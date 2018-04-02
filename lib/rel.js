const {formatParamsMap} = require('./props')

exports.formatRel = (rel = {}, paramMap) => {

	let relString = ''
	if(rel.direction === 'left')
		relString = '<'

	relString = '-['

	if(rel.alias)
		relString += rel.alias

	if(rel.type)
		relString += ":`"+rel.type+"`"


	if(rel.depth){ //can be *, *1
		relString += '*'
		if(rel.depth !== '*' && rel.depth !== 'any')
			relString += rel.depth
	}else if(rel.minDepth || rel.maxDepth){ //can *1..2, *..2, *2..
		relString += '*'
		if(rel.minDepth)
			relString += rel.minDepth
		relString += '..'
		if(rel.maxDepth)
			relString += rel.maxDepth
	}

	relString += formatParamsMap(paramMap)

	relString += "]-"

	if(rel.direction === undefined || rel.direction === 'right')
		relString += ">"

	return relString
}

exports.relMetaFields = [
	'alias',
	'type',
	'depth',
	'maxDepth',
	'minDepth',
	'direction'
]
