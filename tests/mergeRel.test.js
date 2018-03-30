import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

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
	var query = new CypherQuery();
	query.mergeRel(
		{	
			name: 'bonds',
			type: 'mane'
		}, 
		{	
			onMatchSet: {test: 'bla', jhonny: 2}, 
			onCreateSet: {created: 'prop', other: false},
			set: {bim: 'bam', bum: 20e1}
		}
	)
	.mergeRel({type: 'name'}, {parentAlias: 'unkle', childAlias: 'bunkle'});
	t.is(query.queryString, 'MERGE ()-[rel:`mane` {name:{name0}}]->() ON MATCH SET rel.matchedAt = timestamp(), rel.matchCount = coalesce(rel.matchCount, 1) + 1, rel.test = "bla", rel.jhonny = 2 ON CREATE SET rel.createdAt = timestamp(), rel.created = "prop", rel.other = false SET rel.bim = "bam", rel.bum = 200 MERGE (unkle)-[rel1:`name`]->(bunkle) ON MATCH SET rel1.matchedAt = timestamp(), rel1.matchCount = coalesce(rel1.matchCount, 1) + 1 ON CREATE SET rel1.createdAt = timestamp() ');
});