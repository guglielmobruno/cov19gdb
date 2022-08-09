/**
 * This example shows how to use graphology and sigma to interpret a dataset and
 * to transform it to a mappable graph dataset, without going through any other
 * intermediate step.
 *
 * To do this, we start from a dataset from "The Cartography of Political
 * Science in France" extracted from:
 * https://cartosciencepolitique.sciencespo.fr/#/en
 *
 * The CSV contains one line per institution, with an interesting subject_terms
 * column. We will here transform this dataset to a institution/subject
 * bipartite network map.
 */

import Sigma from "sigma";
import Papa from "papaparse";
import Graph from "graphology";
import circular from "graphology-layout/circular";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { cropToLargestConnectedComponent } from "graphology-components";
import drawEdgeLabel from "sigma/rendering/canvas/edge-label";


const uri = 'neo4j+s://1628a821.databases.neo4j.io';
const user = 'neo4j';
const password = 'CII7eDk7eW-2m_5X0b687koeZf8NRrwHVZ_OH22tRUI';
    


/*const session = driver.session({ database: 'neo4j' })
var query = 'MATCH (n:node)-[l]-() RETURN distinct n.ID, n.sequence ';
let col
const graph: Graph = new Graph();
var _ = session.run(query).then(result => {
    
    result.records.slice(0,10).forEach(record=>{
        graph.addNode(record.toObject['n.ID'].toNumber(), {
            nodeType: "node",
            label: [record.toObject['n.ID'].toNumber(), record.toObject['n.sequence']].filter((s) => !!s).join(" - "),
            color: col
        });
    })
    col=(result.records[0].toObject['n.ID'].toNumber()===1815)?'red':'blue'
    session.close()
});
graph.addNode(10,{
    nodeType: "node",
    label:[10,'T'],
    color: col
}) */





let j=0;
let col='black';
const files=['./data2.csv', './edge2.csv'];

// 1. Load CSV file:
Papa.parse<{id: string; label: string; seq: string; len: string; ID: string; sample: string;}>(files[0], {
    download: true,
    header: false,
    delimiter: ";",
    complete: (results) => {
        Papa.parse<{fr: string; tr: string; from: string; to: string; sample: string}>(files[1], {
            download: true,
            header: false,
            delimiter: ";",
            complete: (results2) => {
                const graph: Graph = new Graph();

                // 2. Build the bipartite graph:
                results.data.slice(1,results.data.length+1).forEach((line: any) => {
                    j++;
                    const ID = line[4];
                    const sequence = line[2];
                    if (line[5]) col=(line[5].includes("reference")? 'orange': 'blue');
                    else col='black'
    
                // Create the institution node:
                    graph.addNode(ID, {
                        nodeType: "node",
                        label: [ID, sequence].filter((s) => !!s).join(" - "),
                        color: col
                    });
                    
                })
        
      //     3. Only keep the main connected component:
        
      //     4. Add colors to the nodes, based on node types:


                let i=1;
                 while(i<results2.data.length){
                    graph.addEdge(results2.data[i][2]+'',results2.data[i][3]+'')
                    i++;
                }  
                    /* const COLORS: Record<string, string> = { node: col};
                    graph.forEachNode((node, attributes) =>
                      graph.setNodeAttribute(node, "color", COLORS[attributes.nodeType as string]),
                    ); */

                    //graph.addEdge(from,to);
                     /* results2.data.slice(0,10).forEach((line2: any) => {
                       const from=line2[2];
                       const to=line2[3];
                       graph.addEdge(from,to);
                     }); */
                  // 5. Use degrees for node sizes:
                   /*  const degrees = graph.nodes().map((node) => graph.degree(node));
                    const minDegree = Math.min(...degrees);
                    const maxDegree = Math.max(...degrees);
                    const minSize = 2,
                      maxSize = 15;
                    graph.forEachNode((node) => {
                      const degree = graph.degree(node);
                      graph.setNodeAttribute(
                        node,
                        "size",
                        minSize + ((degree - minDegree) / (maxDegree - minDegree)) * (maxSize - minSize),
                      );
                    }); */

                
      //         6. Position nodes on a circle, then run Force Atlas 2 for a while to get
      //    proper graph layout:
                circular.assign(graph);
                const settings = forceAtlas2.inferSettings(graph);
                forceAtlas2.assign(graph, { settings, iterations: 600 });
                
      //         7. Hide the loader from the DOM:
                const loader = document.getElementById("loader") as HTMLElement;
                loader.style.display = "none";
                
                
      //         8. Finally, draw the graph using sigma:
                const container = document.getElementById("sigma-container") as HTMLElement;
                const renderer = new Sigma(graph, container); 
                
                let draggedNode: string | null = null;
                let isDragging = false;

// On mo        use down on a node
//  - we         enable the drag mode
//  - sa        ve in the dragged node in the state
//  - hi        ghlight the node
//  - di        sable the camera so its state is not updated
                renderer.on("downNode", (e) => {
                    isDragging = true;
                    draggedNode = e.node;
                    graph.setNodeAttribute(draggedNode, "highlighted", true);
                });
// On mo        use move, if the drag mode is enabled, we change the position of the draggedNode
                renderer.getMouseCaptor().on("mousemovebody", (e) => {
                    if (!isDragging || !draggedNode) return;

  // Get         new position of node
                    const pos = renderer.viewportToGraph(e);

                    graph.setNodeAttribute(draggedNode, "x", pos.x);
                    graph.setNodeAttribute(draggedNode, "y", pos.y);

  // Pre        vent sigma to move camera:
                    e.preventSigmaDefault();
                    e.original.preventDefault();
                    e.original.stopPropagation();
                });

// On mo        use up, we reset the autoscale and the dragging mode
                renderer.getMouseCaptor().on("mouseup", () => {
                    if (draggedNode) {
                        graph.removeNodeAttribute(draggedNode, "highlighted");
                    }
                    isDragging = false;
                    draggedNode = null;
                });

// Disab        le the autoscale at the first down interaction
                renderer.getMouseCaptor().on("mousedown", () => {
                    if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
                });
            }
        });
    }
});

  