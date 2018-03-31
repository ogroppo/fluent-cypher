import test from 'ava';
import CypherQuery from '../index';

test('unionAll clause', t => {
	t.is(new CypherQuery().unionAll().queryString, 'UNION ALL ')
});