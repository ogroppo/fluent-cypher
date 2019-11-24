import test from 'ava';
import CypherQuery from '../index';

test('#skip throws', t => {
	t.throws(()=>new CypherQuery().skip())
	t.throws(()=>new CypherQuery().skip('0'))
	t.throws(()=>new CypherQuery().skip(0))
});

test('#skip clause', t => {
	t.is(new CypherQuery().skip(1).queryString, 'SKIP 1 ')
	t.is(new CypherQuery().skip(33).queryString, 'SKIP 33 ')
});
