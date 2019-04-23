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
