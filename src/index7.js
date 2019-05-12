/* eslint-disable no-debugger */
import 'tachyons'
import './index.css'
import { Draw, Point, canvasToRect, Follower, Follower2 } from './main7'
import * as R from 'ramda'

//#region UTILS
function invariant(pred, msg = 'invariant failed') {
  if (!pred) {
    throw new Error(msg)
  }
}
const abs = Math.abs
const absNeg = R.compose(
  R.negate,
  abs,
)
const mul = R.multiply
const add = R.add
const cos = Math.cos
const sin = Math.sin
const sqrt = Math.sqrt
const atan2 = Math.atan2

function fromPolar(radius, theta) {
  return [mul(radius, cos(theta)), mul(radius, sin(theta))]
}

function toPolar(x, y) {
  return [sqrt(add(mul(x, x), mul(y, y))), atan2(y, x)]
}

function degrees(angle) {
  return (angle * Math.PI) / 180
}

//#endregion UTILS

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
  const [vx, vy] = fromPolar(4, degrees(99))
  return { x: vp.w / 2, y: vp.h / 2, r: 30, vx, vy }
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

function rectExtrema({ x, y, w, h }) {
  return { minX: x, minY: y, maxX: x + w, maxY: y + h }
}

function shrinkRectByCircle(circle, rect) {
  const radius = circle.r
  const dia = radius * 2
  const w = rect.w - dia
  const h = rect.h - dia
  invariant(w >= 0 && h >= 0)
  const x = rect.x + radius
  const y = rect.y + radius
  return R.mergeDeepLeft({ x, y, w, h }, rect)
}

function bounceCircleWithinRect(circle, rect) {
  const { minX, minY, maxX, maxY } = rectExtrema(
    shrinkRectByCircle(circle, rect),
  )
  const [x, y] = [circle.x + circle.vx, circle.y + circle.vy]

  const xParts =
    x < minX
      ? { x: minX, vx: abs(circle.vx) }
      : x > maxX
      ? { x: maxX, vx: absNeg(circle.vx) }
      : {}
  const yParts =
    y < minY
      ? { y: minY, vy: abs(circle.vy) }
      : y > maxY
      ? { y: maxY, vy: absNeg(circle.vy) }
      : {}

  return Object.assign({}, xParts, yParts)
}

function translateByVelocity(obj) {
  return R.mergeDeepLeft({ x: obj.x + obj.vx, y: obj.y + obj.vy })(obj)
}

function updateBallPaddleBricks({ vp }, { ball, pad, bricks }) {
  const ballVPRes = bounceCircleWithinRect(ball, vp)
  let res = { ball, pad, bricks }

  if (R.isEmpty(ballVPRes)) {
    // TODO
    res = R.mergeDeepLeft({ ball: translateByVelocity(res.ball) })(res)
  } else {
    res = R.mergeDeepLeft({ ball: ballVPRes })(res)
  }

  return res
}

startGame({
  init({ mouse, viewport }) {
    const vp = {
      x: 0,
      y: 0,
      w: viewport.size.width,
      h: viewport.size.height,
    }
    return {
      follower: Follower.init(mouse.at),
      follower2: Follower2.init(mouse.at),
      ball: initBall(vp),
      pad: initPaddle(vp),
      bricks: initBricks(vp),
    }
  },
  update(deps, state) {
    const { mouse, viewport } = deps
    const vp = {
      x: 0,
      y: 0,
      w: viewport.size.width,
      h: viewport.size.height,
    }
    const deps2 = { vp }
    return {
      ...state,
      follower: state.follower.update(mouse),
      follower2: Follower2.update(mouse, state.follower2),
      ...updateBallPaddleBricks(deps2, state),
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
