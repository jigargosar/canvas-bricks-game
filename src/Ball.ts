import * as R from 'ramda'

import { Rectangle } from './v6/Rectangle'
import { Point } from './v6/Point'
import { Vector, vec } from './v6/Vector'
import { Size } from './v6/Size'

export class Ball {
  static readonly radius = 10

  static readonly size = Size.fromWH(Ball.radius * 2, Ball.radius * 2)

  private rect: Rectangle
  private vel: Vector = Vector.fromDegMag(99, 2)

  private constructor(private viewport: Rectangle) {
    this.rect = Rectangle.fromCS(
      Point.fromXY(viewport.center.x, viewport.center.y),
      Ball.size,
    )
  }

  static init(viewport: Rectangle) {
    return new Ball(viewport)
  }

  update() {
    const offset = this.rect
      .translateBy(this.vel)
      .clampInOffset(this.viewport)
    const { x, y } = offset
    if (!offset.isZero) {
      this.vel = vec(applySign(x, this.vel.x), applySign(y, this.vel.y))
      this.rect = this.rect.translateBy(this.vel).translateBy(offset)
    } else {
      this.rect = this.rect.translateBy(this.vel).clampIn(this.viewport)
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    const { x, y } = this.rect.center
    ctx.fillStyle = 'green'
    ctx.arc(x, y, Ball.radius, 0, 2 * Math.PI, false)
    ctx.fill()
  }
}

function applySign(of: number, to: number) {
  const absNeg = R.compose(
    R.negate,
    Math.abs,
  )
  const fn = of < 0 ? absNeg : of > 0 ? Math.abs : R.identity
  return fn(to)
}
