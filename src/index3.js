import 'tachyons'
import './index.css'
import * as R from 'ramda'

function degToRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function invariant(pred, msg = 'invariant failed') {
  if (!pred) {
    throw new Error(msg)
  }
}

function I(x) {
  return x
}

/**
 * @template T
 * @param T
 * @returns T
 */
const curryAll = R.mapObjIndexed(R.curry)

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

function clamp(min, max, num) {
  invariant(min < max, 'min should be less than max')
  if (num < min) {
    return min
  } else if (num > max) {
    return max
  } else {
    return num
  }
}

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
    try {
      step()
      requestAnimationFrame(callback)
    } catch (e) {
      // eslint-disable-next-line no-debugger
      debugger
    }
  }
  requestAnimationFrame(callback)
}

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
  mapCP(cf, rect) {
    return { ...rect, center: cf(rect.center) }
  },
  translate(vec, rect) {
    return Rect.mapCP(Vector.add(vec), rect)
  },
  alignBottom(fromRect, rect) {
    return Rect.mapCP(
      Vector.mapY(() => Rect.maxY(fromRect) - Rect.h(rect) / 2),
      rect,
    )
  },
  alignCenter(fromRect, rect) {
    return Rect.mapCP(() => Rect.center(fromRect), rect)
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
  constrainPointOffsets([x, y], rect) {
    const [minX, minY] = Rect.minP(rect)
    const [maxX, maxY] = Rect.maxP(rect)

    return [
      x < minX ? minX - x : x > maxX ? maxX - x : 0,
      y < minY ? minY - y : y > maxY ? maxY - y : 0,
    ]
  },
}
Rect = curryAll(Rect)

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

function start() {
  const ctx = initCanvas()
  const vpRect = Rect.fromWH(ctx.canvas.width, ctx.canvas.height)

  const ballSize = Vector.fromXY(20, 20)
  let ballRect = Rect.fromWHTuple(ballSize)
  let ballVel = Vector.fromDegreesMag(20, 10)
  ballRect = Rect.alignCenter(vpRect, ballRect)

  let paddleRect = Rect.fromWH(100, 10)
  const paddleSpeed = 10

  paddleRect = Rect.alignCenter(vpRect, paddleRect)

  paddleRect = Rect.alignBottom(vpRect, paddleRect)
  paddleRect = Rect.translate([0, -Rect.h(paddleRect)], paddleRect)

  function update() {
    const newBR = Rect.mapCP(Vector.add(ballVel), ballRect)
    const newBallC = Rect.center(newBR)
    const newVP = Rect.mapSize(
      vpSize => Vector.sub(vpSize, ballSize),
      vpRect,
    )

    const [xo, yo] = Rect.constrainPointOffsets(newBallC, newVP)

    ballVel = Vector.mapEach(
      dx => (xo === 0 ? dx : xo < 0 ? Math.abs(dx) * -1 : Math.abs(dx)),
      dy => (yo === 0 ? dy : yo < 0 ? Math.abs(dy) * -1 : Math.abs(dy)),
      ballVel,
    )

    ballRect = newBR
  }

  function render() {
    RenderRect.fillRect(ctx, 'orange', paddleRect)
    RenderRect.fillCircleMin(ctx, 'blue', ballRect)
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

setTimeout(() => {
  try {
    start()
  } catch (error) {
    // eslint-disable-next-line no-debugger
    debugger
  }
}, 100)
