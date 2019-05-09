import * as R from 'ramda'

import { Rectangle, line, LineSegment } from './v6/Rectangle'
import { Point } from './v6/Point'
import { Vector, vec, absNeg } from './v6/Vector'
import { Size } from './v6/Size'

export class Ball {
  static readonly radius = 10

  static readonly size = Size.fromWH(Ball.radius * 2, Ball.radius * 2)

  private rect: Rectangle
  private vel: Vector = Vector.fromDegMag(99, 20)

  private constructor(private viewport: Rectangle) {
    this.rect = Rectangle.fromCS(
      Point.fromXY(viewport.center.x, viewport.center.y),
      Ball.size,
    )
  }

  static init(viewport: Rectangle): Ball {
    return new Ball(viewport)
  }

  updateViewportCollision() {
    const offset = this.rect
      .translateBy(this.vel)
      .clampOffsetIn(this.viewport)

    if (!offset.isZero) {
      this.vel = this.vel.applySignOf(offset)
      this.rect = this.rect.translateBy(this.vel).translateBy(offset)
      return true
    }
    return false
  }

  updatePaddleCollision(paddleRect: Rectangle) {
    const p1 = this.rect.center
    const p2 = p1.translateBy(this.vel)
    const collisionRect = paddleRect.grow(this.rect)
    const cex = collisionRect.extrema
    const eis = collisionRect.edgeIntersections(
      LineSegment.fromPoints(p1, p2),
    )

    if (eis.top) {
      this.vel = this.vel.mapY(absNeg)
      this.rect = this.rect.mapCenter(({ x, y }) =>
        Point.fromXY(x, cex.minY - 1),
      )
      return true
    }
    if (eis.bottom) {
      this.vel = this.vel.mapY(Math.abs)
      this.rect = this.rect.mapCenter(({ x, y }) =>
        Point.fromXY(x, cex.maxY + 1),
      )
      return true
    }

    return false
  }

  update(paddleRect: Rectangle) {
    const updated =
      this.updateViewportCollision() ||
      this.updatePaddleCollision(paddleRect)

    if (!updated) {
      this.rect = this.rect.translateBy(this.vel)
      //.clampIn(this.viewport)
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
