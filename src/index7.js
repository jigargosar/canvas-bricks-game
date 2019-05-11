/* eslint-disable no-debugger */
import 'tachyons'
import './index.css'
import { Draw, Point, canvasToRect, Follower, Follower2 } from './main7'
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

function initBall(vp) {
  return { x: vp.w / 2, y: vp.h / 2, r: 10, vx: 0, vy: 0 }
}

function initPaddle(vp) {
  const pad = { x: 0, y: 0, w: 100, h: 15, vx: 0, vy: 0 }
  const x = (vp.w + pad.w) / 2
  const y = vp.h - pad.h - 20
  return { ...pad, x, y }
}

function initBrick(row, col) {
  const brick = { x: 0, y: 0, w: 50, h: 10, alive: true }

  const colGap = 20
  const rowGap = 20
  const topOffset = 100
  const leftOffset = 20

  const x = leftOffset + col * (brick.w + colGap)
  const y = topOffset + row * (brick.h + rowGap)
  return { ...brick, x, y }
}

startGame({
  init({ mouse }) {
    return {
      follower: Follower.init(mouse.at),
      follower2: Follower2.init(mouse.at),
    }
  },
  update({ mouse }, state) {
    return {
      ...state,
      follower: state.follower.update(mouse),
      follower2: Follower2.update(mouse, state.follower2),
    }
  },
  render(draw, { follower, follower2 }) {
    follower.render(draw)
    Follower2.render(draw, follower2)
  },
})
