import test from 'ava';
import CypherQuery from '../index';

test('Match clause', t => {
	t.is(new CypherQuery().match('custom string').queryString, 'MATCH custom string ')
	t.is(new CypherQuery().match('pattern1', 'pattern2').queryString, 'MATCH pattern1, pattern2 ')
});
