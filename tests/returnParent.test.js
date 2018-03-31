import test from 'ava';
import CypherQuery from '../index';

test('returnParent', t => {
	var query = new CypherQuery
	query.matchNode()
	query.matchParent()
	query.returnParent()
	t.is(query.queryString, 'MATCH (node) MATCH (parent)-[]->(node) RETURN parent as parent ');
});
