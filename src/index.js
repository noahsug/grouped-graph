import * as d3 from 'd3'
import { deepCopy } from './utils'
import render, { getNodeRadius } from './render'

function createVisualization(data, config = {}) {
  const root = document.createElement('div')
  const width = config.width || 600
  const height = config.height || 600

  const nodeData = deepCopy(data.nodes)

  const labelAnchorData = []
  const labelLinkData = []
  nodeData.forEach(node => {
    labelAnchorData.push({ node, label: true })
    labelAnchorData.push({ node })
  })

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

  const { svg, link, node, labelAnchor } = render(
    root,
    {
      links: linkData,
      nodes: nodeData,
      labelAnchors: labelAnchorData,
    },
    { width, height }
  )

  const nodeLinkForce = d3
    .forceLink(linkData)
    .distance(200)
    .strength(0.01)

  const nodeForce = d3
    .forceSimulation(nodeData)
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', nodeLinkForce)

  const labelAnchorLinkForce = d3
    .forceLink(labelLinkData)
    .strength(8)
    .distance(d => 8 + getNodeRadius(d.source.node) * 1.1)

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

  // set to true when a node is clicked
  let keepHighlight = false

  node.on('mouseenter', function(d) {
    if (keepHighlight) return
    d3.select(this.childNodes[0]).attr('r', getNodeRadius(d) * 1.2)
    highlightFromNode(d)
  })

  node.on('mouseleave', function(d) {
    if (keepHighlight) return
    d3.select(this.childNodes[0]).attr('r', getNodeRadius(d))
    unhightlight()
  })

  let clickedNode = false
  node.on('click', d => {
    highlightFromNode(d)
    keepHighlight = clickedNode = true
  })
  svg.on('click', () => {
    if (clickedNode) {
      clickedNode = false
    } else {
      keepHighlight = false
      unhightlight()
    }
  })

  function highlightFromNode(d) {
    const highlightedLinks = getShortestPathFromRoot(d)
    const connectedLinks = getConnectedLinks(d, linkData)
    d3
      .selectAll('line.link')
      .attr('class', link => {
        const classList = ['link']
        if (highlightedLinks.has(link)) {
          classList.push('highlight')
        } else if (!connectedLinks.has(link)) {
          classList.push('fade')
        }
        return classList.join(' ')
      })
      .attr(
        'marker-end',
        d => (highlightedLinks.has(d) ? 'url(#highlight)' : 'url(#normal)')
      )

    const highlightedNodes = new Set([
      ...getNodesFromLinks(highlightedLinks),
      ...getNodesFromLinks(connectedLinks),
    ])
    d3.selectAll('g.node').attr('class', node => {
      const classList = ['node']
      if (!highlightedNodes.has(node)) classList.push('fade')
      return classList.join(' ')
    })

    d3.selectAll('g.label-anchor').attr('class', anchor => {
      const classList = ['label-anchor']
      if (!highlightedNodes.has(anchor.node)) classList.push('fade')
      return classList.join(' ')
    })
  }

  function unhightlight() {
    d3
      .selectAll('line.link')
      .attr('class', 'link')
      .attr('marker-end', 'url(#normal)')
    d3.selectAll('g.node').attr('class', 'node')
    d3.selectAll('g.label-anchor').attr('class', 'label-anchor')
  }

  function getNodesFromLinks(links) {
    const nodes = new Set()
    links.forEach(link => {
      nodes.add(link.target)
      nodes.add(link.source)
    })
    return nodes
  }

  function getConnectedLinks(node, linkData) {
    return new Set(
      linkData.filter(link => link.target === node || link.source === node)
    )
  }

  const rootNode = nodeData.find(n => n.name === 'header')
  // const rootNode = nodeData.find(n => n.name === 'layout')

  function getShortestPathFromRoot(node) {
    const childToLink = buildChildToLinkMap(node)
    const path = new Set()
    let next = node
    while (next !== rootNode) {
      const link = childToLink.get(next)
      if (!link) break
      path.add(link)
      next = link.source
    }
    return path
  }

  function buildChildToLinkMap(node) {
    const childToLink = new Map()
    const stack = [rootNode]
    while (stack.length) {
      const node = stack.pop()
      const links = linkData.filter(link => link.source === node)
      links.forEach(link => {
        const child = link.target
        if (childToLink.has(child)) return
        childToLink.set(child, link)
        stack.push(child)
      })
    }
    return childToLink
  }

  function getTargets(node, nodeData) {
    const childTargets = node.children.reduce((total, current) => {
      return total.concat(current.targets)
    }, [])

    const targets = childTargets
      .map(childTarget => getParent(childTarget, nodeData))
      .filter(target => target && target.name !== node.name)
    return Array.from(new Set(targets))
  }

  function getParent(name, nodeData) {
    return nodeData.find(parent => {
      const children = parent.children.map(child => child.name)
      return children.includes(name)
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
