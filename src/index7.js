/* eslint-disable no-debugger */
import 'tachyons'
import './index.css'
import { Draw, Rect, Point, Size, canvasToRect, vec2 } from './main7'
import * as R from 'ramda'

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

const Key = function initKeyboard() {
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
}

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

const overProp = R.curry(function overProp(name, fn, obj) {
  return R.over(R.lensProp(name), fn, obj)
})

function renderFollower(draw, follower) {
  const rect = follower.rect
  draw.fillEllipse(rect, 'dodgerblue')
}

function startGame(cbs) {
  const { init, update, render } = cbs

  const ctx = initCanvas()
  const draw = Draw.fromCtx(ctx)

  const updateDeps = {
    mouse: Mouse(ctx.canvas),
    viewport: draw.rect,
    key: Key(),
  }

  const box = useState(init(updateDeps))

  gameLoop(() => {
    box.mapState(s => update(updateDeps, s))
    draw.clear()

    render(draw, box.state)
  })
}

startGame({
  init({ mouse }) {
    return {
      follower: {
        rect: Rect.fromCS(mouse.at, Size.fromWH(100, 100)),
        vel: vec2(0, 0),
      },
    }
  },
  update({ mouse }, state) {
    function updateFollower(follower) {
      const { rect, vel } = follower
      return { ...follower, rect: rect.translateBy(vel) }
    }
    return { ...state, follower: updateFollower(state.follower) }
  },
  render(draw, { follower }) {
    renderFollower(draw, follower)
  },
})
