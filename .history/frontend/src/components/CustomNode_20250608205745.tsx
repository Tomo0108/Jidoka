"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { NodeShape } from '@/lib/types';

interface CustomNodeData {
  label: string;
  shape: NodeShape;
  selected?: boolean;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const { label, shape } = data;

  const getShapeClasses = () => {
    const baseClasses = "flowchart-node min-w-[120px] min-h-[60px] flex items-center justify-center text-sm font-medium transition-all duration-200 border-2 bg-background";
    
    switch (shape) {
      case 'startEnd':
        return cn(baseClasses, "rounded-full bg-green-50 border-green-500 text-green-800 dark:bg-green-950 dark:text-green-200");
      case 'rectangle':
        return cn(baseClasses, "rounded-md bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950 dark:text-blue-200");
      case 'diamond':
        return cn(baseClasses, "transform rotate-45 w-20 h-20 bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200");
      case 'parallelogram':
        return cn(baseClasses, "transform skew-x-12 bg-purple-50 border-purple-500 text-purple-800 dark:bg-purple-950 dark:text-purple-200");
      case 'predefinedProcess':
        return cn(baseClasses, "rounded-md border-l-4 border-r-4 bg-orange-50 border-orange-500 text-orange-800 dark:bg-orange-950 dark:text-orange-200");
      case 'document':
        return cn(baseClasses, "rounded-t-md rounded-b-[50%] bg-gray-50 border-gray-500 text-gray-800 dark:bg-gray-950 dark:text-gray-200");
      default:
        return cn(baseClasses, "rounded-md");
    }
  };

  const getLabelClasses = () => {
    if (shape === 'diamond') {
      return "transform -rotate-45 text-xs px-1";
    }
    if (shape === 'parallelogram') {
      return "transform -skew-x-12";
    }
    return "";
  };

  return (
    <div className={cn(getShapeClasses(), selected && "selected")}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-primary !border-primary-foreground !w-2 !h-2"
      />
      
      <div className={cn("px-2 py-1 text-center break-words", getLabelClasses())}>
        {label}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-primary !border-primary-foreground !w-2 !h-2"
      />
    </div>
  );
};

export default memo(CustomNode); 