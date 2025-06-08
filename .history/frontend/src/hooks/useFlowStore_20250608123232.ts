'use client';

import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowInstance,
} from 'reactflow';
import { temporal } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'rectangle',
    position: { x: 250, y: 150 },
    data: { label: 'Start Here' },
  },
];

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Omit<Node, 'id'>) => void;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
};

const useFlowStore = create<FlowState>()(
  temporal(
    (set, get) => ({
      nodes: initialNodes,
      edges: [],
      reactFlowInstance: null,
      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },
      addNode: (node) => {
        const newNode = {
          id: uuidv4(),
          ...node,
        };
        set({
          nodes: [...get().nodes, newNode],
        });
      },
      setReactFlowInstance: (instance) => {
        set({ reactFlowInstance: instance });
      },
    }),
    {
      limit: 100, // Undo/Redoの履歴保持数
    }
  )
);

export const useTemporalStore = useFlowStore;

export default useFlowStore;
