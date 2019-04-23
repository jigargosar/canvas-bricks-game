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

export function setX_(fn: number => number, r: TRectangle) {
  r.x = fn(r.x)
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

function setX(number: number, rect: TRectangle): void {
  setX_(() => number, rect)
}

function alignCenterX(refRect: TRectangle, rect: TRectangle): void {
  setX((getWidth(refRect) - getWidth(rect)) / 2, rect)
}

function setY(y, rect) {
  rect.y = y
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
