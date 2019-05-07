import { Rectangle } from './v5/Rectangle'
import { Point } from './v5/Point'
import { Vector, vec } from './v5/Vector'

type Key = {
  left: boolean
  right: boolean
}
export class Paddle {
  static readonly w = 150
  static readonly h = 15
  private rect: Rectangle

  private constructor(private viewport: Rectangle) {
    const { center, size } = viewport
    this.rect = Rectangle.fromCenterWH(
      Point.fromXY(center.x, size.height - Paddle.h * 1.5),
      Paddle.w,
      Paddle.h,
    )
  }

  update(key: Key) {
    const speed = 10
    const dx = key.left ? -speed : key.right ? speed : 0
    const vel = vec(dx, 0)
    this.rect = this.rect.translateBy(vel).clampIn(this.viewport)
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'orange'
    const {
      topLeft: { x, y },
      size: { w, h },
    } = this.rect
    ctx.fillRect(x, y, w, h)
  }
  static init(viewport: Rectangle) {
    return new Paddle(viewport)
  }
}
