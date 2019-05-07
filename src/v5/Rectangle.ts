import * as R from 'ramda'
import { Point } from './Point'

import { Size } from './Size'

export class Rectangle {
  private constructor(private center: Point, private size: Size) {}

  static fromWidthHeight(width: number, height: number): Rectangle {
    return new Rectangle(
      Point.fromXY(width / 2, height / 2),
      Size.fromWidthHeight(width, height),
    )
  }

  static fromWH = Rectangle.fromWidthHeight
}
