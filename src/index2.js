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

function step(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.fillStyle = 'green'
  ctx.fillRect(10, 10, 100, 100)
}

function start() {
  const ctx = initCanvas()
  gameLoop(() => step(ctx))
}

start()
