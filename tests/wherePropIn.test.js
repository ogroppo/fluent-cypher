import test from 'ava';
import CypherQuery from '../index';

test('wherePropIn arg', t => {
	t.is(new CypherQuery().matchNode().wherePropIn({mamma: ['this', 'that']}).queryString, 'MATCH (node) WHERE node.mamma IN ["this","that"] ')
	t.is(new CypherQuery().matchNode().wherePropIn({count: [1, 2]}).queryString, 'MATCH (node) WHERE node.count IN [1,2] ')
});
