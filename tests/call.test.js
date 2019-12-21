import test from 'ava';
import CypherQuery from '../index';

test('#call', t => {
	var query = new CypherQuery();
	t.is(query.call('db.labels()').queryString, "CALL db.labels() ");
});