import groupedGraph from '../src/index'
import data from './data.json'

const root = document.querySelector('.visualization')

const visualization = groupedGraph.createVisualization(data)
visualization.attach(root)
