"use client";

import { Handle, Position, NodeProps } from 'reactflow';
import { memo } from 'react';
import { CustomNodeData } from '@/lib/types';

const DiamondNode = ({ data }: NodeProps<CustomNodeData>) => {
  return (
    <div className="relative w-40 h-40">
      <div className="absolute inset-0 bg-white border-2 border-green-500 transform rotate-45 rounded-md shadow-md"></div>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} className="!top-0 !left-1/2 -translate-x-1/2 !bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!right-0 !top-1/2 -translate-y-1/2 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="!bottom-0 !left-1/2 -translate-x-1/2 !bg-teal-500" />
      <Handle type="target" position={Position.Left} className="!left-0 !top-1/2 -translate-y-1/2 !bg-teal-500" />
    </div>
  );
};

export default memo(DiamondNode); 