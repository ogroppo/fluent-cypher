import test from 'ava';
import CypherQuery from '../index';

test('Merge invalid node throws error', t => {
	var query = new CypherQuery;
	t.throws(()=>{query.mergeNode(['invalid'])});
	t.throws(()=>{query.mergeNode(null)});
	t.throws(()=>{query.mergeNode({id:'0'})});
	t.throws(()=>{query.mergeNode({id: 0})});
});

test('Merge empty node and concatenation', t => {
	var query = new CypherQuery;
	query.mergeNode({type: 'ciccio'});
	query.mergeNode({someprop: 'ciccio'});
	t.is(query.queryString, 'MERGE (node {type:{type0}}) MERGE (node1 {someprop:{type0}}) ');
});

test('Merge node with all arguments', t => {
	var query = new CypherQuery({createdTimestamp: true, updatedTimestamp: true, userId: 13});
	query.mergeNode(
		{alias: 'box', label: 'Box', labels: ['hey', 'you too'], type: 'content'},
		{setProps: {cane: 'morto'}, removeProps: ['ladro'], setLabels: ['Bimbo'], removeLabels: ['GG', 'SS']}
	);
	t.is(query.queryString,
'MERGE (box:`hey`:`you too`:`Box` {type:{type1}}) \
ON CREATE SET box.createdAt = timestamp(), box.createdBy = {userId} \
REMOVE box.ladro, box:`GG`:`SS` SET box.cane = {cane2}, box:`Bimbo`, box.updatedBy = {userId}, box.updatedAt = timestamp() ');
	t.deepEqual(query.queryParams, {type1: 'content', cane2: 'morto', userId: 13});
});
