import { create } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
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
import { temporal, type TemporalState } from 'zundo';
import { nanoid } from 'nanoid';
import { CustomNodeData } from '@/lib/types';

export type NodeShape = 'rectangle' | 'diamond' | 'parallelogram' | 'startEnd' | 'custom' | 'predefinedProcess' | 'document';

export type RFState = {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  activeEdgeType: string;
  selectedNodeId: string | null;
  
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (shape: NodeShape, x: number, y: number) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  setFlow: (flow: { nodes: Node<CustomNodeData>[], edges: Edge[] }) => void;
  getActiveEdgeType: () => string;
  setActiveEdgeType: (edgeType: string) => void;
};

const useFlowStore = create(
  temporal<RFState>(
    (set, get) => ({
      nodes: [
        {
          id: '1',
          type: 'custom',
          position: { x: 250, y: 50 },
          data: { 
            id: '1',
            shape: 'startEnd',
            label: '開始',
            description: 'フローチャートの開始点',
            file: null,
            onChange: (data) => get().updateNodeData('1', data),
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
      addNode: (shape: NodeShape, x: number, y: number) => {
        const id = nanoid();
        const newNode: Node<CustomNodeData> = {
          id,
          type: 'custom',
          position: { x, y },
          data: {
            id,
            shape,
            label: '新しいノード',
            description: '',
            file: null,
            onChange: (data) => get().updateNodeData(id, data),
          },
        };
        set({ nodes: [...get().nodes, newNode] });
      },
      setSelectedNodeId: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },
    
      updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              const newNodeData = { ...node.data, ...data };
              const onChange = (newData: Partial<CustomNodeData>) => get().updateNodeData(nodeId, newData);
              return { ...node, data: { ...newNodeData, onChange } };
            }
            return node;
          }),
        });
      },
    
      setFlow: (flow: { nodes: Node<CustomNodeData>[], edges: Edge[] }) => {
        const { nodes, edges } = flow;
        const newNodes = nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onChange: (data: Partial<CustomNodeData>) => get().updateNodeData(node.id, data),
          },
        }));
        set({ nodes: newNodes, edges });
      },
    
      getActiveEdgeType: () => get().activeEdgeType,
    
      setActiveEdgeType: (edgeType: string) => {
        set({ activeEdgeType: edgeType });
      },
    }),
    {
      partialize: (state) => {
        const { activeEdgeType, ...rest } = state;
        return rest;
      },
    }
  )
);

export const useTemporalStore = <T,>(
  selector: (state: TemporalState<RFState>) => T,
  equality?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(useFlowStore.temporal, selector, equality);

export { useFlowStore };
