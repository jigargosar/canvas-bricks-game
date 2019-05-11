/* eslint-disable no-debugger */
import 'tachyons'
import './index.css'
import { Draw, Rect, Point, Size, canvasToRect } from './main7'
import * as R from 'R'

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

const Rectangle = (function() {
  function fromXYWidthHeight(x, y, w, h) {
    return { x, y, w, h }
  }
  function fromCenterXYWidthHeight(cx, cy, w, h) {
    return fromXYWidthHeight(cx - w / 2, cy - h / 2, w, h)
  }

  function fromCenterPointWidthHeight(centerPoint, w, h) {
    return fromCenterXYWidthHeight(centerPoint.x, centerPoint.y, w, h)
  }

  function toXYWHObj({ x, y, w, h }) {
    return { x, y, w, h }
  }
  return {
    fromXYWidthHeight,
    fromCenterXYWidthHeight,
    fromCenterPointWidthHeight,
    toXYWHObj,
  }
})()

const Mouse = function initMouse(canvas) {
  const canvasRect = canvasToRect(canvas)
  let point = canvasRect.center
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

function initialState({ mouse }) {
  return {
    follower: { rect: Rect.fromCS(mouse.at, Size.fromWH(100, 100)) },
  }
}

function useState(initial) {
  let state = initial
  return {
    get state() {
      return state
    },
    mapState(fn) {
      state = fn(state)
    },
    mergeState(partialState) {
      Object.assign(state, partialState)
    },
  }
}

const overProp = prop => R.over(R.lensProp(prop))

function startGame() {
  const ctx = initCanvas()
  const draw = Draw.fromCtx(ctx)

  const viewportRect = draw.rect
  const mouse = Mouse(ctx.canvas)
  const deps = { mouse }

  let stateBox = useState(initialState(deps))

  function update() {
    stateBox.mapState(
      overProp('follower')(follower => follower.mapCenter(mouse.at)),
    )
  }

  function render() {
    const follower = stateBox.state
    const rect = follower.rect
    draw.fillEllipse(rect, 'dodgerblue')
  }

  gameLoop(() => {
    update()
    draw.clearRect(viewportRect)
    render()
  })
}

startGame()
