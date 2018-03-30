import * as d3 from 'd3'
import render from './render'
import getData from './getData'
import layout from './layout'
import handleInput from './handleInput'

function createVisualization(inputData, config = {}) {
  const root = document.createElement('div')
  const width = config.width || 600
  const height = config.height || 600

  const data = getData(inputData)

  const vis = render(root, data, { width, height })

  layout(data, vis, { width, height })

  handleInput(data, vis)

  function attach(container) {
    container.appendChild(root)
  }

  return { attach }
}

export default { createVisualization }
