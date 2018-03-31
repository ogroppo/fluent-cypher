import test from 'ava';
import CypherQuery from '../index';

test('wherePropRegexp arg', t => {
	const q = new CypherQuery()
	t.is(q.matchNode().wherePropRegexp({mamma: "(?i).*mia.*", awful: `(?i).*${q._escapeStringRegexp("^&[}+.*")}.*`}).queryString, `MATCH (node) WHERE node.mamma =~ {mamma0} AND node.awful =~ {awful1} `)
	t.deepEqual(q.queryParams, {mamma0: "(?i).*mia.*", awful1: `(?i).*${q._escapeStringRegexp("^&[}+.*")}.*`})
});
