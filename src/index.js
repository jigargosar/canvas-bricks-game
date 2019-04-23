//@flow

import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons'
import './index.css'
import type { TRectangle } from './Rectangle'
import * as Rect from './Rectangle'

const App = function App() {
  return (
    <div className="w-80 center sans-serif">
      <div className="mt3 f4 ttu tracked">HEADER</div>
    </div>
  )
}

ReactDOM.render(<App />, ((document.getElementById('app'): any): Element))

// GAME HELPERS

const Game = {
  initScreen: rect => {
    const canvas: HTMLCanvasElement = ((elById(
      'gameScreen',
    ): any): HTMLCanvasElement)
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

function fillRect(rect: TRectangle, ctx: CanvasRenderingContext2D) {
  const { x, y, width, height } = Rect.toXYWH(rect)
  ctx.fillRect(x, y, width, height)
}

// GAME

const screenRect: TRectangle = Rect.fromXYWH({
  x: 0,
  y: 0,
  width: 500,
  height: 400,
})

type Paddle = { rect: TRectangle, dx: number }

const paddle: Paddle = {
  rect: Rect.fromXYWH({
    x: 10,
    y: 10,
    width: 100,
    height: 10,
  }),
  dx: 10,
}

Rect.alignCenterX(screenRect, paddle.rect)
Rect.alignBottomWithOffset(10, screenRect, paddle.rect)

const ctx = Game.initScreen(screenRect)

Game.start(gameStep, ctx)

const keyDowns = {}

function update(ds) {
  // Rect.setX_(x => x + paddle.dx * ds, paddle.rect)
}

function render(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'orange'
  fillRect(paddle.rect, ctx)
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

function setCanvasSize(w: number, h: number, canvas: HTMLCanvasElement) {
  canvas.width = w
  canvas.height = h
}

window.addEventListener('keydown', e => {
  keyDowns[e.key] = true
  switch (e.key) {
    case 'ArrowLeft':
      Rect.updateX(x => {
        const minX = Rect.getX(screenRect)
        const newX = x - paddle.dx
        return newX < minX ? minX : newX
      }, paddle.rect)
      break
    case 'ArrowRight':
      Rect.updateX(x => x + paddle.dx, paddle.rect)

      Rect.clampXIn(screenRect, paddle.rect)
      if (Rect.getX2(paddle.rect) > Rect.getX2(screenRect)) {
        Rect.setX2(Rect.getX2(screenRect), paddle.rect)
      }
      break
  }
})

window.addEventListener('keyup', e => {
  keyDowns[e.key] = false
})
