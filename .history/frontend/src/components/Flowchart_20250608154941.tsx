"use client";

import React, { useCallback, useRef, DragEvent, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  Node,
  // Custom edge types
  StraightEdge,
  StepEdge,
  SmoothStepEdge,
  BezierEdge,
  ReactFlowInstance,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
// import { SmartEdge } from '@tisoap/react-flow-smart-edge';
import { Button } from '@/components/ui/button';

import { useFlowStore, RFState } from '@/hooks/useFlowStore';
import { shallow } from 'zustand/shallow';

// Import custom nodes
import CustomNode from '@/components/CustomNode';

import 'reactflow/dist/style.css';
import { NodeShape } from '@/hooks/useFlowStore';

// Define custom node and edge types
const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  // `dashed` edge type is now handled by React Flow's built-in styles
  // and does not require a custom component anymore.
};

export const Flowchart = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } = useFlowStore(
    (state: RFState) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      addNode: state.addNode,
      setSelectedNodeId: state.setSelectedNodeId,
    }),
    shallow
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const shape = event.dataTransfer.getData('application/reactflow-shape') as NodeShape;
      
      if (typeof shape === 'undefined' || !shape) {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      addNode(shape, position);
    },
    [reactFlowInstance, addNode]
  );
  
  // onAddNodeはヘルパー関数(addNode)を呼ぶように変更
  const handleAddNode = () => {
    //
    addNode('custom', { x: Math.random() * 250, y: Math.random() * 250 });
  }

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-background"
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export function Flowchart() {
  return (
    <ReactFlowProvider>
      <Flowchart />
    </ReactFlowProvider>
  );
} 