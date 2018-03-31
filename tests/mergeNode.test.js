import test from 'ava';
import CypherQuery from '../index';

test('Merge invalid node throws error', t => {
	var query = new CypherQuery;
	t.throws(()=>{
		query.mergeNode(['invalid'])
	});
	t.throws(()=>{
		query.mergeNode(null)
	});
	t.throws(()=>{
		query.mergeNode({id:'0'})
	});
	t.throws(()=>{
		query.mergeNode({id: 0})
	});
});

test('Merge empty node and concatenation', t => {
	var query = new CypherQuery;
	query.mergeNode({type: 'ciccio'});
	query.mergeNode({someprop: 'ciccio'});
	t.is(query.queryString, 'MERGE (node {type:{type0}}) MERGE (node1 {someprop:{type0}}) ');
});

test('Merge node with all arguments', t => {
	var query = new CypherQuery({timestamps: true, userId: 13});
	query.mergeNode(
		{alias: 'box', label: 'Box', labels: ['hey', 'you too'], type: 'content'},
		{setProps: {cane: 'morto'}, removeProps: ['ladro'], setLabels: ['Bimbo'], removeLabels: ['GG', 'SS']}
	);
	t.is(query.queryString,
'MERGE (box:`hey`:`you too`:`Box` {type:{type0}}) \
ON CREATE SET box.createdAt = timestamp(), box.createdBy = 13 \
REMOVE box.ladro, box:`GG`:`SS` SET box.cane = {cane1}, box:`Bimbo`, box.updatedAt = timestamp(), box.updatedBy = 13 ');
	t.deepEqual(query.queryParams, {type0: 'content', cane1: 'morto'});
});