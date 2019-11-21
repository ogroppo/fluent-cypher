import test from 'ava';
import CypherQuery from '../index';

test('where default', t => {
	t.throws(() => new CypherQuery().where())
});

test('where rest args', t => {
	t.is(new CypherQuery().where('kamper').queryString,
  `WHERE kamper `)
});

test('where chain', t => {
	t.is(new CypherQuery().where('kamper').where('jumper').match('fritto').where('ladro').queryString,
  `WHERE kamper AND jumper MATCH fritto WHERE ladro `)
});

test('where object arg', t => {
	t.is(new CypherQuery().where({san: 'marzano'}, {alias: 'd'}).queryString,
  `WHERE d.san = {san0} `)

	t.is(new CypherQuery().where({san: 1}, {alias: 'd', compare: "<="}).queryString,
  `WHERE d.san <= {san0} `)

	t.is(new CypherQuery().where({san: 'marzano &', zio: 'boys'}, {alias: 'd', compare: "<>"}).queryString,
  `WHERE d.san <> {san0} AND d.zio <> {zio1} `)

	t.is(new CypherQuery().where({san: 'marzano', zio: 'boys'}, {alias: 'd', compare: "IS NULL", divider: "OR"}).queryString,
  `WHERE d.san IS NULL OR d.zio IS NULL `)

	t.is(new CypherQuery().where({san: 'marzano', zio: 'boys'}, {alias: 'd', compare: "IS not NULL", divider: "XOR"}).queryString,
  `WHERE d.san IS not NULL XOR d.zio IS not NULL `)

});

test('where object array', t => {
  let q = new CypherQuery()
  t.is(q.where({san: ['marzano', 'pusiano']}, {alias: 'd', compare: "IN", divider: "XOR"}).queryString,
  `WHERE d.san IN {san0} `)
  t.deepEqual(q.queryParams, {san0: ['marzano', 'pusiano']})
})

test('where Prop Regexp arg', t => {
	const q = new CypherQuery()
	t.is(q.matchNode()
  .where({mamma: "(?i).*mia.*", awful: `(?i).*${q._escapeStringRegexp("&{}.-[]")}.*`}, {compare: '=~'}).queryString,
  `MATCH (node) WHERE node.mamma =~ {mamma0} AND node.awful =~ {awful1} `)
});
