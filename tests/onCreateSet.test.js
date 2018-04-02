import test from 'ava';
import CypherQuery from '../index';

test('onCreateSet args', t => {
	t.is(new CypherQuery().onCreateSet('node.prop = ciccio', 'rel.prop = pasticcio').queryString, 'ON CREATE SET node.prop = ciccio, rel.prop = pasticcio ')
});
