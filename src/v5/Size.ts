import * as R from 'ramda'
import { Point } from './Point'
import * as P from './Point'

export class Size {
  constructor(private width: number, private height: number) {}

  static fromWidthHeight(width: number, height: number): Size {
    return new Size(width, height)
  }

  static fromWH = Size.fromWH
}
