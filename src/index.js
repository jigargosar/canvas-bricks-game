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

// GAME HELPERS

function initGameScreen(rect) {
  const canvas = elById('gameScreen')
  canvas.className = 'ba db center'

  setCanvasSize(Rect.getWidth(rect), Rect.getHeight(rect), canvas)

  return canvas.getContext('2d')
}

// GAME

const screenRect = React.create({ x: 0, y: 0, width: 300, height: 200 })

const ctx = initGameScreen(screenRect)

// DOM HELPERS
function elById(domId) {
  return document.getElementById(domId)
}

function setCanvasSize(w, h, canvas) {
  canvas.width = w
  canvas.height = h
}
