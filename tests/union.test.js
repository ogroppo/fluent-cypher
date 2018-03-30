import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('union clause', t => {
	t.is(new CypherQuery().union().queryString, 'UNION ')
});