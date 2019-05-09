import * as R from './ramda'
import { Point } from './Point'
import * as P from './Point'
import { NumberTuple } from './types'
import { Vector } from './Vector'

export class Size {
  private constructor(public width: number, public height: number) {}
  static fromWH(width: number, height: number): Size {
    return new Size(width, height)
  }

  get tuple(): NumberTuple {
    return [this.width, this.height]
  }

  get vector(): Vector {
    return Vector.fromParts(this.width, this.height)
  }

  shrinkBy(b: Size) {
    return substractParts(this, b)
  }
}

function substractParts(a: Size, b: Size) {
  return Size.fromWH(a.width - b.width, a.height - b.height)
}
