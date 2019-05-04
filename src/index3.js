import 'tachyons'
import './index.css'

function degToRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function invariant(pred, msg = 'invariant failed') {
  if (!pred) {
    throw new Error(msg)
  }
}

function Vector(x, y) {
  return {
    get x() {
      return x
    },
    get y() {
      return y
    },
    get angle() {
      return Math.atan2(y, x)
    },
    get mag() {
      return Math.sqrt(x * x + y * y)
    },
    add(vec2) {
      return Vector(x + vec2.x, y + vec2.y)
    },
  }
}

Vector.fromAngleMag = function(angle, mag) {
  return Vector(Math.cos(angle) * mag, Math.sin(angle) * mag)
}

Vector.fromDegreesMag = function(degrees, mag) {
  return Vector.fromAngleMag(degToRadians(degrees), mag)
}

function clamp(min, max, num) {
  invariant(min < max, 'min should be less than max')
  if (num < min) {
    return min
  } else if (num > max) {
    return max
  } else {
    return num
  }
}

function initCanvas() {
  const canvas = document.getElementById('gameScreen')
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, {
    width: 400,
    height: 400,
    className: 'db center ba',
  })
  return ctx
}

function gameLoop(step) {
  const callback = () => {
    step()
    requestAnimationFrame(callback)
  }
  requestAnimationFrame(callback)
}

function start() {
  const ctx = initCanvas()

  function update() {}

  function render() {}

  gameLoop(() => {
    update()
    render()
  })
}

setTimeout(start, 0)
