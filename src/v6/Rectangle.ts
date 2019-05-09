import * as R from 'ramda'
import { Point } from './Point'

import { Size } from './Size'
import { Vector, vec } from './Vector'
import { NumberTuple } from './types'

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

  mapCenter(fn: PointF): Rectangle {
    return mapC(fn, this)
  }

  setCX(cx: number) {
    return this.mapCenter(c => c.setX(cx))
  }

  setCY(cy: number) {
    return this.mapCenter(c => c.setY(cy))
  }

  grow(b: Rectangle) {
    return mapS(s => s.add(b.size), this)
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

  edgeIntersectionsWithPointVector(
    p: Point,
    v: Vector,
  ): EdgeIntersections {
    const a = LineSegment.fromPointVector(p, v)
    return R.mapObjIndexed(b => a.intersectionPoint(b), this.edges)
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

export type EdgeIntersections = {
  top?: Point
  bottom?: Point
  left?: Point
  right?: Point
}

export class LineSegment {
  private constructor(public p1: Point, public p2: Point) {}

  static fromPoints(p1: Point, p2: Point): LineSegment {
    return new LineSegment(p1, p2)
  }

  static fromPointVector(p: Point, v: Vector) {
    return line(p, p.translateBy(v))
  }

  intersectionPoint(b: LineSegment): Point | undefined {
    const a = this
    const pointTuple = lineLineIntersectionPoint(
      a.p1.tuple,
      a.p2.tuple,
      b.p1.tuple,
      b.p2.tuple,
    )
    return whenNotNil(Point.fromTuple, pointTuple)
  }
}

function whenNotNil<A, B>(fn: (a: A) => B, a?: A): B | undefined {
  return a ? fn(a) : undefined
}

export function line(p1: Point, p2: Point): LineSegment {
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

// LINE SEGMENT INTERSECTION
/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @param {Point} p4
 * @returns {Point | null}
 * @tutorial http://www-cs.ccny.cuny.edu/~wolberg/capstone/intersection/Intersection%20point%20of%20two%20lines.html
 */
function lineLineIntersectionPoint(
  p1: NumberTuple,
  p2: NumberTuple,
  p3: NumberTuple,
  p4: NumberTuple,
): NumberTuple | undefined {
  const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = [p1, p2, p3, p4]
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

  if (denominator === 0) return undefined

  const uaNumerator = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)
  const ubNumerator = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)

  if (uaNumerator === 0 && ubNumerator === 0) return undefined

  const ua = uaNumerator / denominator
  const ub = ubNumerator / denominator

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return undefined

  return [x1 + ua * (x2 - x1), y1 + ub * (y2 - y1)]
}
