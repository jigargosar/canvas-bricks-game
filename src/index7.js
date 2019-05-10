/* eslint-disable no-debugger */
import 'tachyons'
import './index.css'
import { Rectangle } from './v6/Rectangle'
import { Point } from './v6/Point'
import { Size } from './v6/Size'

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

const Mouse = function initMouse(canvas) {
  let point = Point.origin
  window.addEventListener('mousemove', e => {
    point = Point.fromXY(
      e.pageX - canvas.offsetLeft,
      e.pageY - canvas.offsetTop,
    )
  })
  return {
    get at() {
      return point
    },
    get x() {
      return point.x
    },
    get y() {
      return point.y
    },
  }
}

function startGame() {
  const ctx = initCanvas()
  const { width, height } = ctx.canvas
  const viewport = Rectangle.fromWH(width, height)
  const mouse = Mouse(ctx.canvas)

  function update() {}

  function render() {
    const rect = Rectangle.fromCS(mouse.at, Size.fromWH(100, 100))
    const { x, y, w, h } = rect.topLeftXYWH
    ctx.fillRect(x, y, w, h)
  }

  gameLoop(() => {
    update()
    const { x, y, w, h } = viewport.topLeftXYWH
    ctx.clearRect(x, y, w, h)
    render()
  })
}

startGame()
