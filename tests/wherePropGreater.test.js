import test from 'ava';
import CypherQuery from '../index';

test('wherePropGreater arg', t => {
	t.is(new CypherQuery().matchNode().wherePropGreater({mamma: 'mia'}).queryString, 'MATCH (node) WHERE node.mamma > "mia" ')
	t.is(new CypherQuery().matchNode().wherePropGreater({count: 1}).queryString, 'MATCH (node) WHERE node.count > 1 ')
});
