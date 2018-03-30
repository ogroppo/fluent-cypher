import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('OPTIONAL clause', t => {
	t.is(new CypherQuery().optional().queryString, '')
	t.is(new CypherQuery().optional(true).queryString, 'OPTIONAL ')
	t.is(new CypherQuery().optional(false).queryString, '')
});