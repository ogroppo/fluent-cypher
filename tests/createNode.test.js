import test from 'ava';
import CypherQuery from '../../class/CypherQuery';

test('Create empty node', t => {
	var query = new CypherQuery;
	query.createNode();
	t.is(query.queryString, 'CREATE (node) ');
});

test('Create with timestamp node', t => {
	var query = new CypherQuery({timestamps: true});
	query.createNode({});
	t.is(query.queryString, 'CREATE (node) SET node.createdAt = timestamp() ');
});

test('Create node with alias, label, labels, properties, reserved field', t => {
	var query = new CypherQuery;
	query.createNode({alias: 'box', label: 'Box', labels: ['hey', 'you too'], type: 'content', createdBy: 123, createdAt: 'timestamp()'});
	t.is(query.queryString, 'CREATE (box:`hey`:`you too`:`Box` {type:{type0}, createdBy:{createdBy1}, createdAt:{createdAt2}}) ');
});