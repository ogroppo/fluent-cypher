const {
  isNotObject,
  isObject,
  isEmptyArray,
  isName,
  isNotName,
  isNotString,
  isNotURL,
  isNotPositive,
  isNotUndefined,
  isNotEmptyObject
} = require('isnot')
const {formatPropKeys, formatCreatedAt, formatCreatedBy, formatUpdatedAt, formatUpdatedBy, formatMatchedAt, formatMatchedCount, formatOrderBy} = require('./lib/props')

const CypherTools = require('./CypherTools')

module.exports = class CypherQuery extends CypherTools{
	constructor(config = {}){
		super()
		this.queryString = ''
		this.queryParams = {}

    this.config = {}
    this.config.onCreateSetTimestamp = config.onCreateSetTimestamp || false
    this.config.onUpdateSetTimestamp = config.onUpdateSetTimestamp || false
    this.config.defaultNodeProps = config.defaultNodeProps || {}
    this.config.forceNodeProps = config.forceNodeProps || {}
    this.config.defaultRelProps = config.defaultRelProps || {}
    this.config.forceRelProps = config.forceRelProps || {}
		if(config.userId){
			this.queryParams.userId = config.userId
		}

		this.clausesUsed = []
		this.currentAlias
		this.nodeAliases = []
		this.relAliases = []
		this.parentAliases = []
		this.childAliases = []
		this.relatedAliases = []
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
			_queryString = _queryString.replace(new RegExp(' MATCH', 'g'), '\nMATCH')
			_queryString = _queryString.replace(new RegExp(' MERGE', 'g'), ' \nMERGE')
			_queryString = _queryString.replace(new RegExp(' SET', 'g'), ' \nSET')
			_queryString = _queryString.replace(new RegExp(' REMOVE', 'g'), ' \nREMOVE')
			_queryString = _queryString.replace(new RegExp(' DELETE', 'g'), ' \nDELETE')
			_queryString = _queryString.replace(new RegExp(' DETACH', 'g'), ' \nDETACH')
			_queryString = _queryString.replace(new RegExp(' WHERE', 'g'), ' \nWHERE')
			_queryString = _queryString.replace(new RegExp(' WITH', 'g'), ' \nWITH')
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

		if(this.clausesUsed[this.clausesUsed.length - 1] === 'merge')
			this.with(this._getPreviousNodeAlias())

		this.queryString += `MATCH ${this._formatCypherPatterns(patterns)} `

		this._whereClauseUsed = false
		this.clausesUsed.push('match')

		return this
	}

	merge(...patterns){
		if(!patterns.length)
			throw new Error("merge: cannot be called without patterns")

    this.queryString += `MERGE ${this._formatCypherPatterns(patterns)} `
		this.clausesUsed.push('merge')

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
