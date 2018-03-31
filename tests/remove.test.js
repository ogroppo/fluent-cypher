import test from 'ava';
import CypherQuery from '../index';

test('REMOVE clause', t => {
	t.is(new CypherQuery().remove().queryString, '')
	t.is(new CypherQuery().remove('custom.prop = 1').queryString, 'REMOVE custom.prop = 1 ')
	t.is(new CypherQuery().remove('prop1', 'prop2').queryString, 'REMOVE prop1, prop2 ')
});