import test from 'ava';
import CypherQuery from '../index';

test('limit throws', t => {
	t.throws(()=> new CypherQuery().limit())
	t.throws(()=> new CypherQuery().limit(0))
	t.throws(()=> new CypherQuery().limit('1'))
});

test('limit clause', t => {
	t.is(new CypherQuery().limit(1).queryString, 'LIMIT 1 ')
});
