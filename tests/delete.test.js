import test from 'ava';
import CypherQuery from '../index';

test('delete wrong args', t => {
	t.throws(()=> new CypherQuery().delete())
	t.throws(()=> new CypherQuery().delete({$: 'rel'}))
	t.throws(()=> new CypherQuery().delete([]))
});

test('delete string', t => {
	t.is(new CypherQuery().delete('node').queryString, `DELETE node `)
	t.is(new CypherQuery().delete('node', 'rel').queryString, `DELETE node, rel `)
	t.is(new CypherQuery().delete('node.prop').queryString, `DELETE node.prop `)
});
