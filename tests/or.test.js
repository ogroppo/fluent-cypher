import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('or default', t => {
	t.is(new CypherQuery().or().queryString, '')
});

test('or rest args', t => {
	t.is(new CypherQuery().or('custom.prop = "ciao"', 'n:Label').or('cane').queryString, `WHERE custom.prop = "ciao" OR n:Label OR cane `)
});

test('or chain', t => {
	t.is(new CypherQuery().or('custom.prop = "ciao"').or('n:Label', 'leche').queryString, `WHERE custom.prop = "ciao" OR n:Label OR leche `)
});