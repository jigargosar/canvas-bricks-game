import * as R from 'ramda'
import { NumberTuple } from './types'
import { Vector } from './Vector'

export class Point {
  private constructor(public x: number, public y: number) {}

  static fromXY(x: number, y: number): Point {
    return new Point(x, y)
  }

  static xy = Point.fromXY

  get tuple(): NumberTuple {
    return Point.toTuple(this)
  }

  translateBy(v: Vector) {
    return Point.translateBy(v, this)
  }

  static toTuple({ x, y }: Point): NumberTuple {
    return [x, y]
  }

  static len(a: Point, b: Point): number {
    return distanceBetweenPoints(a.tuple, b.tuple)
  }

  static translateBy(v: Vector, p: Point): Point {
    return Point.xy(p.x + v.x, p.y + v.y)
  }
}

function distanceBetweenPoints(p1: NumberTuple, p2: NumberTuple): number {
  const [[x1, y1], [x2, y2]] = [p1, p2]
  const [dx, dy] = [x2 - x1, y2 - y1]
  return Math.sqrt(dx * dx + dy * dy)
}
