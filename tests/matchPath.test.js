import test from 'ava';
import CypherQuery from '../index';

test('matchPath clause', t => {
	var q = new CypherQuery().matchPath();
	t.is(q.queryString, 'MATCH path = (parent)-[*]->(child) ')
});
