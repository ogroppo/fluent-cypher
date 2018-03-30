import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('returnAll', t => {
	var query = new CypherQuery;
	query.returnAll();
	t.is(query.queryString, 'RETURN * ');
});