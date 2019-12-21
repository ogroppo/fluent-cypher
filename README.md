# Fluent Cypher

This package allows you to build any cypher query you like and get both the query string and the parameters as an object to be used with the official [neo4j driver](https://www.npmjs.com/package/neo4j-driver).

If you want to be able to connect seamlessy to your Neo4j instance have a look at [fluent-neo4j](https://github.com/ogroppo/fluent-neo4j) otherwise you can always use this package with your own driver/connector.

## What is Cypher

[This guide](https://neo4j.com/developer/cypher-query-language/) explains the basic concepts of Cypher, Neo4j’s query language.

Following the official documentation it is always better to avoid literals so everything is treated as a parameter.

## Table of Contents
* [Usage](#usage)
	* [constuctor()](#constuctor)
* [Building the query](#building)
	* [create()](#create)
	* [match()](#match)
	* [optionalMatch()](#optionalMatch)
	* [where()](#where)
	* [merge()](#merge)
	* [set()](#set)
	* [onCreateSet()](#onCreateSet)
	* [onMatchSet()](#onMatchSet)
	* [remove()](#remove)
	* [delete()](#delete)
	* [detachDelete()](#detachDelete)
  * [return()](#return)
  * [returnDistinct()](#returnDistinct)
  * [limit()](#limit)
  * [skip()](#skip)
  * [orderBy()](#orderBy)
  * [unwind()](#unwind)
  * [with()](#with)
  * [union()](#union)
  * [unionAll()](#unionAll)
  * [loadCsv()](#loadCsv)
  * [call()](#call)
  * [yield()](#yield)
* [Pattern Types](#types)
* [Debug](#log)
* [Tests](#tests)

## <a name="usage"></a> Usage

```js
const CypherQuery = require('fluent-cypher');
//or
import CypherQuery from 'fluent-cypher'

var query = new CypherQuery();

query.match({$: 'node'}, ['code', {type: 'KNOWS', direction: 'left'}, {}])
.where({$: 'node', value: {'<=': 25}}, 'OR', {$: 'node', value: 28})
.return({$: 'node', as: 'myValue')
.orderBy('myValue')
.limit(5)

/*
query.log() =>
MATCH (node), (code)<-[]-()
WHERE node.value <= 25 OR node.value = 28
RETURN node AS myValue
ORDER BY myValue
LIMIT 5


query.queryString => "MATCH (node), (code)<-[]-() WHERE node.value <= {value1} OR node.value = {value2} RETURN node AS myValue ORDER BY myValue LIMIT 5"

query.queryParams => {value1: 25, value2: 28}
*/
```

#### <a name="constructor"></a> constuctor([config])

| Option        | Type           | Description
| ------------- |:-------------:| :-----|
| `onCreateSetTimestamp` | `Boolean` | timestamps will be added for you like `node.createdAt = timestamp()`|
| `onUpdateSetTimestamp` | `Boolean` | timestamps will be added for you like `node.updatedAt = timestamp()`|
| `userId`      | `String`      |  Property will be set like `node.createdBy = {userId}` and `node.updatedBy = {userId}`
| `defaultNodeProps`      | `Object`      | default props for every node
| `forcetNodeProps`       | `Object`      | force props for every node
| `defaultRelProps`      | `Object`      | default props for every relationship
| `forcetRelProps`       | `Object`      | force props for every relationship

## <a name="building"></a> Building the query

### <a name="create"></a> .create(Pattern[, Pattern])
See [Pattern](#pattern) for accepted arguments
~~~js
query.create("(node)", "()->[rel]->()") //CREATE (node), ()->[rel]->()
query.create({$: 'node1', prop: false}, {$: 'node2', val: 12}) //CREATE (node1{prop:false}), (node2{val:12})
query.create([{$: 'parent'}, {type: 'has'}, {$: 'child'}]) // 'CREATE (parent)-[:has]->(child)'
~~~

### <a name="match"></a> .match(Pattern[, Pattern])
See [Pattern](#pattern) for accepted arguments
~~~js
query.match("(node)") // MATCH (node)
query.match("(node)", "()->[rel]->()") // MATCH (node), ()->[rel]->()
query.match({$: 'node1', prop: false}, {$: 'node2', val: 12}) //MATCH (node1{prop:false}), (node2{val:12})
query.match([{$: 'parent'}, {type: 'has'}, {$: 'child'}]) // 'MATCH (parent)-[:has]->(child)'
~~~

### <a name="optionalMatch"></a> .optionalMatch(Pattern[, Pattern])
See [Pattern](#pattern) for accepted arguments
~~~js
query.optionalMatch("(node:Stuff)") // MATCH OPTIONAL (node:Stuff)
~~~

### <a name="where"></a> .where(WhereItem[, WhereItem])
~~~js
query.where({$: 'user', fullName: {'=~': `(?i).*tom.*`}})
// WHERE user.fullName =~ (?i).*tom.*
~~~

### <a name="merge"></a> .merge(Pattern[, Pattern])
See [Pattern](#pattern) for accepted arguments
~~~js
query.merge("(node)") // MERGE (node)
query.merge("(node)", "()->[rel:`type`]->()") // MERGE (node), ()->[rel:`type`]->()
~~~

### <a name="set"></a> .set(PropItem[, PropItem])
~~~js
query.set('friend.rating = 5') // SET friend.rating = 5
query.set({
	$: 'friend', 
	labels: ['lol', 'lel'], 
	wow: '$rating' // <= access the variable with $
}) // SET friend:lol:lel, friend.wow = rating
~~~

### <a name="onCreateSet"></a> .onCreateSet(PropItem[, PropItem])
~~~js
query.onCreateSet('friend.rating = 5') // ON CREATE SET friend.rating = 5
~~~

### <a name="onMatchSet"></a> .onMatchSet(PropItem[, PropItem])
~~~js
query.onCreateSet('friend.rating = 5') // ON MATCH SET friend.rating = 5
~~~

### <a name="remove"></a> .remove(PropItem[, PropItem])
~~~js
query.remove({
	$: 'p', 
	prop: 't', 
	props: ['lel', 'lol'],
	label: 'one',
	labels: ['may', 'april']
})
// REMOVE p:one:may:april, p.t, p.lel, p.lol
~~~

### <a name="delete"></a> .delete(DeleteItem[, DeleteItem])
~~~js
query
	.match({$: 'lonely'})
	.where('NOT', ['lonely', {type: 'has'}, {label: 'Friend'}])
	.delete({$: 'lonely'}) 
/*
MATCH (lonely)
WHERE NOT (lonely)-[:has]->(:Friend)
DELETE friend
*/
~~~

### <a name="detachDelete"></a> .detachDelete(DeleteItem[, DeleteItem])
~~~js
query
	.match(['me', ':knows', {$: 'friend'})
	.detachDelete('friend') 
/*
MATCH (me)-[:knows]->(friend)
DETACH DELETE friend
*/
~~~

### <a name="return"></a> .return(ReturnItem[, ReturnItem])
~~~js
query.return('*') // RETURN *
query.return('node') // RETURN node
query.return('node.prop') // RETURN node.prop
query.return({$: 'node', prop: 'p', as: 'that'}) // RETURN node.p as that
~~~

### <a name="returnDistinct"></a> .returnDistinct(ReturnItem[, ReturnItem])
~~~js
query.returnDistinct('*') // RETURN DISTINCT *
~~~

### <a name="limit"></a> .limit(Integer)
~~~js
query.limit(1) // LIMIT 1
~~~

### <a name="skip"></a> .skip(Integer)
~~~js
query.skip(1) // LIMIT 1
~~~

### <a name="orderBy"></a> .orderBy(Integer)
~~~js
query.orderBy({$: 'node', key: 'ASC'}) // ORDER BY node.key ASC
~~~

### <a name="unwind"></a> .unwind(UnwindItem)
~~~js
query.unwind(['[1,2,3] as number') //UNWIND [1,2,3] as number
query.unwind({$: [1,2,3], as: 'number'}) //UNWIND [1,2,3] as number (parameterized)
query.unwind({$: 'collection', as: 'list'}) //UNWIND collection as list
query.unwind({$: '$param', as: 'entry'}) //UNWIND $param as entry
~~~

### <a name="with"></a> .with(AliasedItem[, AliasedItem])
~~~js
query.with('this as that', {$: 'node', as: 'something'}) 
//WITH this as that, node AS something
~~~

### <a name="union"></a> .union()
~~~js
query.union()
//UNION
~~~

### <a name="unionAll"></a> .unionAll()
~~~js
query.unionAll()
//UNION ALL
~~~

### <a name="loadCsv"></a> .loadCsv(url, options)
~~~js
q.loadCsv('https://neo4j.com/docs/cypher-refcard/3.2/csv/artists.csv', {as: 'row', withHeaders: false})
//LOAD CSV FROM "https://neo4j.com/docs/cypher-refcard/3.2/csv/artists.csv" AS row
~~~

### <a name="call"></a> .call(string)
~~~js
q.call('dbms.procedures()')
//CALL dbms.procedures()
~~~

### <a name="yield"></a> .yield(string)
~~~js
q.yield('name, signature')
//YIELD name, signature
~~~

## <a name="types"></a> Argument Types

### <a name="pattern"></a> Pattern
#### As ***String*** see [`Cypher`](#string)

#### As ***Object*** see [`Node`](#node)

#### As ***Array*** see [`Path`](#path)

### <a name="string"></a> Cypher
#### ***String*** only
This is not manipulated at all and gets inserted in the context as is
```js
'node' //(node) if in node context
'rel:type' //...-[rel:type]->... if in rel context
'CASE WHEN 1=1 THEN this ELSE that END as what' //CASE WHEN 1=1 THEN this ELSE that END as what
```

### <a name="node"></a> Node
#### As ***String***
see [`Cypher`](#string)

#### As ***Object***
|Key  		 | Required   | Type   | Description   | 
| --- 		 |:----------:| -------|---------------|
|`$`  		 | no         | String  | Variable name for node (must be valid variable name) |
|`label`   | no         | String        | Label for node |
|`labels`  | no         | Array         | Label for node |
|`...rest` | no         | String|Arrray | Other properties for the node |
```js
{
	$: 'node', 
	label: 'Cat', 
	labels: ['Animal', 'Living'], 
	this: 'that',
	something: ['li', 'la']
} //(node:Cat:Animal:Living)
```

### <a name="rel"></a> Rel
#### As ***String***
Interpreted as [`Cypher`](#string)

#### As ***Object***
**Props**
|Key  		 | Required   | Type   | Description   | 
| --- 		 |:----------:| -------|---------------|
|`$`  		 | no         | `String`  | Variable name for rel (must be valid variable name) |
|`type`    | yes (in merge) | `String`        | Type of rel |
|`depth`   | no         | `Integer|String` | Eiter `*` or `4` or `1..2` |
|`direction`| no         | `String` | Eiter `left` or `right` (default) or `both` |
|`...rest` | no         | `String|Arrray` | Actual properties of the rel |
**Example**
```js
{
	$: 'rel', 
	type: 'Follows', 
	depth: '..5',
	direction: 'both',
	something: ['amigo']
} //...)-(rel:Follows*..5{something:['amigo']})-(...
```

### <a name="path"></a> Path
#### As ***Array***
If the number of elements is even, the first Object is used for Path options

**Props**
|Key  		 | Required   | Type   | Description   | 
| --- 		 |:----------:| -------|---------------|
|`$`  		 | no         | String  | Variable name for path (must be valid variable name) |
|`shotestPath` | no | Bool        | Whether to use the shortestPath or not |

**Example**
```js
[
	{ $: 'myPath', shotestPath: true },
	{ $: 'start' },
	{},
	'final'
] // myPath = shortestPath((start)-[]->(final))
```

## <a name="log"></a> .log()

As `query.queryString` is a parametrised string you may want to print a string that you can copy and paste in the browser console.

~~~js

query
	.match('(node)')
	.log()     // => MATCH (node)
	.match('()-[rel]->()')
	.log()    // => MATCH (node) MATCH ()-[rel]->()

~~~

## <a name="test"></a> Test

Tests are written in ava, run the following command

```
npm t
```
