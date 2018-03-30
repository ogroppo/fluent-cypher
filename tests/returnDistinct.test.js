import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('returnDistinct strings', t => {
	var query = new CypherQuery;
	query.returnDistinct('node', 'blatch');
	t.is(query.queryString, 'RETURN DISTINCT node, blatch ');
});

test('returnDistinct objects', t => {
	var query = new CypherQuery;
	query.returnDistinct({alias: 'node', as: 'criminal'}, {alias: 'blatch'}, 'kling');
	t.is(query.queryString, 'RETURN DISTINCT node as criminal, blatch, kling ');
});