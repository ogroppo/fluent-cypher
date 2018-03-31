import test from 'ava';
import CypherQuery from '../index';

test('whereProp arg', t => {
	t.is(new CypherQuery().matchNode().whereProp({mamma: 'mia'}).queryString, 'MATCH (node) WHERE node.mamma = "mia" ')
});
