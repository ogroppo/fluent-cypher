const {
  isNotObject,
  isObject,
  isName,
  isNotString,
  isNotURL,
  isNotPositive,
  isNotUndefined,
  isNotEmptyObject
} = require('isnot')
const {formatNode, formatNodeAliasLabels} = require('./lib/node')
const {formatPropKeys, formatCreatedAt, formatCreatedBy, formatUpdatedAt, formatUpdatedBy, formatMatchedAt, formatMatchedCount, formatOrderBy} = require('./lib/props')
const {formatAlias} = require('./lib/alias')
const {formatList} = require('./lib/utils')

const CypherTools = require('./CypherTools')

module.exports = class CypherQuery extends CypherTools{
	constructor(config = {}){
		super()
		this.queryString = ''
		this.queryParams = {}

		this.config = config
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
		this.queryString += `CREATE `
		if(patterns.length)
			this.queryString += `${formatList(patterns)} `

		return this
	}

	createNode(node = {}, options = {}){
		if(isNotObject(node))
			throw "createNode: node must be object"

		node.alias = this._getValidNodeAlias(node.alias)

		this.create(this._node(node))

		if(this.config.timestamps)
			this.set(formatCreatedAt(node))

		return this
	}

	delete(...aliases){
		if(!aliases.length)
			throw "delete: you must provide aliases"

		this.queryString += `DELETE ${formatList(aliases)} `

		return this
	}

	deleteNode(){
		return this.delete(this._getCurrentNodeAlias())
	}

	deleteRel(){
		return this.delete(this._getCurrentRelAlias())
	}

	detachDelete(...aliases){
		if(!aliases.length)
			throw "detachDelete: you must provide aliases"

		this.queryString += `DETACH DELETE ${formatList(aliases)} `

		return this
	}

	detachDeleteNode(){
		return this.detachDelete(this._getCurrentNodeAlias())
	}

	limit(amount){
		if(isNotPositive(amount))
			throw "limit: amount must be positive integer"

		this.queryString += `LIMIT ${amount} `

		return this
	}

	loadCsv(url, options = {}){
		if(isNotURL(url))
			throw "URL is not valid"

		this.queryString += `LOAD CSV `

		if(options.withHeaders)
			this.queryString += `WITH HEADERS `

		let lineAlias = options.lineAlias || 'line'

		this.queryString += `FROM ${JSON.stringify(url)} AS ${lineAlias} `

		return this
	}

	match(...patterns){
		if(!patterns.length)
			throw "match: must use patterns"

		if(this.clausesUsed[this.clausesUsed.length - 1] === 'merge')
			this.with(this._getPreviousNodeAlias())

		this.queryString += `MATCH `
		this.queryString += `${formatList(patterns)} `

		this._whereClauseUsed = false
		this.clausesUsed.push('match')

		return this
	}

	matchChild(child = {}, rel = {}, options = {}){

		child.alias = this._getValidChildAlias(child.alias)

		let currentNode = {alias: this._getCurrentNodeAlias()}

		this.matchPattern(currentNode, rel, child, options)

		return this
	}

	matchNode(node = {}, options = {}){
		if(isNotObject(node))
			throw new TypeError("matchNode: node must be object")

		if(this.config.defaultNodeProps)
			node = this._extend(this.config.defaultNodeProps, node)

		node.alias = this._getValidNodeAlias(node.alias)

		this.optional(options.optional)
		this.match(this._node(node))

		let removes = []
		if(options.removeProps)
			removes.push(formatPropKeys(node, options.removeProps))

		if(options.removeLabels)
			removes.push(formatNodeAliasLabels(node, options.removeLabels))

		this.remove(...removes)

		let sets = []
		if(options.setProps)
			sets.push(this._formatPropsParams(node.alias, options.setProps))

		if(options.setLabels)
			sets.push(formatNodeAliasLabels(node, options.setLabels))

		if(sets.length || removes.length){
			if(this.config.timestamps)
				sets.push(formatUpdatedAt(node))
			if(this.config.userId)
				sets.push(formatUpdatedBy(node.alias, this.config.userId))

			this.set(...sets)
		}

		return this
	}

	matchParent(parent = {}, rel = {}, options = {}){

		parent.alias = this._getValidParentAlias(parent.alias)

		const currentNode = {alias: this._getCurrentNodeAlias()}

		this.matchPattern(parent, rel, currentNode, options)

		return this
	}

	matchPattern(parent, rel, child, options = {}){

		this.optional(options.optional)
    const _pattern = this._pattern(parent, rel, child)
		this.match(
      (options.pathAlias ? options.pathAlias + " = " : '') +
      (options.shortestPath ? `shortestPath(${_pattern})` : _pattern)
    )

		return this
	}

	matchRel(rel = {}, options = {}){
		if(isNotObject(rel))
			throw "matchRel: rel must be object"

		rel.alias = this._getValidRelAlias(rel.alias)

		this.optional(options.optional)
		this.match(this._pattern({alias: options.startAlias}, rel, {alias: options.endAlias}))

		let removes = []
		if(options.removeProps)
			removes.push(formatPropKeys(rel, options.removeProps))

		this.remove(...removes)

		let sets = []
		if(options.setProps)
			sets.push(this._formatPropsParams(rel.alias, options.setProps))

		if(sets.length || removes.length){
			if(this.config.timestamps)
				sets.push(formatUpdatedAt(rel))
			if(this.config.userId)
				sets.push(formatUpdatedBy(rel.alias, this.config.userId))

			this.set(...sets)
		}

		return this
	}

	matchRelated(related, rel, options = {}){

		related.alias = this._getValidRelatedAlias(related.alias)
		rel.alias = this._getValidRelAlias(rel.alias)
		rel.direction = 'both'

		this.matchPattern({alias: this._getCurrentNodeAlias()}, rel, related, options)

		return this
	}

	merge(...patterns){
		if(!patterns.length)
			throw ".merge cannot be called without patterns"

		this.queryString += `MERGE `
		this.queryString += `${formatList(patterns)} `
		this.clausesUsed.push('merge')

		return this
	}

	mergeChild(rel, child, options = {}){
		if(!rel)
			throw Error("mergeChild: rel is required")
		if(!rel.type)
			throw Error("mergeChild: rel.type is required")
    if(!child)
      throw Error("mergeChild: child is required")

		if(this.config.defaultNodeProps)
			child = this._extend(this.config.defaultNodeProps, child)

		child.alias = this._getValidChildAlias(child.alias)

		let currentNode = {alias: this._getCurrentNodeAlias()}

		this.mergePattern(currentNode, rel, child, options)

		return this
	}

	mergeNode(node = {}, options = {}){
		if(isNotObject(node))
			throw "mergeNode: node must be object"

		if(isNotUndefined(node.id))
			throw "mergeNode: node cannot have id"

		if(this.config.defaultNodeProps)
			node = this._extend(this.config.defaultNodeProps, node)

		node.alias = this._getValidNodeAlias(node.alias)

		this.merge(this._node(node))

		var onCreateSets = []
		if(this.config.createdTimestamp)
			onCreateSets.push(formatCreatedAt(node))
		if(this.config.userId)
			onCreateSets.push(formatCreatedBy(node.alias, this.config.userId))
		if(options.onCreateSet)
			onCreateSets.push(this._formatPropsParams(node.alias, options.onCreateSet))
		if(onCreateSets.length)
			this.onCreateSet(...onCreateSets)

		var onMatchSets = []
		if(this.config.matchedTimestamp)
			onMatchSets.push(formatMatchedAt(node))
		if(this.config.matchedCount)
			onMatchSets.push(formatMatchedCount(node))
		if(options.onMatchSet)
			onMatchSets.push(this._formatPropsParams(node.alias, options.onMatchSet))
		if(onMatchSets.length)
			this.onMatchSet(...onMatchSets)

		let removes = []
		if(options.removeProps)
			removes.push(formatPropKeys(node, options.removeProps))
		if(options.removeLabels)
			removes.push(formatNodeAliasLabels(node, options.removeLabels))
		if(removes.length)
			this.remove(...removes)

		let sets = []
		if(isNotEmptyObject(options.setProps))
			sets.push(this._formatPropsParams(node.alias, options.setProps))
		if(options.setLabels)
			sets.push(formatNodeAliasLabels(node, options.setLabels))
		if(this.config.userId)
			sets.push(formatUpdatedBy(node.alias, this.config.userId))
		if(sets.length || removes.length){
			sets.push(formatUpdatedAt(node))
			this.set(...sets)
		}

		return this
	}

	mergeParent(parent, rel = {}, options = {}){
		if(this.config.defaultRelProps)
			rel = this._extend(this.config.defaultRelProps, rel)

		if(!rel || !rel.type)
			throw "mergeParent: rel.type is required"

		if(this.config.defaultNodeProps)
			parent = this._extend(this.config.defaultNodeProps, parent)

		parent.alias = this._getValidParentAlias(parent.alias)

		this.mergeNode(parent, options)
		this.mergeRel(parent.alias, rel, this._getPreviousNodeAlias())

		return this
	}

	mergePattern(left, rel, right){
		if(rel.depth)
			throw "mergePattern: depth not allowed in merge"

		this.merge(this._pattern(left, rel, right))
		return this
	}

	mergeRel(parentAlias, rel, childAlias, options = {}){
		if(isNotObject(rel))
			throw "mergeRel: rel must be object"

		if(!rel.type)
			throw "mergeRel: rel must have type"

		if(rel.depth)
			throw "mergeRel: depth not allowed in merge"

		rel.alias = this._getValidRelAlias(rel.alias)

		this.mergePattern({alias: parentAlias}, rel, {alias: childAlias})

		var onMatchSets = []
		if(this.config.matchedTimestamp)
			onMatchSets.push(formatMatchedAt(rel))
		if(this.config.matchedCount)
			onMatchSets.push(formatMatchedCount(rel))
		if(options.onMatchSet)
			onMatchSets.push(this._formatPropsParams(rel.alias, options.onMatchSet))
		if(onMatchSets.length)
			this.onMatchSet(...onMatchSets)

		var onCreateSets = []
		if(this.config.createdTimestamp)
			onCreateSets.push(formatCreatedAt(rel))
		if(this.config.userId)
			onCreateSets.push(formatCreatedBy(rel))
		if(options.onCreateSet)
			onCreateSets.push(this._formatPropsParams(rel.alias, options.onCreateSet))
		if(onCreateSets.length)
			this.onCreateSet(...onCreateSets)

		var sets = []
		if(options.set)
			sets.push(this._formatPropsParams(rel.alias, options.set))

		if(sets.length)
			this.set(...sets)

		return this
	}

	onCreateSet(...props){
		if(!props.length)
			throw "onCreateSet: need props"

		this.queryString += `ON CREATE SET ${formatList(props)} `

		return this
	}

	onMatchSet(...props){
		if(props.length){
			this.queryString += `ON MATCH SET ${formatList(props)} `

		}

		return this
	}

	optional(optional){
		if(optional)
			this.queryString += `OPTIONAL `

		return this
	}

	optionalMatchNode(node = {}, options = {}){
		options.optional = true
		return this.matchNode(node, options)
	}

	optionalMatchRel(rel = {}, options = {}){
		options.optional = true
		return this.matchRel(rel, options)
	}

	orderBy(...props){
		if(!props.length)
			throw "orderBy: cannot order without props"

		this.queryString += `ORDER BY ${formatOrderBy(props)} `

		return this
	}

	remove(...props){
		if(props.length){
			this.queryString += `REMOVE ${formatList(props)} `

		}

		return this
	}

	return(...aliases){
		if(aliases.length){
			this.queryString += `RETURN ${formatAlias(aliases)} `
		}else{
      this.queryString += `RETURN * `
    }

		return this
	}

	returnDistinct(...aliases){
		if(aliases.length){
			this.queryString += `RETURN DISTINCT ${formatAlias(aliases)} `
		}

		return this
	}

	returnNode(alias = ''){
		if(isNotString(alias))
			throw "returnNode: alias must be string"

		alias = alias || this._getCurrentNodeAlias()
		return this.return(`${alias} as node`)
	}

	returnParent(alias = ''){
		if(isNotString(alias))
			throw "returnParent: alias must be string"

		alias = alias || this._getCurrentParentAlias()
		return this.return(`${alias} as parent`)
	}

	returnChild(alias = ''){
		if(isNotString(alias))
			throw "returnChild: alias must be string"

		alias = alias || this._getCurrentChildAlias()
		return this.return(`${alias} as child`)
	}

	returnRel(alias = ''){
		if(isNotString(alias))
			throw "returnRel: alias must be string"

		alias = alias || this._getCurrentRelAlias()
		return this.return(`${alias} as rel`)
	}

	set(...props){
		if(!props.length)
			throw "set: cannot set nothing"

		this.queryString += `SET ${formatList(props)} `

		return this
	}

	skip(amount){
		if(isNotPositive(amount))
			throw "skip: amount must be positive integer"

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

	where(arg, options = {}){
		if(!arg)
      throw new Error("where: must have arg")

    options.divider = (options.divider || "AND").trim()
		if(!this._whereClauseUsed){
			this.queryString += `WHERE `
			this._whereClauseUsed = true
		}else{
			this.queryString += `${options.divider} `
		}

    const alias = options.alias || this.currentAlias
    if(isObject(arg))
		  this.queryString += `${this._formatPropsParams(alias, arg, options.compare, ` ${options.divider} `)} `
    else if(isName(arg))
      this.queryString += `${arg} `
    else
      throw new TypeError("where: arg type not valid")


		return this
	}

  whereNot(arg){
    if(!arg)
      throw new Error("whereNot: must have arg")

    this.where(`NOT ${arg}`)

    return this
  }

	with(...args){
		if(!args.length)
      throw new Error("with: argument required")

		this.queryString += `WITH ${formatList(args)} `

		return this
	}

	withNode(nodeAlias = ''){

		this.queryString += `WITH ${nodeAlias || this._getCurrentNodeAlias()} `

		return this
	}
}
