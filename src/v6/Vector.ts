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

  scale(factor: number): Vector {
    return scale(factor, this)
  }

  get isZero() {
    return this.x === 0 && this.y === 0
  }
}
export const vec = Vector.fromParts

function scale(s: number, { x, y }: Vector) {
  return vec(x * s, y * s)
}

function toTuple({ x, y }: Vector): NumberTuple {
  return [x, y]
}
