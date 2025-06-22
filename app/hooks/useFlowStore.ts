import { create } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
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

// クリティカルパス分析関数
const getCriticalPath = (nodes: Node<CustomNodeData>[], edges: Edge<CustomEdgeData>[]): string[] => {
  if (nodes.length === 0) return [];
  
  // 開始ノードを探す
  const startNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );
  
  if (startNodes.length === 0) return [];
  
  // 最も時間がかかるパスを計算（簡易版）
  const visited = new Set<string>();
  const path: string[] = [];
  
  const dfs = (nodeId: string): number => {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    path.push(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return 0;
    
    const time = node.data.businessAttributes?.estimatedTime || 0;
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    
    if (outgoingEdges.length === 0) {
      return time;
    }
    
    const maxChildTime = Math.max(...outgoingEdges.map(edge => dfs(edge.target)));
    return time + maxChildTime;
  };
  
  // 各開始ノードから計算し、最も時間がかかるパスを選択
  let maxTime = 0;
  let criticalPath: string[] = [];
  
  startNodes.forEach(startNode => {
    visited.clear();
    const currentPath: string[] = [];
    const time = dfs(startNode.id);
    
    if (time > maxTime) {
      maxTime = time;
      criticalPath = [...currentPath];
    }
  });
  
  return criticalPath;
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
          source: String(connection.source),
          target: String(connection.target),
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
        const newEdges = edges.map(edge => ({
          ...edge,
          source: String(edge.source),
          target: String(edge.target),
          data: edge.data && edge.data.id ? {
            id: edge.data.id,
            label: edge.data.label || '',
            condition: edge.data.condition || '',
            probability: edge.data.probability ?? 0,
            description: edge.data.description || ''
          } : {
            id: nanoid(),
            label: '',
            condition: '',
            probability: 0,
            description: ''
          }
        }));
        set({ nodes: newNodes, edges: newEdges });
        if (get().isValidationEnabled) {
          const errors = FlowchartValidator.validateFlowchart(newNodes, newEdges);
          set({ validationErrors: errors });
        }
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
          criticalPath: getCriticalPath(nodes, edges)
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
      },

      // プロジェクト管理関数
      setCurrentProject: (projectId: number | null) => {
        set({ currentProjectId: projectId });
      },

      loadProjectFlow: (projectId: number) => {
        try {
          const stored = localStorage.getItem(`flowchart_project_${projectId}`);
          if (stored) {
            const data = JSON.parse(stored);
            get().setFlow(data);
            set({ 
              currentProjectId: projectId,
              metadata: data.metadata || { ...initialMetadata, id: nanoid() }
            });
          } else {
            // プロジェクト用の初期フローチャート
            get().resetFlowchart();
            set({ 
              currentProjectId: projectId,
              metadata: { 
                ...initialMetadata, 
                id: nanoid(),
                title: `プロジェクト ${projectId} のフローチャート`
              }
            });
          }
        } catch (error) {
          console.error('Failed to load project flow:', error);
          get().resetFlowchart();
          set({ currentProjectId: projectId });
        }
      },

      saveProjectFlow: (projectId: number) => {
        try {
          const { nodes, edges, metadata, validationErrors } = get();
          const data = { nodes, edges, metadata, validationErrors };
          localStorage.setItem(`flowchart_project_${projectId}`, JSON.stringify(data));
          get().updateMetadata({ lastModified: new Date() });
        } catch (error) {
          console.error('Failed to save project flow:', error);
        }
      }
    }),
    {
      partialize: (state) => state,
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
