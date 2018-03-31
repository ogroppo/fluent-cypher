import test from 'ava';
import CypherQuery from '../index';

test('matchChild function', t => {
	var q = new CypherQuery();
	q.matchNode({name: 'babbo'}).matchChild({name: 'pino'}, {rel: {alias: 'r', name: 'might', type: 'ping'}, optional: true})
	t.is(q.queryString, 'MATCH (node {name:{name0}}) OPTIONAL MATCH (node)-[r:`ping` {name:{name1}}]->(child {name:{name2}}) ')
});