const {isString, isObject} = require('isnot')

exports.formatParamsMap = (paramsMap) => {
	let propsString = ''

	if(Object.keys(paramsMap).length){
		propsString = ' {'
		let propsArray = []
		for(let propKey in paramsMap){
			propsArray.push(`${propKey}:{${paramsMap[propKey]}}`)
		}
		propsString += propsArray.join(', ')
		propsString += '}'
	}

	return propsString
}

exports.formatProps = (element, props, operator = "=") => {
	var a = []
	for (var key in props) {
		var val = props[key]
		a.push(`${element.alias}.${key} ${operator} ${JSON.stringify(val)}`);
	}

	return a.join(', ')
}

exports.formatPropsParams = (alias, props, operator = "=", divider = ", ") => {
	var a = []
	for (var key in props) {
		a.push(`${alias}.${key} ${operator} {${props[key]}}`);
	}

	return a.join(divider)
}

exports.formatOrderBy = (props) => {
	var a = [];

	props.forEach((orderByProp) => {
		if(isString(orderByProp)){
			a.push(orderByProp);
		}else if(isObject(orderByProp)){
			orderByProp.dir = orderByProp.dir || 'ASC'
			a.push(`${orderByProp.alias}.${orderByProp.prop} ${orderByProp.dir}`);
		}
	});

	return a.join(', ');
}

exports.formatPropKeys = (element, propKeys) => {
	var a = [];
	propKeys.forEach((key)=>{
		a.push(`${element.alias}.${key}`);
	})

	return a.join(', ');
}

exports.formatTimestamp = (alias, prop) => `${alias}.${prop} = timestamp()`

exports.formatCreatedAt = (obj) => `${obj.alias}.createdAt = timestamp()`

exports.formatCreatedBy = (alias, userId) => `${alias}.createdBy = {userId}`

exports.formatUpdatedAt = (obj) => `${obj.alias}.updatedAt = timestamp()`

exports.formatUpdatedBy = (alias, userId) => `${alias}.updatedBy = {userId}`

exports.formatMatchedAt = (obj) => `${obj.alias}.matchedAt = timestamp()`

exports.formatMatchedCount = (obj) => `${obj.alias}.matchCount = coalesce(${obj.alias}.matchCount, 1) + 1`
