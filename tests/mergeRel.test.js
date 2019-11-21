import test from 'ava';
import CypherQuery from '../index';

test('MERGE invalid rel throws error', t => {
	var query = new CypherQuery;
	t.throws(()=>{
		query.mergeRel(['invalid'])
	});
	t.throws(()=>{
		query.mergeRel(null)
	});
	t.throws(()=>{
		query.mergeRel()
	});
	t.throws(()=>{
		query.mergeRel({})
	});
});

test('mergeRel all props + chain', t => {
	var query = new CypherQuery({matchedTimestamp: true, matchedCount: true, createdTimestamp: true});
	query.mergeRel(
		'parent',
		{
			name: 'bonds',
			type: 'mane'
		},
		'child',
		{
			onMatchSet: {test: 'bla', jhonny: 2},
			onCreateSet: {created: 'prop', other: false},
			set: {bim: 'bam', bum: 20e1}
		}
	)
	.mergeRel('unkle', {type: 'name'}, 'bunkle');
	t.is(query.queryString, "MERGE (parent)-[rel:`mane` {name:{name0}}]->(child) " +
  "ON MATCH SET rel.matchedAt = timestamp(), rel.matchCount = " +
  "coalesce(rel.matchCount, 1) + 1, rel.test = {test1}, rel.jhonny = {jhonny2} " +
  "ON CREATE SET rel.createdAt = timestamp(), rel.created = {created3}, " +
  "rel.other = {other4} SET rel.bim = {bim5}, rel.bum = {bum6} MERGE " +
  "(unkle)-[rel1:`name`]->(bunkle) ON MATCH SET rel1.matchedAt = timestamp(), " +
  "rel1.matchCount = coalesce(rel1.matchCount, 1) + 1 ON CREATE SET " +
  "rel1.createdAt = timestamp() ");
});
