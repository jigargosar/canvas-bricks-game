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
    const translateBySize = (scale: number) =>
      this.center.translateBy(this.size.vector.scale(scale))

    const { x: minX, y: minY } = translateBySize(-0.5)
    const { x: maxX, y: maxY } = translateBySize(0.5)
    return { minX, minY, maxX, maxY }
  }

  clampIn(big: Rectangle): Rectangle {
    const shrinkedRect = mapS(bigSize => bigSize.shrinkBy(this.size), big)
    const { minX, maxX, minY, maxY } = shrinkedRect.extrema
    const fn = (c: Point) =>
      Point.fromXY(R.clamp(minX, maxX, c.x), R.clamp(minY, maxY, c.y))
    return mapC(fn, this)
  }

  translateBy(v: Vector) {
    return mapC(c => c.translateBy(v), this)
  }

  get vertices() {
    const { minX, minY, maxX, maxY } = this.extrema
    return {
      topLeft: Point.fromXY(minX, minY),
      bottomRight: Point.fromXY(maxX, maxY),
    }
  }

  get topLeft(): Point {
    return this.vertices.topLeft
  }

  get bottomRight(): Point {
    return this.vertices.bottomRight
  }

  get dimension(): NumberTuple {
    return this.size.tuple
  }
}

function translateCenterByScaledSizeVector(
  factor: number,
  r: Rectangle,
): Point {
  return r.center.translateBy(r.size.vector.scale(factor))
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
