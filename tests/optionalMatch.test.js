import test from 'ava';
import CypherQuery from '../index';

test('optionalMatch no args', t => {
	var query = new CypherQuery;
	t.throws(() => query.optionalMatch());
});

test('optionalMatch string', t => {
	var query = new CypherQuery;
	query.optionalMatch('LOL');
	t.is(query.queryString, 'OPTIONAL MATCH LOL ');
});

test('optionalMatch object', t => {
	var query = new CypherQuery;
	query.optionalMatch({$: 'ciao'});
	t.is(query.queryString, 'OPTIONAL MATCH (ciao) ');
});

test('optionalMatch object', t => {
	var query = new CypherQuery;
	query.optionalMatch([{$: 'ciao'}], [{}]);
	t.is(query.queryString, 'OPTIONAL MATCH (ciao), () ');
});
