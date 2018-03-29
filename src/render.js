import * as d3 from 'd3'
import { getNodeRadius } from './shared'

function render(root, data, config) {
  const svg = renderSvg(root, config)
  renderLinkArrows(svg)
  const link = renderLinks(svg, data.links)
  const node = renderNodes(svg, data.nodes)
  const labelAnchor = renderLabels(svg, data.labelAnchors)
  return { svg, link, node, labelAnchor }
}

function renderSvg(root, config) {
  return d3
    .select(root)
    .append('svg')
    .attr('width', config.width)
    .attr('height', config.height)
}

function renderLinkArrows(svg) {
  svg
    .append('svg:defs')
    .selectAll('marker')
    .data(['normal', 'highlight'])
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
}

function renderLinks(svg, linkData) {
  return svg
    .selectAll('line.link')
    .data(linkData)
    .enter()
    .append('svg:line')
    .attr('class', 'link')
    .attr('marker-end', 'url(#normal)')
}

function renderNodes(svg, nodeData) {
  const node = svg
    .selectAll('g.node')
    .data(nodeData)
    .enter()
    .append('svg:g')
    .attr('class', 'node')
  node.append('svg:circle').attr('r', getNodeRadius)
  return node
}

function renderLabels(svg, labelData) {
  const labelAnchor = svg
    .selectAll('g.label-anchor')
    .data(labelData)
    .enter()
    .append('svg:g')
    .attr('class', 'label-anchor')
  labelAnchor.append('svg:text').text(d => (d.label ? d.node.name : ''))
  return labelAnchor
}

export default render
