//@flow

import type { TPoint } from './Point'
import * as Point from './Point'
import * as Dimension from './Dimension'

export opaque type Rectangle = {
  x: number,
  y: number,
  width: number,
  height: number,
}

function fromXYWH({ x, y, width, height }: Rectangle) {
  return fromPointDimension(
    Point.fromXY(x, y),
    Dimension.fromWH(width, height),
  )
}

function getHeight(r: Rectangle) {
  return r.height
}

function getWidth(r: Rectangle) {
  return r.width
}

function fromPointDimension(pos: TPoint, { width, height }) {
  return {
    x: Point.getX(pos),
    y: Point.getY(pos),
    width,
    height,
  }
}

function alignCenterX(refRect, rect) {
  rect.x = (getWidth(refRect) - getWidth(rect)) / 2
}

function alignBottomWithOffset(offset, refRect, rect) {
  rect.y = refRect.height - rect.height - offset
}

export {
  fromXYWH,
  fromPointDimension,
  getWidth,
  getHeight,
  alignCenterX,
  alignBottomWithOffset,
}
