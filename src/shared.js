export function getNodeRadius(node) {
  return 5 + Math.sqrt(node.children.length)
}
