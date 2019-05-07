import * as R from 'ramda'
import { Point } from './Point'

import { Size } from './Size'
import { Vector } from './Vector'
import { NumberTuple } from './types'

export class Rectangle {
  private constructor(public center: Point, public size: Size) {}

  static fromWidthHeight(width: number, height: number): Rectangle {
    return new Rectangle(
      Point.fromXY(width / 2, height / 2),
      Size.fromWidthHeight(width, height),
    )
  }

  static fromCenterWH(
    center: Point,
    width: number,
    height: number,
  ): Rectangle {
    return new Rectangle(center, Size.fromWidthHeight(width, height))
  }

  get topLeft(): Point {
    const {
      center,
      size: { width, height },
    } = this
    const halfDiagVector = Vector.fromParts(width / 2, height / 2)
    return center.translateBy(halfDiagVector.scale(-1))
  }

  get tl(): Point {
    return this.topLeft
  }

  get dimension(): NumberTuple {
    return this.size.tuple
  }

  static fromWH = Rectangle.fromWidthHeight
}
