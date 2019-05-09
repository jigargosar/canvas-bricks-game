import { Rectangle } from './v6/Rectangle'
import { Point } from './v6/Point'
import { Vector, vec } from './v6/Vector'
import { Size } from './v6/Size'

export class Bricks {
  private constructor(private readonly bricks: Brick[]) {}

  static init() {
    return new Bricks([Brick.init(10, 10)])
  }

  render(ctx: CanvasRenderingContext2D) {
    this.bricks.forEach(b => b.render(ctx))
  }
}

export class Brick {
  static readonly width = 50
  static readonly height = 10
  static readonly size = Size.fromWH(Brick.width, Brick.height)

  private constructor(private readonly rect: Rectangle) {}
  static init(cx: number, cy: number) {
    const rect = Rectangle.fromCS(Point.fromXY(cx, cy), Brick.size)
    return new Brick(rect)
  }

  update() {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'green'
    const { x, y, w, h } = this.rect.topLeftXYWH
    ctx.fillRect(x, y, w, h)
  }
}
