const getDb = require('./getDb')
const getNodeQuery = require('./getNodeQuery')

module.exports = function deleteNodes(nodes){
	return getDb().then((db)=>{
		let inClause = {$in: nodes.map(node => node._id)}
		let nodeFilter = {_id: inClause}
		let relFilter = {$or: [{start: inClause}, {end: inClause}]}

	 	return db.collection('rels').deleteMany(relFilter).then(()=>{
			return db.collection('nodes').deleteMany(nodeFilter)
		})
	});
}
