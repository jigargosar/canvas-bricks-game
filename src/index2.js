import 'tachyons'
import './index.css'

function invariant(pred, msg = 'invariant failed') {
  if (!pred) {
    throw new Error(msg)
  }
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
  zero() {
    return Position.fromXY(0, 0)
  },
  fromXY(x, y) {
    return { x, y }
  },
  mapEach(xFn, yFn, pos) {
    return Position.fromXY(xFn(pos.x), yFn(pos.y))
  },

  mapBoth(xyFn, pos) {
    return Position.fromXY(xyFn(pos.x), xyFn(pos.y))
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
}
const I = x => x

const Viewport = {
  fromCtx({ canvas: { width, height } }) {
    return { width, height }
  },
  center(viewport) {
    return Position.fromXY(viewport.width / 2, viewport.height / 2)
  },
  clampCircle(circle, viewport) {
    const cBounds = Bounds.fromCircle(circle)
    const vBounds = Bounds.fromViewport(viewport)

    let mapX = I
    let mapY = I
    if (cBounds.minX < vBounds.minX) {
      mapX = x => x + (vBounds.minX - cBounds.minX)
    } else if (cBounds.maxX > vBounds.maxX) {
      mapX = x => x - (cBounds.maxX - vBounds.maxX)
    }

    if (cBounds.minY < vBounds.minY) {
      mapY = y => y + (vBounds.minY - cBounds.minY)
    } else if (cBounds.maxY > vBounds.maxY) {
      mapY = y => y - (cBounds.maxY - vBounds.maxY)
    }

    return Circle.mapCenter(
      pos => Position.mapEach(mapX, mapY, pos),
      circle,
    )
  },
}

function deg(degrees) {
  return (degrees * Math.PI) / 180
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

  minPos(circle) {
    return Position.mapBoth(num => num - circle.radius, circle.center)
  },
  maxPos(circle) {
    return Position.mapBoth(num => num + circle.radius, circle.center)
  },
}

const Bounds = {
  fromCircle(circle) {
    const minPos = Position.toRecord(Circle.minPos(circle))
    const maxPos = Position.toRecord(Circle.maxPos(circle))
    return {
      minX: minPos.x,
      maxX: maxPos.x,
      minY: minPos.y,
      maxY: maxPos.y,
    }
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

const Ball = {
  init(options) {
    const pos = options.pos || Position.zero()
    return {
      pos,
      radius: 30,
      vel: Velocity.fromPolar(deg(100), 10),
    }
  },
  circle(ball) {
    return Circle.fromCenterRadius(ball.pos, ball.radius)
  },
  update(viewport, ball) {
    const oldCircle = Ball.circle(ball)
    const newCircle = Circle.mapCenter(
      pos => Position.addVelocity(ball.vel, pos),
      oldCircle,
    )
    const newBounds = Bounds.fromCircle(newCircle)

    const clampedPos = Circle.center(
      Viewport.clampCircle(newCircle, viewport),
    )
    ball.pos = clampedPos
  },

  render(ctx, ball) {
    ctx.beginPath()
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = 'green'
    ctx.fill()
  },
}

function step(ctx, { ball, viewport }) {
  Ball.update(viewport, ball)

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  Ball.render(ctx, ball)
}

function start() {
  const ctx = initCanvas()
  const viewport = Viewport.fromCtx(ctx)
  const ball = Ball.init({ pos: Viewport.center(viewport) })

  gameLoop(() => step(ctx, { ball, viewport }))
}

setTimeout(start, 0)
