const {isString, isObject} = require('isnot')

const cypherAliasFormat = (alias) => {
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

exports.formatAlias = (aliases) => aliases.map(alias => cypherAliasFormat(alias)).join(', ')
