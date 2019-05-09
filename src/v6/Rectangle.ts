import * as R from 'ramda'
import { Point } from './Point'

import { Size } from './Size'
import { Vector, vec } from './Vector'
import { NumberTuple } from './types'
import { max } from 'date-fns'

export type XYWH = {
  x: number
  y: number
  w: number
  h: number
}
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

  mapSize(fn: SizeF): Rectangle {
    return mapS(fn, this)
  }

  clampOffsetIn(big: Rectangle): Vector {
    const enclosingRect = mapS(
      bigSize => bigSize.substract(this.size),
      big,
    )
    const { minX, maxX, minY, maxY } = enclosingRect.extrema
    const { x, y } = this.center
    return vec(clampOffset(minX, maxX, x), clampOffset(minY, maxY, y))
  }

  clampIn(big: Rectangle): Rectangle {
    const shrinkedRect = mapS(bigSize => bigSize.substract(this.size), big)
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
      topRight: Point.fromXY(maxX, minY),
      bottomRight: Point.fromXY(maxX, maxY),
      bottomLeft: Point.fromXY(minX, maxY),
    }
  }

  get edges() {
    const { topLeft, topRight, bottomRight, bottomLeft } = this.vertices
    return {
      top: line(topLeft, topRight),
      right: line(topRight, bottomRight),
      bottom: line(bottomRight, bottomLeft),
      left: line(bottomLeft, topLeft),
    }
  }

  get topLeftXYWH(): XYWH {
    const { minX: x, minY: y } = this.extrema
    const { width: w, height: h } = this.size
    return { x, y, w, h }
  }

  get dimension(): NumberTuple {
    return this.size.tuple
  }
}

class LineSegment {
  private constructor(public p1: Point, public p2: Point) {}

  static fromPoints(p1: Point, p2: Point): LineSegment {
    return new LineSegment(p1, p2)
  }
}

function line(p1: Point, p2: Point): LineSegment {
  return LineSegment.fromPoints(p1, p2)
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

function clampOffset(min: number, max: number, val: number): number {
  return val < min ? min - val : val > max ? max - val : 0
}
