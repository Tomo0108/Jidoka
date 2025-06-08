"use client";

import { memo, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUp, Paperclip } from 'lucide-react';

const CustomNode = ({ data }) => {
  const onDescriptionChange = useCallback((evt) => {
    data.onChange({ ...data, description: evt.target.value });
  }, [data]);

  const onFileChange = useCallback((evt) => {
    if (evt.target.files && evt.target.files[0]) {
      data.onChange({ ...data, file: evt.target.files[0] });
    }
  }, [data]);

  const triggerFileInput = () => {
    document.getElementById(`file-input-${data.id}`)?.click();
  };

  const nodeStyle = useMemo(() => {
    const baseStyle = {
      padding: '10px',
      border: '1px solid #4a4a4a',
      background: '#2d2d2d',
      color: '#f0f0f0',
      width: '256px', // w-64
      borderRadius: '0.5rem', // rounded-lg
    };

    switch (data.shape) {
      case 'diamond': // 判断・分岐
        return { 
          ...baseStyle, 
          width: '180px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', 
          background: '#3a5344',
          borderRadius: 0,
        };
      case 'terminator': // 開始・終了
        return { 
            ...baseStyle, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px', 
            background: '#533a3a',
            height: '60px',
        };
      case 'parallelogram': // データ・入出力
        return { 
            ...baseStyle, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'skew(-20deg)',
        };
      // 他の形状も同様にスタイルを調整できます
      default: // rectangle
        return baseStyle;
    }
  }, [data.shape]);
  
  const contentStyle = useMemo(() => {
    if (data.shape === 'parallelogram') {
      return { transform: 'skew(20deg)'};
    }
    return {};
  }, [data.shape]);

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <div style={contentStyle} className="nodrag">
          <div className="font-bold text-base mb-2 text-center">{data.label}</div>
          {data.shape !== 'terminator' && data.shape !== 'diamond' && (
            <>
              <Textarea
                placeholder="ここにタスクの詳細を記述..."
                className="bg-background/50 font-chat text-sm"
                value={data.description || ''}
                onChange={onDescriptionChange}
              />
              <div className="mt-2">
                <input 
                  type="file" 
                  id={`file-input-${data.id}`} 
                  className="hidden" 
                  onChange={onFileChange} 
                />
                <Button variant="ghost" size="sm" onClick={triggerFileInput}>
                  <FileUp className="h-4 w-4 mr-2" />
                  ファイルを選択
                </Button>
                {data.file && (
                  <div className="flex items-center text-xs mt-1 text-muted-foreground">
                    <Paperclip className="h-3 w-3 mr-1" />
                    <span>{typeof data.file === 'string' ? data.file : data.file.name}</span>
                  </div>
                )}
              </div>
            </>
          )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
};

export default memo(CustomNode); 