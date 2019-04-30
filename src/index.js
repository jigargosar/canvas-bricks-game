// @ts-check

import 'tachyons'
import './index.css'

/**
 * @typedef Point
 * @type {[number, number]}
 */

// LINE SEGMENT INTERSECTION
/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @param {Point} p4
 * @returns {Point | null}
 * @tutorial http://www-cs.ccny.cuny.edu/~wolberg/capstone/intersection/Intersection%20point%20of%20two%20lines.html
 */
function lineLineIntersectionPoint(p1, p2, p3, p4) {
  const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = [p1, p2, p3, p4]
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

  if (denominator === 0) return null

  const uaNumerator = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)
  const ubNumerator = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)

  if (uaNumerator === 0 && ubNumerator === 0) return null

  const ua = uaNumerator / denominator
  const ub = ubNumerator / denominator

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null

  return [x1 + ua * (x2 - x1), y1 + ub * (y2 - y1)]
}

/**
 * @param {Point} p1
 * @param {Point} p2
 * @returns {number} length
 */
function distanceBetweenPoints(p1, p2) {
  const [[x1, y1], [x2, y2]] = [p1, p2]
  const [dx, dy] = [x2 - x1, y2 - y1]
  return Math.sqrt(dx * dx + dy * dy)
}

// MATH TRIG

function polarToCart(angle, magnitude) {
  return [Math.cos(angle) * magnitude, Math.sin(angle) * magnitude]
}

function cartToPolar(x, y) {
  return [Math.atan2(y, x), Math.sqrt(x * x + y * y)]
}

function degToRad(deg) {
  return (deg * Math.PI) / 180
}

// HELPERS

function isNil(nullable) {
  return nullable == null
}

function notNil(nullable) {
  return !isNil(nullable)
}

function times(fn, count) {
  return new Array(count).fill(0).map((_, i) => fn(i))
}

function randomIn(num1, num2) {
  const [min, max] = [Math.min(num1, num2), Math.max(num1, num2)]
  return Math.random() * (max - min) + min
}

// CONSTANTS

const V_SIZE = [400, 400]

const [VW, VH] = V_SIZE

const [VCX, VCY] = [VW / 2, VH / 2]

// CANVAS

/**
 * @param {string} id
 * @returns {HTMLCanvasElement}
 */
function getCanvasById(id) {
  const canvas = document.getElementById(id)
  if (canvas instanceof HTMLCanvasElement) {
    return canvas
  }
  throw new Error('Canvas Not Found')
}

const canvas = getCanvasById('gameScreen')

canvas.width = VW
canvas.height = VH

Object.assign(canvas, {
  width: VW,
  height: VH,
  className: 'db center ba',
})

const ctx = canvas.getContext('2d')

// GAME OBJECTS

function setXY(x, y, obj) {
  Object.assign(obj, { x, y })
}

function getCX(obj) {
  return obj.x + obj.w / 2
}
function getCY(obj) {
  return obj.y + obj.h / 2
}

const pad = { x: 0, y: 0, w: 100, h: 10, speed: 10 }
Object.assign(pad, { x: (VW - pad.w) / 2, y: VH - 10 - pad.h })

const initialBallSpeed = 700

const [ballDX, ballDY] = polarToCart(degToRad(100), initialBallSpeed)

const ball = { x: VW / 2, y: VH / 2, r: 10, dx: ballDX, dy: ballDY }

const [brickW, brickH] = [50, 10]

function createBrick(x, y) {
  return { x, y, w: brickW, h: brickH, alive: true }
}

// const brick = createBrick(0, 0)

// setXY(VCX - getCX(brick), VCY - getCY(brick), brick)

const brickVerticalSpacing = 30
const brickHorizontalSpacing = 30

const bricks = times(y => {
  return times(
    x =>
      createBrick(
        x * (brickW + brickHorizontalSpacing),
        y * (brickH + brickVerticalSpacing),
      ),
    5,
  )
}, 5).flatMap(x => x)

// KEYBOARD HANDLERS

window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowLeft':
      pad.x -= pad.speed
      break
    case 'ArrowRight':
      pad.x += pad.speed
      break
  }
})

// MAIN

let lastTS = window.performance.now()

function step(currentTS) {
  const delta = (currentTS - lastTS) / 1000
  lastTS = currentTS
  // UPDATE

  // TODO:
  // * Render bricks?
  // * bounce of paddle?
  // * Game over on bottom viewport side

  update(delta)

  // RENDER
  render()

  requestAnimationFrame(step)
}

step(lastTS)

// RENDER & UPDATE

function render() {
  ctx.clearRect(0, 0, VW, VH)
  ctx.fillStyle = 'orange'
  ctx.fillRect(pad.x, pad.y, pad.w, pad.h)
  ctx.beginPath()
  ctx.fillStyle = 'blue'
  ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI)
  ctx.fill()
  // RENDER BRICK
  ctx.fillStyle = 'green'
  // ctx.fillRect(brick.x, brick.y, brick.w, brick.h)
  bricks
    .filter(b => b.alive)
    .forEach(brick => {
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h)
    })
}

function move(x, y, dx, dy, dt) {
  const [nx, ny] = [x + dx * dt, y + dy * dt]
  return { x, y, nx, ny, len: distanceBetweenPoints([x, y], [nx, ny]) }
}

function update(delta) {
  const [oldBallX, oldBallY] = [ball.x, ball.y]
  const oldBallPos = [oldBallX, oldBallY]
  ball.x += ball.dx * delta
  ball.y += ball.dy * delta
  if (!updateBallViewPortCollision()) {
    updateBallBrickCollision(oldBallPos)
  }
}

/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {[number, number, number, number]} rect4
 */
function lineRectIntersection(p1, p2, rect4) {
  const [rx, ry, rw, rh] = rect4
  const [rt3, rt4] = [
    /** @type [number,number]  */ ([rx, ry]),
    /** @type [number,number]  */ ([rx + rw, ry]),
  ]
  const [rb3, rb4] = [
    /** @type [number,number]  */ ([rx, ry + rh]),
    /** @type [number,number]  */ ([rx + rw, ry + rh]),
  ]

  const intersectionPoints = [
    lineLineIntersectionPoint(p1, p2, rt3, rt4),
    lineLineIntersectionPoint(p1, p2, rb3, rb4),
  ].filter(point => point !== null)

  const sortedPoints = intersectionPoints
    .map(point => {
      return { point, len: distanceBetweenPoints(p1, point) }
    })
    .sort(({ len: a }, { len: b }) => b - a)

  return sortedPoints.length > 0 ? sortedPoints[0] : null
}

function ballIntersectionPointWithBrick(oldBallPos, brick) {
  const [p1, p2] = [oldBallPos, [ball.x, ball.y]]

  const a = 1

  const intersection = lineRectIntersection(
    p1,
    /** @type [number,number]  */(p2),
    [brick.x, brick.y, brick.w, brick.h],
  )
  return intersection ? { intersection, brick } : null
}

function updateBallViewPortCollision() {
  if (ball.y > VH) {
    ball.y = VH
    ball.dy *= -1
    return true
  } else if (ball.y < 0) {
    ball.y = 0
    ball.dy *= -1
    return true
  }
  if (ball.x < 0) {
    ball.x = 0
    ball.dx *= -1
    return true
  } else if (ball.x > VW) {
    ball.x = VW
    ball.dx *= -1
    return true
  }
  return false
}

function updateBallBrickCollision(oldBallPos) {
  const [oldBallX, oldBallY] = oldBallPos
  const brickCollisionResults = bricks
    .filter(b => b.alive)
    .map(brick => ballIntersectionPointWithBrick(oldBallPos, brick))
    .filter(notNil)
    .sort((a, b) => b.intersection.len - a.intersection.len)

  if (brickCollisionResults.length > 0) {
    const { brick, ip } = brickCollisionResults[0]

    brick.alive = false
    ball.dy *= -1
    const [angle, length] = cartToPolar(ball.dx, ball.dy)
    const [newDX, newDY] = polarToCart(
      angle + degToRad(randomIn(-1, +1)),
      length,
    )
    ball.dx = newDX
    ball.dy = newDY
    if (oldBallY <= brick.y) {
      ball.y = brick.y
    } else {
      ball.y = brick.y + brick.h
    }
  }
}
