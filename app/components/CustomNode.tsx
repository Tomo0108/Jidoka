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
    const baseClasses = "flowchart-node min-w-[120px] min-h-[60px] flex items-center justify-center text-sm font-medium transition-all duration-200";
    
    switch (shape) {
      case 'rectangle':
        return cn(baseClasses, "rounded-md");
      case 'diamond':
        return cn(baseClasses, "transform rotate-45 w-16 h-16");
      case 'ellipse':
        return cn(baseClasses, "rounded-full");
      case 'parallelogram':
        return cn(baseClasses, "skew-x-12 rounded-sm");
      case 'trapezoid':
        return cn(baseClasses, "clip-path-trapezoid rounded-sm");
      case 'hexagon':
        return cn(baseClasses, "clip-path-hexagon");
      case 'circle':
        return cn(baseClasses, "rounded-full w-16 h-16");
      case 'triangle':
        return cn(baseClasses, "clip-path-triangle");
      default:
        return cn(baseClasses, "rounded-md");
    }
  };

  const getLabelClasses = () => {
    if (shape === 'diamond') {
      return "transform -rotate-45 text-xs";
    }
    if (shape === 'parallelogram') {
      return "-skew-x-12";
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