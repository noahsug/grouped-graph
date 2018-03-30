# Grouped Graph
> Grouped graph visualization widget.

Check out the live (example)[https://noahsug.github.io/grouped-graph].

![](https://github.com/noahsug/grouped-graph/blob/master/example.png)

The graph above is generated using this data: [example/data.json]('https://github.com/noahsug/grouped-graph/blob/master/example/data.json').


### Api

```js
import groupedGraph from '../src/index'
import data from './data.json'

const root = document.querySelector('.visualization')

const visualization = groupedGraph.createVisualization(data)
visualization.attach(root)
```


### Development

```sh
git clone git@github.com:noahsug/grouped-graph.git
cd grouped-graph
npm run start
npm run build:example -- --watch
```
