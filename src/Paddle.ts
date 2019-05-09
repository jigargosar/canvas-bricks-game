import { Rectangle } from './v6/Rectangle'
import { Point } from './v6/Point'
import { Vector, vec } from './v6/Vector'
import { Size } from './v6/Size'

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
    this.rect = Rectangle.fromCS(
      Point.fromXY(
        viewport.center.x,
        viewport.center.y,
        // viewport.extrema.maxY - Paddle.height * 1.5,
      ),
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
    const { x, y, w, h } = this.rect.topLeftXYWH
    ctx.fillRect(x, y, w, h)
  }
  static init(viewport: Rectangle) {
    return new Paddle(viewport)
  }
}
