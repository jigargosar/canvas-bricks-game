// @flow

export opaque type Point = { x: number, y: number }

function fromXY(x, y) {
  return { x, y }
}

export { fromXY }
