import test from 'ava';
import CypherQuery from '../index';

test('ORDER BY clause', t => {
	t.is(new CypherQuery().orderBy('custom.prop').queryString, 'ORDER BY custom.prop ')
	t.is(new CypherQuery().orderBy('prop1', 'prop2', {alias: 'node', prop:'done', dir: 'DESC'}).queryString, 'ORDER BY prop1, prop2, node.done DESC ')
});
