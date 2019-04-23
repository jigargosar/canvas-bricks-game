import { Point } from './Point'
import { Dimension } from './Dimension'

export const Rectangle = {
  fromXYWH,
  fromPointDimension,
  getWidth,
  getHeight,
  alignCenterX,
  alignBottomWithOffset,
}

function fromXYWH({ x, y, width, height }) {
  return Rectangle.fromPointDimension(
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

function fromPointDimension({ x, y }: Point, { width, height }) {
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
