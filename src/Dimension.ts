export type Dimension = { width: number; height: number }

export const Dimension = {
  fromWH: (width, height) => ({ width, height }),
}
