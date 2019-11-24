import test from 'ava';
import CypherQuery from '../index';

test('#onCreateSet no args', t => {
	t.throws(() => new CypherQuery().onCreateSet())
});

test('#onCreateSet string', t => {
	t.is(new CypherQuery().onCreateSet('node.prop = ciccio', 'rel.prop = pasticcio').queryString,
  'ON CREATE SET node.prop = ciccio, rel.prop = pasticcio ')
});

test('#onCreateSet objects', t => {
	t.is(
    new CypherQuery().onCreateSet({alias: 'node', log: 22, shol: 'bla', zu: ['12','21']}).queryString,
    'ON CREATE SET node.log = {log0}, node.shol = {shol1}, node.zu = {zu2} '
  )
  t.is(
    new CypherQuery().onCreateSet({alias: 'node', log: {'<=': 22}}).queryString,
    'ON CREATE SET node.log <= {log0} '
  )
  t.deepEqual(
    new CypherQuery().onCreateSet({alias: 'node', log: null, d: new Date('2019-12-12')}).queryParams,
    {log0: null, d1: '2019-12-12T00:00:00.000Z'}
  )
});
