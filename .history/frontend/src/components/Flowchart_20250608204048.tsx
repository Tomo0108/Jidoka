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
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 改善されたツールバー */}
      <FlowchartToolbar />
      
      {/* フローチャートキャンバス */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="h-full w-full relative border border-border/50 rounded-lg m-2 shadow-lg bg-white dark:bg-slate-950"
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
                strokeWidth: 2, 
                stroke: '#6366f1',
                strokeDasharray: '0'
              },
              type: 'step',
              markerEnd: {
                type: 'arrowclosed',
                color: '#6366f1',
                width: 20,
                height: 20,
              },
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
            {/* カスタムコントロールパネル */}
            <Panel position="top-right" className="m-4">
              <Card className="p-2 shadow-lg border-border/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
                <div className="flex flex-col gap-2">
                  {/* ズームコントロール */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFitView}
                      className="h-8 w-8 p-0"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetView}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  {/* 表示オプション */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={showGrid ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={showMiniMap ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowMiniMap(!showMiniMap)}
                      className="h-8 w-8 p-0"
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isInteractive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setIsInteractive(!isInteractive)}
                      className="h-8 w-8 p-0"
                    >
                      {isInteractive ? <MousePointer2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </Card>
            </Panel>

            {/* ステータスパネル */}
            <Panel position="bottom-right" className="m-4">
              <Card className="p-3 shadow-lg border-border/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <Move3D className="h-3 w-3" />
                    {nodes.length} ノード
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Layers className="h-3 w-3" />
                    {edges.length} 接続
                  </Badge>
                  <Badge variant={isInteractive ? "default" : "secondary"} className="gap-1">
                    {isInteractive ? <MousePointer2 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {isInteractive ? "編集モード" : "表示モード"}
                  </Badge>
                </div>
              </Card>
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