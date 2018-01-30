var test = require('tape')
var almostEqual = require('almost-equal')
var FLT = almostEqual.FLT_EPSILON

function approx (t, a, b) {
  for (var i = 0; i < a.length; i++) {
    t.ok(almostEqual(a[i], b[i], FLT, FLT),
      'approx equal: ' + a[i] + ' ~ ' + b[i])
  }
}

module.exports = function (test, Store, backend) {
  test('one point', function (t) {
    t.plan(3)
    var geo = Store({
      types: [ 'float32', 'float32', 'uint32' ],
      store: backend()
    })
    geo.insert([1,2], 9999, function (err) {
      t.ifError(err)
      geo.query([1,2], function (err, pts) {
        t.ifError(err)
        t.deepEqual(pts, [ { point: [1,2], value: 9999 } ])
      })
    })
  })

  test('many points', function (t) {
    var n = 20
    var geo = Store({
      types: [ 'float32', 'float32', 'uint32' ],
      store: backend()
    })
    var data = []
    var pending = n
    for (var i = 0; i < n; i++) (function () {
      var x = Math.random() * 200 - 100
      var y = Math.random() * 200 - 100
      var loc = Math.floor(Math.random() * 1000)
      data.push({ point: [x,y], value: loc })
      geo.insert([x,y], loc, function (err) {
        t.ifError(err, 'insert ifError')
        geo.query([x,y], function (err, pts) {
          t.ifError(err, 'query ifError')
          t.equal(pts.length, 1, 'single query result for single point')
          if (pts[0]) {
            approx(t, pts[0].point, [x,y])
            t.equal(pts[0].value, loc, 'point value')
          } else t.fail('no point')
          if (--pending === 0) check()
        })
      })
    })()

    function check () {
      geo.query([[15,50],[-60,10]], function (err, pts) {
        t.ifError(err)
        var expected = data.filter(function (p) {
          var pt = p.point
          return pt[0] >= 15 && pt[0] <= 50
            && pt[1] >= -60 && pt[1] <= 10
        })
        for (var i = 0; i < Math.max(pts.length, expected.length); i++) {
          approx(t, pts[i], expected[i])
        }
        t.end()
      })
    }
  })

  test('various types', function (t) {
    var n = 200
    var geo = Store({
      types: [ 'f64', 'f32', 'uint32' ],
      store: backend()
    })
    var data = []
    var pending = n
    for (var i = 0; i < n; i++) (function () {
      var x = Math.random() * 200 - 100
      var y = Math.random() * 200 - 100
      var loc = Math.floor(Math.random() * 1000)
      data.push({ point: [x,y], value: loc })
      geo.insert([x,y], loc, function (err) {
        t.ifError(err, 'insert ifError')
        geo.query([x,y], function (err, pts) {
          t.ifError(err, 'query ifError')
          t.equal(pts.length, 1, 'single query result for single point')
          if (pts[0]) {
            approx(t, pts[0].point, [x,y])
            t.equal(pts[0].value, loc, 'point value')
          } else t.fail('no point')
          if (--pending === 0) check()
        })
      })
    })()

    function check () {
      geo.query([[15,50],[-60,10]], function (err, pts) {
        t.ifError(err)
        var expected = data.filter(function (p) {
          var pt = p.point
          return pt[0] >= 15 && pt[0] <= 50
            && pt[1] >= -60 && pt[1] <= 10
        })
        for (var i = 0; i < Math.max(pts.length, expected.length); i++) {
          approx(t, pts[i], expected[i])
        }
        t.end()
      })
    }
  })

  test('double point', function (t) {
    t.plan(4)
    var geo = Store({
      types: [ 'float32', 'float32', 'uint32' ],
      store: backend()
    })
    geo.insert([1,2], 444, function (err) {
      t.ifError(err)
      geo.insert([1,2], 555, function (err) {
        t.ifError(err)
        geo.query([1,2], function (err, pts) {
          t.ifError(err)
          t.deepEqual(pts, [
            { point: [1,2], value: 444 },
            { point: [1,2], value: 555 }
          ])
        })
      })
    })
  })

  test('big', function (t) {
    var n = 5000
    var geo = Store({
      types: [ 'float32', 'float32', 'uint32' ],
      store: backend()
    })
    var data = []
    var pending = n
    for (var i = 0; i < n; i++) (function () {
      var x = Math.random() * 200 - 100
      var y = Math.random() * 200 - 100
      var loc = Math.floor(Math.random() * 1000)
      data.push({ point: [x,y], value: loc })
      geo.insert([x,y], loc, function (err) {
        t.ifError(err, 'insert ifError')
        geo.query([x,y], function (err, pts) {
          t.ifError(err, 'query ifError')
          t.equal(pts.length, 1, 'single query result for single point')
          if (pts[0]) {
            approx(t, pts[0].point, [x,y])
            t.equal(pts[0].value, loc, 'point value')
          } else t.fail('no point')
          if (--pending === 0) check()
        })
      })
    })()

    function check () {
      geo.query([[15,50],[-60,10]], function (err, pts) {
        t.ifError(err)
        var expected = data.filter(function (p) {
          var pt = p.point
          return pt[0] >= 15 && pt[0] <= 50
            && pt[1] >= -60 && pt[1] <= 10
        })
        for (var i = 0; i < Math.max(pts.length, expected.length); i++) {
          approx(t, pts[i], expected[i])
        }
        t.end()
      })
    }
  })
}

