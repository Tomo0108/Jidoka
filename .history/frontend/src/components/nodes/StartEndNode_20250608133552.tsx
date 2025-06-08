"use client";

import { Handle, Position, NodeProps } from 'reactflow';
import { memo } from 'react';
import { CustomNodeData } from '@/lib/types';

const StartEndNode = ({ data }: NodeProps<CustomNodeData>) => {
  return (
    <div className="bg-white border-2 border-red-500 rounded-full p-4 w-48 text-center shadow-md">
      <Handle type="target" position={Position.Top} className="!bg-teal-500" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500" />
    </div>
  );
};

export default memo(StartEndNode); 