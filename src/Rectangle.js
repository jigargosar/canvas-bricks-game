export const Rectangle = {
  create: ({ x, y, width, height }) => ({ x, y, width, height }),
  getWidth: r => r.width,
  getHeight: r => r.height,
  alignCenterX,
  alignBottomWithOffset,
}

function alignCenterX(refRect, rect) {
  rect.x = (refRect.width - rect.width) / 2
}

function alignBottomWithOffset(offset, refRect, rect) {
  rect.y = refRect.height - rect.height - offset
}
