import test from 'ava';
import CypherQuery from '../index';

test('union clause', t => {
	t.is(new CypherQuery().union().queryString, 'UNION ')
});