import * as R from './ramda'
import { NumberTuple } from './types'

export class Vector {
  private constructor(public x: number, public y: number) {}

  static fromParts(x: number, y: number): Vector {
    return new Vector(x, y)
  }

  get tuple(): NumberTuple {
    return toTuple(this)
  }

  scale(factor: number): Vector {
    return scale(factor, this)
  }
}
export const vec = Vector.fromParts

function scale(s: number, { x, y }: Vector) {
  return vec(x * s, y * s)
}

function toTuple({ x, y }: Vector): NumberTuple {
  return [x, y]
}
