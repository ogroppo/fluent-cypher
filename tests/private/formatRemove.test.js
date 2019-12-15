import test from 'ava';
import CypherQuery from '../../index';

test('_formatRemove', t => {
	var query = new CypherQuery();
	t.is(query._formatRemove(['this', 'that']), 'this, that');
});