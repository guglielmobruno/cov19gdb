import { useRegisterEvents, useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<{ setHoveredNode: (node: string | null) => void }> = ({ setHoveredNode, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  //AGGIUNTO DRAG AND DROP
  //INIZIO
  let draggedNode: string | null = null;
  let isDragging = false;

  sigma.on("downNode", (e) => {
    isDragging = true;
    draggedNode = e.node;
    graph.setNodeAttribute(draggedNode, "highlighted", true);
  });

  sigma.getMouseCaptor().on("mousemovebody", (e) => {
    if (!isDragging || !draggedNode) return;
  
    // Get new position of node
    const pos = sigma.viewportToGraph(e);
  
    graph.setNodeAttribute(draggedNode, "x", pos.x);
    graph.setNodeAttribute(draggedNode, "y", pos.y);
  
    // Prevent sigma to move camera:
    e.enableCamera('false');
    e.preventSigmaDefault();
    e.original.preventDefault();
    e.original.stopPropagation();
    
  });
  
  // On mouse up, we reset the autoscale and the dragging mode
  sigma.getMouseCaptor().on("mouseup", () => {
    if (draggedNode) {
      graph.removeNodeAttribute(draggedNode, "highlighted");
    }
    isDragging = false;
    draggedNode = null;
  }); 
  
  // Disable the autoscale at the first down interaction
  sigma.getMouseCaptor().on("mousedown", () => {
    if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
  });
  
//FINE D&D


  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      /* clickEdge({ edge }) {
        if (!graph.getNodeAttribute(node, "hidden")) {
          window.open(graph.getNodeAttribute(node, "URL"), "_blank");
        } 
      },   */
      enterNode({ node }) {
        setHoveredNode(node);
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
      },
      leaveNode() {
        setHoveredNode(null);
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.remove("mouse-pointer");
      }
    });
  }, []);

  return <>{children}</>;
};

export default GraphEventsController;
