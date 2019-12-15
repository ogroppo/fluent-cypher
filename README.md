# Fluent Cypher

This library allows you to build any cypher query you like and get the query string and all the parameters as an object.

If you want to be able to connect to your Neo4j instance have a look at [fluent-neo4j](https://github.com/ogroppo/fluent-neo4j) or you can use this package with your own driver/connector

### What is Cypher

[This guide](https://neo4j.com/developer/cypher-query-language/) explains the basic concepts of Cypher, Neo4j’s query language.

Following the official documentation it is better to avoid literals so everything is treated as a parameter.

## Table of Contents
* [Usage](#usage)
	* [constuctor()](#constuctor)
* [Building the query](#building)
	* [create()](#create)
	* [match()](#match)
	* [optionalMatch()](#optionalMatch)
	* [where()](#where)
	* [merge()](#merge)
	* [onCreateSet()](#onCreateSet)
	* [onMergeSet()](#onMergeSet)
	* [set()](#set)
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
* [Debug](#log)
* [Tests](#tests)

## <a name="usage"></a> Usage

```js
const CypherQuery = require('fluent-cypher');
//or
import CypherQuery from 'fluent-cypher'

var query = new CypherQuery();

query.match({$: 'node'})
.where({$: 'node', value: {'<=': 25}})
.return({$: 'node', as: 'myValue')
.log()

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

### <a name="create"></a> create(pattern[, pattern])

Accepts pattern as string

~~~js

query.create("(node)") // 'CREATE (node)'

query.create("(node)", "()->[rel]->()") // 'CREATE (node), ()->[rel]->()'

~~~

Objects for nodes
~~~js

query.create({$: 'node1', prop: false}, {$: 'node2', val: 12}) 
// 'CREATE (node1{prop: false}), (node2{val: 12})'

~~~

Arrays for paths
~~~js

query.create([{$: 'parent'}, {type: 'has'}, {$: 'child'}]) // 'CREATE (parent)-[:has]->(child)'
~~~

#### <a name="match"></a> match(pattern[, pattern])

~~~js

query.match("(node)") // MATCH (node)

query.match("(node)", "()->[rel]->()") // MATCH (node), ()->[rel]->()

~~~

#### <a name="merge"></a> merge(pattern[, pattern])

~~~js

query.merge("(node)") // MERGE (node)

query.merge("(node)", "()->[rel:`type`]->()") // MERGE (node), ()->[rel:`type`]->()

~~~

#### <a name="delete"></a> delete(deleteItem[, deleteItem])

~~~js

query.delete('friends') // DELETE friends
query.delete({$: 'friend'}) // DELETE friend

~~~

### <a name="return"></a> .return(returnItem[, returnItem])

returnItem as string

~~~js

query.return('*') // RETURN *
query.return('node') // RETURN node
query.return('node.prop') // RETURN node.prop
~~~

returnItem as object

~~~js
query.return({$: 'node', prop: 'p', as: 'that'}) // RETURN node.p as that
~~~

### <a name="where"></a> .where(whereItem[, whereItem])

~~~js

query.where({
	fullName: {'=~': `(?i).*tom.*`}
})
~~~

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
