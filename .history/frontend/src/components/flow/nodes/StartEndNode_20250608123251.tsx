import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';

interface NodeData {
  label: string;
}

const StartEndNode = ({ data }: NodeProps<NodeData>) => {
  return (
    <Card className="w-40 h-20 rounded-full flex items-center justify-center text-center">
      <Handle type="target" position={Position.Top} className="!bg-teal-500" />
      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <CardContent className="p-2">
        <p>{data.label}</p>
      </CardContent>
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500" />
    </Card>
  );
};

export default memo(StartEndNode); 