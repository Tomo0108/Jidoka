"use client";

import React, { useCallback, useState, useRef } from 'react';
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
import { FlowchartSidebar } from './FlowchartSidebar';
import CustomNode from './CustomNode';

import 'reactflow/dist/style.css';

const nodeTypes = { custom: CustomNode };

const initialNodes = [
  { id: '1', type: 'custom', position: { x: 250, y: 5 }, data: { id: '1', label: '開始', shape: 'terminator', onChange: () => {} } },
];
const initialEdges = [];

let id = 2;
const getId = () => `${id++}`;

export function Flowchart() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeInfo = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      const { nodeType, shape } = nodeInfo;

      // check if the dropped element is valid
      if (typeof nodeType === 'undefined' || !nodeType) {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNodeId = getId();
      const newNode = {
        id: newNodeId,
        type: nodeType,
        position,
        data: { 
          id: newNodeId, 
          label: `${shape} node`, 
          shape: shape,
          onChange: (newData) => onNodeDataChange(newNodeId, newData),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, onNodeDataChange]
  );
  
  const nodesWithDataHandler = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      id: node.id,
      onChange: (newData) => onNodeDataChange(node.id, newData)
    }
  }));

  return (
    <div className="flex h-full w-full">
      <div className="flex-grow h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodesWithDataHandler}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
      <div className="w-80 p-4 border-l border-zinc-700 bg-background">
        <FlowchartSidebar />
      </div>
    </div>
  );
} 