import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('CypherQuery contructor', t => {
	var query = new CypherQuery();
	t.is(typeof query, 'object');
	t.is(typeof query.queryString, 'string');
	t.is(query.queryString.length, 0);
	t.is(Object.keys(query.queryParams).length, 0);
	t.true(query instanceof CypherQuery);
});