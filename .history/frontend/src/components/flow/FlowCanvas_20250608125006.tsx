"use client";

import React, { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow';
import useFlowStore from '@/hooks/useFlowStore';

import 'reactflow/dist/style.css';

// カスタムノードのインポート
import RectangleNode from './nodes/RectangleNode';
import DiamondNode from './nodes/DiamondNode';
import ParallelogramNode from './nodes/ParallelogramNode';
import StartEndNode from './nodes/StartEndNode';

const FlowCanvas = () => {
    const nodes = useFlowStore((state) => state.nodes);
    const edges = useFlowStore((state) => state.edges);
    const onNodesChange = useFlowStore((state) => state.onNodesChange);
    const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
    const onConnect = useFlowStore((state) => state.onConnect);
    const addNode = useFlowStore((state) => state.addNode);
    const reactFlowInstance = useFlowStore((state) => state.reactFlowInstance);
    const setReactFlowInstance = useFlowStore((state) => state.setReactFlowInstance);
    
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(
    () => ({
      rectangle: RectangleNode,
      diamond: DiamondNode,
      parallelogram: ParallelogramNode,
      startEnd: StartEndNode,
    }),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (
        typeof type === 'undefined' ||
        !type ||
        !reactFlowWrapper.current ||
        !reactFlowInstance
      ) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode({
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` },
      });
    },
    [reactFlowInstance, addNode]
  );

  return (
    <div className="flex-grow h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
};

const FlowCanvasWrapper = () => (
  <ReactFlowProvider>
    <FlowCanvas />
  </ReactFlowProvider>
);

export default FlowCanvasWrapper; 