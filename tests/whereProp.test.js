import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('whereProp default', t => {
	t.is(new CypherQuery().whereProp().queryString, '')
});

test('whereProp arg', t => {
	t.is(new CypherQuery().matchNode().whereProp({mamma: 'mia'}).queryString, 'MATCH (node) WHERE node.mamma = "mia" ')
});
