import test from 'ava';
import CypherQuery from '../../index';

test('_formatOrderBy', t => {
	var query = new CypherQuery();
	t.is(query._formatOrderBy(['this', 'that']), 'this, that');
});