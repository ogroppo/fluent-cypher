import test from 'ava';
import CypherQuery from '../index';

test('onMatchSet no args', t => {
	t.throws(() => new CypherQuery().onMatchSet())
});

test('onMatchSet string', t => {
	t.is(new CypherQuery().onMatchSet('node.prop = ciccio', 'rel.prop = pasticcio').queryString,
  'ON MATCH SET node.prop = ciccio, rel.prop = pasticcio ')
	t.is(
    new CypherQuery().onMatchSet({alias: 'node', log: 22, shol: 'bla', zu: ['12','21']}).queryString,
    'ON MATCH SET node.log = {log0}, node.shol = {shol1}, node.zu = {zu2} '
  )
  t.is(
    new CypherQuery().onMatchSet({alias: 'node', log: {'<=': 22}}, {alias: '4', gg: 'lol'}).queryString,
    'ON MATCH SET node.log <= {log0}, 4.gg = {gg1} '
  )
  t.deepEqual(
    new CypherQuery().onMatchSet({alias: 'node', log: null, d: new Date('2019-12-12')}).queryParams,
    {log0: null, d1: '2019-12-12T00:00:00.000Z'}
  )
});
