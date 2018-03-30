import * as d3 from 'd3'
import { getNodeRadius } from './shared'

function handleInput(data, vis) {
  // set to true when a node is clicked
  let keepHighlight = false

  vis.node.on('mouseenter', function(d) {
    if (keepHighlight) return
    d3.select(this.childNodes[0]).attr('r', getNodeRadius(d) * 1.2)
    highlightFromNode(d, data)
  })

  vis.node.on('mouseleave', function(d) {
    if (keepHighlight) return
    d3.select(this.childNodes[0]).attr('r', getNodeRadius(d))
    unhightlight()
  })

  let clickedNode = false
  vis.node.on('click', d => {
    highlightFromNode(d, data)
    keepHighlight = clickedNode = true
  })
  vis.svg.on('click', () => {
    if (clickedNode) {
      clickedNode = false
    } else {
      keepHighlight = false
      unhightlight()
    }
  })
}

function highlightFromNode(d, data) {
  const highlightedLinks = getShortestPathFromRoot(d, data)
  const connectedLinks = getConnectedLinks(d, data.links)
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

function getShortestPathFromRoot(node, data) {
  const childToLink = buildChildToLinkMap(node, data)
  const path = new Set()
  let next = node
  while (next !== data.rootNode) {
    const link = childToLink.get(next)
    if (!link) break
    path.add(link)
    next = link.source
  }
  return path
}

function buildChildToLinkMap(node, data) {
  const childToLink = new Map()
  const queue = [data.rootNode]
  while (queue.length) {
    const node = queue.shift()
    const links = data.links.filter(link => link.source === node)
    const foundNode = links.find(link => {
      const child = link.target
      if (childToLink.has(child)) return false
      childToLink.set(child, link)
      queue.push(child)
      return child === node
    })
    if (foundNode) break
  }
  return childToLink
}

export default handleInput
