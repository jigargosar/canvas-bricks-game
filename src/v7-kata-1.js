/* eslint-disable no-console no-debugger */
import * as R from 'ramda'
import 'tachyons'
import './index.css'

const elById = id => document.getElementById(id)
const callWith = arg => fn => fn(arg)
const I = R.identity
const add = R.add
const clamp = R.clamp
const abs = Math.abs
const absNeg = x => Math.abs(x) * -1
const mul = R.multiply
const cos = Math.cos
const sin = Math.sin

function fromPolar(radius, theta) {
  return [mul(radius, cos(theta)), mul(radius, sin(theta))]
}

function degrees(angle) {
  return (angle * Math.PI) / 180
}

const Canvas2D = {
  clearScreen: () => ({ ctx, vp }) => {
    const { x, y, w, h } = vp
    ctx.clearRect(x, y, w, h)
  },
  fillRect: ({ x, y, w, h, fill }) => ({ ctx }) => {
    ctx.fillStyle = fill
    ctx.fillRect(x, y, w, h)
  },
  fillCircle: ({ x, y, r, fill }) => ({ ctx }) => {
    ctx.beginPath()
    ctx.fillStyle = fill
    ctx.arc(x, y, r, 0, 2 * Math.PI, false)
    ctx.fill()
  },
  run: ({ vp, ctx }) => viewCmds =>
    R.compose(
      R.forEach(callWith({ vp, ctx })),
      R.flatten,
    )(viewCmds),
}

function initCanvas(width, height) {
  const canvas = elById('gameScreen')
  canvas.width = width
  canvas.height = height
  canvas.className = 'db center ba bw1 b--green'
  const ctx = canvas.getContext('2d')
  return ctx
}

const initKeyboard = () => {
  const keyDownDict = {}
  window.addEventListener('keydown', e => (keyDownDict[e.key] = true))
  window.addEventListener('keyup', e => (keyDownDict[e.key] = false))
  return {
    get left() {
      return keyDownDict['ArrowLeft']
    },
    get right() {
      return keyDownDict['ArrowRight']
    },
  }
}

const run = initFn => viewFn => updateFn => {
  const vp = { x: 0, y: 0, w: 400, h: 400 }

  const ctx = initCanvas(vp.w, vp.h)
  const key = initKeyboard()

  const initialState = initFn(vp)

  const onFrame = state => () => {
    const viewCmds = viewFn(state)
    Canvas2D.run({ ctx, vp })(viewCmds)
    const nextState = updateFn({ vp, key })(state)
    requestAnimationFrame(onFrame(nextState))
  }

  requestAnimationFrame(onFrame(initialState))
}

const init = vp => ({
  pad: initPad(vp),
  ball: initBall(vp),
  bricks: initBricks(vp),
})

const initBall = vp => {
  const [vx, vy] = fromPolar(7, degrees(120))
  return {
    x: vp.w / 2,
    y: (vp.h * 2) / 3,
    r: 10,
    vx,
    vy,
  }
}

const initPad = vp => {
  const w = 100
  const h = 15

  return { x: (vp.w - w) / 2, y: vp.h - h * 5, w, h }
}

const initBricks = vp => {
  const rows = 5
  const cols = 5
  const w = 50
  const h = 15
  const xGap = 30
  const yGap = 20

  const xOffset = (vp.w - cols * (w + xGap) + xGap) / 2
  const yOffset = 20

  const createBrickAt = (x, y) => ({
    x: x * (w + xGap) + xOffset,
    y: y * (h + yGap) + yOffset,
    w,
    h,
    alive: true,
  })

  const grid = R.times(y => R.times(x => createBrickAt(x, y))(rows))(cols)
  return R.flatten(grid)
}

const view = state => [
  //
  Canvas2D.clearScreen(),
  viewPad(state.pad),
  viewBall(state.ball),
  viewBricks(state.bricks),
]

const viewPad = pad => {
  const { x, y, w, h } = pad
  return Canvas2D.fillRect({ x, y, w, h, fill: 'orange' })
}

const viewBall = ball => {
  const { x, y, r } = ball
  return Canvas2D.fillCircle({ x, y, r, fill: 'blue' })
}

const viewBricks = bricks => {
  const viewBrick = brick => {
    const { x, y, w, h } = brick
    return Canvas2D.fillRect({ x, y, w, h, fill: 'green' })
  }

  return bricks.filter(R.prop('alive')).map(viewBrick)
}

const update = ({ vp, key }) => state => {
  return R.pipe(
    //
    updatePad({ vp, key }),
    updateBall(vp),
  )(state)
}

const arrowKeyToDx = key => (key.left ? -1 : key.right ? 1 : 0)
const overPad = R.over(R.lensProp('pad'))
const overX = R.over(R.lensProp('x'))

const updatePad = ({ vp, key }) =>
  overPad(pad =>
    overX(
      R.pipe(
        add(arrowKeyToDx(key) * 10),
        clamp(0)(vp.w - pad.w),
      ),
    )(pad),
  )

const updateBall = vp => state => {
  const ball = state.ball
  const newBall = { ...ball, x: ball.x + ball.vx, y: ball.y + ball.vy }

  if (ballViewportHitTest(vp)(newBall)) {
    const solvedBall = resolveBallViewportCollision(vp)(newBall)
    return { ...state, ball: solvedBall }
  } else if (circleRectHitTest(state.pad)(newBall)) {
    const solvedBall = resolveCircleRectCollision(state.pad)(newBall)
    return { ...state, ball: solvedBall }
  } else if (ballBricksHitTest(state.bricks)(newBall)) {
    const result = resolveBallBricksCollision(state.bricks)(newBall)
    const { ball, bricks } = result
    return { ...state, ball, bricks }
  } else {
    return { ...state, ball: newBall }
  }
}

const ballViewportHitTest = vp => ball => {
  const minX = vp.x + ball.r
  const maxX = vp.x + vp.w - ball.r
  const minY = vp.y + ball.r
  const maxY = vp.y + vp.h - ball.r
  return ball.x < minX || ball.x > maxX || ball.y < minY || ball.y > maxY
}

const resolveBallViewportCollision = vp => ball => {
  const minX = vp.x + ball.r
  const maxX = vp.x + vp.w - ball.r

  const newXParts = (() => {
    if (ball.x < minX) {
      return { x: minX, vx: abs(ball.vx) }
    } else if (ball.x > maxX) {
      return { x: maxX, vx: absNeg(ball.vx) }
    } else {
      return {}
    }
  })()

  const minY = vp.y + ball.r
  const maxY = vp.y + vp.h - ball.r

  const newYParts = (() => {
    if (ball.y < minY) {
      return { y: minY, vy: abs(ball.vy) }
    } else if (ball.y > maxY) {
      return { y: maxY, vy: absNeg(ball.vy) }
    } else {
      return {}
    }
  })()

  return { ...ball, ...newXParts, ...newYParts }
}

const expandRectByCirExtrema = cir => rect => {
  return {
    minX: rect.x - cir.r,
    maxX: rect.x + rect.w + cir.r,
    minY: rect.y - cir.r,
    maxY: rect.y + rect.h + cir.r,
  }
}

const circleRectHitTest = rect => circle => {
  const extrema = expandRectByCirExtrema(circle)(rect)
  const { minX, maxX, minY, maxY } = extrema

  const { x, y } = circle
  return x >= minX && x <= maxX && y >= minY && y <= maxY
}

const resolveCircleRectCollision = pad => ball => {
  const extrema = expandRectByCirExtrema(ball)(pad)
  const { minX, maxX, minY, maxY } = extrema

  const { vx, vy } = ball

  const changes =
    abs(vx) > abs(vy)
      ? vx >= 0
        ? { x: minX - 1, vx: absNeg(vx) }
        : { x: maxX + 1, vx: abs(vx) }
      : vy >= 0
      ? { y: minY - 1, vy: absNeg(vy) }
      : { y: maxY + 1, vy: abs(vy) }

  return { ...ball, ...changes }
}

const isBallCollidingWithAliveBrick = brick => ball =>
  brick.alive && circleRectHitTest(brick)(ball)

const ballBricksHitTest = bricks => ball => {
  return R.any(brick => isBallCollidingWithAliveBrick(brick)(ball))(bricks)
}

const resolveBallBricksCollision = bricks => ball => {
  const idx = R.findIndex(brick =>
    isBallCollidingWithAliveBrick(brick)(ball),
  )(bricks)

  const brick = bricks[idx]

  const newBrick = { ...brick, alive: false }

  const newBall = resolveCircleRectCollision(brick)(ball)

  return { ball: newBall, bricks: R.update(idx)(newBrick)(bricks) }
}

run(init)(view)(update)
