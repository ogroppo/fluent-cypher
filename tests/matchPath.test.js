import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('matchPath clause', t => {
	var q = new CypherQuery().matchPath();
	t.is(q.queryString, 'MATCH path = (parent)-[*]->(child) ')
});
