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

function step(ctx, ball) {
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
function start() {
  const ctx = initCanvas()
  const ball = { pos: { x: 0, y: 0 }, r: 30 }

  ball.pos = getCtxCenter(ctx)

  gameLoop(() => step(ctx, ball))
}

start()
