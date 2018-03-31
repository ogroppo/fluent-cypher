import test from 'ava';
import CypherQuery from '../index';

test('onMatchSet default', t => {
	t.is(new CypherQuery().onMatchSet().queryString, '')
});

test('onMatchSet args', t => {
	t.is(new CypherQuery().onMatchSet('ciccio', 'pasticcio').queryString, 'ON MATCH SET ciccio, pasticcio ')
});