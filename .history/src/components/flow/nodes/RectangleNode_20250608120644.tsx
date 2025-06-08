import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';

const RectangleNode = ({ data }: NodeProps<{ label: string }>) => {
  return (
    <Card className="w-40 h-20 flex items-center justify-center">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <CardContent className="p-0">
        <p className="text-center text-sm">{data.label}</p>
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </Card>
  );
};

export default memo(RectangleNode); 