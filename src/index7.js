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

function renderBall(ctx, { x, y, r }) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI, false)
  ctx.fillStyle = 'green'
  ctx.fill()
}

function initPaddle(vp) {
  const pad = { x: 0, y: 0, w: 100, h: 15, vx: 0, vy: 0 }
  const x = (vp.w - pad.w) / 2
  const y = vp.h - pad.h - 20
  return { ...pad, x, y }
}

function renderPaddle(ctx, { x, y, w, h }) {
  ctx.fillStyle = 'orange'
  ctx.fillRect(x, y, w, h)
}

function initBricks(vp) {
  const rowCt = 5
  const colCt = 5
  const brickWidth = 50
  const brickHeight = 10
  const colGap = 20
  const rowGap = 20
  const topOffset = 30
  const gridWidth = colCt * (brickWidth + colGap) - colGap
  const leftOffset = (vp.w - gridWidth) / 2

  const bricksRows = R.times(
    row => R.times(col => initBrick(row, col), colCt),
    rowCt,
  )
  return R.flatten(bricksRows)

  function initBrick(row, col) {
    const brick = {
      x: 0,
      y: 0,
      w: brickWidth,
      h: brickHeight,
      alive: true,
    }
    const x = leftOffset + col * (brick.w + colGap)
    const y = topOffset + row * (brick.h + rowGap)
    return { ...brick, x, y }
  }
}

function renderBricks(ctx, bricks) {
  ctx.fillStyle = 'dodgerblue'
  bricks
    .filter(b => b.alive)
    .forEach(({ x, y, w, h }) => ctx.fillRect(x, y, w, h))
}

function update({ mouse, viewport: vp }, state) {
  const { ball, pad, bricks } = state
  return { ...state, ball, pad, bricks }
}

startGame({
  init({ mouse, viewport }) {
    const vp = { w: viewport.size.width, h: viewport.size.height }
    return {
      follower: Follower.init(mouse.at),
      follower2: Follower2.init(mouse.at),
      ball: initBall(vp),
      pad: initPaddle(vp),
      bricks: initBricks(vp),
    }
  },
  update({ mouse }, state) {
    return {
      ...state,
      follower: state.follower.update(mouse),
      follower2: Follower2.update(mouse, state.follower2),
    }
  },
  render(draw, { follower, follower2, ball, pad, bricks }) {
    // follower.render(draw)
    // Follower2.render(draw, follower2)
    const ctx = draw.ctx
    renderBall(ctx, ball)
    renderPaddle(ctx, pad)
    renderBricks(ctx, bricks)
  },
})
