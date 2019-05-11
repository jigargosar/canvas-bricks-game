// GEOMETRY

export type NumTuple = [number, number]

function degToRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

export class Vec {
  private constructor(private readonly tuple: NumTuple) {}
  static fromTuple(tuple: NumTuple) {
    return new Vec(tuple)
  }

  static fromComponents(a: number, b: number) {
    return Vec.fromTuple([a, b])
  }

  get xComponent() {
    return this.tuple[0]
  }

  get yComponent() {
    return this.tuple[1]
  }

  scale(s: number) {
    const newTuple = this.tuple.map(n => n * s) as NumTuple
    return Vec.fromTuple(newTuple)
  }

  static fromDegMag(deg: number, mag: number) {
    const angle = degToRadians(deg)
    return Vec.fromComponents(Math.cos(angle) * mag, Math.sin(angle) * mag)
  }
}

export class Point {
  private constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}
  static fromXY(x: number, y: number) {
    return new Point(x, y)
  }

  translateBy(vec: Vec): Point {
    return Point.fromXY(this.x + vec.xComponent, this.y + vec.yComponent)
  }
  static origin = Point.fromXY(0, 0)
}

export class Size {
  private constructor(
    public readonly width: number,
    public readonly height: number,
  ) {}

  static fromWH(width: number, height: number) {
    return new Size(width, height)
  }

  get halfVec() {
    return Vec.fromComponents(this.width / 2, this.height / 2)
  }
}

export class Rect {
  private constructor(
    public readonly center: Point,
    public readonly size: Size,
  ) {}

  static fromCS(center: Point, size: Size) {
    return new Rect(center, size)
  }

  static fromWH(width: number, height: number) {
    const center = Point.fromXY(width / 2, height / 2)
    const size = Size.fromWH(width, height)
    return Rect.fromCS(center, size)
  }

  get topLeft() {
    return this.center.translateBy(this.size.halfVec.scale(-1))
  }
}

// Canvas

export class Draw {
  private constructor(public readonly ctx: CanvasRenderingContext2D) {}
  static fromCtx(ctx: CanvasRenderingContext2D) {
    return new Draw(ctx)
  }

  clearRect(rect: Rect) {
    const [x, y, w, h] = Draw.rectToXYWHTuple(rect)
    this.ctx.clearRect(x, y, w, h)
  }

  static rectToXYWHTuple(rect: Rect) {
    const { x, y } = rect.topLeft
    const { width, height } = rect.size
    return [x, y, width, height]
  }
}

// Game
