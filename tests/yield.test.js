import test from 'ava';
import CypherQuery from '../index';

test('#yield', t => {
	var query = new CypherQuery();
	t.is(query.yield('name, signature').queryString, "YIELD name, signature ");
});