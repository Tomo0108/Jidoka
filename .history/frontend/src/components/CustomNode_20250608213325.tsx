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

const shapeConfig = {
  startEnd: {
    color: '#2ECC71',
    bgColor: 'bg-white dark:bg-[#2C3E50]',
    borderColor: 'border-[#2ECC71]',
    textColor: 'text-[#2ECC71]',
    shape: 'rounded-full',
    shadow: 'shadow-[#2ECC71]/20'
  },
  rectangle: {
    color: '#3498DB',
    bgColor: 'bg-white dark:bg-[#2C3E50]',
    borderColor: 'border-[#3498DB]',
    textColor: 'text-[#3498DB]',
    shape: 'rounded-lg',
    shadow: 'shadow-[#3498DB]/20'
  },
  diamond: {
    color: '#E67E22',
    bgColor: 'bg-white dark:bg-[#2C3E50]',
    borderColor: 'border-[#E67E22]',
    textColor: 'text-[#E67E22]',
    shape: 'transform rotate-45',
    shadow: 'shadow-[#E67E22]/20'
  },
  parallelogram: {
    color: '#9B59B6',
    bgColor: 'bg-white dark:bg-[#2C3E50]',
    borderColor: 'border-[#9B59B6]',
    textColor: 'text-[#9B59B6]',
    shape: 'skew-x-12 rounded-md',
    shadow: 'shadow-[#9B59B6]/20'
  },
  predefinedProcess: {
    color: '#3498DB',
    bgColor: 'bg-white dark:bg-[#2C3E50]',
    borderColor: 'border-[#3498DB]',
    textColor: 'text-[#3498DB]',
    shape: 'rounded-lg',
    shadow: 'shadow-[#3498DB]/20'
  },
  document: {
    color: '#F1C40F',
    bgColor: 'bg-white dark:bg-[#2C3E50]',
    borderColor: 'border-[#F1C40F]',
    textColor: 'text-[#F1C40F]',
    shape: 'rounded-t-lg',
    shadow: 'shadow-[#F1C40F]/20'
  }
};

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const { label, shape } = data;
  const config = shapeConfig[shape] || shapeConfig.rectangle;

  const getNodeClasses = () => {
    const baseClasses = "relative min-w-[140px] min-h-[70px] flex items-center justify-center transition-all duration-300 border-2 cursor-pointer group";
    
    let specificClasses = "";
    
    if (shape === 'diamond') {
      specificClasses = "w-20 h-20 transform rotate-45";
    } else if (shape === 'predefinedProcess') {
      specificClasses = "border-double border-4";
    }
    
    return cn(
      baseClasses,
      config.bgColor,
      config.borderColor,
      config.shape,
      specificClasses,
      selected && "ring-2 ring-offset-2 ring-[#3498DB] scale-105",
      "hover:scale-105 hover:shadow-lg",
      config.shadow
    );
  };

  const getLabelClasses = () => {
    let transformClasses = "";
    
    if (shape === 'diamond') {
      transformClasses = "transform -rotate-45 text-xs";
    } else if (shape === 'parallelogram') {
      transformClasses = "-skew-x-12";
    }
    
    return cn(
      "px-4 py-2 text-center break-words font-medium leading-tight",
      config.textColor,
      transformClasses
    );
  };

  const getHandleStyle = () => ({
    backgroundColor: config.color,
    borderColor: config.color,
    width: '10px',
    height: '10px',
    border: '2px solid',
    opacity: 0.7
  });

  return (
    <div className={getNodeClasses()}>
      {/* 背景装飾 */}
      <div 
        className="absolute inset-0 rounded-lg opacity-5 pointer-events-none"
        style={{ backgroundColor: config.color }}
      />
      
      {/* トップハンドル */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-transparent !border-0 transition-opacity duration-200 hover:!opacity-100"
        style={getHandleStyle()}
      />
      
      {/* メインコンテンツ */}
      <div className={getLabelClasses()}>
        {label}
      </div>
      
      {/* ボトムハンドル */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-transparent !border-0 transition-opacity duration-200 hover:!opacity-100"
        style={getHandleStyle()}
      />
      
      {/* ホバー効果の装飾 */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: config.color }}
      />
    </div>
  );
};

export default memo(CustomNode); 