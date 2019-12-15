import test from 'ava';
import CypherQuery from '../index';

test('MERGE throws', t => {
	t.throws(()=> new CypherQuery().merge())
});

test('MERGE strings', t => {
	t.is(new CypherQuery().merge('custom string').queryString, 'MERGE custom string ')
	t.is(new CypherQuery().merge('pattern1', 'pattern2').queryString, 'MERGE pattern1, pattern2 ')
});

test('MERGE objects', t => {
	t.is(new CypherQuery().merge({zio: 'billy'}).queryString, 'MERGE ({zio:{zio0}}) ')
	t.is(new CypherQuery().merge({zio: 'billy'}, {labels: ['Stone', 'frik']}).queryString,
  'MERGE ({zio:{zio0}}), (:`Stone`:`frik`) ')
  t.is(new CypherQuery().merge({zio: 'billy', $: 'me'}).queryString,
  'MERGE (me{zio:{zio0}}) ')

  t.throws(() => new CypherQuery().merge({$: 'me space'}))

  t.deepEqual(
    new CypherQuery({defaultNodeProps: {zio: 'ken', ladder: 22}}).merge({zio: 'billy'}).queryParams,
    {zio0: 'billy', ladder1: 22}
  )

  t.deepEqual(
    new CypherQuery({forceNodeProps: {zio: 'ken'}}).merge({zio: 'billy'}).queryParams,
    {zio0: 'ken'}
  )
});

test('MERGE array', t => {
	t.is(new CypherQuery().merge([{zio: 'billy'}]).queryString, 'MERGE ({zio:{zio0}}) ')
	t.is(new CypherQuery().merge([{zio: 'billy'}, {type: 'Stone', direction: 'left'}, {mega: 'tera'}]).queryString,
    'MERGE ({zio:{zio0}})<-[:`Stone`]-({mega:{mega1}}) '
  )
});
