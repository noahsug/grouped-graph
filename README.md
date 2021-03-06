# Grouped Dependency Graph
> Visualize dependencies between groups of components.

Check out an example source code dependency graph [here](https://noahsug.github.io/grouped-graph).

![](https://github.com/noahsug/grouped-graph/blob/master/example.png)

The graph above is generated using [example/data.json](https://github.com/noahsug/grouped-graph/blob/master/example/data.json):

```json
{
  "rootNode": "layout",
  "nodes": [
    {
      "name": "layout",
      "children": [
        {
          "name": "layout/index.js",
          "targets": [ "footer/index.js", "header/index.js" ]
        }
      ]
    }, {
      "name": "footer",
      "children": [
        {
          "name": "footer/index.js",
          "targets": [ "footer/components/Footer.jsx" ]
        }, {
          "name": "footer/components/Footer.jsx",
          "targets": [ "footer/components/FooterAnimation.jsx", "utils/clone.js" ]
        }, {
```

### Features
Clicking a node displays the list of the components within that node and selects it.

Hovering over a node highlights the shortest path from the `rootNode` or selected node.


### Installation
```sh
npm install --save grouped-graph
```

### API
```js
import groupedGraph from 'grouped-graph'
import data from './data.json'

const root = document.querySelector('.visualization')

const options = { width: 800, height: 800 }
const visualization = groupedGraph.createVisualization(data, options)
visualization.attach(root)
```

### Development
```sh
git clone git@github.com:noahsug/grouped-graph.git
cd grouped-graph
npm run start
npm run build:example -- --watch
```
