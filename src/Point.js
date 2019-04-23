// @flow

export type TPoint = { x: number, y: number }

export function fromXY(x: number, y: number): TPoint {
  return { x, y }
}

export function getX(p: TPoint) {
  return p.x
}

export function getY(p: TPoint) {
  return p.y
}
