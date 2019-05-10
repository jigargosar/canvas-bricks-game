/* eslint-disable no-debugger */
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

const Point = (function() {
  function fromXY(x, y) {
    return { x, y }
  }
  return {
    fromXY,
    origin: fromXY(0, 0),
  }
})()

const Rectangle = (function() {
  function fromXYWidthHeight(x, y, w, h) {
    return { x, y, w, h }
  }
  function fromWidthHeight(w, h) {
    return fromXYWidthHeight(0, 0, w, h)
  }

  function fromCenterXYWidthHeight(cx, cy, w, h) {
    return fromXYWidthHeight(cx - w / 2, cy - h / 2, w, h)
  }

  function toXYWHObj({ x, y, w, h }) {
    return { x, y, w, h }
  }
  return {
    fromWidthHeight,
    fromCenterXYWidthHeight,
    toXYWHObj,
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
  const viewportRectangle = Rectangle.fromWidthHeight(width, height)
  const mouse = Mouse(ctx.canvas)

  function update() {}

  function render() {
    const mp = mouse.at
    const rect = Rectangle.fromCenterXYWidthHeight(mp.x, mp.y, 100, 100)
    const { x, y, w, h } = Rectangle.toXYWHObj(rect)
    ctx.fillRect(x, y, w, h)
  }

  gameLoop(() => {
    update()
    const { x, y, w, h } = Rectangle.toXYWHObj(viewportRectangle)
    ctx.clearRect(x, y, w, h)
    render()
  })
}

startGame()
