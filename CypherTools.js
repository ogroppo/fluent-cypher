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

		if(options.emptyLineBefore)
			console.log()

		if(options.multiLine){
			_queryString = _queryString.replace(' MERGE', ' \nMERGE')
			_queryString = _queryString.replace(' RETURN', ' \nRETURN')
			_queryString = _queryString.replace(' MATCH', ' \nMATCH')
			console.log()
		}

		console.log(_queryString)

		return this
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
			let existingCount = this.nodeAliases.filter(candidateAlias => candidateAlias.startsWith(currentNodeAlias)).length
			currentNodeAlias += existingCount
		}

		this.nodeAliases.push(currentNodeAlias)
		this.currentAlias = currentNodeAlias
		return currentNodeAlias
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

		if(!this.relAliases){
			this.relAliases = [currentRelAlias]
		}else{
			if(this.relAliases.includes(currentRelAlias)){
				let existingCount = this.relAliases.filter((alias) => alias.startsWith(currentRelAlias)).length
				currentRelAlias += existingCount
			}

			this.relAliases.push(currentRelAlias)
		}

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
