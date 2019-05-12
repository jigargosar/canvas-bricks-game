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

//#region GEOM
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

function growRectByCircle(circle, rect) {
  const radius = circle.r
  const dia = radius * 2
  const w = rect.w + dia
  const h = rect.h + dia

  const x = rect.x - radius
  const y = rect.y - radius
  return R.mergeDeepLeft({ x, y, w, h }, rect)
}

function bounceCircleWithinRect(rect, circle) {
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

  return R.mergeDeepLeft(xParts, yParts)
}

function translateByVelocity(obj) {
  return R.mergeDeepLeft({ x: obj.x + obj.vx, y: obj.y + obj.vy })(obj)
}

function isPointInBounds({ x, y }, { minX, minY, maxX, maxY }) {
  return x >= minX && x <= maxX && y >= minY && y <= maxY
}

function bounceCircleOffRect(rect, cir_) {
  const cir = translateByVelocity(cir_)
  const extrema = rectExtrema(growRectByCircle(cir, rect))

  if (!isPointInBounds(cir, extrema)) return {}

  const { minX, minY, maxX, maxY } = extrema
  const changes =
    abs(cir.vx) > abs(cir.vy)
      ? cir_.x < cir.x
        ? { x: minX - 1, y: cir.y, vx: absNeg(cir.vx) }
        : { x: maxX + 1, y: cir.y, vx: abs(cir.vx) }
      : /* lenX < lenY else corners */
      cir_.y < cir.y
      ? { y: minY - 1, x: cir.x, vy: absNeg(cir.vy) }
      : { y: maxY + 1, x: cir.x, vy: abs(cir.vy) }

  return changes
}
function rectCenter({ x, y, w, h }) {
  return { x: x + w / 2, y: y + h / 2 }
}

function clampRectInRect(big, small) {
  invariant(small.w < big.w && small.h < big.h)

  return {
    ...small,
    x: R.clamp(big.x, big.w - small.w, small.x),
    y: R.clamp(big.y, big.h - small.h, small.y),
  }
}

//#endregion GEOM

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

function startGame({ init, update, render }) {
  const canvas = document.getElementById('gameScreen')
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, {
    width: 400,
    height: 400,
    className: 'db center ba',
  })

  const vp = { x: 0, y: 0, w: canvas.width, h: canvas.height }
  const key = Key()

  let state = init({ vp })

  const step = () => {
    state = update({ key, vp }, state)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    render(ctx, state)
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function initBall(vp) {
  const [vx, vy] = fromPolar(7, degrees(100))
  return { x: vp.w / 2, y: vp.h / 2, r: 10, vx, vy }
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
    return {
      x: leftOffset + col * (brickWidth + colGap),
      y: topOffset + row * (brickHeight + rowGap),
      w: brickWidth,
      h: brickHeight,
      alive: true,
    }
  }
}
const fillRect = R.curry(function fillRect_(ctx, { x, y, w, h }) {
  return ctx.fillRect(x, y, w, h)
})

function renderBricks(ctx, bricks) {
  ctx.fillStyle = 'dodgerblue'
  bricks.filter(R.prop('alive')).forEach(fillRect(ctx))
}

startGame({
  init({ vp }) {
    return {
      ball: initBall(vp),
      pad: initPaddle(vp),
      bricks: initBricks(vp),
    }
  },
  update(deps, state) {
    const newState = updatePaddle(deps, state)
    return updateBallPaddleBricks(deps, newState)
  },
  render(ctx, { ball, pad, bricks }) {
    renderBall(ctx, ball)
    renderPaddle(ctx, pad)
    renderBricks(ctx, bricks)
  },
})

function updatePaddle({ key, vp }, state) {
  const updateVel = pad => {
    const dx = 2
    return { ...pad, vx: key.left ? -dx : key.right ? dx : 0 }
  }

  const update = R.compose(
    small => clampRectInRect(vp, small),
    translateByVelocity,
    updateVel,
  )
  return overProp('pad')(update)(state)
}

const overProp = R.curry(function overProp_(prop, fn, obj) {
  return R.over(R.lensProp(prop))(fn)(obj)
})

function updateBallPaddleBricks({ vp }, state) {
  const { ball, pad, bricks } = state

  const ballBrickCollision = () => {
    return bricks.reduce((acc, b, idx) => {
      if (!R.isEmpty(acc) || !b.alive) return acc

      const ballChanges = bounceCircleOffRect(b, ball)
      if (R.isEmpty(ballChanges)) {
        return {}
      } else {
        return {
          ball: ballChanges,
          bricks: R.update(idx, { ...b, alive: false }, bricks),
        }
      }
    }, {})
  }

  const ballPaddleVPCollision = () => {
    const ballChangesFns = [
      () => bounceCircleWithinRect(vp, ball),
      () => bounceCircleOffRect(pad, ball),
      () => translateByVelocity(ball),
    ]

    return { ball: findFirstNonEmptyResult(ballChangesFns) }
  }

  const changes = findFirstNonEmptyResult([
    ballBrickCollision,
    ballPaddleVPCollision,
  ])

  return R.mergeDeepLeft(changes, state)

  function findFirstNonEmptyResult(fns) {
    return fns.reduce((acc, fn) => {
      if (!R.isEmpty(acc)) return acc

      return fn()
    }, {})
  }
}
