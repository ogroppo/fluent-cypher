import test from 'ava';
import CypherQuery from '../index';

test('Match invalid node throws error', t => {
	var query = new CypherQuery;
	t.throws(()=>{
		query.matchNode(['invalid'])
	});
	t.throws(()=>{
		query.matchNode(null)
	});
	t.throws(()=>{
		query.matchNode({alias: 'invalid.alias'})
	});
});

test('Match empty node and current alias', t => {
	var query = new CypherQuery;
	query.matchNode({alias: 'other'});
	query.matchNode();
	query.matchNode();
	query.matchNode({alias: 'other1'});
	query.matchNode({alias: 'other2'});
	query.matchNode({alias: 'other3'});
	t.is(query.queryString, 'MATCH (other) MATCH (node) MATCH (node1) MATCH (other1) MATCH (other2) MATCH (other3) ');
});

test('Match node with alias, label, labels, properties, reserved field, set options, remove options', t => {
	var query = new CypherQuery;
	query.matchNode(
		{alias: 'box', label: 'Box', labels: ['hey', 'you too'], type: 'content', createdBy: 123, createdAt: 123123123},
		{setProps: {cane: 'morto'}, removeProps: ['ladro'], setLabels: ['Bimbo'], removeLabels: ['GG', 'SS']}
	);
	t.is(query.queryString, 'MATCH (box:`hey`:`you too`:`Box` {type:{type0}, createdBy:{createdBy1}, createdAt:{createdAt2}}) REMOVE box.ladro, box:`GG`:`SS` SET box.cane = {cane3}, box:`Bimbo` ');
});
