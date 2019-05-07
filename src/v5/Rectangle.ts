import * as R from 'ramda'
import { Point } from './Point'

import { Size } from './Size'
import { Vector } from './Vector'
import { NumberTuple } from './types'

export class Rectangle {
  private constructor(public center: Point, public size: Size) {}

  static fromCS(c: Point, s: Size): Rectangle {
    return new Rectangle(c, s)
  }

  static fromWH(width: number, height: number): Rectangle {
    return Rectangle.fromCS(
      Point.fromXY(width / 2, height / 2),
      Size.fromWH(width, height),
    )
  }

  get extrema() {
    const tl = this.topLeft
    const br = this.bottomRight
    return { minX: tl.x, minY: tl.y, maxX: br.x, maxY: br.y }
  }

  shrink(b: Size): Rectangle {
    return mapS(
      a => Size.fromWH(a.width - b.width, a.height - b.height),
      this,
    )
  }

  clampIn(big: Rectangle): Rectangle {
    const { minX, maxX, minY, maxY } = big.shrink(this.size).extrema
    const fn = (c: Point) =>
      Point.fromXY(R.clamp(minX, maxX, c.x), R.clamp(minY, maxY, c.y))
    return mapC(fn, this)
  }

  translateBy(v: Vector) {
    return mapC(c => c.translateBy(v), this)
  }

  get topLeft(): Point {
    return translateCenterByScaledSizeVector(-0.5, this)
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
}

function translateCenterByScaledSizeVector(
  factor: number,
  rect: Rectangle,
): Point {
  return rect.center.translateBy(rect.size.vector.scale(factor))
}

type PointF = (a: Point) => Point
type SizeF = (a: Size) => Size

const rec = Rectangle.fromCS

function mapC(fn: PointF, r: Rectangle): Rectangle {
  return rec(fn(r.center), r.size)
}

function mapS(fn: SizeF, r: Rectangle): Rectangle {
  return rec(r.center, fn(r.size))
}
