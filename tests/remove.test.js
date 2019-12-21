import test from 'ava';
import CypherQuery from '../index';

test('remove no args', t => {
	t.throws(() => new CypherQuery().remove())
});

test('remove string', t => {
	t.is(new CypherQuery().remove('custom.prop').queryString, 'REMOVE custom.prop ')
	t.is(new CypherQuery().remove('prop1', 'prop2').queryString, 'REMOVE prop1, prop2 ')
});

test('remove object', t => {
	t.is(new CypherQuery().remove({$: 'custom', prop: 'prop'}).queryString, 'REMOVE custom.prop ')
	t.is(new CypherQuery().remove({$: 'p', prop: 'can', props: ['lel', 'lol']}).queryString, 'REMOVE p.lel, p.lol, p.can ')
	t.is(new CypherQuery().remove({$: 'p', label: 'S', labels: ['P']}).queryString, 'REMOVE p:P:S ')
});
