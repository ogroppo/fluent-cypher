import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('unionAll clause', t => {
	t.is(new CypherQuery().unionAll().queryString, 'UNION ALL ')
});