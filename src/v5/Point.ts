import * as R from 'ramda'

type Point = {
  x: number
  y: number
}

type ReducerNum2 = (a: number, b: number) => number

function map2Both(fn: ReducerNum2, a: Point, b: Point): Point {
  return { x: fn(a.x, b.x), y: fn(a.y, b.y) }
}

function subtract(a: Point, b: Point): Point {
  return map2Both(R.subtract, a, b)
}

function square(a: number): number {
  return a * a
}

function len(a: Point, b: Point) {
  const c = subtract(a, b)
  return Math.sqrt(square(c.x) + square(c.y))
}
