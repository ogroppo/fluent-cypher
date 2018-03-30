import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('where default', t => {
	t.is(new CypherQuery().where().queryString, '')
});

test('where rest args', t => {
	t.is(new CypherQuery().where('kamper', 'jumper').queryString, `WHERE kamper AND jumper `)
});

test('where chain', t => {
	t.is(new CypherQuery().where('kamper').where('jumper').match('fritto').where('ladro').queryString, `WHERE kamper AND jumper MATCH fritto WHERE ladro `)
});