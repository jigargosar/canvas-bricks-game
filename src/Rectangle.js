export const Rectangle = {
  create: ({ x, y, width, height }) => ({ x, y, width, height }),
  getWidth: r => r.width,
  getHeight: r => r.height,
}
