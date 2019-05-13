// @ts-ignore
/* eslint-disable no-console */
/* eslint-disable no-debugger */
import { taggedSum } from 'daggy'
import * as R from 'ramda'
import {
  add,
  addIndex,
  clamp,
  compose,
  curry,
  flatten,
  isEmpty,
  lensProp,
  map,
  mergeDeepLeft,
  multiply,
  negate,
  over,
  prop,
  reduce,
  times,
} from 'ramda'
import 'tachyons'
import './index.css'

//#region UTILS
function invariant(pred, msg = 'invariant failed') {
  if (!pred) {
    throw new Error(msg)
  }
}
const abs = Math.abs
const absNeg = compose(
  negate,
  abs,
)
const overIdx = curry(function overIdx_(idx, fn, arr) {
  return over(R.lensIndex(idx), fn, arr)
})

const overPath = curry(function overPath_(path, fn, arr) {
  return over(R.path(path), fn, arr)
})

const overProp = curry(function overProp_(prop, fn, obj) {
  return over(lensProp(prop))(fn)(obj)
})

const whileNothing = curry(function whileNothing_(fn, arr) {
  return reduceIndexed(
    (acc, elem, idx, arr) => acc.orElse(() => fn(elem, idx, arr)),
    Nothing,
    arr,
  )
})

const mul = multiply
// const add = add
const mapIndexed = addIndex(map)
const reduceIndexed = addIndex(reduce)
const cos = Math.cos
const sin = Math.sin
const sqrt = Math.sqrt
const atan2 = Math.atan2

const tapLog = curry(function tapLog(msg, val) {
  console.log(msg, val)
  return val
})

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

//#region Maybe
const Maybe = taggedSum('Maybe', {
  Nothing: [],
  Just: ['value'],
})

Maybe.fromEmpty = function maybeFromEmpty(val) {
  return isEmpty(val) ? Nothing : Just(val)
}

Maybe.withDefault = curry(function withDefault(defaultValue, mb) {
  return mb.withDefault(defaultValue)
})

const Just = Maybe.Just
const Nothing = Maybe.Nothing

Maybe.prototype.map = function map(f) {
  return this.cata({
    Just: () => Just(f(this.value)),
    Nothing: () => this,
  })
}

Maybe.prototype.orElse = function orElse(f) {
  return this.cata({
    Just: () => this,
    Nothing: () => {
      const r = f()
      invariant(Maybe.is(r))
      return r
    },
  })
}

Maybe.prototype.withDefault = function withDefault(defaultValue) {
  return this.cata({
    Just: () => this.value,
    Nothing: () => defaultValue,
  })
}

//#endregion

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
  return mergeDeepLeft({ x, y, w, h }, rect)
}

function growRectByCircle(circle, rect) {
  const radius = circle.r
  const dia = radius * 2
  const w = rect.w + dia
  const h = rect.h + dia

  const x = rect.x - radius
  const y = rect.y - radius
  return mergeDeepLeft({ x, y, w, h }, rect)
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

  return Maybe.fromEmpty(mergeDeepLeft(xParts, yParts))
}

function translateByVelocity(obj) {
  return mergeDeepLeft({ x: obj.x + obj.vx, y: obj.y + obj.vy })(obj)
}

function isPointInBounds({ x, y }, { minX, minY, maxX, maxY }) {
  return x >= minX && x <= maxX && y >= minY && y <= maxY
}

function bounceCircleOffRect(rect, cir_) {
  const cir = translateByVelocity(cir_)
  const extrema = rectExtrema(growRectByCircle(cir, rect))

  if (!isPointInBounds(cir, extrema)) return Nothing

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

  return isEmpty(changes) ? Nothing : Just(changes)
}

function clampRectInRect(big, small) {
  invariant(small.w < big.w && small.h < big.h)

  return {
    ...small,
    x: clamp(big.x, big.w - small.w, small.x),
    y: clamp(big.y, big.h - small.h, small.y),
  }
}

//#endregion GEOM

//#region RENDER
const fillRect = curry(function fillRect_(ctx, { x, y, w, h }) {
  return ctx.fillRect(x, y, w, h)
})

const fillCircle = curry(function fillRect_(ctx, { x, y, r }) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, degrees(360), false)
  ctx.fill()
})
//#endregion

const Key = function initKeyboard() {
  const km = {}
  window.addEventListener('keydown', e => {
    km[e.key] = true
  })
  window.addEventListener('keyup', e => {
    km[e.key] = false
  })

  return {
    get km() {
      return km
    },
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
    render({ ctx, vp }, state)
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function initBall(vp) {
  const [vx, vy] = fromPolar(7, degrees(100))
  return { x: vp.w / 2, y: vp.h / 2, r: 10, vx, vy }
}

function renderBall(ctx, ball) {
  ctx.fillStyle = 'green'
  fillCircle(ctx, ball)
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

  const bricksRows = times(
    row => times(col => initBrick(row, col), colCt),
    rowCt,
  )
  return flatten(bricksRows)

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

function renderBricks(ctx, bricks) {
  ctx.fillStyle = 'dodgerblue'
  bricks.filter(prop('alive')).forEach(fillRect(ctx))
}

const updatePaddle = curry(function updatePaddle_({ key, vp }, state) {
  const updateVel = pad => {
    const dx = 2
    return { ...pad, vx: key.left ? -dx : key.right ? dx : 0 }
  }

  const update = compose(
    small => clampRectInRect(vp, small),
    translateByVelocity,
    updateVel,
  )
  return overProp('pad')(update)(state)
})

function ballBrickCollision(bricks, ball) {
  return whileNothing((brick, idx) => {
    if (!brick.alive) return Nothing
    return bounceCircleOffRect(brick, ball).map(ball => ({
      ball,
      bricks: overIdx(idx, R.mergeDeepLeft({ alive: false }), bricks),
    }))
  }, bricks)
}

const updateBallPaddleBricks = curry(function updateBallPaddleBricks_(
  { vp },
  state,
) {
  const { ball, pad, bricks } = state

  const changes = ballBrickCollision(bricks, ball)
    .orElse(() =>
      bounceCircleWithinRect(vp, ball)
        .orElse(() => bounceCircleOffRect(pad, ball))
        .map(ball => ({ ball })),
    )
    .withDefault({ ball: translateByVelocity(ball) })

  return mergeDeepLeft(changes, state)
})
function circExtrema({ x, y, r }) {
  return { minX: x - r, maxX: x + r, minY: y - r, maxY: y + r }
}
const checkBallOutOfBottomEdge = curry(function(vp, ball) {
  const vpEx = rectExtrema(vp)
  const ballEx = circExtrema(ball)

  return ballEx.maxY >= vpEx.maxY
})

const GameState = taggedSum('GameState', { Running: [], Over: [] })
function init({ vp }) {
  return {
    ball: initBall(vp),
    pad: initPaddle(vp),
    bricks: initBricks(vp),
    gameState: GameState.Running,
  }
}

startGame({
  init,
  update(deps, state) {
    if (GameState.Running.is(state.gameState)) {
      const newBall = translateByVelocity(state.ball)
      if (checkBallOutOfBottomEdge(deps.vp, newBall)) {
        return { ...state, gameState: GameState.Over, ball: newBall }
      }
      return R.compose(
        updateBallPaddleBricks(deps),
        updatePaddle(deps),
      )(state)
    } else if (GameState.Over.is(state.gameState)) {
      if (deps.key.km[' ']) {
        return init(deps)
      }

      return state
    }
  },
  render({ vp, ctx }, { ball, pad, bricks, gameState }) {
    renderBall(ctx, ball)
    renderPaddle(ctx, pad)
    renderBricks(ctx, bricks)
    renderGameState({ ctx, vp }, gameState)
  },
})

function renderGameState({ ctx, vp }, gs) {
  if (!GameState.Over.is(gs)) return
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  fillRect(ctx, vp)
  ctx.fillStyle = 'white'
  const fz = 50
  ctx.font = `${fz}px san-serif`
  const textString = 'GAME OVER'
  const tm = ctx.measureText(textString)

  ctx.fillText(textString, vp.w / 2 - tm.width / 2, (vp.h + fz) / 2)
}
