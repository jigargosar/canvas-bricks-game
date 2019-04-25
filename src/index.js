import 'tachyons'
import './index.css'

// CONSTANTS

const V_SIZE = [500, 500]

const [VW, VH] = V_SIZE

const canvas = document.getElementById('gameScreen')
canvas.width = VW
canvas.height = VH

const ctx = canvas.getContext('2d')

ctx.fillStyle = 'orange'
ctx.fillRect(0, 0, 100, 10)
