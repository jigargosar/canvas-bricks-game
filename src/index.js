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

ctx.fillStyle = 'orange'
ctx.fillRect((VW - pad.w) / 2, VH - 10 - pad.h, 100, 10)

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
