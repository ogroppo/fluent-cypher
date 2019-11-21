import test from 'ava';
import CypherQuery from '../index';

test('whereNot no arg', t => {
	t.throws(() => new CypherQuery().whereNot())
});

test('where string arg', t => {
	t.is(new CypherQuery().whereNot('kamper').queryString,
  `WHERE NOT kamper `)
});
