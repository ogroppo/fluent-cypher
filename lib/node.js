const {formatLabels} = require('./labels')
const {formatParamsMap} = require('./props')

exports.formatNode = (node, paramsMap) => `(${node.alias?node.alias:''}${formatLabels(node.labels)}${formatParamsMap(paramsMap)})`

exports.formatNodeAliasLabels = (node, labels) => `${node.alias}${formatLabels(labels)}`

exports.nodeMetaFields = [
	'alias',
	'label',
	'labels',
	'rel'
]
