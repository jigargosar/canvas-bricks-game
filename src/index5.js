import 'tachyons'
import './index.css'
import * as R from 'ramda'

import { Elm } from './Main.elm'

Elm.Main.init({
  node: document.getElementById('root'),
  flags: { now: Date.now() },
})
