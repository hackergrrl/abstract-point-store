var test = require('tape')
var almostEqual = require('almost-equal')
var FLT = almostEqual.FLT_EPSILON
var randomBytes = require('crypto').randomBytes

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
      geo.query([[1,1],[2,2]], function (err, pts) {
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
      var x = Math.fround(Math.random() * 200 - 100)
      var y = Math.fround(Math.random() * 200 - 100)
      var loc = Math.floor(Math.random() * 1000)
      data.push({ point: [x,y], value: loc })
      geo.insert([x,y], loc, function (err) {
        t.ifError(err, 'insert ifError')
        geo.query([[x,x],[y,y]], function (err, pts) {
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
        for (var i = 0; i < Math.min(pts.length, expected.length); i++) {
          approx(t, pts[i], expected[i])
        }
        t.end()
      })
    }
  })

  test('float64', function (t) {
    var n = 200
    var geo = Store({
      types: [ 'f64', 'f64', 'uint32' ],
      store: backend()
    })
    var data = []
    var pending = n
    function next () {
      var x = Math.random() * 200 - 100
      var y = Math.random() * 200 - 100
      var loc = Math.floor(Math.random() * 1000)
      data.push({ point: [x,y], value: loc })
      geo.insert([x,y], loc, function (err) {
        t.ifError(err, 'insert ifError')
        var bbox = [[x-FLT,x+FLT],[y-FLT,y+FLT]]
        geo.query([[x-FLT,x+FLT],[y-FLT,y+FLT]], function (err, pts) {
          t.ifError(err, 'query ifError')
          t.equal(pts.length, 1, 'single query result for single point')
          if (pts[0]) {
            approx(t, pts[0].point, [x,y])
            t.equal(pts[0].value, loc, 'point value')
          } else t.fail('no point')
          if (--pending === 0) check()
          else next()
        })
      })
    }
    next()

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
        geo.query([[1,1],[2,2]], function (err, pts) {
          t.ifError(err)
          t.deepEqual(pts, [
            { point: [1,2], value: 444 },
            { point: [1,2], value: 555 }
          ])
        })
      })
    })
  })

  test('buffer payload', function (t) {
    var n = 20
    var geo = Store({
      types: [ 'float32', 'float32', 'buffer[64]' ],
      store: backend()
    })
    var data = []
    var pending = n
    for (var i = 0; i < n; i++) (function (i) {
      var x = Math.fround(Math.random() * 200 - 100)
      var y = Math.fround(Math.random() * 200 - 100)
      var value = randomBytes(64)
      data.push({ point: [x,y], value: value })
      geo.insert([x,y], value, function (err) {
        t.ifError(err, 'insert ifError')
        geo.query([[x,x],[y,y]], function (err, pts) {
          t.ifError(err, 'query ifError')
          t.equal(pts.length, 1, 'single query result for single point')
          if (pts[0]) {
            approx(t, pts[0].point, [x,y])
            t.deepEqual(pts[0].value, value, 'point value')
          } else t.fail('no point')
          if (--pending === 0) check()
        })
      })
    })(i)

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

  test('uint8 payload', function (t) {
    var n = 20
    var geo = Store({
      types: [ 'float32', 'float32', 'uint8' ],
      store: backend()
    })
    var data = []
    var pending = n
    for (var i = 0; i < n; i++) (function (i) {
      var x = Math.fround(Math.random() * 200 - 100)
      var y = Math.fround(Math.random() * 200 - 100)
      data.push({ point: [x,y], value: i })
      geo.insert([x,y], i, function (err) {
        t.ifError(err, 'insert ifError')
        geo.query([[x,x],[y,y]], function (err, pts) {
          t.ifError(err, 'query ifError')
          t.equal(pts.length, 1, 'single query result for single point')
          if (pts[0]) {
            approx(t, pts[0].point, [x,y])
            t.equal(pts[0].value, i, 'point value')
          } else t.fail('no point')
          if (--pending === 0) check()
        })
      })
    })(i)

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

  test('big', function (t) {
    var n = 5
    var geo = Store({
      types: [ 'float32', 'float32', 'uint32' ],
      store: backend()
    })
    var data = []
    var pending = n
    for (var i = 0; i < n; i++) (function () {
      var x = Math.fround(Math.random() * 200 - 100)
      var y = Math.fround(Math.random() * 200 - 100)
      var loc = Math.floor(Math.random() * 1000)
      data.push({ point: [x,y], value: loc })
      geo.insert([x,y], loc, function (err) {
        t.ifError(err, 'insert ifError')
        geo.query([[x,x],[y,y]], function (err, pts) {
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

  test('insert/remove update', function (t) {
    t.plan(10)

    var kdb = Store({
      types: [ 'float32', 'float32', 'uint32' ],
      store: backend()
    })

    var points = [
      { point: [1,2], value: 444 },
      { point: [4,5], value: 333 },
      { point: [1,3], value: 555 }
    ]
    var pending = points.length
    points.forEach(function (p) {
      kdb.insert(p.point, p.value, function (err) {
        t.ifError(err)
        if (--pending === 0) check1()
      })
    })

    function check1 () {
      kdb.query([[-9,9],[-9,9]], function (err, pts) {
        t.ifError(err)
        pts = pts.sort(sortPt)
        t.deepEqual(pts, [
          { point: [1,2], value: 444 },
          { point: [4,5], value: 333 },
          { point: [1,3], value: 555 }
        ].sort(sortPt))
        remove()
      })
    }
    function remove () {
      kdb.remove([1,2], function (err) {
        t.ifError(err)
        kdb.remove([1,3], function (err) {
          t.ifError(err)
          kdb.insert([1,2], 999, function (err) {
            t.ifError(err)
            check2()
          })
        })
      })
    }
    function check2 () {
      kdb.query([[-9,9],[-9,9]], function (err, pts) {
        t.ifError(err)
        pts = pts.sort(sortPt)
        t.deepEqual(pts, [
          { point: [4,5], value: 333 },
          { point: [1,2], value: 999 }
        ].sort(sortPt))
      })
    }
  })
}

function sortPt (a, b) {
  return b.value - a.value
}
