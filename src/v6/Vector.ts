import * as R from 'ramda'
import { NumberTuple } from './types'

function degToRadians(degrees) {
  return (degrees * Math.PI) / 180
}

export class Vector {
  private constructor(public x: number, public y: number) {}

  static fromParts(x: number, y: number): Vector {
    return new Vector(x, y)
  }
  static fromDegMag(deg: number, mag: number): Vector {
    const angle = degToRadians(deg)
    return Vector.fromParts(Math.cos(angle) * mag, Math.sin(angle) * mag)
  }

  get tuple(): NumberTuple {
    return toTuple(this)
  }

  mapX(fn: NumberF) {
    return mapEach(fn, R.identity, this)
  }
  mapY(fn: NumberF) {
    return mapEach(R.identity, fn, this)
  }

  scale(factor: number): Vector {
    return scale(factor, this)
  }

  get isZero() {
    return this.x === 0 && this.y === 0
  }

  applySignOf(of: Vector) {
    return map2Both(applySignOf, of, this)
  }
}

export const vec = Vector.fromParts

function scale(s: number, { x, y }: Vector) {
  return vec(x * s, y * s)
}

function toTuple({ x, y }: Vector): NumberTuple {
  return [x, y]
}

type NumberF = (a: number) => number

function mapEach(xf: NumberF, yf: NumberF, { x, y }: Vector) {
  return vec(xf(x), yf(y))
}

function map2Both(fn, a, b) {
  return vec(fn(a.x, b.x), fn(a.y, b.y))
}
export const absNeg = R.compose(
  R.negate,
  Math.abs,
)
function applySignOf(of: number, to: number) {
  const fn = of < 0 ? absNeg : of > 0 ? Math.abs : R.identity
  return fn(to)
}
