import test from 'ava';
import CypherQuery from '../index';

test('matchParent function', t => {
	var q = new CypherQuery()
	.matchNode({name: 'babbo'})
	.matchParent({name: 'pino'}, {alias: 'r', name: 'might', type: 'ping'}, {optional: true})
	t.is(q.queryString, 'MATCH (node {name:{name0}}) OPTIONAL MATCH (parent {name:{name1}})-[r:`ping` {name:{name2}}]->(node) ')
});
