import test from 'ava';
import CypherQuery from '../index';

test('log returns instance', t => {
	t.true(new CypherQuery().log() instanceof CypherQuery)
});
