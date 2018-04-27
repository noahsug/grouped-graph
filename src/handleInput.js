import * as d3 from 'd3'
import { getNodeRadius } from './shared'

function handleInput(data, vis, popup, config) {
  // set to true when a node is clicked
  let selectedNode = false

  vis.node.on('mouseenter', function(d) {
    d3.select(this.childNodes[0]).attr('r', getNodeRadius(d) * 1.2)
    if (selectedNode) {
      const { highlightedLinks } = highlightShortestPath(d, selectedNode, data)
      popup.setData({ selected: selectedNode, highlightedLinks })
    } else {
      highlightShortestPath(data.rootNode, d, data)
    }
  })

  vis.node.on('mouseleave', function(d) {
    d3.select(this.childNodes[0]).attr('r', getNodeRadius(d))
    if (selectedNode) {
      const { highlightedLinks } = highlightShortestPath(
        data.rootNode,
        selectedNode,
        data
      )
      popup.setData({ selected: selectedNode, highlightedLinks })
    } else {
      unhighlight(data.rootNode)
    }
  })

  // used to differentiate between node clicks and background clicks.
  let clickedNode = false
  vis.node.on('click', d => {
    selectedNode = clickedNode = d
    const { highlightedLinks } = highlightShortestPath(data.rootNode, d, data)
    popup.setData({ selected: d, highlightedLinks })
    popup.show()
  })
  vis.svg.on('click', () => {
    if (clickedNode) {
      clickedNode = false
    } else {
      selectedNode = false
      unhighlight(data.rootNode)
      popup.hide()
    }
  })

  vis.node.on('dblclick', d => {
    if (config.onDoubleClick) config.onDoubleClick(d.name)
  })
}

function highlightShortestPath(from, to, data) {
  const highlightedLinks = getShortestPath(from, to, data)
  const connectedLinks = getConnectedLinks(to, data.links)
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
    if (node === from) classList.push('root')
    return classList.join(' ')
  })

  d3.selectAll('g.label-anchor').attr('class', anchor => {
    const classList = ['label-anchor']
    if (!highlightedNodes.has(anchor.node)) classList.push('fade')
    return classList.join(' ')
  })

  return { highlightedLinks, highlightedNodes }
}

function unhighlight(rootNode) {
  d3
    .selectAll('line.link')
    .attr('class', 'link')
    .attr('marker-end', 'url(#normal)')
  d3
    .selectAll('g.node')
    .attr('class', d => (d === rootNode ? 'node root' : 'node'))
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

function getShortestPath(from, to, data) {
  const childToLink = buildChildToLinkMap(from, data)
  const path = new Set()
  let next = to
  while (next !== from) {
    const link = childToLink.get(next)
    if (!link) break
    path.add(link)
    next = link.source
  }
  return path
}

function buildChildToLinkMap(from, data) {
  const childToLink = new Map()
  const queue = [from]
  while (queue.length) {
    const node = queue.shift()
    const links = data.links.filter(link => link.source === node)
    links.forEach(link => {
      const child = link.target
      if (childToLink.has(child)) return
      childToLink.set(child, link)
      queue.push(child)
    })
  }
  return childToLink
}

export default handleInput
