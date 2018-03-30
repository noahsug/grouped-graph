import { deepCopy } from './utils'

function getData(input) {
  const data = {}

  data.nodes = deepCopy(input.nodes)
  data.rootNode = data.nodes.find(n => n.name === input.rootNode)

  data.labelAnchors = []
  data.labelLinks = []
  data.nodes.forEach(node => {
    data.labelAnchors.push({ node, label: true })
    data.labelAnchors.push({ node })
  })

  data.nodes.forEach((node, i) => {
    data.labelLinks.push({ source: i * 2, target: i * 2 + 1 })
  })

  data.links = []
  data.nodes.forEach(node => {
    const targets = getTargets(node, data.nodes)
    targets.forEach(target => {
      data.links.push({ source: node, target: target })
    })
  })

  return data
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

export default getData
