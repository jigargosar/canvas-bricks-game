//@flow

import * as Point from './Point'
import * as Dimension from './Dimension'

export opaque type Rectangle = {
  x: number,
  y: number,
  width: number,
  height: number,
}

function fromXYWH({ x, y, width, height }) {
  return fromPointDimension(
    Point.fromXY(x, y),
    Dimension.fromWH(width, height),
  )
}

function getHeight(r) {
  return r.height
}

function getWidth(r) {
  return r.width
}

function fromPointDimension({ x, y }, { width, height }) {
  return {
    x,
    y,
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
