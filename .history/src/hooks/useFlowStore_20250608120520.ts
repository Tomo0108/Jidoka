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
import { temporal, TemporalState } from 'zustand/middleware/temporal';
import { shallow } from 'zustand/shallow';
import { v4 as uuidv4 } from 'uuid';

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number; y: number }) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

const useFlowStore = create<FlowState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
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
      addNode: (type: string, position: { x: number; y: number }) => {
        const newNode: Node = {
          id: uuidv4(),
          type,
          position,
          data: { label: `${type} node` },
        };
        set({ nodes: [...get().nodes, newNode] });
      },
      setNodes: (nodes: Node[]) => {
        set({ nodes });
      },
      setEdges: (edges: Edge[]) => {
        set({ edges });
      },
    }),
    {
      partialize: (state) => {
        const { nodes, edges, ...rest } = state;
        return { nodes, edges };
      },
      equality: shallow,
    }
  )
);

export const useTemporalFlowStore = <T>(
  selector: (state: TemporalState<FlowState>) => T,
  equality?: (a: T, b: T) => boolean
) => useFlowStore(useFlowStore.temporal, selector, equality);

export default useFlowStore; 