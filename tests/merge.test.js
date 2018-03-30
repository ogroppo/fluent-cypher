import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('MERGE throws', t => {
	t.throws(()=> new CypherQuery().merge())
});

test('MERGE clause', t => {
	t.is(new CypherQuery().merge('custom string').queryString, 'MERGE custom string ')
	t.is(new CypherQuery().merge('pattern1', 'pattern2').queryString, 'MERGE pattern1, pattern2 ')
});
