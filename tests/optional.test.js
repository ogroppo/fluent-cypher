import test from 'ava';
import CypherQuery from '../index';

test('OPTIONAL clause', t => {
	t.is(new CypherQuery().optional().queryString, '')
	t.is(new CypherQuery().optional(true).queryString, 'OPTIONAL ')
	t.is(new CypherQuery().optional(false).queryString, '')
});