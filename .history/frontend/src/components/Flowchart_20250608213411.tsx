"use client";

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  Node,
  ReactFlowInstance,
  Panel,
} from 'reactflow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCcw, 
  Grid3X3, 
  Eye,
  EyeOff,
  Layers,
  MousePointer2,
  Move3D
} from 'lucide-react';

import { useFlowStore } from '@/hooks/useFlowStore';
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
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isInteractive, setIsInteractive] = useState(true);

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

  // ズーム操作
  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  const handleResetView = useCallback(() => {
    reactFlowInstance?.setViewport({ x: 0, y: 0, zoom: 1 });
  }, [reactFlowInstance]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#2C3E50]">
      {/* 改善されたツールバー */}
      <FlowchartToolbar />
      
      {/* フローチャートキャンバス */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="h-full w-full relative border border-slate-200 dark:border-slate-600 rounded-xl m-4 shadow-xl bg-white dark:bg-[#2C3E50] overflow-hidden"
          ref={reactFlowWrapper}
        >
          <ReactFlow
            id="flowchart-canvas"
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
              style: { 
                strokeWidth: 2.5, 
                stroke: '#7F8C8D', // グラファイトグレー
                strokeDasharray: '0'
              },
              type: 'step',
              markerEnd: {
                type: 'arrowclosed',
                color: '#7F8C8D',
                width: 18,
                height: 18,
              },
              animated: false,
            }}
            fitView
            attributionPosition="bottom-left"
            nodesDraggable={isInteractive}
            nodesConnectable={isInteractive}
            elementsSelectable={isInteractive}
            panOnDrag={isInteractive}
            zoomOnScroll={isInteractive}
            zoomOnPinch={isInteractive}
            zoomOnDoubleClick={isInteractive}
          >
            {/* 浮遊コントロールパネル */}
            <Panel position="top-right" className="m-6">
              <div className="bg-white/90 dark:bg-[#2C3E50]/90 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-xl p-3">
                <div className="flex flex-col gap-3">
                  {/* ズームコントロール */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFitView}
                      className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetView}
                      className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="h-px bg-slate-200 dark:bg-slate-600" />
                  
                  {/* 表示オプション */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={showGrid ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                      className="h-9 w-9 p-0 rounded-lg"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={showMiniMap ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowMiniMap(!showMiniMap)}
                      className="h-9 w-9 p-0 rounded-lg"
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isInteractive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setIsInteractive(!isInteractive)}
                      className="h-9 w-9 p-0 rounded-lg"
                    >
                      {isInteractive ? <MousePointer2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>

            {/* エレガントなステータスパネル */}
            <Panel position="bottom-right" className="m-6">
              <div className="bg-white/90 dark:bg-[#2C3E50]/90 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-xl px-4 py-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3498DB]"></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{nodes.length} ノード</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#7F8C8D]"></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{edges.length} 接続</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isInteractive ? 'bg-green-100 dark:bg-green-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {isInteractive ? <MousePointer2 className="h-3 w-3 text-green-600 dark:text-green-400" /> : <Eye className="h-3 w-3 text-slate-500" />}
                    <span className={`text-xs font-medium ${isInteractive ? 'text-green-700 dark:text-green-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {isInteractive ? "編集中" : "表示のみ"}
                    </span>
                  </div>
                </div>
              </div>
            </Panel>

            {/* 条件付きコンポーネント */}
            <Controls 
              className="!bg-white/95 dark:!bg-slate-950/95 !border-border/50 !shadow-lg"
              showZoom={false}
              showFitView={false}
              showInteractive={false}
            />
            
            {showMiniMap && (
              <MiniMap 
                className="!bg-white/95 dark:!bg-slate-950/95 !border-border/50 !shadow-lg"
                nodeColor="#6366f1"
                maskColor="rgba(99, 102, 241, 0.1)"
                pannable
                zoomable
              />
            )}
            
            {showGrid && (
              <Background 
                variant="dots" 
                gap={20} 
                size={1.5} 
                color="#e2e8f0"
                className="dark:!bg-slate-900"
              />
            )}
          </ReactFlow>
        </div>
      </div>
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