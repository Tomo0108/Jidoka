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
    const baseClasses = "min-w-[120px] min-h-[60px] flex items-center justify-center text-sm font-medium transition-all duration-300 shadow-sm border-2";
    
    switch (shape) {
      case 'startEnd':
        // 開始/終了 - エメラルドグリーン #2ECC71
        return cn(baseClasses, "rounded-full", "bg-[#2ECC71]/10 border-[#2ECC71] text-[#2ECC71] dark:bg-[#2ECC71]/20 dark:text-[#2ECC71]");
      case 'rectangle':
        // 処理 - アズールブルー #3498DB
        return cn(baseClasses, "rounded-md", "bg-[#3498DB]/10 border-[#3498DB] text-[#3498DB] dark:bg-[#3498DB]/20 dark:text-[#3498DB]");
      case 'diamond':
        // 判断/分岐 - ブライトオレンジ #E67E22
        return cn(baseClasses, "transform rotate-45 w-20 h-20", "bg-[#E67E22]/10 border-[#E67E22] text-[#E67E22] dark:bg-[#E67E22]/20 dark:text-[#E67E22]");
      case 'parallelogram':
        // データ/入出力 - アメジストパープル #9B59B6
        return cn(baseClasses, "skew-x-12 rounded-sm", "bg-[#9B59B6]/10 border-[#9B59B6] text-[#9B59B6] dark:bg-[#9B59B6]/20 dark:text-[#9B59B6]");
      case 'predefinedProcess':
        // 定義済み処理 - アズールブルー（処理の変種）
        return cn(baseClasses, "rounded-md border-double border-4", "bg-[#3498DB]/10 border-[#3498DB] text-[#3498DB] dark:bg-[#3498DB]/20 dark:text-[#3498DB]");
      case 'document':
        // 書類/注釈 - サンフラワーイエロー #F1C40F
        return cn(baseClasses, "rounded-t-md", "bg-[#F1C40F]/10 border-[#F1C40F] text-[#F1C40F] dark:bg-[#F1C40F]/20 dark:text-[#F1C40F]");
      default:
        return cn(baseClasses, "rounded-md", "bg-[#3498DB]/10 border-[#3498DB] text-[#3498DB] dark:bg-[#3498DB]/20 dark:text-[#3498DB]");
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

  const getHandleColor = () => {
    switch (shape) {
      case 'startEnd':
        return "!bg-emerald-500 !border-emerald-600";
      case 'rectangle':
        return "!bg-blue-500 !border-blue-600";
      case 'diamond':
        return "!bg-orange-500 !border-orange-600";
      case 'parallelogram':
        return "!bg-purple-500 !border-purple-600";
      case 'predefinedProcess':
        return "!bg-teal-500 !border-teal-600";
      case 'document':
        return "!bg-slate-500 !border-slate-600";
      default:
        return "!bg-blue-500 !border-blue-600";
    }
  };

  return (
    <div className={cn(
      getShapeClasses(), 
      selected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-105",
      "hover:scale-105 hover:shadow-md"
    )}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn("!w-3 !h-3 !rounded-full !border-2", getHandleColor())}
      />
      
      <div className={cn("px-3 py-2 text-center break-words leading-tight", getLabelClasses())}>
        {label}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn("!w-3 !h-3 !rounded-full !border-2", getHandleColor())}
      />
    </div>
  );
};

export default memo(CustomNode); 