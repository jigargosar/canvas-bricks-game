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
  } else if (ballPaddleHitTest(state.pad)(newBall)) {
    return { ...state }
  } else {
    return { ...state, ball: newBall }
  }
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

const ballViewportHitTest = vp => ball => {
  const minX = vp.x + ball.r
  const maxX = vp.x + vp.w - ball.r
  const minY = vp.y + ball.r
  const maxY = vp.y + vp.h - ball.r
  return ball.x < minX || ball.x > maxX || ball.y < minY || ball.y > maxY
}

const ballPaddleHitTest = paddle => ball => {
  return false
}

run(init)(view)(update)
