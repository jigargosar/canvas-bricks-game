// @flow

export type TDimension = { width: number, height: number }

export function fromWH(width: number, height: number) {
  return { width, height }
}
