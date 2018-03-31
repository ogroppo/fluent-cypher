import test from 'ava';
import CypherQuery from '../index';

test('Match invalid rel throws error', t => {
	var query = new CypherQuery;
	t.throws(()=>{
		query.matchRel(['invalid'])
	});
	t.throws(()=>{
		query.matchRel(null)
	});
	t.throws(()=>{
		query.matchRel({alias: 'my rel'})
	});
});

test('Match rel and current rel', t => {
	var query = new CypherQuery;
	query.matchRel({alias: 'otherRel', depth: '*'});
	query.matchRel({depth: 1});
	query.matchRel({depth: '2'});
	query.matchRel({alias: 'otherRel', depth: '1..1'});
	query.matchRel({alias: 'otherRel', depth: '1..2'});
	t.is(query.queryString, 'MATCH ()-[otherRel*]->() MATCH ()-[rel*1]->() MATCH ()-[rel1*2]->() MATCH ()-[otherRel1*1..1]->() MATCH ()-[otherRel2*1..2]->() ');
});

test('Match rel with alias, properties, reserved field, set options, remove options', t => {
	var query = new CypherQuery({timestamps: true});
	query.matchRel(
		{alias: 'rello', direction: false, type: 'KNOWS', jesus: 'christ', createdBy: 123, createdAt: 123123123},
		{startAlias: 'dad', endAlias: 'Kid', setProps: {cane: 'morto'}, removeProps: ['ladro']}
	);
	t.is(query.queryString, 'MATCH (dad)-[rello:`KNOWS` {jesus:{jesus0}, createdBy:{createdBy1}, createdAt:{createdAt2}}]-(Kid) REMOVE rello.ladro SET rello.cane = "morto", rello.updatedAt = timestamp() ');
});