"use client";

import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import { Button } from '@/components/ui/button';

import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '開始' }, type: 'input' },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'ユーザーの指示を分析' } },
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
];

let id = 3;
const getId = () => `${id++}`;

export function Flowchart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState(null);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onAddNode = useCallback(() => {
    const newNode = {
      id: getId(),
      data: { label: '新しいノード' },
      position: {
        x: Math.random() * 250,
        y: Math.random() * 250,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
      <div className="absolute top-4 left-4 z-10">
        <Button onClick={onAddNode}>ノードを追加</Button>
      </div>
    </div>
  );
} 