import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons'
import './index.css'

const App = function App() {
  return (
    <div className="w-80 center sans-serif">
      <div className="mt3 f4 ttu tracked">HEADER</div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))

const canvas = elById('gameScreen')

canvas.className = 'ba db center'

const screenRect = { x: 0, y: 0, w: 300, h: 200 }

setCanvasSize(screenRect.w, screenRect.h, canvas)
const ctx = canvas.getContext('2d')

// DOM HELPERS
function elById(domId) {
  return document.getElementById(domId)
}

function setCanvasSize(w, h, canvas) {
  canvas.width = w
  canvas.height = h
}

const Rect = {
  create: (x, y, w, h) => ({ x, y, w, h }),
  getWidth: ({ w }) => w,
  getHeight: ({ h }) => h,
}
