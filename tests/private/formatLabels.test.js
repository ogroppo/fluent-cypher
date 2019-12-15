import test from 'ava';
import CypherQuery from '../../index';

test('_formatLabels', t => {
	var query = new CypherQuery();
	t.is(query._formatLabels(['this and', 'that']), ':`this and`:`that`');
});