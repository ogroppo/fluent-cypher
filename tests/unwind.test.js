import test from 'ava';
import CypherQuery from '../index';

test('#unwind invalid arg', t => {
	t.throws(()=>new CypherQuery().unwind());
	t.throws(()=>new CypherQuery().unwind([12, 112]));
});

test('#unwind string', t => {
	t.is(new CypherQuery().unwind('[1,2,3] as list').queryString, `UNWIND [1,2,3] as list `);
});

test('#unwind aliased', t => {
	t.is(new CypherQuery().unwind({$: 'collection', as: 'list'}).queryString, `UNWIND collection AS list `);
});

test('#unwind param', t => {
	t.is(new CypherQuery().unwind({$: '$list', as: 'item'}).queryString, `UNWIND $list AS item `);
});

test('#unwind with var', t => {
	t.is(new CypherQuery().unwind({$: [1,2,3], as: 'row'}).queryString, `UNWIND {unwind0} AS row `);
});
