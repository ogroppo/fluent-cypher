import test from 'ava';
import CypherQuery from '../index';

test('mergeChild function', t => {
	var q = new CypherQuery();
	q.mergeNode({name: 'dad'});
	q.mergeChild({alias: 'r', type: 'ping', name: 'might', startIndex: 0}, {name: 'son'})
	t.is(q.queryString,
		'MERGE (node {name:{name0}}) MERGE (node)-[r:`ping` {name:{name1}, startIndex:{startIndex2}}]->(child {name:{name3}}) ')
	t.deepEqual(q.queryParams, {name0: 'dad', name1: 'might', startIndex2: 0, name3: 'son'})
});
