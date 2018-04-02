import test from 'ava';
import CypherQuery from '../index';

test('matchRelated', t => {
	var q = new CypherQuery()
	.matchNode({name: 'babbo'})
	.matchRelated({name: 'pino'}, {type: 'ping', name: 'g', maxDepth: 3}, {optional: true})
	t.is(q.queryString, 'MATCH (node {name:{name0}}) OPTIONAL MATCH (node)-[rel:`ping`*..3 {name:{name1}}]-(related {name:{name2}}) ')
});
