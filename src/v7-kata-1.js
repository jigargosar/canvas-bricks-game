/* eslint-disable no-console no-debugger */
import { taggedSum } from 'daggy'
import * as R from 'ramda'
import 'tachyons'
import './index.css'

const elById = id => document.getElementById(id)
const callWith = arg => fn => fn(arg)

const Canvas2D = {
  clearScreen: () => ({ ctx, vp }) => {
    const { x, y, w, h } = vp
    ctx.clearRect(x, y, w, h)
  },
  fillRect: ({ x, y, w, h, style }) => ({ ctx }) => {
    ctx.fillStyle = style
    ctx.fillRect(x, y, w, h)
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
]

const viewPad = pad => {
  const { x, y, w, h } = pad
  return Canvas2D.fillRect({ x, y, w, h, style: 'orange' })
}

const update = ({ vp, key }) => state => {
  return R.compose(
    //
    updatePad({ vp, key }),
  )(state)
}

const arrowKeyToDx = key => (key.left ? -1 : key.right ? 1 : 0)
const overPad = R.over(R.lensProp('pad'))
const overX = R.over(R.lensProp('x'))

const updatePad = ({ vp, key }) =>
  overPad(pad =>
    overX(
      R.pipe(
        R.add(arrowKeyToDx(key) * 10),
        R.clamp(vp.x)(vp.w - pad.w),
      ),
    )(pad),
  )

run(init)(view)(update)
