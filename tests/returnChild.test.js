import test from 'ava';
import CypherQuery from '../index';

test('returnChild', t => {
	var query = new CypherQuery
	query.matchNode()
	query.matchChild()
	query.returnChild()
	t.is(query.queryString, 'MATCH (node) MATCH (node)-[]->(child) RETURN child as child ');
});
