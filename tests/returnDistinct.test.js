import test from 'ava';
import CypherQuery from '../index';

test('#returnDistinct no args', t => {
	t.throws(() => new CypherQuery().returnDistinct())
});

test('#returnDistinct strings', t => {
	var query = new CypherQuery;
	query.returnDistinct('node', 'blatch');
	t.is(query.queryString, 'RETURN DISTINCT node, blatch ');
});

test('#returnDistinct objects', t => {
	var query = new CypherQuery;
	query.returnDistinct({$: 'node', as: 'criminal'}, {$: 'blatch'}, 'kling');
	t.is(query.queryString, 'RETURN DISTINCT node AS criminal, blatch, kling ');
});
