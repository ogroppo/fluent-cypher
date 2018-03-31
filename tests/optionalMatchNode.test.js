import test from 'ava';
import CypherQuery from '../index';

test('OPTIONAL MATCH node clause', t => {
	var query = new CypherQuery;
	query.optionalMatchNode();
	t.is(query.queryString, 'OPTIONAL MATCH (node) ');
});