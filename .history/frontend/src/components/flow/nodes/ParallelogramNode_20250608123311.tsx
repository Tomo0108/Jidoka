import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';

interface NodeData {
  label: string;
}

const ParallelogramNode = ({ data }: NodeProps<NodeData>) => {
  return (
    <Card className="w-48 h-20 flex items-center justify-center text-center transform -skew-x-12">
      <Handle type="target" position={Position.Top} className="!bg-teal-500 !-skew-x-0" />
      <Handle type="target" position={Position.Left} className="!bg-teal-500 !-skew-x-0" />
      <CardContent className="p-2 transform skew-x-12">
        <p>{data.label}</p>
      </CardContent>
      <Handle type="source" position={Position.Right} className="!bg-teal-500 !-skew-x-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !-skew-x-0" />
    </Card>
  );
};

export default memo(ParallelogramNode); 