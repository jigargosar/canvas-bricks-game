import * as R from 'ramda'
import { Point } from './Point'
import * as P from './Point'

export class Size {
  constructor(public width: number, public height: number) {}

  get w() {
    return this.width
  }

  get h() {
    return this.height
  }

  static fromWidthHeight(width: number, height: number): Size {
    return new Size(width, height)
  }

  static fromWH = Size.fromWH
}
