import 'tachyons'
import './index.css'

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

function clampCircleInViewPort(viewport, { pos, radius }) {
  let x = pos.x

  const [minX, maxX] = [radius, viewport.width - radius]
  if (x < minX) {
    x = minX
  } else if (x > maxX) {
    x = maxX
  }

  let y = pos.y
  const [minY, maxY] = [radius, viewport.height - radius]

  if (y < minY) {
    y = minY
  } else if (y > maxY) {
    y = maxY
  }

  return { x, y }
}

const Ball = {
  nextPos(ball) {
    return { x: ball.pos.x + ball.vel.dx, y: ball.pos.y + ball.vel.dy }
  },
  update(viewport, ball) {
    const newPos = Ball.nextPos(ball)
    const clampedPos = clampCircleInViewPort(viewport, {
      pos: newPos,
      radius: ball.r,
    })
    ball.pos = clampedPos
  },
}

function step(ctx, { ball, viewport }) {
  Ball.update(viewport, ball)

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.fillStyle = 'green'
  ctx.beginPath()
  ctx.arc(ball.pos.x, ball.pos.y, ball.r, 0, Math.PI * 2, false)
  ctx.fillStyle = 'green'
  ctx.fill()
}

function getCtxCenter({ canvas }) {
  return { x: canvas.width / 2, y: canvas.height / 2 }
}

const Velocity = {
  fromPolar(angle, magnitude) {
    return {
      dx: Math.cos(angle) * magnitude,
      dy: Math.sin(angle) * magnitude,
    }
  },
}

const Viewport = {
  fromCtx({ canvas: { width, height } }) {
    return { width, height }
  },
}

function deg(degrees) {
  return (degrees * Math.PI) / 180
}

function start() {
  const ctx = initCanvas()
  const ball = {
    pos: { x: 0, y: 0 },
    r: 30,
    vel: Velocity.fromPolar(deg(100), 10),
  }

  ball.pos = getCtxCenter(ctx)

  const viewport = Viewport.fromCtx(ctx)

  gameLoop(() => step(ctx, { ball, viewport }))
}

start()
