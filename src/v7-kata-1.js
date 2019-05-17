/* eslint-disable no-console no-debugger */
import { taggedSum } from 'daggy'
import * as R from 'ramda'
import 'tachyons'
import './index.css'

const elById = id => document.getElementById(id)

const Canvas2D = {
  clearScreen: () => ({ ctx, vp }) => {
    const { x, y, w, h } = vp
    ctx.clearRect(x, y, w, h)
  },
  fillRect: ({ x, y, w, h, style }) => ({ ctx }) => {
    ctx.fillStyle = style
    ctx.fillRect(x, y, w, h)
  },
}

function initCanvas(width, height) {
  const canvas = elById('gameScreen')
  canvas.width = width
  canvas.height = height
  canvas.className = 'db center ba bw1 b--green'
  const ctx = canvas.getContext('2d')
  return ctx
}

function initPad(vp) {
  const padWidth = 100
  const padHeight = 15
  const initialPad = {
    x: (vp.w - padWidth) / 2,
    y: vp.h - padHeight * 2,
    w: padWidth,
    h: padHeight,
  }
  return initialPad
}

const runDrawCanvas = ({ ctx, vp }) => viewCmds => {
  const callWith = arg => fn => fn(arg)
  R.flatten(viewCmds).forEach(callWith({ ctx, vp }))
}

const run = initFn => viewFn => {
  const vp = { x: 0, y: 0, w: 400, h: 400 }

  const ctx = initCanvas(vp.w, vp.h)

  const state = initFn(vp)

  const viewCmds = viewFn(state)
  runDrawCanvas({ ctx, vp })(viewCmds)
}

const init = vp => {
  return {
    pad: initPad(vp),
  }
}
const view = state => {
  return [Canvas2D.clearScreen(), renderPad(state.pad)]
}

const renderPad = pad => {
  const { x, y, w, h } = pad
  return Canvas2D.fillRect({ x, y, w, h, style: 'orange' })
}

run(init)(view)
