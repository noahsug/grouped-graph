import * as d3 from 'd3'
import './tree.css'
import { deepCopy } from './utils'

function createVisualization(data) {
  const root = document.createElement('div')
  const width = 600
  const height = 600

  const nodeData = deepCopy(data.nodes)

  const labelAnchorData = []
  nodeData.forEach(node => {
    labelAnchorData.push({ node, label: true })
    labelAnchorData.push({ node })
  })

  const labelLinkData = []
  nodeData.forEach((node, i) => {
    labelLinkData.push({ source: i * 2, target: i * 2 + 1 })
  })

  const linkData = []
  nodeData.forEach(node => {
    const targets = getTargets(node, nodeData)
    targets.forEach(target => {
      linkData.push({ source: node, target: target })
    })
  })

  function getTargets(node, nodeData) {
    const childTargets = node.children.reduce((total, current) => {
      return total.concat(current.targets)
    }, [])

    return childTargets
      .map(childTarget => getParent(childTarget, nodeData))
      .filter(target => target.name !== node.name)
  }

  function getParent(name, nodeData) {
    return nodeData.find(parent => {
      const children = parent.children.map(child => child.name)
      return children.includes(name)
    })
  }

  const svg = d3
    .select(root)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const link = svg
    .selectAll('line.link')
    .data(linkData)
    .enter()
    .append('svg:line')
    .attr('class', 'link')
    .attr('marker-end', 'url(#end)')

  const node = svg
    .selectAll('g.node')
    .data(nodeData)
    .enter()
    .append('svg:g')
    .attr('class', 'node')
  node.append('svg:circle').attr('r', getNodeRadius)

  const labelAnchor = svg
    .selectAll('g.labelAnchor')
    .data(labelAnchorData)
    .enter()
    .append('svg:g')
    .attr('class', 'label-anchor')
  labelAnchor.append('svg:text').text(d => (d.label ? d.node.name : ''))

  svg
    .append('svg:defs')
    .selectAll('marker')
    .data(['end'])
    .enter()
    .append('svg:marker') // This section adds in the arrows
    .attr('id', d => d)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 5)
    .attr('markerHeight', 5)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')

  const nodeLinkForce = d3.forceLink(linkData).distance(100)

  const nodeForce = d3
    .forceSimulation(nodeData)
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', nodeLinkForce)

  const labelAnchorLinkForce = d3
    .forceLink(labelLinkData)
    .strength(8)
    .distance(15)

  const labelAnchorForce = d3
    .forceSimulation(labelAnchorData)
    .force('charge', d3.forceManyBody())
    .force('link', labelAnchorLinkForce)

  // prerun simulation for less spazzing when the page loads
  for (let i = 0; i < 100; i++) {
    nodeForce.tick()
    labelAnchorForce.tick()
    labelAnchor.each(d => {
      d.x = d.node.x
      d.y = d.node.y + 15
    })
  }

  nodeForce.on('tick', () => {
    updateLabelAnchor(labelAnchor)

    updateNode(node)
    updateNode(labelAnchor)
    updateLink(link)
  })

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
    // .attr('x1', d => d.source.x)
    //.attr('y1', d => d.source.y)
    //.attr('x2', d => d.target.x)
    //.attr('y2', d => d.target.y)
  }

  function getNodeRadius(node) {
    return 5 + node.children.length
  }

  function updateNode(node) {
    node.attr('transform', d => `translate(${d.x}, ${d.y})`)
  }

  function attach(container) {
    container.appendChild(root)
  }

  return { attach }
}

export default { createVisualization }
