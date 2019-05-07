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

  mapCenter(cfn: (a: Point) => Point): Rectangle {
    return new Rectangle(cfn(this.center), this.size)
  }
  get extrema() {
    const tl = this.topLeft
    const br = this.bottomRight
    return { minX: tl.x, minY: tl.y, maxX: br.x, maxY: br.y }
  }
  shrink(bySize: Size): Rectangle {
    const { w, h } = this.size
    return new Rectangle(
      this.center,
      Size.fromWH(w - bySize.w, h - bySize.h),
    )
  }

  clampIn(big: Rectangle): Rectangle {
    const { minX, maxX, minY, maxY } = big.shrink(this.size).extrema
    return this.mapCenter(c =>
      Point.xy(R.clamp(minX, maxX, c.x), R.clamp(minY, maxY, c.y)),
    )
  }

  get topLeft(): Point {
    return translateCenterByScaledSizeVector(0.5, this)
  }

  get bottomRight(): Point {
    return translateCenterByScaledSizeVector(0.5, this)
  }

  get tl(): Point {
    return this.topLeft
  }

  get dimension(): NumberTuple {
    return this.size.tuple
  }

  static fromWH = Rectangle.fromWidthHeight
}

function translateCenterByScaledSizeVector(
  factor: number,
  rect: Rectangle,
): Point {
  return rect.center.translateBy(rect.size.vector.scale(factor))
}
