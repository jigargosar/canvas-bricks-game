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

const rectCenter = rect => ({
  x: rect.x + rect.w / 2,
  y: rect.y + rect.h / 2,
})

const init = vp => ({
  ball: initBall(vp),
})

const initBall = vp => {
  const { x, y } = rectCenter(vp)
  const [vx, vy] = fromPolar(3, degrees(99))
  return { x, y, r: 10, vx, vy }
}
const view = state => [
  //
  Canvas2D.clearScreen(),
  Canvas2D.fillCircle({ ...state.ball, fill: 'blue' }),
]

const update = ({ vp, key }) => state => {
  return R.pipe(
    //
    I,
    updateBall(vp),
  )(state)
}
const move = ro => {
  const { x, y, vx, vy } = ro
  return { ...ro, x: x + vx, y: y + vy }
}

const expandRectByCirExtrema = rect => cir => {
  return {
    minX: rect.x - cir.r,
    maxX: rect.x + rect.w + cir.r,
    minY: rect.y - cir.r,
    maxY: rect.y + rect.h + cir.r,
  }
}

const shrinkRectByCirExtrema = rect => cir => {
  return {
    minX: rect.x + cir.r,
    maxX: rect.x + rect.w - cir.r,
    minY: rect.y + cir.r,
    maxY: rect.y + rect.h - cir.r,
  }
}

const rectContainsCircle = rect => cir => {
  const { minX, maxX, minY, maxY } = shrinkRectByCirExtrema(rect)(cir)
  const { x, y } = cir

  return x === R.clamp(minX)(maxX)(x) && y === R.clamp(minY)(maxY)(x)
}

const bounceCircleInRect = cir => rect => {
  const { minX, maxX, minY, maxY } = shrinkRectByCirExtrema(rect)(cir)
  const { x, y, vx, vy } = cir

  const xparts =
    x < minX
      ? { x: minX, vx: abs(vx) }
      : x > maxX
      ? { x: maxX, vx: absNeg(vx) }
      : {}

  const yparts =
    y < minY
      ? { y: minY, vy: abs(vy) }
      : y > maxY
      ? { y: maxY, vy: absNeg(vy) }
      : {}

  return { ...cir, ...xparts, ...yparts }
}

const updateBall = vp => state => {
  const newBall = move(state.ball)
  if (!rectContainsCircle(vp)(newBall)) {
    return { ...state, ball: bounceCircleInRect(newBall)(vp) }
  }
  return { ...state, ball: newBall }
}

const arrowKeyToDx = key => (key.left ? -1 : key.right ? 1 : 0)

run(init)(view)(update)
