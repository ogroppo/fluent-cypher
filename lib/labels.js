const {isNotString, isEmptyString} = require('isnot')

const cypherLabelFormat = function(label){
	if(isNotString(label))
		throw "Cypher label must be string, supplied: " + label.toString() 

	if(isEmptyString(label))
		return '';

	return ":`"+escapeLabel(label)+"`"
}

const escapeLabel = function(label){
	return label;
}

exports.formatLabels = function(labels = []){
	var cypherLabelString = ''

	labels.forEach(label => {
		cypherLabelString += cypherLabelFormat(label)
	})

	return cypherLabelString
}