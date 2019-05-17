/* eslint-disable no-console no-debugger */
import { taggedSum } from 'daggy'
import * as R from 'ramda'
import 'tachyons'
import './index.css'

const elById = id => document.getElementById(id)

const run = () => {
  const vpWidth = 400
  const vpHeight = 400
  const vp = { x: 0, y: 0, w: vpWidth, h: vpHeight }

  const ctx = initCanvas(vpWidth, vpHeight)

  const state = {
    pad: initPad(vp),
  }

  render(ctx)(state)
}

const render = ctx => state => {
  const { x, y, w, h } = state.pad
  ctx.fillStyle = 'orange'
  ctx.fillRect(x, y, w, h)
}

run()
function initCanvas(vpWidth, vpHeight) {
  const canvas = elById('gameScreen')
  canvas.width = vpWidth
  canvas.height = vpHeight
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
