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
import CustomNode from './CustomNode';

import 'reactflow/dist/style.css';

const nodeTypes = { custom: CustomNode };

const initialNodes = [
  { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: { id: '1', label: '開始', description: '', file: null, onChange: () => {} } },
  { id: '2', type: 'custom', position: { x: 0, y: 250 }, data: { id: '2', label: 'ユーザーの指示を分析', description: '', file: null, onChange: () => {} } },
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
];

let id = 3;
const getId = () => `${id++}`;

export function Flowchart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeDataChange = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  
  const onAddNode = useCallback(() => {
    const newNodeId = getId();
    const newNode = {
      id: newNodeId,
      type: 'custom',
      data: {
        id: newNodeId,
        label: '新しいノード',
        description: '',
        file: null,
        onChange: (newData) => onNodeDataChange(newNodeId, newData),
      },
      position: {
        x: Math.random() * 250,
        y: Math.random() * 250,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, onNodeDataChange]);
  
  const nodesWithDataHandler = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      id: node.id,
      onChange: (newData) => onNodeDataChange(node.id, newData)
    }
  }));

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodesWithDataHandler}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
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