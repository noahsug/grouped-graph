import * as d3 from 'd3'
import { getNodeRadius } from './shared'

function layout(data, vis, config) {
  const layouts = {
    node: getNodeLayout(data, config),
    label: getLabelLayout(data),
  }

  prerunSimulation(layouts, vis)

  layouts.node.on('tick', () => {
    updateLabelAnchor(vis.labelAnchor)
    updateNode(vis.node)
    updateNode(vis.labelAnchor)
    updateLink(vis.link)
  })
}

function getNodeLayout(data, { width, height }) {
  const nodeLinkForce = d3
    .forceLink(data.links)
    .distance(200)
    .strength(0.01)

  return d3
    .forceSimulation(data.nodes)
    .force('charge', d3.forceManyBody().strength(-350))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', nodeLinkForce)
}

function getLabelLayout(data) {
  const labelAnchorLinkForce = d3
    .forceLink(data.labelLinks)
    .strength(8)
    .distance(d => 8 + getNodeRadius(d.source.node) * 1.1)

  return d3
    .forceSimulation(data.labelAnchors)
    .force('charge', d3.forceManyBody())
    .force('link', labelAnchorLinkForce)
}

// prerun simulation for less spazzing when the page loads
function prerunSimulation(layouts, vis) {
  for (let i = 0; i < 100; i++) {
    layouts.node.tick()
    layouts.label.tick()
    vis.labelAnchor.each(d => {
      d.x = d.node.x
      d.y = d.node.y + 15
    })
  }
}

function updateLabelAnchor(labelAnchor) {
  labelAnchor.each(function(d) {
    if (d.label) {
      const bounds = this.childNodes[0].getBBox()
      const diffX = d.x - d.node.x
      const diffY = d.y - d.node.y
      const dist = Math.sqrt(diffX * diffX + diffY * diffY)

      let shiftX = bounds.width * (diffX - dist) / (dist * 2)
      shiftX = Math.max(-bounds.width, Math.min(0, shiftX))

      const shiftY = 5

      this.childNodes[0].setAttribute(
        'transform',
        `translate(${shiftX}, ${shiftY})`
      )
    } else {
      d.x = d.node.x
      d.y = d.node.y
    }
  })
}

function updateLink(link) {
  function getLinkEnd(from, to) {
    const xDiff = Math.abs(from.x - to.x)
    const yDiff = Math.abs(from.y - to.y)
    const xRatio = xDiff / (xDiff + yDiff)
    const yRatio = yDiff / (xDiff + yDiff)
    const radius = getNodeRadius(to)

    return {
      x: to.x + xRatio * radius * (from.x < to.x ? -1 : 1),
      y: to.y + yRatio * radius * (from.y < to.y ? -1 : 1),
    }
  }

  link
    .attr('x1', d => getLinkEnd(d.target, d.source).x)
    .attr('y1', d => getLinkEnd(d.target, d.source).y)
    .attr('x2', d => getLinkEnd(d.source, d.target).x)
    .attr('y2', d => getLinkEnd(d.source, d.target).y)
}

function updateNode(node) {
  node.attr('transform', d => `translate(${d.x}, ${d.y})`)
}

export default layout
