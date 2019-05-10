import * as R from 'ramda'

import { Rectangle, line, LineSegment } from './v6/Rectangle'
import { Point } from './v6/Point'
import { Vector, vec, absNeg, NumF } from './v6/Vector'
import { Size } from './v6/Size'
import { Bricks } from './Bricks'
import { Brick } from './index'

type FAA<A> = (a: A) => A

type RectF = FAA<Rectangle>
type VecF = FAA<Vector>

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
    return new Ball(rect, Vector.fromDegMag(99, 5))
  }

  updateViewportCollision(viewport: Rectangle) {
    const offset = this.rect.translateBy(this.vel).clampOffsetIn(viewport)

    if (!offset.isZero) {
      const vel = this.vel.applySignOf(offset)
      const rect = this.rect.translateBy(this.vel).translateBy(offset)
      return new Ball(rect, vel)
    }
  }

  map(rfn: RectF, vfn: VecF): Ball {
    return new Ball(rfn(this.rect), vfn(this.vel))
  }

  mapRect(rfn: RectF): Ball {
    return this.map(rfn, R.identity)
  }
  mapVel(vfn: VecF) {
    return this.map(R.identity, vfn)
  }
  mapVelY(fn: NumF) {
    return this.mapVel(v => v.mapY(fn))
  }
  mapVelX(fn: NumF) {
    return this.mapVel(v => v.mapX(fn))
  }
  setCY(cy: number) {
    return this.mapRect(r => r.setCY(cy))
  }
  setCX(cy: number) {
    return this.mapRect(r => r.setCX(cy))
  }

  updateBrickCollision(bricks: Bricks, brickIdx: number) {
    const rect2 = bricks.rectAtIdx(brickIdx).grow(this.rect)
    const ext = rect2.extrema
    const eis = rect2.edgeIntersectionsWithPointVector(
      this.rect.center,
      this.vel,
    )

    rect2.containsPoint(this.rect.center)

    if (eis.top) {
      return this.setCY(ext.minY - 1).mapVelY(absNeg)
    } else if (eis.bottom) {
      return this.setCY(ext.maxY + 1).mapVelY(Math.abs)
    }

    if (eis.left) {
      return this.setCX(ext.minX - 1).mapVelX(absNeg)
    } else if (eis.right) {
      return this.setCX(ext.maxX + 1).mapVelX(Math.abs)
    }
  }

  updatePaddleCollision(paddleRect: Rectangle) {
    const rect2 = paddleRect.grow(this.rect)
    const ext = rect2.extrema
    const eis = rect2.edgeIntersectionsWithPointVector(
      this.rect.center,
      this.vel,
    )

    if (eis.top) {
      return this.setCY(ext.minY - 1).mapVelY(absNeg)
    } else if (eis.bottom) {
      return this.setCY(ext.maxY + 1).mapVelY(Math.abs)
    }

    if (eis.left) {
      return this.setCX(ext.minX - 1).mapVelX(absNeg)
    } else if (eis.right) {
      return this.setCX(ext.maxX + 1).mapVelX(Math.abs)
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

  findCollidingBrickIdx(bricks: Bricks): number {
    return bricks.findCollidingIdx(this.rect)
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    const { x, y } = this.rect.center
    ctx.fillStyle = 'green'
    ctx.arc(x, y, Ball.radius, 0, 2 * Math.PI, false)
    ctx.fill()
  }
}
