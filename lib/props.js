const {isString, isObject} = require('isnot')

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
