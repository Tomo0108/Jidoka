import { Node } from 'reactflow';

export interface CustomNodeData {
  id: string;
  shape: 'rectangle' | 'diamond' | 'parallelogram' | 'startEnd' | 'custom';
  label: string;
  description: string;
  file: File | string | null;
  onChange: (data: Partial<CustomNodeData>) => void;
}

export type CustomNode = Node<CustomNodeData>; 