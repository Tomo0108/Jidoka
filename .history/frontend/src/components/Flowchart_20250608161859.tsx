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

function FlowchartCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Split selectors to return primitives/functions individually - this prevents infinite loop
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const onConnect = useFlowStore((state) => state.onConnect);
  const addNode = useFlowStore((state) => state.addNode);
  const setSelectedNodeId = useFlowStore((state) => state.setSelectedNodeId);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) {
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position.x, position.y);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

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
      <FlowchartCanvas />
    </ReactFlowProvider>
  );
} 