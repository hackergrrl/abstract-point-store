# abstract-point-store

> Test suite & interface to implement a geographic (2D) point storage backend.

## Background

An abstract point store is a data store that allows you to store, delete, and
make spatial queries over many points. A point has 2 (or more) dimensional
coordinates, and a value associated with it (that is compatible with the
[comparable-storable-types][cst] set of types).

## Install

```
npm install abstract-point-store
```

## Some modules that use this

- [kdb-tree-store](https://github.com/peermaps/kdb-tree-store)
- [grid-point-store](https://github.com/noffle/grid-point-store)
- (*COMING SOON*) [geohash-point-store](https://github.com/noffle/geohash-point-store)

If you write a new one, send a PR adding it.

## API

#### `pointStore = new PointStore(opts)`

Create a new point store. `opts` include:

- (required) `opts.types`: a size-3 array of [comparable-storable-types][cst] strings: X coord, Y coord, value.
- (optional) `opts.store`: a point-store-specific storage backend for the spatial data.

#### `pointStore.insert(pt, value, [cb])`

`pt` is a size-2 array with the coordinates of the point. `value` is the value
to be associated with this point.

### `pointStore.remove(pt, [cb])`

Remove all points at location `pt` (`[x, y]`).

#### `pointStore.query(bbox[, opts][, cb])`

Query for points with `bbox`, a size-2 array of the shape `[[minX,maxX],[minY,maxY]]`.

Results are given as an array of points in `cb(err, results)`. Each element in
`results` has a `point` and `value` property.

## Test suite

Publishing a test suite as a module lets multiple modules all ensure
compatibility since they use the same test suite.

To use the test suite from this module you can
`require('abstract-point-store/tests')`.

An example of this can be found in the
[grid-point-store](https://github.com/noffle/grid-point-store/blob/master/test.js)
test setup.

To run the tests simply pass your test module (`tap` or `tape` or any other
compatible modules are supported) and your store's constructor (or a setup
function) in:

```js
var tests = require('abstract-point-store/tests')
tests(require('tape'), require('your-custom-point-store'), instance-of-needed-storage-backend)
```

## Acknowledgements

- @mafintosh and @Feross for
  [abstract-chunk-store](https://github.com/Feross/abstract-chunk-store), which this README is heavily borrowed from.
- @maxogden for starting the immensely useful `abstract-***-store` pattern.
- @substack for all of the
  [kdb-tree-store](https://github.com/substack/kdb-tree-store) tests that served
  as a base for this module.

## License

ISC

[cst]: https://github.com/substack/comparable-storable-types

