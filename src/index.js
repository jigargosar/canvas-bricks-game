import 'tachyons'
import './index.css'

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

function randomIn(num1, num2) {
  const [min, max] = [Math.min(num1, num2), Math.max(num1, num2)]
  return Math.random() * (max - min) + min
}

// CONSTANTS

const V_SIZE = [400, 400]

const [VW, VH] = V_SIZE

const [VCX, VCY] = [VW / 2, VH / 2]

// CANVAS
const canvas = document.getElementById('gameScreen')
canvas.width = VW
canvas.height = VH

Object.assign(canvas, {
  width: VW,
  height: VH,
  className: 'db center ba',
})

const ctx = canvas.getContext('2d')

// GAME OBJECTS

const pad = { x: 0, y: 0, w: 100, h: 10, speed: 10 }
Object.assign(pad, { x: (VW - pad.w) / 2, y: VH - 10 - pad.h })

const [ballDX, ballDY] = polarToCart(degToRad(100), 1000)

const ball = { x: VW / 2, y: VH / 2, r: 10, dx: ballDX, dy: ballDY }

const [brickW, brickH] = [50, 10]

function createBrick(x, y) {
  return { x, y, w: brickW, h: brickH }
}

const brick = createBrick(0, 0)
brick.x = VCX - brick.w / 2
brick.y = VCY - brick.h / 2

function times(fn, count) {
  return new Array(count).fill(0).map((v, i) => {
    return fn(i)
  })
}

const bricks = times(y => {
  return times(x => createBrick(x * (brickW + 10), y * (brickH + 10)), 5)
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

  // BOUNCE BALL OFF VIEWPORT

  const [oldBallX, oldBallY] = [ball.x, ball.y]

  ball.x += ball.dx * delta
  ball.y += ball.dy * delta

  if (ball.y > VH) {
    ball.y = VH
    ball.dy *= -1
  }

  if (ball.y < 0) {
    ball.y = 0
    ball.dy *= -1
  }

  if (ball.x < 0) {
    ball.x = 0
    ball.dx *= -1
  }
  if (ball.x > VW) {
    ball.x = VW
    ball.dx *= -1
  }

  // BOUNCE BALL OFF BRICK

  if (
    ball.x >= brick.x &&
    ball.x < brick.x + brick.w &&
    ball.y >= brick.y &&
    ball.y < brick.y + brick.h
  ) {
    // ball.y = brick.y + brick.h
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

  // RENDER
  ctx.clearRect(0, 0, VW, VH)

  ctx.fillStyle = 'orange'
  ctx.fillRect(pad.x, pad.y, pad.w, pad.h)

  ctx.beginPath()
  ctx.fillStyle = 'blue'
  ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI)
  ctx.fill()

  // RENDER BRICK

  ctx.fillStyle = 'green'
  ctx.fillRect(brick.x, brick.y, brick.w, brick.h)

  bricks.forEach(brick => {
    ctx.fillRect(brick.x, brick.y, brick.w, brick.h)
  })

  requestAnimationFrame(step)
}

step(lastTS)
