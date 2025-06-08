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
    const baseClasses = "flowchart-node min-w-[140px] min-h-[70px] flex items-center justify-center text-sm font-semibold transition-all duration-200 border-2 shadow-lg hover:shadow-xl";
    
    switch (shape) {
      case 'startEnd':
        return cn(baseClasses, "rounded-full bg-green-50 border-green-600 text-green-900 dark:bg-green-950/80 dark:text-green-100 dark:border-green-400 shadow-green-200/50 dark:shadow-green-800/30");
      case 'rectangle':
        return cn(baseClasses, "rounded-lg bg-blue-50 border-blue-600 text-blue-900 dark:bg-blue-950/80 dark:text-blue-100 dark:border-blue-400 shadow-blue-200/50 dark:shadow-blue-800/30");
      case 'diamond':
        return cn(baseClasses, "transform rotate-45 w-24 h-24 bg-amber-50 border-amber-600 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100 dark:border-amber-400 shadow-amber-200/50 dark:shadow-amber-800/30");
      case 'parallelogram':
        return cn(baseClasses, "transform skew-x-12 bg-purple-50 border-purple-600 text-purple-900 dark:bg-purple-950/80 dark:text-purple-100 dark:border-purple-400 shadow-purple-200/50 dark:shadow-purple-800/30");
      case 'predefinedProcess':
        return cn(baseClasses, "rounded-lg border-l-4 border-r-4 bg-orange-50 border-orange-600 text-orange-900 dark:bg-orange-950/80 dark:text-orange-100 dark:border-orange-400 shadow-orange-200/50 dark:shadow-orange-800/30");
      case 'document':
        return cn(baseClasses, "rounded-t-lg rounded-b-[50%] bg-slate-50 border-slate-600 text-slate-900 dark:bg-slate-950/80 dark:text-slate-100 dark:border-slate-400 shadow-slate-200/50 dark:shadow-slate-800/30");
      default:
        return cn(baseClasses, "rounded-lg bg-background border-accent text-accent-foreground");
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