import * as R from 'ramda'
import { Point } from './Point'

import { Size } from './Size'

export class Rectangle {
  private constructor(private center: Point, private size: Size) {}

  get x1() {
    const {
      center: { x, y },
      size: { w, h },
    } = this
    return x - w / 2
  }

  get y1() {
    const {
      center: { x, y },
      size: { w, h },
    } = this
    return y - h / 2
  }

  get x2() {
    const {
      center: { x, y },
      size: { w, h },
    } = this
    return x + w / 2
  }

  get y2() {
    const {
      center: { x, y },
      size: { w, h },
    } = this
    return y + h / 2
  }

  static fromWidthHeight(width: number, height: number): Rectangle {
    return new Rectangle(
      Point.fromXY(width / 2, height / 2),
      Size.fromWidthHeight(width, height),
    )
  }

  static fromWH = Rectangle.fromWidthHeight
}
