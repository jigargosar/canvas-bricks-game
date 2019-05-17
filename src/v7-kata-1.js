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
}

run()
