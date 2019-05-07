import * as R from 'ramda'
import { NumberTuple } from './types'

export class Vector {
  private constructor(public x: number, public y: number) {}

  static fromParts(x: number, y: number): Vector {
    return new Vector(x, y)
  }

  get tuple(): NumberTuple {
    return Vector.toTuple(this)
  }

  scale(factor: number): Vector {
    return Vector.scale(factor, this)
  }
  static scale(factor: number, v: Vector) {
    return Vector.fromParts(v.x * factor, v.y * factor)
  }

  static toTuple({ x, y }: Vector): NumberTuple {
    return [x, y]
  }
}

export const vec = Vector.fromParts
