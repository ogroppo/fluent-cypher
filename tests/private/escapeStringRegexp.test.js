import test from 'ava';
import CypherQuery from '../../index';

test('_escapeStringRegexp', t => {
	var query = new CypherQuery();
	t.is(query._escapeStringRegexp('\.do?'), '\\\.do\\?');
});