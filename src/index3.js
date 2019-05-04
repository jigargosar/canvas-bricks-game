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

const Rect = {
  fromWH(width, height) {
    return { center: [width / 2, height / 2], size: [width, height] }
  },
  cp(rect) {
    return rect.center
  },
  tl(rect) {
    return [
      rect.center[0] - rect.size[0] / 2,
      rect.center[1] - rect.size[1] / 2,
    ]
  },
  maxY(rect) {
    return rect.center[1] + rect.size[1] / 2
  },

  height(rect) {
    return rect.size[1]
  },

  width(rect) {
    return rect.size[0]
  },

  size(rect) {
    return rect.size
  },
  mapCP(cf, rect) {
    return { ...rect, center: cf(rect.center) }
  },
  mapCX(xf, rect) {
    return Rect.mapCP(([x, y]) => [xf(x), y], rect)
  },
  addCX(offset, rect) {
    return Rect.mapCX(x => x + offset, rect)
  },
  mapCY(yf, rect) {
    return Rect.mapCP(([x, y]) => [x, yf(y)], rect)
  },
  toTLXYWH(rect) {
    return [...Rect.tl(rect), ...Rect.size(rect)]
  },
  alignBottom(fromRect, rect) {
    return Rect.mapCY(
      () => Rect.maxY(fromRect) - Rect.height(rect) / 2,
      rect,
    )
  },

  alignCenter(fromRect, rect) {
    return Rect.mapCP(() => Rect.cp(fromRect), rect)
  },
}

const RenderRect = {
  clear(ctx, rect) {
    const [x, y, w, h] = Rect.toTLXYWH(rect)
    ctx.clearRect(x, y, w, h)
  },

  fillRect(ctx, fillStyle, rect) {
    const [x, y, w, h] = Rect.toTLXYWH(rect)
    ctx.fillStyle = fillStyle
    ctx.fillRect(x, y, w, h)
  },

  fillCircleMin(ctx, fillStyle, rect) {
    const [x, y] = Rect.cp(rect)
    const radius = Math.min(Rect.width(rect, Rect.height(rect))) / 2
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, degToRadians(360), false)
    ctx.fillStyle = fillStyle
    ctx.fill()
  },
}

function start() {
  const ctx = initCanvas()
  const vpRect = Rect.fromWH(ctx.canvas.width, ctx.canvas.height)
  let ballRect = Rect.fromWH(20, 20)
  ballRect = Rect.alignCenter(vpRect, ballRect)

  let paddleRect = Rect.fromWH(100, 10)
  const paddleSpeed = 10

  paddleRect = Rect.alignCenter(vpRect, paddleRect)
  paddleRect = Rect.alignBottom(vpRect, paddleRect)
  paddleRect = Rect.mapCY(y => y - Rect.height(paddleRect), paddleRect)

  function update() {}

  function render() {
    RenderRect.fillRect(ctx, 'orange', paddleRect)
    RenderRect.fillCircleMin(ctx, 'blue', ballRect)
  }

  gameLoop(() => {
    update()
    RenderRect.clear(ctx, vpRect)
    render()
  })

  window.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowLeft':
        paddleRect = Rect.addCX(-paddleSpeed, paddleRect)
        break
      case 'ArrowRight':
        paddleRect = Rect.addCX(paddleSpeed, paddleRect)
        break
    }
  })
}

setTimeout(start, 1)
