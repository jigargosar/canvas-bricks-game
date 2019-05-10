/* eslint-disable no-debugger */
import 'tachyons'
import './index.css'
import { Rectangle } from './Rectangle'
import { Paddle } from './Paddle'
import { Ball } from './Ball'
import { Bricks } from './Bricks'

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

function startGame() {
  const ctx = initCanvas()
  const { width, height } = ctx.canvas
  const viewport = Rectangle.fromWH(width, height)
  let pad = Paddle.init(viewport)
  let ball = Ball.init(viewport)
  let bricks = Bricks.init(viewport)

  function update() {
    pad = pad.update(Key, viewport)
    const bb = ball.updateBricksCollision(bricks)
    if (bb) {
      ball = bb.ball
      bricks = bricks.killAt(bb.brickIdx)
    } else {
      ball = ball.update(viewport, pad.rect, bricks)
    }
  }

  function render() {
    pad.render(ctx)
    ball.render(ctx)
    bricks.render(ctx)
  }

  gameLoop(() => {
    update()
    const { x, y, w, h } = viewport.topLeftXYWH
    ctx.clearRect(x, y, w, h)
    render()
  })
}

startGame()
