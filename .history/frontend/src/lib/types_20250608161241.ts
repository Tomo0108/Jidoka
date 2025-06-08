import { Node, Edge } from 'reactflow';

// 基本的なノード形状の型定義
export type NodeShape = 
  | 'rectangle'         // 処理
  | 'diamond'          // 条件分岐
  | 'parallelogram'    // データ
  | 'startEnd'         // 開始/終了
  | 'predefinedProcess' // 定義済み処理
  | 'document'         // 書類
  | 'custom';          // カスタム

// 優先度レベル
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// ノードのステータス
export type NodeStatus = 'draft' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';

// 業務属性インターface
export interface BusinessAttributes {
  owner?: string;           // 責任者
  department?: string;      // 部署
  estimatedTime?: number;   // 想定時間（分）
  priority?: Priority;      // 優先度
  status?: NodeStatus;      // ステータス
  dueDate?: string;        // 期限
  tags?: string[];         // タグ
  notes?: string;          // 備考
}

// カスタムノードデータの型定義
export interface CustomNodeData {
  id: string;
  shape: NodeShape;
  label: string;
  description: string;
  file: File | string | null;
  
  // 業務フローチャート専用属性
  businessAttributes?: BusinessAttributes;
  
  // UI関連
  onChange: (data: Partial<CustomNodeData>) => void;
}

// カスタムエッジデータの型定義
export interface CustomEdgeData {
  id: string;
  label?: string;
  condition?: string;      // 条件分岐の場合の条件
  probability?: number;    // 発生確率（0-100）
  description?: string;    // エッジの説明
}

// フローチャート全体のメタデータ
export interface FlowchartMetadata {
  id: string;
  title: string;
  description?: string;
  version: string;
  author: string;
  lastModified: Date;
  tags?: string[];
  department?: string;
  approvalStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
  approver?: string;
  approvalDate?: Date;
}

// エクスポート形式
export type ExportFormat = 'pdf' | 'png' | 'svg' | 'json' | 'excel';

// バリデーションエラー
export interface ValidationError {
  id: string;
  type: 'warning' | 'error';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

// フローチャート全体の型定義
export interface FlowchartData {
  metadata: FlowchartMetadata;
  nodes: Node<CustomNodeData>[];
  edges: Edge<CustomEdgeData>[];
  validationErrors?: ValidationError[];
}

// 統計情報
export interface FlowchartStatistics {
  totalNodes: number;
  nodesByType: Record<NodeShape, number>;
  totalEdges: number;
  estimatedTotalTime: number;
  completionRate: number;
  criticalPath?: string[];
}

// テンプレート
export interface FlowchartTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  data: FlowchartData;
}

// 検索フィルター
export interface SearchFilter {
  query?: string;
  nodeTypes?: NodeShape[];
  priorities?: Priority[];
  statuses?: NodeStatus[];
  departments?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export type CustomNode = Node<CustomNodeData>;
export type CustomEdge = Edge<CustomEdgeData>; 