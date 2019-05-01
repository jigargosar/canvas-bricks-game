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

/**
 * @template A
 * @param {A} nullable
 * @returns {boolean}
 */
function isNil(nullable) {
  return nullable == null
}

function notNil(nullable) {
  return !isNil(nullable)
}

/**
 * @template T
 * @param { (i:number) => T } fn
 * @param { number } count
 */
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

/**
 * @template T
 * @param {T | null} obj
 * @returns T
 */
function assertNotNil(obj) {
  if (obj == null) {
    throw new Error('assertNotNil')
  }
  return obj
}

const ctx = assertNotNil(canvas.getContext('2d'))

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

const initialBallSpeed = 200

const [ballDX, ballDY] = polarToCart(degToRad(100), initialBallSpeed)

/**
 *
 * @typedef Ball
 * @type {{x:number, y:number, r:number, dx:number,dy:number}}
 */

/**
 *
 * @type {Ball}
 */
const ball = { x: VW / 2, y: VH / 2, r: 10, dx: ballDX, dy: ballDY }

const [brickW, brickH] = [50, 30]

/**
 *
 * @typedef Brick
 * @type {{x:number, y:number, w:number, h:number, alive:boolean}}
 */

/**
 * @param {number} x
 * @param {number} y
 * @returns {Brick}
 */
function createBrick(x, y) {
  return { x, y, w: brickW, h: brickH, alive: true }
}

// const brick = createBrick(0, 0)

// setXY(VCX - getCX(brick), VCY - getCY(brick), brick)

const brickVerticalSpacing = 30
const brickHorizontalSpacing = 30

/**
 * @param {number} row
 * @param {number} column
 * @returns {Brick} brick
 */
function createBrickAtRowColumn(row, column) {
  const x = column * (brickW + brickHorizontalSpacing)
  const y = row * (brickH + brickVerticalSpacing)
  return createBrick(x, y)
}

function createInitialBricks() {
  return times(
    row => times(column => createBrickAtRowColumn(row, column), 5),
    5,
  ).flatMap(x => x)
}

const bricks = createInitialBricks()

// const bricks = []

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

/**
 * @typedef Move
 * @type {{p:Point, np:Point, len:number}}
 */
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} dx
 * @param {number} dy
 * @param {number} dt
 * @returns {Move}
 */
function move(x, y, dx, dy, dt) {
  const [nx, ny] = [x + dx * dt, y + dy * dt]
  return {
    p: [x, y],
    np: [nx, ny],
    len: distanceBetweenPoints([x, y], [nx, ny]),
  }
}

/**
 * @param {number} delta
 */
function update(delta) {
  const ballMove = move(ball.x, ball.y, ball.dx, ball.dy, delta)

  // ball.x += ball.dx * delta
  // ball.y += ball.dy * delta

  if (
    !updateBallViewPortCollision(ballMove) &&
    !updateBallBrickCollision(ballMove)
  ) {
    const [nx, ny] = ballMove.np
    ball.x = nx
    ball.y = ny
  }
}

/**
 * @typedef Rect4
 * @type {[number,number,number,number]}
 */
/**
 * @typedef Side
 * @type {"top"| 'bottom'|'left'|'right'}
 *
 * @typedef RectEdge
 * @type {{side:Side, p1:Point,p2:Point}}
 *
 * @param {Rect4} rect4
 * @returns {RectEdge []}
 */
function rect4ToEdges(rect4) {
  const [x1, y1, w, h] = rect4
  const [x2, y2] = [x1 + w, y1 + h]
  return [
    { side: 'top', p1: [x1, y1], p2: [x2, y1] },
    { side: 'bottom', p1: [x1, y2], p2: [x2, y2] },
    { side: 'left', p1: [x1, y1], p2: [x1, y2] },
    { side: 'right', p1: [x2, y1], p2: [x2, y2] },
  ]
}

/**
 * @template T
 * @param {(T|null)[]} arr
 * @returns {T[]}
 */
function rejectNil(arr) {
  // @ts-ignore
  return arr.filter(notNil)
}

/**
 * @typedef LineRectIntersection
 * @type {{edge:RectEdge, point:Point, len:number}}
 *
 */
/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Rect4} rect4
 * @returns {LineRectIntersection | null}
 */
function lineRectIntersection(p1, p2, rect4) {
  const intersections = rejectNil(
    rect4ToEdges(rect4).map(edge => {
      const pIntersec = lineLineIntersectionPoint(p1, p2, edge.p1, edge.p2)

      return unlessNil(
        point => ({
          edge,
          point,
          len: distanceBetweenPoints(p1, point),
        }),
        pIntersec,
      )
    }),
  ).sort(({ len: a }, { len: b }) => b - a)

  return head(intersections)
}

/**
 * @template T
 * @param {T[]} arr
 * @returns {T?}
 */
function head(arr) {
  return arr.length > 0 ? arr[0] : null
}

/**
 * @template A,B
 * @param {(a:A) => B} fn
 * @param {A?} nullable
 * @return {B?}
 */
function unlessNil(fn, nullable) {
  return nullable == null ? null : fn(nullable)
}

/**
 * @param {number} num
 * @param {Rect4} rect4
 * @returns {Rect4}
 */
function expandRect4By(num, rect4) {
  const [x, y, w, h] = rect4
  return [x - num, y - num, w + num * 2, h + num * 2]
}

/**
 * @param {{ x: number; y: number; w: number; h: number }} rectRecord
 * @returns {Rect4}
 */
function rect4FromRecord(rectRecord) {
  const { x, y, w, h } = rectRecord
  return [x, y, w, h]
}

/**
 * @typedef BallRectIntersection
 * @type {{intersection:LineRectIntersection, brick:Brick}}
 *
 */
/**
 *
 * @param {Move} ballMove
 * @param {Brick} brick
 * @returns {BallRectIntersection?}
 *
 */
function ballIntersectionWithBrick(ballMove, brick) {
  const rect4 = expandRect4By(ball.r, rect4FromRecord(brick))

  return unlessNil(
    intersection => ({ intersection, brick }),
    lineRectIntersection(ballMove.p, ballMove.np, rect4),
  )
}

/**
 *
 * @param {Move} ballMove
 *
 */
function updateBallViewPortCollision(ballMove) {
  const [nx, ny] = ballMove.np
  if (ny > VH) {
    ball.y = VH
    ball.x = nx
    ball.dy *= -1
    return true
  } else if (ny < 0) {
    ball.y = 0
    ball.x = nx
    ball.dy *= -1
    return true
  }

  if (nx < 0) {
    ball.x = 0
    ball.y = ny
    ball.dx *= -1
    return true
  } else if (nx > VW) {
    ball.x = VW
    ball.y = ny
    ball.dx *= -1
    return true
  }
  return false
}

function updateBallBrickCollision(ballMove) {
  const brickCollisionResults = rejectNil(
    bricks
      .filter(b => b.alive)
      .map(brick => ballIntersectionWithBrick(ballMove, brick)),
  ).sort((a, b) => b.intersection.len - a.intersection.len)

  const bbIntersection = head(brickCollisionResults)
  if (!bbIntersection) return false

  const {
    brick,
    intersection: {
      point,
      edge: { side },
    },
  } = bbIntersection
  brick.alive = false

  ball.x = point[0]
  ball.y = point[1]

  switch (side) {
    case 'top':
    case 'bottom':
      ball.dy *= -1
      break

    case 'left':
    case 'right':
      ball.dx *= -1
      break
  }

  const [angle, length] = cartToPolar(ball.dx, ball.dy)
  const [newDX, newDY] = polarToCart(
    angle + degToRad(randomIn(-1, +1)),
    length,
  )
  ball.dx = newDX
  ball.dy = newDY

  return true
}
