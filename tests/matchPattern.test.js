import test from 'ava';
import CypherQuery from '../index';

test('matchPattern', t => {
	var q = new CypherQuery();
	q.matchPattern({name: 'dad'}, {name: 'rel'}, {name: 'sin'})
	t.is(q.queryString,
		'MATCH ( {name:{name0}})-[ {name:{name1}}]->( {name:{name2}}) ')
});
