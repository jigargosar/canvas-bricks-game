import { Rectangle } from './v5/Rectangle'
import { Point } from './v5/Point'
import { Vector, vec } from './v5/Vector'
import { Size } from './v5/Size'

type Key = {
  left: boolean
  right: boolean
}
export class Paddle {
  static readonly width = 150
  static readonly height = 15
  static readonly size = Size.fromWH(Paddle.width, Paddle.height)

  private rect: Rectangle

  private constructor(private viewport: Rectangle) {
    const { center, size } = viewport
    this.rect = Rectangle.fromCS(
      Point.fromXY(center.x, size.height - Paddle.height * 1.5),
      Paddle.size,
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
    const { topLeft: p, size: s } = this.rect
    ctx.fillRect(p.x, p.y, s.width, s.height)
  }
  static init(viewport: Rectangle) {
    return new Paddle(viewport)
  }
}
