import test from 'ava';
import CypherQuery from '../index';

test('loadCsv default', t => {
	t.throws(()=>new CypherQuery().loadCsv())
	t.throws(()=>new CypherQuery().loadCsv('/local/file.csv'))
});

test('loadCsv no headers', t => {
	var q = new CypherQuery()
	t.is(
		q.loadCsv('https://neo4j.com/docs/cypher-refcard/3.2/csv/artists.csv', {lineAlias: 'row'})
		.create('(node:`Artist` {name: row[1], year: toInteger(row[2])})').queryString,
		'LOAD CSV FROM "https://neo4j.com/docs/cypher-refcard/3.2/csv/artists.csv" AS row CREATE (node:`Artist` {name: row[1], year: toInteger(row[2])}) ')
});

test('loadCsv headers', t => {
	var q = new CypherQuery()
	t.is(
		q.loadCsv('https://neo4j.com/docs/cypher-refcard/3.2/csv/artists-with-headers.csv', {lineAlias: 'row', withHeaders: true})
		.create('(:Artist {name: row.Name, year: toInteger(row.Year)})').queryString,
		'LOAD CSV WITH HEADERS FROM "https://neo4j.com/docs/cypher-refcard/3.2/csv/artists-with-headers.csv" AS row CREATE (:Artist {name: row.Name, year: toInteger(row.Year)}) ')
});
