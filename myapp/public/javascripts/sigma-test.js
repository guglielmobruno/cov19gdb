const sigma = require('sigma');

console.log("sigma-test.js")

var i,
s,
N = 50,
E = 50,
g = {
  nodes: [],
  edges: []
};

// Generate random nodes:
for (i = 0; i < N; i++)
    g.nodes.push({
        id: 'n' + i,
        label: 'Article ' + i,
        x: Math.random(),
        y: Math.random(),
        size: Math.random(),
        color: '#ec5148'
    });

// Generate random edges
for (i = 0; i < E; i++)
    g.edges.push({
    id: 'connection' + i,
    source: 'n' + (Math.random() * N | 0),
    target: 'n' + (Math.random() * N | 0),
    size: Math.random(),
    color: '#ccb6b6'
});

s = new sigma({ 
    graph: g,
    container: 'container',
    settings: {
        defaultNodeColor: '#ec5148'
    }
});

//Initialize nodes as a circle
s.graph.nodes().forEach(function(node, i, a) {
  node.x = Math.cos(Math.PI * 2 * i / a.length);
  node.y = Math.sin(Math.PI * 2 * i / a.length);
});

console.log('End of sigma-test.js')