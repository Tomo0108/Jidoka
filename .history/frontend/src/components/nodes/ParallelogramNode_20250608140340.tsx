"use client";

import { Handle, Position, NodeProps } from 'reactflow';
import { memo } from 'react';
import { CustomNodeData } from '@/lib/types';

const ParallelogramNode = ({ data }: NodeProps<CustomNodeData>) => {
  return (
    <div className="bg-card border-2 border-primary p-4 w-48 text-center shadow-md transform -skew-x-12 text-foreground">
        <div className="transform skew-x-12">
            {data.label}
        </div>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
};

export default memo(ParallelogramNode); 