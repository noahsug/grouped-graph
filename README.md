# Grouped Graph
> Visualize dependencies between grouped components.

Check out the demo [here](https://noahsug.github.io/grouped-graph/example).

![](https://github.com/noahsug/grouped-graph/blob/master/example.png)

The graph above is generated using [example/data.json](https://github.com/noahsug/grouped-graph/blob/master/example/data.json).


### Installation
```sh
npm install --save grouped-graph
```

### Api

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
