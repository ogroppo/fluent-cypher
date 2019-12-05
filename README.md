# Fluent Cypher

This library allows you to build any cypher query you like and get the query string and all the parameters as an object.

If you want to be able to connect to your Neo4j instance have a look at [fluent-neo4j](https://github.com/ogroppo/fluent-neo4j)

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
* [Debug](#debug)
* [Tests](#tests)

## <a name="usage"></a> Usage

```js
const CypherQuery = require('fluent-cypher');
//or
import CypherQuery from 'fluent-cypher'

var query = new CypherQuery(config);

//let's start building our query!
```

#### <a name="constructor"></a> constuctor([config])

| Option        | Type           | Description
| ------------- |:-------------:| :-----|
| `onCreateSetTimestamp` | `Boolean` | timestamps will be added for you like `alias.createdAt = timestamp()`|
| `onUpdateSetTimestamp` | `Boolean` | timestamps will be added for you like `alias.updatedAt = timestamp()`|
| `userId`      | `String`      |  Property will be set like `alias.createdBy = {userId}` and `alias.updatedBy = {userId}`
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

As Object for node

~~~js

query.create({alias: 'node'}) // 'CREATE (node)'
~~~

As Array for paths

~~~js

query.create([{alias: 'parent'}, {type: 'has'}, {alias: 'child'}]) // 'CREATE (parent)-[:has]->(child)'
~~~

#### <a name="match"></a> match(...patterns)

~~~js

query.match("(node)") // MATCH (node)

query.match("(node)", "()->[rel]->()") // MATCH (node), ()->[rel]->()

~~~

#### <a name="merge"></a> merge(...patterns)

~~~js

query.merge("(node)") // MERGE (node)

query.merge("(node)", "()->[rel:`type`]->()") // MERGE (node), ()->[rel:`type`]->()

~~~
#### <a name="delete"></a> delete(aliases)

~~~js

query.delete({alias: 'friend'}) // DELETE (friend)
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
query.return({alias: 'node', prop: 'p', as: 'that'}) // RETURN node.p as that
~~~

### <a name="where"></a> .where(whereItem[, whereItem])

~~~js

query.where({
	fullName: {'=~': `(?i).*tom.*`}
})
~~~

## <a name="debug"></a> .debug()

As `query.queryString` is a parametrised string you may want to print a string that you can copy and paste in the browser console.

~~~js

query
	.match()
	.debug()     // => MATCH (node)
	.match()
	.debug()    // => MATCH (node) MATCH ()-[rel]->()

~~~

## <a name="test"></a> Test

Tests are written in ava, run the following command

```
npm t
```
