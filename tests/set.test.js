import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('SET clause', t => {
	t.is(new CypherQuery().set().queryString, '')
	t.is(new CypherQuery().set('custom.prop = 1').queryString, 'SET custom.prop = 1 ')
	t.is(new CypherQuery().set('prop1', 'prop2').queryString, 'SET prop1, prop2 ')
});