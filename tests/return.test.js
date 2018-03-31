import test from 'ava';
import CypherQuery from '../index';

test('Return array of strings', t => {
	var query = new CypherQuery;
	query.return('node', 'blatch');
	t.is(query.queryString, 'RETURN node, blatch ');
});

test('Return array of objects', t => {
	var query = new CypherQuery;
	query.return({alias: 'node', as: 'criminal'}, {alias: 'blatch'}, 'kling');
	t.is(query.queryString, 'RETURN node as criminal, blatch, kling ');
});