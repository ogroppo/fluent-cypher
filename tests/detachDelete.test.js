import test from 'ava';
import CypherQuery from '../index';

test('detachDelete wrong args', t => {
	t.throws(()=> new CypherQuery().detachDelete())
	t.throws(()=> new CypherQuery().detachDelete({alias: 'rel'}))
	t.throws(()=> new CypherQuery().detachDelete([]))
});

test('detachDelete string', t => {
	t.is(new CypherQuery().detachDelete('node').queryString, `DETACH DELETE node `)
	t.is(new CypherQuery().detachDelete('node', 'rel').queryString, `DETACH DELETE node, rel `)
	t.is(new CypherQuery().detachDelete('node.prop').queryString, `DETACH DELETE node.prop `)
});
