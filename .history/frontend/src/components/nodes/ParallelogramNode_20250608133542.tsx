"use client";

import { Handle, Position, NodeProps } from 'reactflow';
import { memo } from 'react';
import { CustomNodeData } from '@/lib/types';

const ParallelogramNode = ({ data }: NodeProps<CustomNodeData>) => {
  return (
    <div className="bg-white border-2 border-yellow-500 p-4 w-48 text-center shadow-md transform -skew-x-12">
        <div className="transform skew-x-12">
            {data.label}
        </div>
      <Handle type="target" position={Position.Top} className="!bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500" />
      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
    </div>
  );
};

export default memo(ParallelogramNode); 