// @flow

export opaque type Dimension = { width: number, height: number }

export function fromWH(width, height) {
  return { width, height }
}
