import test from 'ava';
import CypherQuery from '../index';

test('with throws no arg', t => {
	t.throws(() => new CypherQuery().with())
});

test('with arguments', t => {
	var q = new CypherQuery();
	t.is(q.with('gino', 'paolo', 'count(ciccio) as ciccioCount').queryString, 'WITH gino, paolo, count(ciccio) as ciccioCount ')
});
