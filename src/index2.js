import 'tachyons'
import './index.css'

function degToRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function invariant(pred, msg = 'invariant failed') {
  if (!pred) {
    throw new Error(msg)
  }
}

function Vector(x, y) {
  return {
    get x() {
      return x
    },
    get y() {
      return y
    },
    get angle() {
      return Math.atan2(y, x)
    },
    get mag() {
      return Math.sqrt(x * x + y * y)
    },
    add(vec2) {
      return Vector(x + vec2.x, y + vec2.y)
    },
  }
}

Vector.fromAngleMag = function(angle, mag) {
  return Vector(Math.cos(angle) * mag, Math.sin(angle) * mag)
}

Vector.fromDegreesMag = function(degrees, mag) {
  return Vector.fromAngleMag(degToRadians(degrees), mag)
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

const Position = {
  equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y
  },
  zero() {
    return Position.fromXY(0, 0)
  },
  fromXY(x, y) {
    return { x, y }
  },
  mapEach(xFn, yFn, pos) {
    return Position.fromXY(xFn(pos.x), yFn(pos.y))
  },

  addVelocity(vel, pos) {
    const [dx, dy] = Velocity.toCartTuple(vel)
    return Position.mapEach(x => x + dx, y => y + dy, pos)
  },

  toRecord(pos) {
    return { x: pos.x, y: pos.y }
  },
}

const Velocity = {
  fromPolar(angle, magnitude) {
    return {
      dx: Math.cos(angle) * magnitude,
      dy: Math.sin(angle) * magnitude,
    }
  },
  toCartTuple(vel) {
    return [vel.dx, vel.dy]
  },

  fromXY(dx, dy) {
    return { dx, dy }
  },

  mapEach(xFn, yFn, vel) {
    return Velocity.fromXY(xFn(vel.dx), yFn(vel.dy))
  },
}
const I = x => x

const Viewport = {
  fromCtx({ canvas: { width, height } }) {
    return { width, height }
  },
  center(viewport) {
    return Position.fromXY(viewport.width / 2, viewport.height / 2)
  },
}

const Circle = {
  fromCenterRadius(center, radius) {
    invariant(radius >= 0, 'radius of circle cannot be negative')
    return { center, radius }
  },

  center(circle) {
    return circle.center
  },

  mapCenter(cFn, circle) {
    return Circle.fromCenterRadius(cFn(circle.center), circle.radius)
  },
}

const Bounds = {
  fromPosSize(pos, size) {
    const minPos = pos
    const maxPos = Position.mapEach(
      x => x + size.width,
      y => y + size.height,
      pos,
    )

    return {
      minX: minPos.x,
      maxX: maxPos.x,
      minY: minPos.y,
      maxY: maxPos.y,
    }
  },

  shrinkBy(num, bounds) {
    const { minX, maxX, minY, maxY } = bounds
    return {
      minX: minX + num,
      maxX: maxX - num,
      minY: minY + num,
      maxY: maxY - num,
    }
  },
  growBy(num, bounds) {
    return Bounds.shrinkBy(num * -1, bounds)
  },

  clampPos(pos, bounds) {
    const { minX, maxX, minY, maxY } = bounds
    const xFn = x => clamp(minX, maxX, x)
    const yFn = y => clamp(minY, maxY, y)

    return Position.mapEach(xFn, yFn, pos)
  },

  containsPos(pos, bounds) {
    const cp = Bounds.clampPos(pos, bounds)
    return Position.equals(cp, pos)
  },

  fromViewport(viewport) {
    const minPos = Position.zero()
    const maxPos = Position.fromXY(viewport.width, viewport.height)

    return {
      minX: minPos.x,
      maxX: maxPos.x,
      minY: minPos.y,
      maxY: maxPos.y,
    }
  },
}

function ensurePositive(num) {
  return Math.abs(num)
}

function ensureNegative(num) {
  return Math.abs(num) * -1
}

const Ball = {
  init(options) {
    const pos = options.pos || Position.zero()
    return {
      pos,
      radius: 10,
      vel: Velocity.fromPolar(degToRadians(79.99), 5),
    }
  },
  circle(ball) {
    return Circle.fromCenterRadius(ball.pos, ball.radius)
  },

  update(viewport, ball, paddle) {
    const bounds = Bounds.shrinkBy(
      ball.radius,
      Bounds.fromViewport(viewport),
    )

    const newPos = Position.addVelocity(ball.vel, ball.pos)

    const paddleBounds = Bounds.growBy(
      ball.radius,
      Bounds.fromPosSize(paddle.pos, paddle.size),
    )

    const isCollidingWithPaddle = Bounds.containsPos(newPos, paddleBounds)

    if (isCollidingWithPaddle) {
      let x = newPos.x
      let y = newPos.y
      let dyFn = I
      if (newPos.y >= paddleBounds.minY) {
        y = paddleBounds.minY - 1
        dyFn = ensureNegative
      }

      ball.vel = Velocity.mapEach(I, dyFn, ball.vel)
      ball.pos = Position.fromXY(x, y)
      return
    }

    const clampedPos = Bounds.clampPos(newPos, bounds)

    function velocityFn(min, max, val) {
      if (val < min) {
        return ensurePositive
      } else if (val > max) {
        return ensureNegative
      } else {
        return I
      }
    }

    const dxFn = velocityFn(bounds.minX, bounds.maxX, newPos.x)
    const dyFn = velocityFn(bounds.minY, bounds.maxY, newPos.y)

    ball.vel = Velocity.mapEach(dxFn, dyFn, ball.vel)
    ball.pos = clampedPos
  },

  render(ctx, ball) {
    ctx.beginPath()
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = 'green'
    ctx.fill()
  },
}

function Paddle(options) {
  const paddle = PaddleF.init(options)
  return {
    get pos() {
      return paddle.pos
    },
    get size() {
      return paddle.size
    },
    set pos(pos) {
      paddle.pos = pos
    },
    render(ctx) {
      PaddleF.render(ctx, paddle)
    },
  }
}

const PaddleF = {
  init(options = {}) {
    const pos = options.pos || Position.zero()
    return {
      pos,
      size: { width: 100, height: 10 },
    }
  },
  render(ctx, paddle) {
    ctx.beginPath()
    const { x, y } = Position.toRecord(paddle.pos)
    const { width, height } = paddle.size
    ctx.rect(x, y, width, height)
    ctx.fillStyle = 'orange'
    ctx.fill()
  },
}

function step(ctx, { ball, paddle, viewport }) {
  Ball.update(viewport, ball, paddle)

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  Ball.render(ctx, ball)
  paddle.render(ctx)
}

function start() {
  const ctx = initCanvas()
  const viewport = Viewport.fromCtx(ctx)
  const ball = Ball.init({ pos: Viewport.center(viewport) })
  const paddle = Paddle()
  paddle.pos = Position.fromXY(
    (viewport.width - paddle.size.width) / 2,
    viewport.height - paddle.size.height - 20,
  )
  gameLoop(() => step(ctx, { ball, paddle, viewport }))
}

setTimeout(start, 0)
