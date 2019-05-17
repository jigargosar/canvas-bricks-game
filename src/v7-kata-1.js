/* eslint-disable no-console no-debugger */
import { taggedSum } from 'daggy'
import * as R from 'ramda'
import 'tachyons'
import './index.css'

const elById = id => document.getElementById(id)
const callWith = arg => fn => fn(arg)
const I = R.identity
const add = R.add
const clamp = R.clamp

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
})

const initBall = vp => ({
  x: vp.w / 2,
  y: (vp.h * 2) / 3,
  r: 10,
  vx: 1,
  vy: 1,
})

const initPad = vp => {
  const w = 100
  const h = 15

  return { x: (vp.w - w) / 2, y: vp.h - h * 2, w, h }
}

const view = state => [
  //
  Canvas2D.clearScreen(),
  viewPad(state.pad),
  viewBall(state.ball),
]

const viewPad = pad => {
  const { x, y, w, h } = pad
  return Canvas2D.fillRect({ x, y, w, h, fill: 'orange' })
}

const viewBall = ball => {
  const { x, y, r } = ball
  return Canvas2D.fillCircle({ x, y, r, fill: 'blue' })
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
const overY = R.over(R.lensProp('y'))

const updatePad = ({ vp, key }) =>
  overPad(pad =>
    overX(
      R.pipe(
        R.add(arrowKeyToDx(key) * 10),
        R.clamp(0)(vp.w - pad.w),
      ),
    )(pad),
  )

const overProp = R.pipe(
  R.lensProp,
  R.over,
)

const abs = Math.abs
const absNeg = R.pipe(
  abs,
  R.negate,
)

const overVx = overProp('vx')
const overVy = overProp('vy')

const clampBallInViewport = vp => ball =>
  R.pipe(
    overX(R.clamp(ball.r, vp.w - ball.r)),
    overY(R.clamp(ball.r, vp.h - ball.r)),
  )(ball)

const updateBall = vp =>
  overProp('ball')(ball => {
    const updateXY = R.pipe(
      overX(R.add(ball.vx)),
      overY(R.add(ball.vy)),
    )

    return R.pipe(
      b => overX(R.add(b.vx))(b),
      b => overY(R.add(b.vy))(b),
      b => overVx(b.x < b.r ? abs : b.x > vp.w - b.r ? absNeg : I)(b),
      b => overVy(b.y < b.r ? abs : b.y > vp.w - b.r ? absNeg : I)(b),
      clampBallInViewport(vp),
    )(ball)
  })

run(init)(view)(update)
