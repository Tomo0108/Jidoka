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
import { 
  CustomNodeData, 
  CustomEdgeData, 
  NodeShape, 
  FlowchartMetadata,
  ValidationError,
  FlowchartStatistics
} from '@/lib/types';
import { FlowchartValidator } from '@/lib/validationUtils';

export type RFState = {
  nodes: Node<CustomNodeData>[];
  edges: Edge<CustomEdgeData>[];
  activeEdgeType: string;
  selectedNodeId: string | null;
  
  // プロジェクト管理
  currentProjectId: number | null;
  
  // メタデータ
  metadata: FlowchartMetadata;
  
  // バリデーション
  validationErrors: ValidationError[];
  isValidationEnabled: boolean;
  
  // UI状態
  isLoading: boolean;
  
  // アクション
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (shape: NodeShape, x: number, y: number) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  updateEdgeData: (edgeId: string, data: Partial<CustomEdgeData>) => void;
  setFlow: (flow: { nodes: Node<CustomNodeData>[], edges: Edge<CustomEdgeData>[] }) => void;
  getActiveEdgeType: () => string;
  setActiveEdgeType: (edgeType: string) => void;
  
  // メタデータ操作
  updateMetadata: (metadata: Partial<FlowchartMetadata>) => void;
  
  // バリデーション操作
  validateFlowchart: () => void;
  toggleValidation: () => void;
  clearValidationErrors: () => void;
  
  // 統計情報取得
  getStatistics: () => FlowchartStatistics;
  
  // リセット
  resetFlowchart: () => void;
  
  // プロジェクト管理
  setCurrentProject: (projectId: number | null) => void;
  loadProjectFlow: (projectId: number) => void;
  saveProjectFlow: (projectId: number) => void;
};

const initialMetadata: FlowchartMetadata = {
  id: nanoid(),
  title: '新しいフローチャート',
  description: '',
  version: '1.0.0',
  author: 'ユーザー',
  lastModified: new Date(),
  tags: [],
  department: '',
  approvalStatus: 'draft'
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
            businessAttributes: {
              priority: 'medium',
              status: 'draft'
            },
            onChange: (data) => get().updateNodeData('1', data),
          },
        },
      ],
      edges: [],
      activeEdgeType: 'step',
      selectedNodeId: null,
      currentProjectId: null,
      metadata: initialMetadata,
      validationErrors: [],
      isValidationEnabled: true,
      isLoading: false,
      
      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
        
        // リアルタイムバリデーション
        if (get().isValidationEnabled) {
          const { nodes, edges } = get();
          const errors = FlowchartValidator.validateRealtime(nodes, edges);
          set({ validationErrors: errors });
        }
        
        // メタデータの更新
        get().updateMetadata({ lastModified: new Date() });
      },
      
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
        
        // リアルタイムバリデーション
        if (get().isValidationEnabled) {
          const { nodes, edges } = get();
          const errors = FlowchartValidator.validateRealtime(nodes, edges);
          set({ validationErrors: errors });
        }
        
        // メタデータの更新
        get().updateMetadata({ lastModified: new Date() });
      },
      
      onConnect: (connection: Connection) => {
        const newEdge: Edge<CustomEdgeData> = {
          ...connection,
          id: nanoid(),
          type: get().activeEdgeType,
          data: {
            id: nanoid(),
            label: '',
            condition: '',
            description: ''
          }
        };
        
        set({
          edges: addEdge(newEdge, get().edges),
        });
        
        // メタデータの更新
        get().updateMetadata({ lastModified: new Date() });
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
            businessAttributes: {
              priority: 'medium',
              status: 'draft'
            },
            onChange: (data) => get().updateNodeData(id, data),
          },
        };
        set({ nodes: [...get().nodes, newNode] });
        
        // メタデータの更新
        get().updateMetadata({ lastModified: new Date() });
      },
      
      setSelectedNodeId: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },
    
      updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              const newNodeData = { ...node.data, ...data };
              const onChange = node.data.onChange || ((newData: Partial<CustomNodeData>) => get().updateNodeData(nodeId, newData));
              return { ...node, data: { ...newNodeData, onChange } };
            }
            return node;
          }),
        });
        
        // メタデータの更新
        get().updateMetadata({ lastModified: new Date() });
      },
      
      updateEdgeData: (edgeId: string, data: Partial<CustomEdgeData>) => {
        set({
          edges: get().edges.map((edge) => {
            if (edge.id === edgeId) {
              return { ...edge, data: { ...edge.data, ...data } };
            }
            return edge;
          }),
        });
        
        // メタデータの更新
        get().updateMetadata({ lastModified: new Date() });
      },
    
      setFlow: (flow: { nodes: Node<CustomNodeData>[], edges: Edge<CustomEdgeData>[] }) => {
        const { nodes, edges } = flow;
        const newNodes = nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onChange: (data: Partial<CustomNodeData>) => get().updateNodeData(node.id, data),
          },
        }));
        set({ nodes: newNodes, edges });
        
        // バリデーション実行
        if (get().isValidationEnabled) {
          const errors = FlowchartValidator.validateFlowchart(newNodes, edges);
          set({ validationErrors: errors });
        }
        
        // メタデータの更新
        get().updateMetadata({ lastModified: new Date() });
      },
    
      getActiveEdgeType: () => get().activeEdgeType,
    
      setActiveEdgeType: (edgeType: string) => {
        set({ activeEdgeType: edgeType });
      },
      
      updateMetadata: (metadata: Partial<FlowchartMetadata>) => {
        set({
          metadata: { ...get().metadata, ...metadata }
        });
      },
      
      validateFlowchart: () => {
        const { nodes, edges } = get();
        const errors = FlowchartValidator.validateFlowchart(nodes, edges);
        set({ validationErrors: errors });
      },
      
      toggleValidation: () => {
        const newState = !get().isValidationEnabled;
        set({ isValidationEnabled: newState });
        
        if (newState) {
          get().validateFlowchart();
        } else {
          set({ validationErrors: [] });
        }
      },
      
      clearValidationErrors: () => {
        set({ validationErrors: [] });
      },
      
      getStatistics: (): FlowchartStatistics => {
        const { nodes, edges } = get();
        
        const nodesByType = nodes.reduce((acc, node) => {
          acc[node.data.shape] = (acc[node.data.shape] || 0) + 1;
          return acc;
        }, {} as Record<NodeShape, number>);
        
        const estimatedTotalTime = nodes.reduce((total, node) => {
          return total + (node.data.businessAttributes?.estimatedTime || 0);
        }, 0);
        
        const completedNodes = nodes.filter(n => 
          n.data.businessAttributes?.status === 'completed'
        ).length;
        const completionRate = nodes.length > 0 ? (completedNodes / nodes.length) * 100 : 0;
        
        return {
          totalNodes: nodes.length,
          nodesByType,
          totalEdges: edges.length,
          estimatedTotalTime,
          completionRate,
          criticalPath: [] // TODO: クリティカルパス分析を実装
        };
      },
      
      resetFlowchart: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          metadata: { ...initialMetadata, id: nanoid(), lastModified: new Date() },
          validationErrors: []
        });
      }
    }),
    {
      partialize: (state) => {
        const { activeEdgeType, isLoading, ...rest } = state;
        return rest;
      },
    }
  )
);

export const useTemporalStore = <T,>(
  selector: (state: TemporalState<RFState>) => T,
  equality?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(useFlowStore.temporal, selector, equality);

// 型エクスポート
export type { NodeShape };

export { useFlowStore };
