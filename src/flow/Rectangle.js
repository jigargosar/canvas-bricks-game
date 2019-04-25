//@flow

import type { TPoint } from './Point'
import * as Point from './Point'
import type { TDimension } from './Dimension'
import * as Dimension from './Dimension'

export opaque type TRectangle = {
  x: number,
  y: number,
  dimension: TDimension,
}

type XYWH = {
  x: number,
  y: number,
  width: number,
  height: number,
}

export function updateX(fn: number => number, r: TRectangle) {
  r.x = fn(r.x)
}

export function clampXIn(largeRect: TRectangle, rect: TRectangle) {
  const [minX, maxX2] = [getX(largeRect), getX2(largeRect)]

  const [x1, x2] = [getX(rect), getX2(rect)]

  if (x1 < minX) {
    setX(minX, rect)
  } else if (x2 > maxX2) {
    setX2(maxX2, rect)
  }
}

export function toXYWH(r: TRectangle): XYWH {
  return {
    x: r.x,
    y: r.y,
    width: getWidth(r),
    height: getHeight(r),
  }
}
function fromXYWH({ x, y, width, height }: XYWH): TRectangle {
  return fromPointDimension(
    Point.fromXY(x, y),
    Dimension.fromWH(width, height),
  )
}

function getHeight(r: TRectangle) {
  return r.dimension.height
}

function getWidth(r: TRectangle) {
  return r.dimension.width
}

function fromPointDimension(
  { x, y }: TPoint,
  { width, height }: TDimension,
) {
  return {
    x,
    y,
    dimension: Dimension.fromWH(width, height),
  }
}

export function setX(number: number, rect: TRectangle): void {
  updateX(() => number, rect)
}

function alignCenterX(refRect: TRectangle, rect: TRectangle): void {
  setX((getWidth(refRect) - getWidth(rect)) / 2, rect)
}

function setY(y, rect) {
  rect.y = y
}

export function setX2(x2: number, rect: TRectangle) {
  setX(x2 - getWidth(rect), rect)
}

export function getX(r: TRectangle) {
  return r.x
}

export function getX2(r: TRectangle) {
  return getX(r) + getWidth(r)
}

function alignBottomWithOffset(
  offset: number,
  refRect: TRectangle,
  rect: TRectangle,
) {
  setY(getHeight(refRect) - getHeight(rect) - offset, rect)
}

export {
  fromXYWH,
  fromPointDimension,
  getWidth,
  getHeight,
  alignCenterX,
  alignBottomWithOffset,
}
