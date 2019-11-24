import test from 'ava';
import CypherQuery from '../index';

test('match no args', t => {
	t.throws(() => new CypherQuery().match())
	t.throws(() => new CypherQuery().match(new Date()))
	t.throws(() => new CypherQuery().match([]))
});

test('match with strings', t => {
  t.is(new CypherQuery().match('custom string').queryString, 'MATCH custom string ')
  t.is(new CypherQuery().match('pattern1', 'pattern2').queryString, 'MATCH pattern1, pattern2 ')
});

test('match with objects', t => {
  t.is(new CypherQuery().match({}).queryString, 'MATCH () ')
  t.is(new CypherQuery().match({alias: 'm'}).queryString, 'MATCH (m) ')
  t.is(new CypherQuery().match({alias: 'm'}, {label: 'Score'}).queryString, 'MATCH (m), (:`Score`) ')
});

test('match with arrays', t => {
  t.is(new CypherQuery().match([{},'',{}]).queryString, 'MATCH ()-[]->() ')
  t.is(new CypherQuery().match(['zio',{type: 'j'},'mega']).queryString, 'MATCH (zio)-[:`j`]->(mega) ')
  t.is(
    new CypherQuery().match(['zio','rel','mega',{direction: 'left'},'pas']).queryString,
    'MATCH (zio)-[rel]->(mega)<-[]-(pas) '
  )
});
