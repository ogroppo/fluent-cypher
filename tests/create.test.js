import test from 'ava';
import CypherQuery from '../index';

test('Create clause', t => {
	t.is(new CypherQuery().create().queryString, 'CREATE ')
	t.is(new CypherQuery().create('custom string').queryString, 'CREATE custom string ')
	t.is(new CypherQuery().create('pattern1', 'pattern2').queryString, 'CREATE pattern1, pattern2 ')
});