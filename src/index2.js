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

  addVelocity(vel, pos) {
    const [dx, dy] = Velocity.toCartTuple(vel)
    return Position.mapEach(x => x + dx, y => y + dy, pos)
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

const Viewport = {
  fromCtx({ canvas: { width, height } }) {
    return { width, height }
  },
  center(viewport) {
    return Position.fromXY(viewport.width / 2, viewport.height / 2)
  },
  clampCircle({ pos, radius }, viewport) {
    const [minX, maxX] = [radius, viewport.width - radius]
    const x = clamp(minX, maxX, pos.x)

    const [minY, maxY] = [radius, viewport.height - radius]
    const y = clamp(minY, maxY, pos.y)

    return { x, y }
  },
}

function deg(degrees) {
  return (degrees * Math.PI) / 180
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
  mapPos(fn, ball) {
    return { ...ball, pos: fn(ball.pos) }
  },
  update(viewport, ball) {
    const newPos = Position.addVelocity(ball.vel, ball.pos)
    const clampedPos = Viewport.clampCircle(
      {
        pos: newPos,
        radius: ball.radius,
      },
      viewport,
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

start()
