import test from 'ava';
import CypherQuery from '../index';

test('#where default', t => {
	t.throws(() => new CypherQuery().where())
});

test('#where string args', t => {
	t.is(new CypherQuery().where('kamper').queryString, `WHERE kamper `)
});

test('#where string args', t => {
	t.is(new CypherQuery().where('NOT', {$: 'p', label: '1', name: 'T'}).queryString,
  "WHERE NOT p:`1` AND p.name = {name0} ")

  t.is(new CypherQuery().where({$: 'p', labels: ['1']}, 'OR', 'some.think = pig').queryString,
  "WHERE p:`1` OR some.think = pig ")
});

test('#where string args', t => {
	t.is(new CypherQuery().where(
    {$: 'n', name: 'p'},
    'XOR',
    [
      {$: 'n', age: {'<': 23}},
      'AND',
      {$: 'n', name: 'p'}
    ],
    'OR NOT',
    [
      {$: 'n', name: 'asd'},
      'OR',
      {$: 'n', name: 'p'}
    ]
  ).queryString,
  `WHERE n.name = {name0} XOR (n.age < {age1} AND n.name = {name0}) OR NOT (n.name = {name2} OR n.name = {name0}) `)
});

test('#where object', t => {
  t.is(new CypherQuery().where({$: 'd', t: {exists: true}}).queryString,
  `WHERE exists(d.t) `)

	t.is(new CypherQuery().where({$: 'd', san: 'marzano'}).queryString,
  `WHERE d.san = {san0} `)

	t.is(new CypherQuery().where({$: 'd', san: { '<>': 'marzano'}, ges: 'tapos'}).queryString,
  `WHERE d.san <> {san0} AND d.ges = {ges1} `)

	t.is(new CypherQuery().where({$: 'd', san: 'IS NULL'}, 'OR', {$: 'f', gio: "IS NOT NULL"}).queryString,
  `WHERE d.san IS NULL OR f.gio IS NOT NULL `)
});

test('where object array', t => {
  let q = new CypherQuery()
  t.is(q.where({$: 'd', san: {'IN': ['marzano', 'pusiano']}}).queryString,
  `WHERE d.san IN {san0} `)
  t.deepEqual(q.queryParams, {san0: ['marzano', 'pusiano']})
})

test('where object array labels', t => {
  let q = new CypherQuery()
  t.is(q.where({$: 'd', label: 'PUSTO LENGO'}).queryString,
  "WHERE d:`PUSTO LENGO` ")
})

test('where Prop Regexp arg', t => {
	const q = new CypherQuery()
	t.is(q.where(
    {$: 'node', mamma: {'=~': "(?i).*mia.*"}, awful: {'=~': `(?i).*${q._escapeStringRegexp("&{}.-[]")}.*`}}).queryString,
  `WHERE node.mamma =~ {mamma0} AND node.awful =~ {awful1} `)
});
