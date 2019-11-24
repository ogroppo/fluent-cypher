import test from 'ava';
import CypherQuery from '../index';

test('debug', t => {
	t.true(new CypherQuery().debug() instanceof CypherQuery)
});
