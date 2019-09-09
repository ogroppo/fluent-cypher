const {isName, isNotVariableName} = require('isnot')
const {formatNode, nodeMetaFields} = require('./lib/node')
const {formatRel, relMetaFields} = require('./lib/rel')

module.exports = class CypherTools{
	debug(options = {}){

		let _queryString = this.queryString

		let _queryParams = this.queryParams
		for(let param in _queryParams){
			_queryString = _queryString.replace(new RegExp(`{${param}}`, 'g'), JSON.stringify(_queryParams[param]) )
		}

		if(!options.compact){
			_queryString = _queryString.replace(new RegExp(' CREATE', 'g'), '\nCREATE')
			_queryString = _queryString.replace(new RegExp(' MATCH', 'g'), '\nMATCH')
			_queryString = _queryString.replace(new RegExp(' MERGE', 'g'), ' \nMERGE')
			_queryString = _queryString.replace(new RegExp(' SET', 'g'), ' \nSET')
			_queryString = _queryString.replace(new RegExp(' REMOVE', 'g'), ' \nREMOVE')
			_queryString = _queryString.replace(new RegExp(' DELETE', 'g'), ' \nDELETE')
			_queryString = _queryString.replace(new RegExp(' DETACH', 'g'), ' \nDETACH')
			_queryString = _queryString.replace(' RETURN', ' \nRETURN')
			console.log()
		}

		console.log(_queryString)

		return this
	}

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
		this.queryParams[paramKey] = propVal
		return paramKey
	}

	_formatPropsParams(alias, props, operator = "=", divider = ", ") {
		var a = []
		for (var key in props) {
			a.push(`${alias}.${key} ${operator} {${this._getParamKey(key, props[key])}}`);
		}

		return a.join(divider)
	}

	_node(node = {}){
		if(isName(node.label)){
			node.labels = node.labels || []
			node.labels.push(node.label)
		}

		let paramMap = {}
		for(let nodePropKey in node){
			if(nodeMetaFields.includes(nodePropKey))
				continue

			paramMap[nodePropKey] = this._getParamKey(nodePropKey, node[nodePropKey])
		}

		return formatNode(node, paramMap)
	}

	_rel(rel = {}){
		let paramMap = {}
		for(let relPropKey in rel){
			if(relMetaFields.includes(relPropKey))
				continue

			paramMap[relPropKey] = this._getParamKey(relPropKey, rel[relPropKey])
		}

		return formatRel(rel, paramMap)
	}

	_pattern(parentNode, rel, childNode){
		return this._node(parentNode)+this._rel(rel)+this._node(childNode)
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
			throw "Trying to get current node alias, that not exists"

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
