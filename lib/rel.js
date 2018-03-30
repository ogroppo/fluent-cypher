const {formatParamsMap} = require('./props')

exports.formatRel = (rel = {}, paramMap) => {

	let relString = ''
	if(rel.direction === 'left')
		relString = '<'
	
	relString = '-['
	
	if(rel.alias){
		relString += rel.alias
	}

	if(rel.type)
		relString += ":`"+rel.type+"`"


	//can be *, 1, 2, 1..2
	if(rel.depth){
		relString += '*'
		if(rel.depth !== '*' || rel.depth !== 'any')
			relString += rel.depth.toString().replace('*', '')
	} 
		


	relString += formatParamsMap(paramMap)

	relString += "]-"

	if(rel.direction === undefined || rel.direction === 'right')
		relString += ">"

	return relString
}

exports.relMetaFields = [
	'alias', 
	'parentAlias', 
	'childAlias',
	'type',
	'depth',
	'direction'
]