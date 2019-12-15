import test from 'ava';
import CypherQuery from '../../index';

test('_formatAs', t => {
	var query = new CypherQuery();
	t.is(query._formatAs([
    {$: 'node', as: 'that'}, 
    {$: 'rel.prop', as: 'relProp'}, 
    {$: 'that', prop: 'lol', as: 'this'}
  ]), 'node AS that, rel.prop AS relProp, that.lol AS this');
});