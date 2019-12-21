import test from 'ava';
import CypherQuery from '../index';

test('#foreach missing arg', t => {
	t.throws(()=> new CypherQuery().foreach())
});

test('#foreach arg string', t => {
	t.is(new CypherQuery().foreach('(n IN nodes(p)| SET n.marked = TRUE )').queryString, `FOREACH (n IN nodes(p)| SET n.marked = TRUE ) `)
});