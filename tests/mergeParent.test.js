import test from 'ava';
import CypherQuery from '../index';

test('mergeParent function', t => {
	var q = new CypherQuery();
	q.mergeNode({name: 'babbo'});
	q.mergeParent({name: 'pino'}, {alias: 'r', name: 'might', type: 'ping', endIndex: 2})
	t.is(q.queryString,
		'MERGE (node {name:{name0}}) MERGE (parent {name:{name1}}) MERGE (parent)-[r:`ping` {name:{name2}, endIndex:{endIndex3}}]->(node) ');
	t.deepEqual(q.queryParams, {name0: 'babbo', name1: 'pino', name2: 'might', endIndex3: 2})
});
