import { useSigma } from "react-sigma-v2";
import { FC, useEffect, useState } from "react";
import { keyBy, omit } from "lodash";
import { Attributes } from "graphology-types";
import { searchSample } from "../canvas-utils"

import { Dataset, FiltersState } from "../types";

//import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
                
const GraphDataController: FC<{ dataset: Dataset; filters: FiltersState }> = ({ dataset, filters, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [mess, setMess] = useState<string>('');
  /**
   * Feed graphology with the new dataset:
   */
  useEffect(() => {
    if (!graph || !dataset) return;

    const clusters = keyBy(dataset.clusters, "key");
    const tags = keyBy(dataset.tags, "key");

    dataset.nodes.forEach((node) =>
      graph.addNode(node.key, {
        ...node,
        ...omit(tags[node.tag], "key"),
        ...omit(clusters[node.cluster], "key")
        //image: `${process.env.PUBLIC_URL}/images/${tags[node.tag].image}`,
      }),
    );
    graph.forEachNode((key: string, attributes: Attributes) => {
      const color = attributes.color;
      graph.setNodeAttribute(key, 'originalcolor', color);
    })
    
    dataset.edges.forEach(([source, target, ref, sample, from_sign, to_sign]) => {
      const edge = graph.addEdge(source, target, {size: 1 });
      graph.setEdgeAttribute(edge, "source", source );
      graph.setEdgeAttribute(edge, "target", target );
      graph.setEdgeAttribute(edge, "is_ref", ref );
      graph.setEdgeAttribute(edge, "color", '#c3c3c3' );
      graph.setEdgeAttribute(edge, "originalcolor", '#c3c3c3' );
      graph.setEdgeAttribute(edge, "sample", sample );
      graph.setEdgeAttribute(edge, "from_sign", from_sign );
      graph.setEdgeAttribute(edge, "hidden", false );
      graph.setEdgeAttribute(edge, "to_sign", to_sign );
    });
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { settings, iterations: 1000 });

    // Use degrees as node sizes:
    graph.forEachNode((node) =>
      graph.setNodeAttribute(
        node,
        "size", 5
        //((graph.getNodeAttribute(node, "score")
        // - minDegree) / (maxDegree - minDegree)) *
        //  (MAX_NODE_SIZE - MIN_NODE_SIZE) +
        //  MIN_NODE_SIZE,
      ),
    );
    
    return () => graph.clear();
  }, [graph, dataset]);

  /**
   * Apply filters to graphology:
   */
  useEffect(() => {
    const { clusters, tags } = filters;
    graph.forEachNode((node, { cluster, tag }) =>
      graph.setNodeAttribute(node, "hidden", !clusters[cluster] || !tags[tag]),
    );
  }, [graph, filters]);

  return <div>
    <>{children}</>
    {/* <p>{mess}</p> */}
  </div>;
};

 

export default GraphDataController;
