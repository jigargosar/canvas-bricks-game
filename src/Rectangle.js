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

export function mapX(fn: number => number, r: TRectangle) {
  r.x = fn(r.x)
}

export function toXYWH(r: TRectangle): XYWH {
  return {
    x: r.x,
    y: r.y,
    width: r.dimension.width,
    height: r.dimension.height,
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

function alignCenterX(refRect: TRectangle, rect: TRectangle) {
  rect.x = (getWidth(refRect) - getWidth(rect)) / 2
}

function alignBottomWithOffset(
  offset: number,
  refRect: TRectangle,
  rect: TRectangle,
) {
  rect.y = refRect.dimension.height - rect.dimension.height - offset
}

export {
  fromXYWH,
  fromPointDimension,
  getWidth,
  getHeight,
  alignCenterX,
  alignBottomWithOffset,
}
