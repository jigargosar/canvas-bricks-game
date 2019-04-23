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
canvas.width = 600
canvas.height = 400
canvas.className = 'ba '
const ctx = canvas.getContext('2d')

// DOM HELPERS
function elById(domId) {
  return document.getElementById(domId)
}
