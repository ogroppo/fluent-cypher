import test from 'ava';
import CypherQuery from '../index';

test('unwind invalid arg', t => {
	t.throws(()=>{
		new CypherQuery().unwind()
	});
});

test('unwind valid arg', t => {
	t.is(new CypherQuery().unwind([1,2,3]).queryString, `UNWIND {data0} `);
});
