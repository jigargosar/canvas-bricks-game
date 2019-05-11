type MapF<T> = (a: T) => T

type MapFOrValue<T> = MapF<T> | T

// GEOMETRY

export type NumTuple = [number, number]

function degToRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

export class Vec {
  private constructor(readonly dx: number, readonly dy: number) {}

  static fromParts(x: number, y: number) {
    return new Vec(x, y)
  }
  static fromTuple(tuple: NumTuple) {
    const [x, y] = tuple
    return new Vec(x, y)
  }
  get tuple() {
    return [this.dx, this.dy]
  }
  scale(s: number) {
    const { dx, dy } = this
    return vec2(dx * s, dy * s)
  }
  static fromDegMag(deg: number, mag: number) {
    const angle = degToRadians(deg)
    return vec2(Math.cos(angle) * mag, Math.sin(angle) * mag)
  }
}

export const vec2 = Vec.fromParts

export class Point {
  private constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}
  static fromXY(x: number, y: number) {
    return new Point(x, y)
  }
  translateBy(vec: Vec): Point {
    return Point.fromXY(this.x + vec.dx, this.y + vec.dy)
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
    return vec2(this.width / 2, this.height / 2)
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
  mapCenter(pointF: MapFOrValue<Point>) {
    const nc = pointF instanceof Point ? pointF : pointF(this.center)
    return Rect.fromCS(nc, this.size)
  }
  translateBy(v: Vec) {
    return this.mapCenter(c => c.translateBy(v))
  }
}

// Canvas

export class Draw {
  private constructor(public readonly ctx: CanvasRenderingContext2D) {}
  static fromCtx(ctx: CanvasRenderingContext2D) {
    return new Draw(ctx)
  }
  get canvas() {
    return this.ctx.canvas
  }
  get rect() {
    return canvasToRect(this.canvas)
  }
  clear() {
    this.clearRect(this.rect)
  }
  clearRect(rect: Rect) {
    const [x, y, w, h] = Draw.rectToTopLeftXYWHTuple(rect)
    this.ctx.clearRect(x, y, w, h)
  }
  fillRect(
    rect: Rect,
    fillStyle: string | CanvasGradient | CanvasPattern,
  ) {
    this.ctx.fillStyle = fillStyle
    const [x, y, w, h] = Draw.rectToTopLeftXYWHTuple(rect)
    this.ctx.fillRect(x, y, w, h)
  }
  fillEllipse(
    rect: Rect,
    fillStyle: string | CanvasGradient | CanvasPattern,
  ) {
    const ctx = this.ctx
    ctx.beginPath()
    ctx.fillStyle = fillStyle
    const [x, y, w, h] = Draw.rectToCenterXYWHTuple(rect)
    ctx.ellipse(x, y, w, h, 0, 0, 2 * Math.PI, false)
    ctx.fill()
  }
  static rectToTopLeftXYWHTuple(rect: Rect) {
    const { center, size } = rect
    const { x, y } = center.translateBy(size.halfVec.scale(-1))
    return [x, y, size.width, size.height]
  }
  static rectToCenterXYWHTuple(rect: Rect) {
    const { x, y } = rect.center
    const { width, height } = rect.size
    return [x, y, width, height]
  }
}

export function canvasToRect(canvas: HTMLCanvasElement) {
  return Rect.fromWH(canvas.width, canvas.height)
}

// Game
