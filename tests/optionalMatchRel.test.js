import test from 'ava';
import CypherQuery from '../index';

test('Match optional rel', t => {
	var query = new CypherQuery;
	query.optionalMatchRel();
	t.is(query.queryString, 'OPTIONAL MATCH ()-[rel]->() ');
});