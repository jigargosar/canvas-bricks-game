import { Rectangle } from './v5/Rectangle'
import { Point } from './v5/Point'
import { Vector } from './v5/Vector'

export class Paddle {
  static readonly w = 150
  static readonly h = 15
  private rect: Rectangle
  private vel: Vector

  private constructor({ center, size }: Rectangle) {
    this.rect = Rectangle.fromCenterWH(
      Point.xy(center.x, size.height - Paddle.h * 1.5),
      Paddle.w,
      Paddle.h,
    )
    this.vel = Vector.fromParts(2, 2)
  }

  update() {
    // const dx = Key.left ? -speed : Key.right ? speed : 0
    // const vel = vec(dx, 0)
    // rect = rect.mapCenter(c => c.add(vel)).clampIn(vp)
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
