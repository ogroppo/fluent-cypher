module.exports function formatWhereProps(element, props, operator = "="){
	var propsArray = []
	for (var key in props) {
		var val = props[key]
		propsArray.push(`${element.alias}.${key} ${operator} ${JSON.stringify(val)}`);
	}

	return a.join(' and ')
}
