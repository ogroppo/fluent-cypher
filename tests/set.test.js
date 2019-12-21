import test from 'ava';
import CypherQuery from '../index';

test('#set no args', t => {
	t.throws(() => new CypherQuery().set())
});

test('#set strings', t => {
	t.is(new CypherQuery().set('custom.prop = 1').queryString, 'SET custom.prop = 1 ')
	t.is(new CypherQuery().set('prop1', 'prop2').queryString, 'SET prop1, prop2 ')
});

test('#set objects', t => {
	t.is(
    new CypherQuery().set({$: 'node', log: 22, shol: 'bla', zu: ['12','21']}).queryString,
    'SET node.log = {log0}, node.shol = {shol1}, node.zu = {zu2} '
  )
  t.is(
    new CypherQuery().set({$: 'node', label: 'zio', labels: ['Po']}).queryString,
    'SET node:Po:zio '
  )
  t.deepEqual(
    new CypherQuery().set({$: 'node', log: null, d: new Date('2019-12-12')}).queryParams,
    {log0: null, d1: '2019-12-12T00:00:00.000Z'}
  )
});
