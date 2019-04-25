import 'tachyons'
import './index.css'

// CONSTANTS

const V_SIZE = [400, 400]

const [VW, VH] = V_SIZE

const canvas = document.getElementById('gameScreen')
canvas.width = VW
canvas.height = VH

Object.assign(canvas, {
  width: VW,
  height: VH,
  className: 'db center ba',
})

const ctx = canvas.getContext('2d')

const pad = { x: 0, y: 0, w: 100, h: 10, speed: 10 }
Object.assign(pad, { x: (VW - pad.w) / 2, y: VH - 10 - pad.h })

const ball = { x: VW / 2, y: VH / 2, r: 10 }

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

function step() {
  ctx.clearRect(0, 0, VW, VH)
  ctx.fillStyle = 'orange'
  ctx.fillRect(pad.x, pad.y, pad.w, pad.h)

  ctx.beginPath()
  ctx.fillStyle = 'blue'
  ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI)
  ctx.fill()
  ctx.endPath()

  requestAnimationFrame(step)
}

step()
