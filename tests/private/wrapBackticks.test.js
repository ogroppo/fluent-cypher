import test from 'ava';
import CypherQuery from '../../index';

test('_wrapBackticks', t => {
	var query = new CypherQuery();
	t.is(query._wrapBackticks('this'), 'this');
	t.is(query._wrapBackticks('t h i s'), '`t h i s`');
});