import * as R from 'ramda'
import { Point } from './Point'
import * as P from './Point'
import { NumberTuple } from './types'
import { Vector } from './Vector'

export class Size {
  private constructor(public width: number, public height: number) {}

  get w() {
    return this.width
  }

  get h() {
    return this.height
  }

  get tuple(): NumberTuple {
    return [this.w, this.h]
  }

  get vector(): Vector {
    return Vector.fromParts(this.w, this.h)
  }

  static fromWidthHeight(width: number, height: number): Size {
    return new Size(width, height)
  }

  static fromWH = Size.fromWidthHeight
}
