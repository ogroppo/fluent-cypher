const {isNotObject, isNotString, isNotURL, isInt} = require('isnot')
const {formatNode, formatNodeAliasLabels} = require('./lib/node')
const {formatProps, formatPropKeys, formatPropsParams, formatCreatedAt, formatCreatedBy, formatUpdatedAt, formatUpdatedBy, formatMatchedAt, formatMatchCount, formatOrderBy} = require('./lib/props')
const {formatAlias} = require('./lib/alias')
const {formatList} = require('./lib/utils')

const CypherTools = require('./CypherTools')

module.exports = class CypherQuery extends CypherTools{
	constructor(config = {}){
		super()
		this.queryString = ''
		this.queryParams = {}
		this.userId = config.userId
		this.timestamps = config.timestamps || false
		this.clausesUsed = []
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

		if(this.timestamps)
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

	limit(integer){
		if(isInt(integer) && integer > 0)
			this.queryString += `LIMIT ${integer} `

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
		if(patterns.length){
			if(this.clausesUsed[this.clausesUsed.length - 1] === 'merge')
				this.with(this._getPreviousNodeAlias())

			this.queryString += `MATCH `
			this.queryString += `${formatList(patterns)} `

			this._whereClauseUsed = false
			this.clausesUsed.push('match')
		}

		return this
	}

	matchChild(node = {}, options = {}){

		node.alias = this._getValidNodeAlias(node.alias || 'child')

		var previousNode = {alias: this._getPreviousNodeAlias()}

		this.optional(options.optional)

		this.match(this._node(previousNode)+this._rel(options.rel)+this._node(node))

		return this
	}

	matchNode(node = {}, options = {}){
		if(isNotObject(node))
			throw "matchNode: node must be object"

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
			sets.push(formatProps(node, options.setProps))

		if(options.setLabels)
			sets.push(formatNodeAliasLabels(node, options.setLabels))

		if(sets.length || removes.length){
			if(this.timestamps)
				sets.push(formatUpdatedAt(node))
			if(this.userId)
				sets.push(formatUpdatedBy(node.alias, this.userId))
		}

		this.set(...sets)

		return this
	}

	matchPath(options = {}){

		options.pathAlias = options.pathAlias || 'path'

		options.parentNode = {
			alias: 'parent'
		}

		options.rel = options.rel || {}
		options.rel.depth = options.rel.depth || '*'

		options.childNode = {
			alias: 'child'
		}

		this.match(options.pathAlias + " = "+this._node(options.parentNode)+this._rel(options.rel)+this._node(options.childNode))

		return this
	}

	matchParent(node = {}, options = {}){

		node.alias = this._getValidNodeAlias(node.alias || 'parent')

		var previousNode = {alias: this._getPreviousNodeAlias()}

		this.optional(options.optional)

		this.match(this._node(node)+this._rel(options.rel)+this._node(previousNode))

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
			sets.push(formatProps(rel, options.setProps))

		if(sets.length || removes.length){
			if(this.timestamps)
				sets.push(formatUpdatedAt(rel))
			if(this.userId)
				sets.push(formatUpdatedBy(rel.alias, this.userId))
		}

		this.set(...sets)

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

	mergeChild(childNode = {}, options = {}){

		childNode.alias = this._getValidNodeAlias(childNode.alias || 'child')

		const originNode = {alias: this._getPreviousNodeAlias()}

		this.merge(this._pattern(originNode, options.rel, childNode))

		return this
	}

	mergeNode(node = {}, options = {}){
		if(isNotObject(node))
			throw "mergeNode: node must be object"

		if(typeof node.id !== "undefined")
			throw "mergeNode: node cannot have id"

		node.alias = this._getValidNodeAlias(node.alias)

		this.merge(this._node(node))

		var onCreateSets = []
		if(this.timestamps)
			onCreateSets.push(formatCreatedAt(node))
		if(this.userId)
			onCreateSets.push(formatCreatedBy(node.alias, this.userId))
		if(options.onCreateSet)
			onCreateSets.push(formatProps(node, options.onCreateSet))
		this.onCreateSet(...onCreateSets)

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
			if(this.timestamps)
				sets.push(formatUpdatedAt(node))
			if(this.userId)
				sets.push(formatUpdatedBy(node.alias, this.userId))
		}
		this.set(...sets)

		return this
	}

	mergeParent(node = {}, options = {}){

		node.alias = this._getValidNodeAlias(node.alias || 'parent')

		const originNode = {alias: this._getPreviousNodeAlias()}

		this.merge(this._node(node)+this._rel(options.rel)+this._node(originNode))

		return this
	}

	mergeRel(rel, options = {}){ //it is only a contextual clause
		if(isNotObject(rel))
			throw "mergeRel: rel must be object"

		if(!rel.type)
			throw "mergeRel: rel must have type"

		rel.alias = this._getValidRelAlias(rel.alias)

		this.merge(this._node({alias: options.parentAlias})+this._rel(rel)+this._node({alias: options.childAlias}))

		var onMatchSets = [formatMatchedAt(rel), formatMatchCount(rel)]
		if(options.onMatchSet)
			onMatchSets.push(formatProps(rel, options.onMatchSet))
		this.onMatchSet(...onMatchSets)

		var onCreateSets = [formatCreatedAt(rel)]
		if(options.onCreateSet)
			onCreateSets.push(formatProps(rel, options.onCreateSet))

		this.onCreateSet(...onCreateSets)

		var sets = []
		if(options.set)
			sets.push(formatProps(rel, options.set))

		this.set(...sets)

		return this
	}

	onCreateSet(...props){
		if(props.length){
			this.queryString += `ON CREATE SET ${formatList(props)} `

		}

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

	or(...args){
		if(args.length){
			if(!this._whereClauseUsed){
				this.queryString += `WHERE `
				this._whereClauseUsed = true
			}else{
				this.queryString += `OR `
			}

			this.queryString += `${formatList(args, ' OR ')} `

		}

		return this
	}

	orderBy(...props){
		if(props.length){
			this.queryString += `ORDER BY ${formatOrderBy(props)} `

		}

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
		}

		return this
	}

	returnAll(){
		this.queryString += `RETURN * `

		return this
	}

	returnDistinct(...aliases){
		if(aliases.length){
			this.queryString += `RETURN DISTINCT ${formatAlias(aliases)} `
		}

		return this
	}

	returnNode(nodeAlias = ''){
		if(isNotString(nodeAlias))
			throw "returnNode: nodeAlias must be string"

		nodeAlias = nodeAlias || this._getCurrentNodeAlias()
		this.queryString += `RETURN ${nodeAlias} as node `

		return this
	}

	returnRel(relAlias = ''){
		if(isNotString(relAlias))
			throw "Error: returnRel - relAlias must be string"

		this.queryString += `RETURN `
		if(relAlias)
			this.queryString += `${relAlias} as `

		this.queryString += `rel `

		return this
	}

	set(...props){
		if(props.length){
			this.queryString += `SET ${formatList(props)} `
		}

		return this
	}

	skip(amount){
		if(amount && parseInt(amount)){
			this.queryString += `SKIP ${parseInt(amount)} `

		}

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

	where(...args){
		if(args.length){
			if(!this._whereClauseUsed){
				this.queryString += `WHERE `
				this._whereClauseUsed = true
			}else{
				this.queryString += `AND `
			}

			this.queryString += `${formatList(args, ' AND ')} `

		}

		return this
	}

	whereProp(prop){
		if(prop){
			this.where(formatProps({alias: this.currentAlias}, prop))
		}

		return this
	}

	wherePropGreater(prop){
		if(prop){
			this.where(formatProps({alias: this.currentAlias}, prop, ">"))
		}

		return this
	}

	wherePropIn(prop){
		if(prop){
			this.where(formatProps({alias: this.currentAlias}, prop, "IN"))
		}

		return this
	}

	wherePropRegexp(props){
		if(props){
			let a = []
			for(let propKey in props){
				a.push(`${this.currentAlias}.${propKey} =~ {${this._getParamKey(propKey, props[propKey])}}`)
			}

			this.where(...a)
		}

		return this
	}

	with(...args){
		if(args.length)
			this.queryString += `WITH ${formatList(args)} `

		return this
	}

	withNode(nodeAlias){
		this.queryString += `WITH ${nodeAlias || this._getCurrentNodeAlias()} `

		return this
	}

	xor(...args){
		if(args.length){
			if(!this._whereClauseUsed){
				this.queryString += `WHERE `
				this._whereClauseUsed = true
			}else{
				this.queryString += `XOR `
			}

			this.queryString += `${formatList(args, ' XOR ')} `

		}

		return this
	}
}
