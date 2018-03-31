import test from 'ava';
import CypherQuery from '../index';

test('with default', t => {
	t.is(new CypherQuery().with().queryString, '')
});

test('with arguments', t => {
	var q = new CypherQuery();
	t.is(q.with('gino', 'paolo', 'count(ciccio) as ciccioCount').queryString, 'WITH gino, paolo, count(ciccio) as ciccioCount ')
});