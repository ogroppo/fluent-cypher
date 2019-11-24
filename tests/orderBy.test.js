import test from 'ava';
import CypherQuery from '../index';

test('orderBy no args', t => {
	t.throws(() => new CypherQuery().orderBy())
});

test('orderBy clause', t => {
	t.is(new CypherQuery().orderBy('custom.prop').queryString, 'ORDER BY custom.prop ')
	t.is(
    new CypherQuery().orderBy('prop1', 'rel.prop2', {alias: 'node', done: 'DESC'}).queryString,
    'ORDER BY prop1, rel.prop2, node.done DESC '
  )
});
