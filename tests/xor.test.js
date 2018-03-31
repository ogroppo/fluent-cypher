import test from 'ava';
import CypherQuery from '../index';

test('xor default', t => {
	t.is(new CypherQuery().xor().queryString, '')
});

test('xor rest args', t => {
	t.is(new CypherQuery().xor('custom.prop = "ciao"', 'n:Label').xor('cane').queryString, `WHERE custom.prop = "ciao" XOR n:Label XOR cane `)
});

test('xor chain', t => {
	t.is(new CypherQuery().xor('custom.prop = "ciao"').xor('n:Label', 'leche').queryString, `WHERE custom.prop = "ciao" XOR n:Label XOR leche `)
});