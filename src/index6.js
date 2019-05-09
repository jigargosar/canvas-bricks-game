/* eslint-disable no-debugger */
import 'tachyons'
import './index.css'
import * as R from 'ramda'
import { Rectangle } from './v6/Rectangle'
import { Paddle } from './Paddle'
import { Ball } from './Ball'

function invariant(pred, msg = 'invariant failed') {
  if (!pred) {
    throw new Error(msg)
  }
}

//#region Basics
/**
 * @template T
 * @param T
 * @returns T
 */
const curryAll = R.mapObjIndexed(R.curry)

function I(x) {
  return x
}
function degToRadians(degrees) {
  return (degrees * Math.PI) / 180
}
function absNeg(num) {
  return Math.abs(num) * -1
}
function absPos(num) {
  return Math.abs(num)
}
/**
 * @param {Point} p1
 * @param {Point} p2
 * @returns {number} length
 */
function distanceBetweenPoints(p1, p2) {
  const [[x1, y1], [x2, y2]] = [p1, p2]
  const [dx, dy] = [x2 - x1, y2 - y1]
  return Math.sqrt(dx * dx + dy * dy)
}
//#endregion

// LINE SEGMENT INTERSECTION
/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @param {Point} p4
 * @returns {Point | null}
 * @tutorial http://www-cs.ccny.cuny.edu/~wolberg/capstone/intersection/Intersection%20point%20of%20two%20lines.html
 */
function lineLineIntersectionPoint(p1, p2, p3, p4) {
  const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = [p1, p2, p3, p4]
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

  if (denominator === 0) return null

  const uaNumerator = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)
  const ubNumerator = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)

  if (uaNumerator === 0 && ubNumerator === 0) return null

  const ua = uaNumerator / denominator
  const ub = ubNumerator / denominator

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null

  return [x1 + ua * (x2 - x1), y1 + ub * (y2 - y1)]
}

let Vector = {
  fromXY(x, y) {
    return [x, y]
  },
  fromAngleMag(angle, mag) {
    return Vector.fromXY(Math.cos(angle) * mag, Math.sin(angle) * mag)
  },
  fromDegreesMag(degrees, mag) {
    return Vector.fromAngleMag(degToRadians(degrees), mag)
  },
  fromTuple([x, y]) {
    return Vector.fromXY(x, y)
  },
  toTuple([x, y]) {
    return [x, y]
  },
  x(v) {
    return v[0]
  },
  y(v) {
    return v[1]
  },
  angle([x, y]) {
    return Math.atan2(y, x)
  },
  mag([x, y]) {
    return Math.sqrt(x * x + y * y)
  },
  add([x1, y1], [x2, y2]) {
    return Vector.fromXY(x1 + x2, y1 + y2)
  },
  sub([x1, y1], [x2, y2]) {
    return Vector.fromXY(x1 - x2, y1 - y2)
  },
  scale(num, vec) {
    return vec.map(n => n * num)
  },
  mapEach(xf, yf, [x, y]) {
    return Vector.fromXY(xf(x), yf(y))
  },
  mapX(xf, vec) {
    return Vector.mapEach(xf)(I)(vec)
  },
  mapY(yf, vec) {
    return Vector.mapEach(I)(yf)(vec)
  },
}
Vector = curryAll(Vector)

let Rect = {
  fromWH(width, height) {
    const size = Vector.fromXY(width, height)
    return { center: Vector.scale(0.5, size), size }
  },
  fromWHTuple([width, height]) {
    return Rect.fromWH(width, height)
  },
  center(rect) {
    return rect.center
  },
  tl(rect) {
    return Vector.sub(rect.center, Vector.scale(0.5, rect.size))
  },
  maxY(rect) {
    return rect.center[1] + rect.size[1] / 2
  },
  h(rect) {
    return rect.size[1]
  },
  w(rect) {
    return rect.size[0]
  },
  size(rect) {
    return rect.size
  },
  mapCenter(cf, rect) {
    return { ...rect, center: cf(rect.center) }
  },
  translate(vec, rect) {
    return Rect.mapCenter(Vector.add(vec), rect)
  },
  alignBottom(fromRect, rect) {
    return Rect.mapCenter(
      Vector.mapY(() => Rect.maxY(fromRect) - Rect.h(rect) / 2),
      rect,
    )
  },
  alignCenter(fromRect, rect) {
    return Rect.mapCenter(() => Rect.center(fromRect), rect)
  },
  toTLXYWH(rect) {
    return [...Rect.tl(rect), ...Rect.size(rect)]
  },
  halfSize(rect) {
    return Vector.scale(0.5, rect.size)
  },
  minP(rect) {
    return Vector.sub(rect.center, Rect.halfSize(rect))
  },
  maxP(rect) {
    return Vector.add(rect.center, Rect.halfSize(rect))
  },
  mapSize(sfn, rect) {
    return { ...rect, size: sfn(rect.size) }
  },
  constrainPointOffset([x, y], rect) {
    const [minX, minY] = Rect.minP(rect)
    const [maxX, maxY] = Rect.maxP(rect)

    return [
      x < minX ? minX - x : x > maxX ? maxX - x : 0,
      y < minY ? minY - y : y > maxY ? maxY - y : 0,
    ]
  },
  constrainRectOffset(smallRect, bigRect) {
    invariant(Rect.w(smallRect) < Rect.w(bigRect))
    invariant(Rect.h(smallRect) < Rect.h(bigRect))

    const smallCenter = Rect.center(smallRect)
    const shrinkedBigRect = Rect.mapSize(
      Vector.sub(R.__, Rect.size(smallRect)),
    )(bigRect)
    return Rect.constrainPointOffset(smallCenter, shrinkedBigRect)
  },
  edgesTRBL(rect) {
    const [minX, minY] = Rect.minP(rect)
    const [maxX, maxY] = Rect.maxP(rect)

    return [
      { p1: [minX, minY], p2: [maxX, minY], side: 'top' },
      { p1: [maxX, minY], p2: [maxX, maxY], side: 'right' },
      { p1: [maxX, maxY], p2: [minX, maxY], side: 'bottom' },
      { p1: [minX, maxY], p2: [minX, minY], side: 'left' },
    ]
  },
}
Rect = curryAll(Rect)

function lineRectEdgeIntersection(p1, p2, rect) {
  const llip = R.partial(lineLineIntersectionPoint, [p1, p2])
  const distFromBallP2To = R.partial(distanceBetweenPoints, [p2])
  return R.compose(
    R.head,
    R.sortWith([R.ascend(R.prop('len'))]),
    R.map(ei => R.assoc('len', distFromBallP2To(ei.ipt), ei)),
    R.reject(
      R.compose(
        R.isNil,
        R.prop('ipt'),
      ),
    ),
    R.map(edge => ({ edge, ipt: llip(edge.p1, edge.p2) })),
    Rect.edgesTRBL,
  )(rect)
}

let RenderRect = {
  clear(ctx, rect) {
    const [x, y, w, h] = Rect.toTLXYWH(rect)
    ctx.clearRect(x, y, w, h)
  },

  fillRect(ctx, fillStyle, rect) {
    const [x, y, w, h] = Rect.toTLXYWH(rect)
    ctx.fillStyle = fillStyle
    ctx.fillRect(x, y, w, h)
  },

  fillCircleMin(ctx, fillStyle, rect) {
    const [x, y] = Rect.center(rect)
    const radius = Math.min(Rect.w(rect, Rect.h(rect))) / 2
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, degToRadians(360), false)
    ctx.fillStyle = fillStyle
    ctx.fill()
  },
}
RenderRect = curryAll(RenderRect)

function initCanvas() {
  const canvas = document.getElementById('gameScreen')
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, {
    width: 400,
    height: 400,
    className: 'db center ba',
  })
  return ctx
}

function gameLoop(step) {
  const callback = () => {
    step()
    requestAnimationFrame(callback)
  }
  requestAnimationFrame(callback)
}

function ballCollisionWithViewPort(ballRV, vpRect) {
  const { rect: ballRect, vel: ballVel } = ballRV

  const offset = Rect.constrainRectOffset(ballRect, vpRect)
  const [xOffset, yOffset] = Vector.toTuple(offset)

  const newVel = Vector.mapEach(
    dx =>
      xOffset === 0 ? dx : xOffset < 0 ? Math.abs(dx) * -1 : Math.abs(dx),
    dy =>
      yOffset === 0 ? dy : yOffset < 0 ? Math.abs(dy) * -1 : Math.abs(dy),
    ballVel,
  )
  const newRect = Rect.translate(offset, ballRect)

  const newBallRV = { rect: newRect, vel: newVel }

  return R.equals(ballRV, newBallRV) ? null : newBallRV
}

function ballCollisionWithPaddle(ballRV, paddleRect) {
  const grownPaddleRect = Rect.mapSize(Vector.add(Rect.size(ballRV.rect)))(
    paddleRect,
  )

  const ballP1 = Rect.center(ballRV.rect)
  const ballP2 = Vector.add(ballP1, ballRV.vel)

  const ei = lineRectEdgeIntersection(ballP1, ballP2, grownPaddleRect)

  if (ei) {
    let xfn = I
    let yfn = I
    let dxfn = I
    let dyfn = I

    switch (ei.edge.side) {
      case 'top':
        yfn = R.always(Vector.y(ei.edge.p1))
        dyfn = absNeg
        break
      case 'bottom':
        yfn = R.always(Vector.y(ei.edge.p1))
        dyfn = Math.abs
        break
      case 'left':
        xfn = R.always(Vector.x(ei.edge.p1))
        dxfn = absNeg
        break
      case 'right':
        xfn = R.always(Vector.x(ei.edge.p1))
        dxfn = Math.abs
        break
    }

    const newBallRV = {
      rect: Rect.mapCenter(Vector.mapEach(xfn, yfn), ballRV.rect),
      vel: Vector.mapEach(dxfn, dyfn, ballRV.vel),
    }

    return R.equals(ballRV, newBallRV) ? null : newBallRV
  }
  return null
}

function start() {
  const ctx = initCanvas()
  const vpRect = Rect.fromWH(ctx.canvas.width, ctx.canvas.height)

  const ballSize = Vector.fromXY(20, 20)

  const ballRV = {
    rect: R.compose(
      Rect.alignCenter(vpRect),
      Rect.fromWHTuple,
    )(ballSize),
    vel: Vector.fromDegreesMag(99, 5),
  }

  const paddleSpeed = 20
  let paddleRect = R.compose(
    r => Rect.translate([0, -Rect.h(r) * 8])(r),
    Rect.alignBottom(vpRect),
    Rect.alignCenter(vpRect),
    Rect.fromWH,
  )(100, 10)

  function update() {
    const newBallRect = Rect.mapCenter(Vector.add(ballRV.vel), ballRV.rect)

    const newBallRV = { rect: newBallRect, vel: ballRV.vel }

    const collResThunks = [
      () => ballCollisionWithViewPort(newBallRV, vpRect),
      () => ballCollisionWithPaddle(ballRV, paddleRect),
      () => newBallRV,
    ]

    const collRes = R.reduce((cr, th) =>
      R.isNil(cr) ? th() : R.reduced(cr),
    )(null)(collResThunks)

    Object.assign(ballRV, R.pick(['rect', 'vel'])(collRes))
  }

  function render() {
    RenderRect.fillRect(ctx, 'orange', paddleRect)
    RenderRect.fillCircleMin(ctx, 'blue', ballRV.rect)
  }

  gameLoop(() => {
    update()
    RenderRect.clear(ctx, vpRect)
    render()
  })

  window.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowLeft':
        paddleRect = Rect.translate([-paddleSpeed, 0], paddleRect)
        break
      case 'ArrowRight':
        paddleRect = Rect.translate([paddleSpeed, 0], paddleRect)
        break
    }
  })
}

function vecFromDegMag(deg, mag) {
  const angle = degToRadians(deg)
  return vec(Math.cos(angle) * mag, Math.sin(angle) * mag)
}

function vec(x, y) {
  return {
    get x() {
      return x
    },
    get y() {
      return y
    },
    get tuple() {
      return [x, y]
    },
    add(v2) {
      return vec(x + v2.x, y + v2.y)
    },
    mapEach(xfn, yfn) {
      return vec(xfn(x), yfn(y))
    },
    equals(v2) {
      return x === v2.x && y === v2.y
    },
  }
}

function rectFromWH(w, h) {
  return rectFromCS(vec(w / 2, h / 2), vec(w, h))
}

function rectFromCS(center, size) {
  const { x: cx, y: cy } = center
  const { x: w, y: h } = size
  return {
    get x1() {
      return cx - w / 2
    },
    get y1() {
      return cy - h / 2
    },
    get x2() {
      return cx + w / 2
    },
    get y2() {
      return cy + h / 2
    },
    constrainPointOffset(point) {
      const { x, y } = point
      const { minX, minY, maxX, maxY } = this.bounds

      return vec(
        x < minX ? minX - x : x > maxX ? maxX - x : 0,
        y < minY ? minY - y : y > maxY ? maxY - y : 0,
      )
    },
    restrictInOffset(big) {
      invariant(w < big.w)
      invariant(h < big.h)
      return big.shrink(this).constrainPointOffset(center)
    },
    get bounds() {
      const [minX, minY, maxX, maxY] = [this.x1, this.y1, this.x2, this.y2]
      return { minX, minY, maxX, maxY }
    },
    get edges() {
      const { minX, minY, maxX, maxY } = this.bounds
      return [
        { p1: [minX, minY], p2: [maxX, minY], side: 'top' },
        { p1: [maxX, minY], p2: [maxX, maxY], side: 'right' },
        { p1: [maxX, maxY], p2: [minX, maxY], side: 'bottom' },
        { p1: [minX, maxY], p2: [minX, minY], side: 'left' },
      ]
    },
    lineEdgeShortestIntersection(p1, p2) {
      const llip = R.partial(lineLineIntersectionPoint, [p1, p2])
      const distFromP2 = R.partial(distanceBetweenPoints, [p2])
      return R.compose(
        R.head,
        R.sortWith([R.ascend(R.prop('len'))]),
        R.map(ei => R.assoc('len', distFromP2(ei.ipt), ei)),
        R.reject(
          R.compose(
            R.isNil,
            R.prop('ipt'),
          ),
        ),
        R.map(edge => ({ edge, ipt: llip(edge.p1, edge.p2) })),
      )(this.edges)
    },
    get cx() {
      return cx
    },
    get cy() {
      return cy
    },
    get w() {
      return w
    },
    get h() {
      return h
    },
    get center() {
      return center
    },
    translate(v1) {
      return rectFromCS(center.add(v1), size)
    },
    mapCenter(cfn) {
      return rectFromCS(cfn(center), size)
    },
    // mapSize(sfn) {
    //   return rectFromCS(center, sfn(size))
    // },
    shrink(small) {
      invariant(w > small.w)
      invariant(h > small.h)
      return rectFromCS(center, vec(w - small.w, h - small.h))
    },
    grow(rect) {
      return rectFromCS(center, vec(w + rect.w, h + rect.h))
    },
    clampIn(big) {
      invariant(w < big.w)
      invariant(h < big.h)
      if (
        this.x1 > big.x1 &&
        this.x2 < big.x2 &&
        this.y1 > big.y1 &&
        this.y2 < big.y2
      ) {
        return this
      } else {
        const shr = big.shrink(this)
        return this.mapCenter(c =>
          c.mapEach(R.clamp(shr.x1, shr.x2), R.clamp(shr.y1, shr.y2)),
        )
      }
    },
  }
}

const Key = (function initKeyboard() {
  const km = {}
  window.addEventListener('keydown', e => {
    km[e.key] = true
  })
  window.addEventListener('keyup', e => {
    km[e.key] = false
  })

  return {
    get left() {
      return km['ArrowLeft']
    },
    get right() {
      return km['ArrowRight']
    },
  }
})()

function createPaddle(vp) {
  const h = 15
  const w = 150
  let rect = rectFromCS(vec(vp.cx, vp.y2 - h * 2), vec(w, h))

  const speed = 10

  return {
    get rect() {
      return rect
    },
    update() {
      const dx = Key.left ? -speed : Key.right ? speed : 0
      const vel = vec(dx, 0)
      rect = rect.mapCenter(c => c.add(vel)).clampIn(vp)
    },
    render(ctx) {
      ctx.fillStyle = 'orange'
      ctx.fillRect(rect.x1, rect.y1, rect.w, rect.h)
    },
  }
}

function createBall(vp, padRect) {
  const r = 10
  const w = r * 2
  const h = r * 2
  let rect = rectFromCS(vec(vp.cx, vp.cy), vec(w, h))
  let vel = vecFromDegMag(99, 10)

  function viewportCollision() {
    const newRect = rect.translate(vel)

    const offset = rect.translate(vel).restrictInOffset(vp)

    if (offset.equals(vec(0, 0))) return false

    const { x: xOffset, y: yOffset } = offset

    vel = vel.mapEach(
      dx =>
        xOffset === 0
          ? dx
          : xOffset < 0
          ? Math.abs(dx) * -1
          : Math.abs(dx),
      dy =>
        yOffset === 0
          ? dy
          : yOffset < 0
          ? Math.abs(dy) * -1
          : Math.abs(dy),
    )

    rect = newRect.translate(offset)
    return true
  }

  function paddleCollision() {
    const grownPaddleRect = padRect.grow(rect)

    const ballP1 = rect.center.tuple
    const ballP2 = rect.center.add(vel).tuple

    const ei = grownPaddleRect.lineEdgeShortestIntersection(ballP1, ballP2)

    if (ei) {
      let xfn = I
      let yfn = I
      let dxfn = I
      let dyfn = I

      switch (ei.edge.side) {
        case 'top':
          yfn = R.always(Vector.y(ei.edge.p1))
          dyfn = absNeg
          break
        case 'bottom':
          yfn = R.always(Vector.y(ei.edge.p1))
          dyfn = Math.abs
          break
        case 'left':
          xfn = R.always(Vector.x(ei.edge.p1))
          dxfn = absNeg
          break
        case 'right':
          xfn = R.always(Vector.x(ei.edge.p1))
          dxfn = Math.abs
          break
      }

      rect = rect.translate(vel).mapCenter(c => c.mapEach(xfn, yfn))
      vel = vel.mapEach(dxfn, dyfn)

      return true
    }
    return false
  }

  return {
    update() {
      const collisionHandled = viewportCollision() || paddleCollision()
      if (!collisionHandled) {
        rect = rect.translate(vel)
      }
    },
    render(ctx) {
      const { cx, cy } = rect
      const radius = r
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, degToRadians(360), false)
      ctx.fillStyle = 'blue'
      ctx.fill()
    },
  }
}

function startGame() {
  const ctx = initCanvas()
  const { width, height } = ctx.canvas
  const viewport = Rectangle.fromWH(width, height)
  const pad = Paddle.init(viewport)
  const ball = Ball.init(viewport, pad.rect)

  function update() {
    pad.update(Key)
    ball.update()
  }

  function render() {
    pad.render(ctx)
    ball.render(ctx)
  }

  gameLoop(() => {
    update()
    const { x, y, w, h } = viewport.topLeftXYWH
    ctx.clearRect(x, y, w, h)
    render()
  })
}

startGame()
