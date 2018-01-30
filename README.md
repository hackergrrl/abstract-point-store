# abstract-point-store

> Test suite & interface to implement a geographic point storage backend.

## Background

An abstract point store is a data store that allows you to store, delete, and
make spatial queries on a map comprised of many points. A point has 2 (or more)
dimensional coordinates, and a value associated with it (that is compatible with
the
[comparable-storable-types](https://github.com/substack/comparable-storable-types)
set of types).

## Install

```
npm install abstract-point-store
```

## Some modules that use this

- [kdb-tree-store](https://github.com/peermaps/kdb-tree-store)
- [grid-point-store](https://github.com/noffle/grid-point-store)
- [geohash-point-store](https://github.com/noffle/geohash-point-store)

If you write a new one, send a PR adding it.

## API

#### `pointStore = new PointStore(pointLength)`

Create a new point store. Points must have a length of `pointLength`.

#### `pointStore.put(index, pointBuffer, [cb])`

Add a new point to the storage. Index should be an integer.

#### `pointStore.del(index, pointBuffer, [cb])`

Add a new point to the storage. Index should be an integer.

#### `pointStore.query(index, [options], cb)`

Retrieve a point stored. Index should be an integer.
Options include:

``` js
{
  offset: pointByteOffset,
  length: byteLength
}
```

If the index doesn't exist in the storage an error should be returned.

#### `pointStore.close([cb])`

Close the underlying resource, e.g. if the store is backed by a file, this would close the
file descriptor.

#### `pointStore.destroy([cb])`

Destroy the file data, e.g. if the store is backed by a file, this would delete the file
from the filesystem.

#### `pointStore.pointLength`

Expose the point length from the constructor so that code that receives a point
store can know what size of points to write.

## Test Suite

Publishing a test suite as a module lets multiple modules all ensure
compatibility since they use the same test suite.

To use the test suite from this module you can
`require('abstract-point-store/tests')`.

An example of this can be found in the
[grid-point-store](https://github.com/noffle/grid-point-store/blob/master/test.js)
test suite.

To run the tests simply pass your test module (`tap` or `tape` or any other
compatible modules are supported) and your store's constructor (or a setup
function) in:

```js
var tests = require('abstract-point-store/tests')
tests(require('tape'), require('your-custom-point-store'))
```

## Acknowledgements

- @mafintosh and @Feross for
  [abstract-chunk-store](https://github.com/Feross/abstract-chunk-store), which this README is heavily borrowed from.
- @maxogden for starting the immensely useful `abstract-***-store` pattern.

## License

ISC
