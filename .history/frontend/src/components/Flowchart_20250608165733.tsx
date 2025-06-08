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
import { FlowchartToolbar } from '@/components/FlowchartToolbar';

// Import custom nodes
import CustomNode from '@/components/CustomNode';

import 'reactflow/dist/style.css';
import { NodeShape } from '@/lib/types';

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
  const [showStatistics, setShowStatistics] = useState(false);

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

      const type = event.dataTransfer.getData('application/reactflow-shape');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type as NodeShape, position.x, position.y);
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
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <FlowchartToolbar />
      
      {/* フローチャートキャンバス */}
      <div 
        className="flex-1 relative"
        ref={reactFlowWrapper}
      >
        <ReactFlow
          id="flowchart-canvas" // エクスポート用のID
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
          defaultEdgeOptions={{
            style: { strokeWidth: 2, stroke: '#94a3b8' },
            type: 'step',
            markerEnd: {
              type: 'arrowclosed',
              color: '#94a3b8',
            },
          }}
          fitView
          attributionPosition="top-right"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* 統計パネル（今後実装） */}
      {showStatistics && (
        <div className="absolute top-16 right-4 w-80 bg-background border rounded-lg shadow-lg p-4 z-10">
          <h3 className="font-semibold mb-2">統計情報</h3>
          <div className="space-y-2 text-sm">
            <div>総ノード数: {nodes.length}</div>
            <div>総エッジ数: {edges.length}</div>
            <div className="text-muted-foreground">
              ※詳細な統計機能は今後実装予定
            </div>
          </div>
        </div>
      )}
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