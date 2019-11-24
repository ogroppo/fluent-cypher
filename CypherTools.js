const {isName, isString, isNotName, isNotVariableName, isObject, isArray, isEven, isDate} = require('isnot')
const relMetaFields = require('./constants/relMetaFields')
const nodeMetaFields = require('./constants/nodeMetaFields')
const booleanOPerators = require('./constants/booleanOPerators')
const predicateFunctions = require('./constants/predicateFunctions')

module.exports = class CypherTools{
	_extend(...objects){
		return Object.assign({}, ...objects)
	}

	_escapeStringRegexp(string){
		return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
	}

	_getParamKey(propKey, propVal){
		for(let paramKey in this.queryParams){
			if(propVal === this.queryParams[paramKey])
				return paramKey
		}

		let paramKey = propKey + Object.keys(this.queryParams).length
		this.queryParams[paramKey] = isDate(propVal) ? propVal.toISOString() : propVal
		return paramKey
	}

  _getParamMap(metaFields, element){
    let paramMap = {}
    for(let key in element){
      if(metaFields.includes(key))
        continue

      paramMap[key] = this._getParamKey(key, element[key])
    }
    return paramMap
  }

  _formatCypherOrderBy(props){
  	var propsList = [];

  	props.forEach(prop => {
      if(isName(prop))
        return propsList.push(prop)
      if(isObject(prop)){
        var proplist = []
        for (var key in prop) {
          if(key === 'alias')
          continue

          let propString = `${prop.alias}.${key} `
          propString += prop[key] //sort order

          proplist.push(propString);
        }
        return propsList.push(proplist.join(', '));
      }

      throw new Error("_formatCypherOrderBy: invalid prop type")
  	});

  	return propsList.join(', ');
  }

  _formatCypherRemove(removeItems){
    var itemList = [];

    removeItems.forEach(removeItem => {
      if(isName(removeItem))
        return itemList.push(removeItem)
      if(isObject(removeItem)){
        if(!removeItem.alias)
          throw new Error("_formatCypherRemove: alias is required here")
        let removeItemList = []
        var labels = removeItem.labels || []
        var props = removeItem.props || []
        if(removeItem.label)
          labels.push(removeItem.label)
        if(removeItem.prop)
          props.push(removeItem.prop)

        if(labels.length){
          removeItemList.push(this._formatCypherAliasLabels(removeItem.alias, labels))
        }

        props.forEach(prop => removeItemList.push(`${removeItem.alias}.${prop}`))

        return itemList.push(removeItemList.join(', '));
      }

      throw new Error("_formatCypherRemove: invalid prop type")
    });

    return itemList.join(', ');
  }

  _formatCypherAliasAsItems(items){
    var itemList = [];

    items.forEach(item => {
      if(isName(item))
        return itemList.push(item)
      if(isObject(item)){
        if(!item.alias)
          throw new Error("_formatCypherAliasAsItems: alias is required for object item")

        let returnItemList = []
        let string = item.alias
        if(item.as)
          string += ` as ${item.as}`

        return itemList.push(string);
      }

      throw new Error("_formatCypherAliasAsItems: invalid prop type")
    });

    return itemList.join(', ');
  }

  _formatCypherLabels(labels = []){
    var cypherLabelString = ''

  	labels.forEach(label => {
  		cypherLabelString += this._formatCypherLabel(label)
  	})

  	return cypherLabelString
  }

  _formatCypherAliasLabels(alias, labels){
    if(isNotName(alias))
  		throw new Error("_formatCypherAliasLabels: alias required")

    return `${alias}${this._formatCypherLabels(labels)}`
  }

  _formatCypherLabel(label){
    if(isNotName(label))
  		throw new Error("_formatCypherLabel: label must be a valid string")

  	return ":`"+label+"`"
  }

  _formatCypherPatterns(patterns){
    let list = []
    patterns.forEach(pattern => {
      if(isName(pattern))
        return list.push(pattern)
      if(isObject(pattern))
        return list.push(this._formatCypherNode(pattern))
      if(isArray(pattern))
        return list.push(this._formatCypherPath(...pattern))

      throw new TypeError("_formatCypherPatterns: pattern has not valid type")
    })
    return list.join(', ')
  }

  _formatCypherWhereGroups(items){
    let list = []
    items.forEach(item => {
      if(isName(item))
        return list.push(item)
      if(isObject(item))
        return list.push(this._formatCypherPropItem(item, ' AND '))
      if(isArray(item)){
        if(item.some(subItem => booleanOPerators.includes(subItem))){
          let subList = []
          item.forEach(subItem => {
            if(isName(subItem))
              subList.push(subItem)
            if(isObject(subItem))
              subList.push(this._formatCypherPropItem(subItem, ' AND '))
            if(isArray(subItem))
              subList.push(this._formatCypherPath(...subItem))
          })
          list.push(`(${subList.join(' ')})`)
        }else{
          list.push(this._formatCypherPath(...item))
        }
        return
      }

      throw new TypeError("_formatCypherWhereGroup: invalid item type")
    })

    return list.join(' ')
  }

	_formatCypherNode(node = {}){
    if(isName(node)){
      return `(${node})`
    }

    if(isName(node.alias) && isNotVariableName(node.alias)){
      throw new Error(`_formatCypherNode: invalid alias => ${node.alias}`)
    }

    let _node = {
      ...this.config.defaultNodeProps,
      ...node,
      ...this.config.forceNodeProps
    }

		if(isName(_node.label)){
			_node.labels = _node.labels || []
			_node.labels.push(_node.label)
		}

    let string = `(`
    if(_node.alias)
      string += _node.alias
    string += this._formatCypherLabels(_node.labels)
    string += this._formatParamsMap(nodeMetaFields, _node)
    string += `)`

		return string
	}

  _formatParamsMap(metaFields, element){
    const paramsMap = this._getParamMap(metaFields, element)

  	let propsString = ''

  	if(Object.keys(paramsMap).length){
  		propsString = '{'
  		let propsArray = []
  		for(let propKey in paramsMap){
  			propsArray.push(`${propKey}:{${paramsMap[propKey]}}`)
  		}
  		propsString += propsArray.join(', ')
  		propsString += '}'
  	}

  	return propsString
  }

  _formatCreatedAt(elements){
    return elements.filter(element => isObject(element)).map(element => {
      return `${element.alias}.createdAt = timestamp()`
    }).join(', ')
  }

  _formatAliases(aliases){
    return aliases.map(alias => this._formatAlias(alias)).join(', ')
  }

  _formatAlias(alias){
    var aliasString = '';

  	if(isString(alias)){ //eg alias = 'node' or 'node.prop' or 'node.prop as myNode'
  		aliasString = alias;
  	}

  	if(isObject(alias)){ //eg alias = {alias: 'something', prop: 'name', as: 'node'}
  		if(!alias.alias) return aliasString; //the rest will not make sense

  		aliasString = alias.alias;
  		if(alias.prop)
  			aliasString += "."+alias.prop;
  		if(alias.as)
  			aliasString += " as "+alias.as;
  	}

  	return aliasString;
  }

  _formatCypherPropItems(items) {
    let list = []
    items.forEach(item => {
      if(isName(item))
        return list.push(item)
      if(isObject(item))
        return list.push(this._formatCypherPropItem(item))

      throw new TypeError("_formatCypherPropItems: invalid items type")
    })

    return list.join(', ')
  }

  _formatCypherPropItem(item, joint = ', ') {
    var list = []

    let labels = item.labels || []
    if(item.label)
      labels.push(item.label)

    if(labels.length)
      list.push(this._formatCypherAliasLabels(item.alias, labels))

    for (var key in item) {
      if(nodeMetaFields.includes(key))
        continue

      let propString = `${item.alias}.${key}`

      let comparisonOperator
      let val = item[key]
      if(isObject(val)){
        let operand = Object.keys(val)[0]
        if(predicateFunctions.includes(operand)){
          propString = `${operand}(${propString})`
        }else{
          comparisonOperator = operand
          val = val[operand]
        }
      }else{
        if(isString(val) && (val.toLowerCase() === 'is null' || val.toLowerCase() === 'is not null'))
          propString += ` ${val}`
        else
          comparisonOperator = '='
      }

      if(comparisonOperator)
        propString += ` ${comparisonOperator} {${this._getParamKey(key, val)}}`

      list.push(propString);
    }

    return list.join(joint)
  }

	_formatCypherRel(rel = {}){
    if(isName(rel)){
      return `-[${rel}]->`
    }

    if(isName(rel.type) && isNotVariableName(rel.type)){
      throw new Error(`_formatCypherRel: invalid type => ${rel.type}`)
    }

    let _rel = {
      ...this.config.defaultRelProps,
      ...rel,
      ...this.config.forceRelProps
    }

    let relString = ''
  	if(_rel.direction === 'left')
  		relString += '<'

  	relString += '-['

  	if(_rel.alias)
  		relString += _rel.alias

  	if(_rel.type)
  		relString += ":`"+_rel.type+"`"

  	if(_rel.depth){ //can be *, *1
  		relString += '*'
  		if(_rel.depth !== '*' && _rel.depth !== 'any')
  			relString += _rel.depth
  	}else if(_rel.minDepth || _rel.maxDepth){ //can *1..2, *..2, *2..
  		relString += '*'
  		if(_rel.minDepth)
  			relString += _rel.minDepth
  		relString += '..'
  		if(_rel.maxDepth)
  			relString += rel.maxDepth
  	}

  	relString += this._formatParamsMap(relMetaFields, _rel)

  	relString += "]-"

  	if(_rel.direction === undefined || _rel.direction === 'right')
  		relString += ">"

  	return relString
	}

	_formatCypherPath(...elements){
    let options = {}
    let _path = ''
    if(isEven(elements.length))
      options = elements.shift()

    if(options.pathAlias){
      _path += `${options.pathAlias} = `
    }

    if(options.shortestPath)
      _path += `shortestPath(`

    _path += elements.map((element, index) => {
      return isEven(index) ? this._formatCypherNode(element) : this._formatCypherRel(element)
    }).join('')

    if(options.shortestPath)
      _path += `)`

    return _path
	}

	_getValidNodeAlias(candidateAlias){
		if(candidateAlias && isNotVariableName(candidateAlias))
			throw "Not valid node alias: " + candidateAlias

		let currentNodeAlias = candidateAlias || 'node'

		if(this.nodeAliases.includes(currentNodeAlias)){
			let existingCount = this.nodeAliases.filter(alias => alias.startsWith(currentNodeAlias)).length
			currentNodeAlias += existingCount
		}

		this.nodeAliases.push(currentNodeAlias)
		this.currentAlias = currentNodeAlias
		return currentNodeAlias
	}

	_getValidParentAlias(candidateAlias){
		if(candidateAlias && isNotVariableName(candidateAlias))
			throw "Not valid parent alias: " + candidateAlias

		let currentParentAlias = candidateAlias || 'parent'

		if(this.parentAliases.includes(currentParentAlias)){
			let existingCount = this.parentAliases.filter(alias => alias.startsWith(currentParentAlias)).length
			currentParentAlias += existingCount
		}

		this.parentAliases.push(currentParentAlias)
		this.currentAlias = currentParentAlias
		return currentParentAlias
	}

	_getValidChildAlias(candidateAlias){
		if(candidateAlias && isNotVariableName(candidateAlias))
			throw "Not valid child alias: " + candidateAlias

		let currentChildAlias = candidateAlias || 'child'

		if(this.childAliases.includes(currentChildAlias)){
			let existingCount = this.childAliases.filter(alias => alias.startsWith(currentChildAlias)).length
			currentChildAlias += existingCount
		}

		this.childAliases.push(currentChildAlias)
		this.currentAlias = currentChildAlias
		return currentChildAlias
	}

	_getValidRelatedAlias(candidateAlias){
		if(candidateAlias && isNotVariableName(candidateAlias))
			throw "Not valid related alias: " + candidateAlias

		let currentRelatedAlias = candidateAlias || 'related'

		if(this.relatedAliases.includes(currentRelatedAlias)){
			let existingCount = this.relatedAliases.filter(alias => alias.startsWith(currentRelatedAlias)).length
			currentRelatedAlias += existingCount
		}

		this.relatedAliases.push(currentRelatedAlias)
		this.currentAlias = currentRelatedAlias
		return currentRelatedAlias
	}

	_getCurrentNodeAlias(){
		if(!this.nodeAliases.length)
			throw new Error("Trying to get current node alias, that not exists")

		return this.nodeAliases[this.nodeAliases.length - 1]
	}

	_getCurrentParentAlias(){
		if(!this.parentAliases.length)
			throw "Trying to get current parent alias, that not exists"

		return this.parentAliases[this.parentAliases.length - 1]
	}

	_getCurrentChildAlias(){
		if(!this.childAliases.length)
			throw "Trying to get current child alias, that not exists"

		return this.childAliases[this.childAliases.length - 1]
	}

	_getValidRelAlias(alias){
		if(alias && isNotVariableName(alias))
			throw "Not valid rel alias"

		let currentRelAlias = alias || 'rel'

		if(this.relAliases.includes(currentRelAlias)){
			let existingCount = this.relAliases.filter((alias) => alias.startsWith(currentRelAlias)).length
			currentRelAlias += existingCount
		}

		this.relAliases.push(currentRelAlias)
		this.currentAlias = currentRelAlias
		return currentRelAlias
	}

	_getCurrentRelAlias(){
		return this.relAliases[this.relAliases.length - 1]
	}

	_getPreviousNodeAlias(){
		return this.nodeAliases[this.nodeAliases.length - 2]
	}
}
