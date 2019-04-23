//@flow

import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons'
import './index.css'
import type { Rectangle } from './Rectangle'
import * as Rect from './Rectangle'

const App = function App() {
  return (
    <div className="w-80 center sans-serif">
      <div className="mt3 f4 ttu tracked">HEADER</div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))

// GAME HELPERS

const Game = {
  initScreen: rect => {
    const canvas = elById('gameScreen')
    canvas.className = 'ba db center'

    setCanvasSize(Rect.getWidth(rect), Rect.getHeight(rect), canvas)

    return canvas.getContext('2d')
  },
  start: (stepFn, ctx) => {
    let lastTs = 0
    const loopWrapper = ts => {
      stepFn(ts - lastTs, ctx)
      lastTs = ts
      requestAnimationFrame(loopWrapper)
    }

    requestAnimationFrame(loopWrapper)
  },
  clear: ctx => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  },
}

function fillRect(rect, ctx) {
  const { x, y, width, height } = rect
  ctx.fillRect(x, y, width, height)
}

// GAME

const screenRect: Rectangle = Rect.fromXYWH({
  x: 0,
  y: 0,
  width: 500,
  height: 400,
})

type Paddle = { rect: Rectangle, dx: string }

const paddle: Paddle = {
  rect: Rect.fromXYWH({
    x: 10,
    y: 10,
    width: 100,
    height: 10,
  }),
  dx: 10,
}

const paddleRect = paddle.rect

Rect.alignCenterX(screenRect, paddleRect)
Rect.alignBottomWithOffset(10, screenRect, paddleRect)

const ctx = Game.initScreen(screenRect)

Game.start(gameStep, ctx)

function update(ds) {
  paddleRect.x += paddle.dx * ds
}

function render(ctx) {
  ctx.fillStyle = 'orange'
  fillRect(paddleRect, ctx)
}

function gameStep(delta, ctx) {
  const ds = delta / 1000
  Game.clear(ctx)

  update(ds)
  render(ctx)
}

// DOM HELPERS
function elById(domId) {
  return document.getElementById(domId)
}

function setCanvasSize(w, h, canvas) {
  canvas.width = w
  canvas.height = h
}
