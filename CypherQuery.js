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
    this.variableSymbol = '$' //make configurable
    this.relMetaFields = [this.variableSymbol].concat(relMetaFields)
    this.nodeMetaFields = [this.variableSymbol].concat(nodeMetaFields)
    this.config.onCreateSetTimestamp = config.onCreateSetTimestamp || false
    this.config.onUpdateSetTimestamp = config.onUpdateSetTimestamp || false
    this.config.defaultNodeProps = config.defaultNodeProps || {}
    this.config.forceNodeProps = config.forceNodeProps || {}
    this.config.defaultRelProps = config.defaultRelProps || {}
    this.config.forceRelProps = config.forceRelProps || {}
    this.userId = config.userId || false
		if(this.userId){
			this.queryParams.userId = this.userId
		}
	}

  _escapeStringRegexp(string){
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
  }

  //{$: 'node', as: 'that'} or {$: 'rel.prop', as: 'relProp'} or {$: 'that', prop: 'lol', as: 'this'}
  _formatAs(items){
    var itemList = [];

    items.forEach(item => {
      if(isName(item))
        return itemList.push(item)

      if(isObject(item)){
        if(!item[this.variableSymbol])
          throw new Error(this.variableSymbol + " is required for here")

        let string = item[this.variableSymbol]
        if(item.prop)
          string += "."+item.prop;
        if(item.as)
          string += ` AS ${item.as}`

        return itemList.push(string);
      }

      throw new TypeError("Invalid item => " + JSON.stringify(item))
    });

    return itemList.join(', ');
  }

  _formatLabels(labels = []){
    var cypherLabelString = ''

    labels.forEach(label => {
      if(isNotName(label))
        throw new Error("label must be a  string => " + JSON.stringify(label))

      cypherLabelString += ":`"+label+"`"
    })

    return cypherLabelString
  }

  _formatOrderBy(props){
    var propsList = [];

    props.forEach(prop => {
      //node.key ASC
      if(isName(prop))
        return propsList.push(prop)
      //{$: 'node', key: 'ASC'}
      if(isObject(prop)){
        var proplist = []
        for (var key in prop) {
          if(key === this.variableSymbol)
            continue

          let propString = `${prop[this.variableSymbol]}.${key} `
          propString += prop[key] //sort order

          proplist.push(propString);
        }
        return propsList.push(proplist.join(', '));
      }

      throw new TypeError(JSON.stringify(prop))
    });

    return propsList.join(', ');
  }

  _formatRemove(removeItems){
    var itemList = [];

    removeItems.forEach(removeItem => {
      if(isName(removeItem))
        return itemList.push(removeItem)
      if(isObject(removeItem)){
        if(!removeItem[this.variableSymbol])
          throw new Error(this.variableSymbol + " is required here")
        let removeItemList = []
        var labels = removeItem.labels || []
        var props = removeItem.props || []
        if(removeItem.label)
          labels.push(removeItem.label)
        if(removeItem.prop)
          props.push(removeItem.prop)

        if(labels.length){
          removeItemList.push(this._formatVariableAndLabels(removeItem[this.variableSymbol], labels))
        }

        props.forEach(prop => removeItemList.push(`${removeItem[this.variableSymbol]}.${prop}`))

        return itemList.push(removeItemList.join(', '));
      }

      throw new Error("_formatRemove: invalid prop type")
    });

    return itemList.join(', ');
  }

  _formatVariableAndLabels(variable, labels){
    if(isNotName(variable))
      throw new Error("variable required")

    return `${variable}${this._formatLabels(labels)}`
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

  _formatWhereGroups(items){
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

    if(isName(node[this.variableSymbol]) && isNotVariableName(node[this.variableSymbol])){
      throw new Error(`invalid variable => ${node[this.variableSymbol]}`)
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
    if(_node[this.variableSymbol])
      string += _node[this.variableSymbol]
    string += this._formatLabels(_node.labels)
    string += this._formatParamsMap(this.nodeMetaFields, _node)
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
      if(isObject(val)){ //the value is a variable {$: 'varName'}
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
      return `${element[this.variableSymbol]}.createdAt = timestamp()`
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

    //item => {$: 'node', labels: ['one']}
    let labels = item.labels || []
    if(item.label) 
      labels.push(item.label)

    if(labels.length)
      list.push(this._formatVariableAndLabels(item[this.variableSymbol], labels))

    for (var key in item) {
      if(this.variableSymbol === key || nodeMetaFields.includes(key))
        continue

      //item => {$: 'node', key: 'string'}
      let propString = `${item[this.variableSymbol]}.${key}`

      let comparisonOperator
      let val = item[key]
      
      //item => {$: 'node', key: {'<': 2} <= val}
      if(isObject(val)){ 
        let operand = Object.keys(val)[0]
        if(predicateFunctions.includes(operand)){
          propString = `${operand}(${propString})`
        }else{
          comparisonOperator = operand
          const operandValue = val[operand] 
          //{$: 'node', key: {'<': '$node3'} <= operandValue} }
          if(isString(operandValue) && operandValue.startsWith(this.variableSymbol)){
            propString += ` ${comparisonOperator} ${operandValue.slice(this.variableSymbol.length)}`
          }else{
            propString += ` ${comparisonOperator} {${this._getParamKey(key, val[operand])}}`
          }
        }

        list.push(propString)
        continue
      }
      
      //{$: 'node', key: 'is null'} <= val
      if(isString(val) 
        && (val.toLowerCase() === 'is null' || val.toLowerCase() === 'is not null')
      ){
        propString += ` ${val}`
        list.push(propString)
        continue
      }

      //{$: 'node', key: '$node3'} <= val
      if(isString(val) 
        && val.startsWith(this.variableSymbol)
      ){
        propString += ` = ${val.slice(this.variableSymbol.length)}`
        list.push(propString)
        continue
      }

      propString += ` = {${this._getParamKey(key, val)}}`
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

    if(_rel[this.variableSymbol])
      relString += _rel[this.variableSymbol]

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

    relString += this._formatParamsMap(this.relMetaFields, _rel)

    relString += "]-"

    if(_rel.direction === undefined || _rel.direction === 'right')
      relString += ">"

    return relString
  }

  _formatCypherPath(...elements){
    let pathElement = {}
    let _path = ''
    if(isEven(elements.length))
      pathElement = elements.shift()

    if(pathElement[this.variableSymbol]){
      _path += `${pathElement[this.variableSymbol]} = `
    }

    if(pathElement.shortestPath)
      _path += `shortestPath(`

    _path += elements.map((element, index) => {
      return isEven(index) ? this._formatCypherNode(element) : this._formatCypherRel(element)
    }).join('')

    if(pathElement.shortestPath)
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

  log(queryName){
		let _queryString = this.queryString
		let _queryParams = this.queryParams

		for(let param in _queryParams){
			_queryString = _queryString.replace(
        new RegExp(`{${param}}`, 'g'),
        JSON.stringify(_queryParams[param])
      )
		}

    console.log() //margin top
    if(isString(queryName))
      console.log(`//${queryName}`);
      
    _queryString = _queryString.replace(new RegExp(' CREATE', 'g'), '\nCREATE')
    _queryString = _queryString.replace(new RegExp(' OPTIONAL MATCH', 'g'), '\nOPTIONAL MATCH')
    _queryString = _queryString.replace(new RegExp('(?<!OPTIONAL) MATCH', 'g'), '\nMATCH')
    _queryString = _queryString.replace(new RegExp(' MERGE', 'g'), ' \nMERGE')
    _queryString = _queryString.replace(new RegExp(' SET', 'g'), ' \nSET')
    _queryString = _queryString.replace(new RegExp(' REMOVE', 'g'), ' \nREMOVE')
    _queryString = _queryString.replace(new RegExp(' DETACH DELETE', 'g'), ' \nDETACH DELETE')
    _queryString = _queryString.replace(new RegExp('(?<!DETACH) DELETE', 'g'), '\nDELETE')
    _queryString = _queryString.replace(new RegExp(' DETACH', 'g'), ' \nDETACH')
    _queryString = _queryString.replace(new RegExp(' WHERE', 'g'), ' \nWHERE')
    _queryString = _queryString.replace(new RegExp(' WITH', 'g'), ' \nWITH')
    _queryString = _queryString.replace(new RegExp(' ORDER BY', 'g'), ' \nORDER BY')
    _queryString = _queryString.replace(new RegExp(' LIMIT', 'g'), ' \nLIMIT')
    _queryString = _queryString.replace(' RETURN', ' \nRETURN')

		console.log(_queryString)

		return this
	}

	delete(...variables){
		if(!variables.length)
			throw new Error("delete: you must provide variables")

    variables.forEach(variable => {
      if(isNotName(variable))
        throw new Error("delete: variables must all be strings")
    })

		this.queryString += `DELETE ${this._formatCypherPatterns(variables)} `

		return this
	}

	detachDelete(...variables){
		if(!variables.length)
			throw new Error("detachDelete: you must provide variables")

    variables.forEach(variable => {
      if(isNotName(variable))
        throw new Error("delete: variables must all be strings")
    })

		this.queryString += `DETACH DELETE ${this._formatCypherPatterns(variables)} `

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

		this.queryString += `FROM ${JSON.stringify(url)} AS ${options.as || 'line'} `

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

	orderBy(...items){
		if(!items.length)
			throw new Error("Cannot order without items")

		this.queryString += `ORDER BY ${this._formatOrderBy(items)} `

		return this
	}

	remove(...items){
		if(!items.length)
      throw new Error("orderBy: cannot order without items")

		this.queryString += `REMOVE ${this._formatRemove(items)} `

    return this
	}

	return(...items){
    if(!items.length)
      throw new Error("return: items missing")

		this.queryString += `RETURN ${this._formatAs(items)} `

		return this
	}

	returnDistinct(...items){
    if(!items.length)
      throw new Error("returnDistinct: items missing")

		this.queryString += `RETURN DISTINCT ${this._formatAs(items)} `

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

  unwind(data, variable = ''){
    if(!data)
      throw new Error("unwind: must have data")

    this.queryString += `UNWIND {${this._getParamKey('data', data)}} `

    if(variable)
      this.queryString += `AS ${variable} `

		return this
  }

	where(...items){
		if(!items.length)
      throw new Error("where: items missing")

    this.queryString += `WHERE ${this._formatWhereGroups(items)} `

		return this
	}

	with(...items){
		if(!items.length)
      throw new Error("with: argument required")

		this.queryString += `WITH ${this._formatAs(items)} `

		return this
	}
}
