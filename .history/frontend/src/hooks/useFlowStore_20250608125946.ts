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
} from 'reactflow';
import { nanoid } from 'nanoid';

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  activeEdgeType: string;
  setActiveEdgeType: (edgeType: string) => void;
};

const useFlowStore = create<RFState>((set, get) => ({
  nodes: [
    {
      id: '1',
      type: 'startEnd',
      position: { x: 250, y: 50 },
      data: { label: 'Start' },
    },
  ],
  edges: [],
  activeEdgeType: 'default',
  
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
      edges: addEdge({ ...connection, type: get().activeEdgeType }, get().edges),
    });
  },

  addNode: (type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: nanoid(),
      type,
      position,
      data: { label: `${type} node` },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId: string, data: any) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  setActiveEdgeType: (edgeType: string) => {
    set({ activeEdgeType: edgeType });
  },
}));

export default useFlowStore;
