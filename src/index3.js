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

  return { rect: newRect, vel: newVel }
}

function absNeg(num) {
  return Math.abs(num) * -1
}

function absPos(num) {
  return Math.abs(num)
}

function ballCollisionWithPaddle(ballRV, paddleRect) {
  const grownPaddleRect = Rect.mapSize(Vector.add(Rect.size(ballRV.rect)))(
    paddleRect,
  )

  const [minX, minY] = Rect.minP(grownPaddleRect)
  const [maxX, maxY] = Rect.maxP(grownPaddleRect)

  const oldBallCenter = Rect.center(ballRV.rect)
  const [x1, y1] = Vector.toTuple(oldBallCenter)
  const [x2, y2] = Vector.toTuple(Vector.add(oldBallCenter, ballRV.vel))

  let x = x2,
    y = y2
  let dxfn = R.identity,
    dyfn = R.identity
  if (x > minX && x < maxX && y > minY && y < maxY) {
    if (x1 < x2) {
      // LEFT
      x = minX
      dxfn = absNeg
    } else if (x2 < x1) {
      // RIGHT
      x = maxX
      dxfn = Math.abs
    }
    if (y1 < y2) {
      // TOP
      y = minY
      dyfn = absNeg
    } else if (y2 < y1) {
      // BOTTOM
      y = maxY
      dyfn = Math.abs
    }
    return {
      rect: Rect.mapCenter(Vector.mapEach(() => x, () => y), ballRV.rect),
      vel: Vector.mapEach(dxfn, dyfn, ballRV.vel),
    }
  } else {
    return ballRV
  }
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

    const beforeCollision = { rect: newBallRect, vel: ballRV.vel }
    const afterCollision = ballCollisionWithViewPort(
      beforeCollision,
      vpRect,
    )

    ballRV.rect = afterCollision.rect
    ballRV.vel = afterCollision.vel

    if (R.equals(beforeCollision, afterCollision)) {
      //TODO: check collision with paddle
      const afterCollision = ballCollisionWithPaddle(ballRV, paddleRect)
      ballRV.rect = afterCollision.rect
      ballRV.vel = afterCollision.vel
      if (R.equals(beforeCollision, afterCollision)) {
        //TODO: check collision with bricks
      }
    }
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

setTimeout(() => {
  try {
    start()
  } catch (error) {
    // eslint-disable-next-line no-debugger
    debugger
  }
}, 100)
