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
import { CustomNodeData } from '@/lib/types';

export type NodeShape = 'rectangle' | 'diamond' | 'parallelogram' | 'startEnd' | 'custom';

export type RFState = {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (shape: NodeShape, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  setFlow: (nodes: Node<CustomNodeData>[], edges: Edge[]) => void;
  activeEdgeType: string;
  setActiveEdgeType: (edgeType: string) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;
};

const useFlowStore = create<RFState>((set, get) => ({
  nodes: [
    {
      id: '1',
      type: 'custom',
      position: { x: 250, y: 50 },
      data: { 
        id: '1',
        shape: 'startEnd',
        label: '開始',
        description: '',
        file: null,
        onChange: (newData) => get().updateNodeData('1', newData),
      },
    },
  ],
  edges: [],
  activeEdgeType: 'step',
  selectedNodeId: null,
  
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

  addNode: (shape: NodeShape, position: { x: number; y: number }) => {
    const newNodeId = nanoid();
    const newNode: Node<CustomNodeData> = {
      id: newNodeId,
      type: 'custom',
      position,
      data: {
        id: newNodeId,
        shape: shape,
        label: `${shape.charAt(0).toUpperCase() + shape.slice(1)}`,
        description: '',
        file: null,
        onChange: (newData) => get().updateNodeData(newNodeId, newData),
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  setFlow: (nodes: Node<CustomNodeData>[], edges: Edge[]) => {
    set({ nodes, edges });
  },

  setActiveEdgeType: (edgeType: string) => {
    set({ activeEdgeType: edgeType });
  },

  setSelectedNodeId: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },
}));

export default useFlowStore;
