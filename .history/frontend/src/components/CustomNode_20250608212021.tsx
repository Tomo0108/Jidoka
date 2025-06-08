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
        // 開始/終了 - 落ち着いた緑系
        return cn(baseClasses, "rounded-full bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200");
      case 'rectangle':
        // 処理 - プロフェッショナルな青系
        return cn(baseClasses, "rounded-md bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200");
      case 'diamond':
        // 判断/分岐 - 注意を引くオレンジ系
        return cn(baseClasses, "transform rotate-45 w-20 h-20 bg-orange-50 border-orange-300 text-orange-800 dark:bg-orange-950 dark:border-orange-700 dark:text-orange-200");
      case 'parallelogram':
        // データ/入出力 - 落ち着いた紫系
        return cn(baseClasses, "skew-x-12 rounded-sm bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-950 dark:border-purple-700 dark:text-purple-200");
      case 'predefinedProcess':
        // 定義済み処理 - 信頼性のある青緑系
        return cn(baseClasses, "rounded-md bg-teal-50 border-teal-300 text-teal-800 dark:bg-teal-950 dark:border-teal-700 dark:text-teal-200");
      case 'document':
        // 書類 - ニュートラルなグレー系
        return cn(baseClasses, "rounded-t-md bg-slate-50 border-slate-300 text-slate-800 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200");
      default:
        return cn(baseClasses, "rounded-md bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200");
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