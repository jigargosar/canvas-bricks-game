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
}

export class Size {
  private constructor(
    public readonly width: number,
    public readonly height: number,
  ) {}
  static fromWH(width: number, height: number) {
    return new Size(width, height)
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
}

// Canvas

export class Draw {
  private constructor(public readonly ctx: CanvasRenderingContext2D) {}
  static fromCtx(ctx: CanvasRenderingContext2D) {
    return new Draw(ctx)
  }
}

// Game
