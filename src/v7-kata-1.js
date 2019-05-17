/* eslint-disable no-console no-debugger */
import { taggedSum } from 'daggy'
import * as R from 'ramda'
import 'tachyons'
import './index.css'

const elById = id => document.getElementById(id)

const run = () => {
  const canvas = elById('gameScreen')
  canvas.width = 400
  canvas.height = 400
  canvas.className = 'db center ba bw1 b--green'

  const ctx = canvas.getContext('2d')

  const state = {
    pad: { x: 0, y: 0, w: 100, h: 15 },
  }

  render(ctx)(state)
}

const render = ctx => state => {
  const { x, y, w, h } = state.pad
  ctx.fillStyle = 'orange'
  ctx.fillRect(x, y, w, h)
}

run()
