"use client";

import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import { Button } from '@/components/ui/button';
import CustomNode, { CustomNodeData } from './CustomNode';

import 'reactflow/dist/style.css';

const nodeTypes = { custom: CustomNode };

let id = 3;
const getId = () => `${id++}`;

export function Flowchart() {
  const onNodeDataChange = useCallback((newData: Partial<CustomNodeData>) => {
    // This function will be defined inside Flowchart component to have access to setNodes
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);

  const onNodeDataChangeHandler = useCallback((newData: Partial<CustomNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === newData.id) {
            // when receiving new data, merge it with existing data
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        })
      );
    }, [setNodes]);

  const initialNodes: Node<CustomNodeData>[] = [
      { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: { id: '1', label: '開始', description: '', file: null, onChange: onNodeDataChangeHandler } },
      { id: '2', type: 'custom', position: { x: 0, y: 250 }, data: { id: '2', label: 'ユーザーの指示を分析', description: '', file: null, onChange: onNodeDataChangeHandler } },
    ];
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Set initial nodes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  
  const onAddNode = useCallback(() => {
    const newNodeId = getId();
    const newNode: Node<CustomNodeData> = {
      id: newNodeId,
      type: 'custom',
      data: {
        id: newNodeId,
        label: '新しいノード',
        description: '',
        file: null,
        onChange: onNodeDataChangeHandler,
      },
      position: {
        x: Math.random() * 250,
        y: Math.random() * 250,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, onNodeDataChangeHandler]);
  

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
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