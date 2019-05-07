import * as R from 'ramda'

export class Vector2 {
  private constructor(private _x: number, private _y: number) {}

  static fromParts(x: number, y: number): Vector2 {
    return new Vector2(x, y)
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  static xy = Point.fromXY

  get tuple(): Vec2 {
    return Point.toTuple(this)
  }

  static toTuple(a: Point): Vec2 {
    return [a.x, a.y]
  }

  static len(a: Point, b: Point): number {
    return distanceBetweenPoints(a.tuple, b.tuple)
  }
}

type Vec2 = [number, number]

function distanceBetweenPoints(p1: Vec2, p2: Vec2): number {
  const [[x1, y1], [x2, y2]] = [p1, p2]
  const [dx, dy] = [x2 - x1, y2 - y1]
  return Math.sqrt(dx * dx + dy * dy)
}
