import test from 'ava';
import CypherQuery from '../../index';

test('_formatCypherLabels', t => {
	var query = new CypherQuery();
	t.is(query._formatCypherLabels(['this and', 'that', '123']), ':`this and`:that:`123`');
});