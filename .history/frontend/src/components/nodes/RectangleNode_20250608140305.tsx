"use client";

import { Handle, Position, NodeProps } from 'reactflow';
import { memo } from 'react';
import { CustomNodeData } from '@/lib/types';

const RectangleNode = ({ data }: NodeProps<CustomNodeData>) => {
  return (
    <div className="bg-card border-2 border-primary rounded-md p-4 w-48 text-center shadow-md text-foreground">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};

export default memo(RectangleNode); 