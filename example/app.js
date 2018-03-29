import speedyTree from '../src/index'
import data from './data.json'

const root = document.querySelector('.visualization')

const visualization = speedyTree.createVisualization(data, { root: 'layout' })
visualization.attach(root)
