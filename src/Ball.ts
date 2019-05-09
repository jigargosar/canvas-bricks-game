import * as R from 'ramda'

import { Rectangle, line, LineSegment } from './v6/Rectangle'
import { Point } from './v6/Point'
import { Vector, vec, absNeg, NumF } from './v6/Vector'
import { Size } from './v6/Size'

export class Ball {
  static readonly radius = 10

  static readonly size = Size.fromWH(Ball.radius * 2, Ball.radius * 2)

  private constructor(
    private readonly rect: Rectangle,
    private readonly vel: Vector,
  ) {}

  static init(viewport: Rectangle): Ball {
    const rect = Rectangle.fromCS(
      Point.fromXY(viewport.center.x, viewport.center.y),
      Ball.size,
    )
    return new Ball(rect, Vector.fromDegMag(99, 20))
  }

  updateViewportCollision(viewport: Rectangle) {
    const offset = this.rect.translateBy(this.vel).clampOffsetIn(viewport)

    if (!offset.isZero) {
      const vel = this.vel.applySignOf(offset)
      const rect = this.rect.translateBy(this.vel).translateBy(offset)
      return new Ball(rect, vel)
    }
  }

  updatePaddleCollision(paddleRect: Rectangle) {
    const p1 = this.rect.center
    const p2 = p1.translateBy(this.vel)
    const collisionRect = paddleRect.grow(this.rect)
    const ext = collisionRect.extrema
    const eis = collisionRect.edgeIntersections(
      LineSegment.fromPoints(p1, p2),
    )

    const updateY = (velYFn: NumF, cy: number) =>
      new Ball(this.rect.setCY(cy), this.vel.mapY(velYFn))
    if (eis.top) {
      return updateY(absNeg, ext.minY - 1)
    } else if (eis.bottom) {
      return updateY(Math.abs, ext.maxY + 1)
    }

    const updateX = (velXFn: NumF, cx: number) =>
      new Ball(this.rect.setCX(cx), this.vel.mapX(velXFn))
    if (eis.left) {
      return updateX(absNeg, ext.minX - 1)
    } else if (eis.right) {
      return updateX(Math.abs, ext.maxX + 1)
    }
  }

  update(viewport: Rectangle, paddleRect: Rectangle) {
    const move = () => new Ball(this.rect.translateBy(this.vel), this.vel)
    return (
      this.updateViewportCollision(viewport) ||
      this.updatePaddleCollision(paddleRect) ||
      move()
    )
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    const { x, y } = this.rect.center
    ctx.fillStyle = 'green'
    ctx.arc(x, y, Ball.radius, 0, 2 * Math.PI, false)
    ctx.fill()
  }
}
