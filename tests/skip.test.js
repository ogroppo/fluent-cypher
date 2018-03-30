import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('skip default', t => {
	t.is(new CypherQuery().skip().queryString, '')
	t.is(new CypherQuery().skip(0).queryString, '')
	t.is(new CypherQuery().skip(0.0).queryString, '')
	t.is(new CypherQuery().skip('0').queryString, '')
	t.is(new CypherQuery().skip(null).queryString, '')
	t.is(new CypherQuery().skip(undefined).queryString, '')
});

test('skip clause', t => {
	t.is(new CypherQuery().skip(1).queryString, 'SKIP 1 ')
	t.is(new CypherQuery().skip('33').queryString, 'SKIP 33 ')
	t.is(new CypherQuery().skip('33.33').queryString, 'SKIP 33 ')
});