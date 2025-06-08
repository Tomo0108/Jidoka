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
} from 'reactflow';
import { SmartEdge } from '@tisoap/react-flow-smart-edge';
import { Button } from '@/components/ui/button';

import useFlowStore, { RFState } from '@/hooks/useFlowStore';
import DashedEdge from '@/components/edges/DashedEdge';

// Import custom nodes
import RectangleNode from './nodes/RectangleNode';
import DiamondNode from './nodes/DiamondNode';
import ParallelogramNode from './nodes/ParallelogramNode';
import StartEndNode from './nodes/StartEndNode';
import CustomNode from './CustomNode'; // 既存のものを維持

import 'reactflow/dist/style.css';

// Define custom node and edge types
const nodeTypes = {
  rectangle: RectangleNode,
  diamond: DiamondNode,
  parallelogram: ParallelogramNode,
  startEnd: StartEndNode,
  custom: CustomNode, // 既存のものを維持
};

export const edgeTypes = {
  default: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
  smart: SmartEdge,
  dashed: DashedEdge,
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNode: state.addNode,
});

function FlowchartComponent() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useFlowStore(selector);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);


  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type) {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );
  
  // onAddNodeはヘルパー関数(addNode)を呼ぶように変更
  const handleAddNode = () => {
    //
    addNode('custom', { x: Math.random() * 250, y: Math.random() * 250 });
  }

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
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
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
      <div className="absolute top-4 left-4 z-10">
        <Button onClick={handleAddNode}>ノードを追加</Button>
      </div>
    </div>
  );
}

export function Flowchart() {
  return (
    <ReactFlowProvider>
      <FlowchartComponent />
    </ReactFlowProvider>
  );
} 