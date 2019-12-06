const {
  isArray,
  isObject,
  isEmptyArray,
  isString,
  isEven,
  isDate,
  isName,
  isNotName,
  isNotVariableName,
  isNotURL,
  isNotPositive,
} = require('isnot')

const relMetaFields = require('./constants/relMetaFields')
const nodeMetaFields = require('./constants/nodeMetaFields')
const booleanOPerators = require('./constants/booleanOPerators')
const predicateFunctions = require('./constants/predicateFunctions')

module.exports = class CypherQuery {
	constructor(config = {}){
		this.queryString = ''
		this.queryParams = {}

    this.config = {}
    this.config.onCreateSetTimestamp = config.onCreateSetTimestamp || false
    this.config.onUpdateSetTimestamp = config.onUpdateSetTimestamp || false
    this.config.defaultNodeProps = config.defaultNodeProps || {}
    this.config.forceNodeProps = config.forceNodeProps || {}
    this.config.defaultRelProps = config.defaultRelProps || {}
    this.config.forceRelProps = config.forceRelProps || {}
    this.config.userId = config.userId || false
		if(this.config.userId){
			this.queryParams.userId = this.config.userId
		}
	}

  _escapeStringRegexp(string){
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
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

        let string = item.alias
        if(item.prop)
          string += "."+item.prop;
        if(item.as)
          string += ` as ${item.as}`

        return itemList.push(string);
      }

      throw new Error("_formatCypherAliasAsItems: invalid prop type => " + JSON.stringify(item))
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
        //does not support lowercase!!!
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

    let string = ''

    string += `(`
    if(_node.alias)
      string += _node.alias
    string += this._formatCypherLabels(_node.labels)
    string += this._formatParamsMap(nodeMetaFields, _node)
    string += `)`

    return string
  }

  _formatParamsMap(metaFields, element){
    let propsArray = []
    for(let key in element){
      if(metaFields.includes(key))
        continue

      let val = element[key]
      let valString = ''
      if(isObject(val)){ //the value is a variable {alias: 'varName'}
        throw new Error("provided an object param " + JSON.stringify(val))
      }else if(isString(val) && val.startsWith('$')){
        valString = val.slice(1)
      }else{
        valString = `{${this._getParamKey(key, val)}}`
      }
      propsArray.push(`${key}:${valString}`)
    }

    if(propsArray.length)
      return `{${propsArray.join(',')}}`

    return ''
  }

  _formatCreatedAt(elements){
    return elements.filter(element => isObject(element)).map(element => {
      return `${element.alias}.createdAt = timestamp()`
    }).join(', ')
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

    //item => {alias: 'node', labels: ['one']}
    let labels = item.labels || []
    if(item.label) 
      labels.push(item.label)

    if(labels.length)
      list.push(this._formatCypherAliasLabels(item.alias, labels))

    for (var key in item) {
      if(nodeMetaFields.includes(key))
        continue

      let variableName
      //item => {alias: 'node', key: 'string'}
      let propString = `${item.alias}.${key}`

      let comparisonOperator
      let val = item[key]
      // refactor type mess below!!!
      if(isObject(val)){ //item => {alias: 'node', key: {'<': 2} <= val}
        let operand = Object.keys(val)[0]
        if(predicateFunctions.includes(operand)){
          propString = `${operand}(${propString})`
        }else{
          comparisonOperator = operand
          const operandValue = val[operand] //{alias: 'node', key: {'<': '$node3'} <= operandValue} }
          if(isString(operandValue) && operandValue.startsWith('$')){
            propString += ` ${comparisonOperator} ${operandValue.slice(1)}`
          }else{
            propString += ` ${comparisonOperator} {${this._getParamKey(key, val[operand])}}`
          }
        }
      }

      if(isString(val)){
        //{alias: 'node', key: '$node3'} <= val
        if(val.toLowerCase() === 'is null' || val.toLowerCase() === 'is not null')
          propString += ` ${val}`
        else{
          if(val.startsWith('$'))
            propString += ` = ${val.slice(1)}`
          else
            propString += ` = ${this._getParamKey(key, val)}`
        }
      }

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

  _getParamKey(propKey, propVal){
    for(let paramKey in this.queryParams){
      if(propVal === this.queryParams[paramKey])
        return paramKey
    }

    let paramKey = propKey + Object.keys(this.queryParams).length
    this.queryParams[paramKey] = isDate(propVal) ? propVal.toISOString() : propVal
    return paramKey
  }

	create(...patterns){
    if(isEmptyArray(patterns))
			throw "create: at least a pattern required"

		this.queryString += `CREATE ${this._formatCypherPatterns(patterns)} `

		return this
	}

  debug(options = {}){
		let _queryString = this.queryString
		let _queryParams = this.queryParams

		for(let param in _queryParams){
			_queryString = _queryString.replace(
        new RegExp(`{${param}}`, 'g'),
        JSON.stringify(_queryParams[param])
      )
		}

		if(!options.compact){
			_queryString = _queryString.replace(new RegExp(' CREATE', 'g'), '\nCREATE')
      _queryString = _queryString.replace(new RegExp(' OPTIONAL MATCH', 'g'), '\nOPTIONAL MATCH')
			_queryString = _queryString.replace(new RegExp('(?<!OPTIONAL) MATCH', 'g'), '\nMATCH')
			_queryString = _queryString.replace(new RegExp(' MERGE', 'g'), ' \nMERGE')
			_queryString = _queryString.replace(new RegExp(' SET', 'g'), ' \nSET')
			_queryString = _queryString.replace(new RegExp(' REMOVE', 'g'), ' \nREMOVE')
			_queryString = _queryString.replace(new RegExp(' DELETE', 'g'), ' \nDELETE')
			_queryString = _queryString.replace(new RegExp(' DETACH', 'g'), ' \nDETACH')
			_queryString = _queryString.replace(new RegExp(' WHERE', 'g'), ' \nWHERE')
			_queryString = _queryString.replace(new RegExp(' WITH', 'g'), ' \nWITH')
			_queryString = _queryString.replace(new RegExp(' ORDER BY', 'g'), ' \nORDER BY')
			_queryString = _queryString.replace(' RETURN', ' \nRETURN')
			console.log()
		}

		console.log(_queryString)

		return this
	}

	delete(...aliases){
		if(!aliases.length)
			throw new Error("delete: you must provide aliases")

    aliases.forEach(alias => {
      if(isNotName(alias))
        throw new Error("delete: aliases must all be strings")
    })

		this.queryString += `DELETE ${this._formatCypherPatterns(aliases)} `

		return this
	}

	detachDelete(...aliases){
		if(!aliases.length)
			throw new Error("detachDelete: you must provide aliases")

    aliases.forEach(alias => {
      if(isNotName(alias))
        throw new Error("delete: aliases must all be strings")
    })

		this.queryString += `DETACH DELETE ${this._formatCypherPatterns(aliases)} `

		return this
	}

	limit(amount){
		if(isNotPositive(amount))
			throw new Error("limit: amount must be positive integer")

		this.queryString += `LIMIT ${amount} `

		return this
	}

	loadCsv(url, options = {}){
		if(isNotURL(url))
			throw new Error("URL is not valid")

		this.queryString += `LOAD CSV `

		if(options.withHeaders)
			this.queryString += `WITH HEADERS `

		let lineAlias = options.lineAlias || 'line'

		this.queryString += `FROM ${JSON.stringify(url)} AS ${lineAlias} `

		return this
	}

	match(...patterns){
		if(!patterns.length)
			throw "match: must use at least one pattern"

		this.queryString += `MATCH ${this._formatCypherPatterns(patterns)} `

		return this
	}

	merge(...patterns){
		if(!patterns.length)
			throw new Error("merge: cannot be called without patterns")

    this.queryString += `MERGE ${this._formatCypherPatterns(patterns)} `

		return this
	}

	onCreateSet(...props){
		if(!props.length)
			throw new Error("onCreateSet: need props")

		this.queryString += `ON CREATE SET ${this._formatCypherPropItems(props)} `

		return this
	}

	onMatchSet(...items){
    if(!items.length)
			throw new Error("onMatchSet: need items")

    this.queryString += `ON MATCH SET ${this._formatCypherPropItems(items)} `

		return this
	}

	optionalMatch(...patterns){
    if(!patterns.length)
			throw new Error("optionalMatch: at least 1 pattern required")

    this.queryString += `OPTIONAL `
		return this.match(...patterns)
	}

	orderBy(...props){
		if(!props.length)
			throw new Error("orderBy: cannot order without props")

		this.queryString += `ORDER BY ${this._formatCypherOrderBy(props)} `

		return this
	}

	remove(...items){
		if(!items.length)
      throw new Error("orderBy: cannot order without items")

		this.queryString += `REMOVE ${this._formatCypherRemove(items)} `

    return this
	}

	return(...items){
    if(!items.length)
      throw new Error("return: items missing")

		this.queryString += `RETURN ${this._formatCypherAliasAsItems(items)} `

		return this
	}

	returnDistinct(...items){
    if(!items.length)
      throw new Error("returnDistinct: items missing")

		this.queryString += `RETURN DISTINCT ${this._formatCypherAliasAsItems(items)} `

		return this
	}

	set(...items){
		if(!items.length)
			throw new Error("set: items missing")

		this.queryString += `SET ${this._formatCypherPropItems(items)} `

		return this
	}

	skip(amount){
		if(isNotPositive(amount))
			throw new Error("skip: amount must be positive integer")

		this.queryString += `SKIP ${amount} `

		return this
	}

	union(){
		this.queryString += `UNION `

		return this
	}

	unionAll(){
		this.queryString += `UNION ALL `

		return this
	}

  unwind(data, alias = ''){
    if(!data)
      throw new Error("unwind: must have data")

    this.queryString += `UNWIND {${this._getParamKey('data', data)}} `

    if(alias)
      this.queryString += `as ${alias} `

		return this
  }

	where(...items){
		if(!items.length)
      throw new Error("where: items missing")

    this.queryString += `WHERE ${this._formatCypherWhereGroups(items)} `

		return this
	}

	with(...items){
		if(!items.length)
      throw new Error("with: argument required")

		this.queryString += `WITH ${this._formatCypherAliasAsItems(items)} `

		return this
	}
}
