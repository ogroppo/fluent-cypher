import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('returnRel invalid', t => {
	var query = new CypherQuery;
	t.throws(()=>{
		query.returnRel([]);
	});
	t.throws(()=>{
		query.returnRel({alias: 'relAlias'});
	});
});

test('returnRel default', t => {
	var query = new CypherQuery;
	query.returnRel();
	t.is(query.queryString, 'RETURN rel ');
});

test('returnRel arg', t => {
	var query = new CypherQuery;
	query.returnRel('knows');
	t.is(query.queryString, 'RETURN knows as rel ');
});