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

const Vector = {
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
  add: v1 => v2 => Vector.add2(v1, v2),
  add2([x1, y1], [x2, y2]) {
    return Vector.fromXY(x1 + x2, y1 + y2)
  },
  sub([x1, y1], [x2, y2]) {
    return Vector.fromXY(x1 - x2, y1 - y2)
  },
  scale(num, vec) {
    return vec.map(n => n * num)
  },
  mapEach: xf => yf => ([x, y]) => Vector.fromXY(xf(x), yf(y)),
  mapX(xf, vec) {
    return Vector.mapEach(xf)(I)(vec)
  },
  mapY: yf => vec => Vector.mapEach(I)(yf)(vec),
}

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
    step()
    requestAnimationFrame(callback)
  }
  requestAnimationFrame(callback)
}

const Rect = {
  fromWH(width, height) {
    const size = Vector.fromXY(width, height)
    return { center: Vector.scale(0.5, size), size }
  },
  cp(rect) {
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
    return Rect.mapCP(() => Rect.cp(fromRect), rect)
  },
  toTLXYWH(rect) {
    return [...Rect.tl(rect), ...Rect.size(rect)]
  },
}

const RenderRect = {
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
    const [x, y] = Rect.cp(rect)
    const radius = Math.min(Rect.w(rect, Rect.h(rect))) / 2
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, degToRadians(360), false)
    ctx.fillStyle = fillStyle
    ctx.fill()
  },
}

function start() {
  const ctx = initCanvas()
  const vpRect = Rect.fromWH(ctx.canvas.width, ctx.canvas.height)

  let ballRect = Rect.fromWH(20, 20)
  let ballVel = Vector.fromDegreesMag(20, 0.5)
  ballRect = Rect.alignCenter(vpRect, ballRect)

  let paddleRect = Rect.fromWH(100, 10)
  const paddleSpeed = 10

  paddleRect = Rect.alignCenter(vpRect, paddleRect)

  paddleRect = Rect.alignBottom(vpRect, paddleRect)
  paddleRect = Rect.translate([0, -Rect.h(paddleRect)], paddleRect)

  function update() {
    ballRect = Rect.mapCP(Vector.add(ballVel), ballRect)
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

setTimeout(start, 1)
