import test from 'ava';
import CypherQuery from '../index';

test('create clause no args', t => {
	t.throws(() => new CypherQuery().create())
});

test('create string', t => {
	var query = new CypherQuery({onCreateSetTimestamp: true}).create('(ciccio)');
	t.is(query.queryString, 'CREATE (ciccio) ');
});

test('create node', t => {
	var query = new CypherQuery().create({name: 'zio', date: new Date('2011')});
	t.is(query.queryString, 'CREATE ({name:{name0},date:{date1}}) ');
	t.deepEqual(query.queryParams, {name0: 'zio', date1: new Date('2011').toISOString()});
});

test('create pattern', t => {
	t.is(new CypherQuery().create([{name: 'zio'}]).queryString, 'CREATE ({name:{name0}}) ');
	t.is(
    new CypherQuery().create([{name: 'zio'}, {type: 'cane'}, 'boia']).queryString,
    'CREATE ({name:{name0}})-[:`cane`]->(boia) '
  );
});
