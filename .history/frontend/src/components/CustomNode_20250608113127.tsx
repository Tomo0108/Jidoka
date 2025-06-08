"use client";

import { useCallback, memo, useMemo } from 'react';
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
      padding: '16px',
      border: '1px solid #4a4a4a',
      background: '#2d2d2d',
      color: '#f0f0f0',
      width: '180px',
      minHeight: '80px',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    switch (data.shape) {
      case 'rectangle': // 処理
        return { ...baseStyle, borderRadius: '4px' };
      case 'diamond': // 判断・分岐
        return { ...baseStyle, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', background: '#3a5344' };
      case 'terminator': // 開始・終了
        return { ...baseStyle, borderRadius: '9999px', background: '#533a3a' };
      case 'parallelogram': // データ・入出力
        return { ...baseStyle, transform: 'skew(-20deg)' };
      case 'cylinder': // データベース
        return { ...baseStyle,
          background: '#4a4a4a',
          border: '1px solid #6a6a6a',
          borderRadius: '50% / 20%',
          clipPath: 'path("M0,10 A90,20 0 1,0 180,10 L180,70 A90,20 0 1,1 0,70 Z")'
        };
      case 'hexagon': // 準備
          return { ...baseStyle, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
      case 'subroutine': // 定義済み処理
          return { ...baseStyle, borderStyle: 'double', borderWidth: '3px' };
      default:
        return baseStyle;
    }
  }, [data.shape]);

  const innerContentStyle = useMemo(() => {
    const baseStyle = {
      width: '100%',
    };
    if (data.shape === 'parallelogram') {
      return { ...baseStyle, transform: 'skew(20deg)'};
    }
    return baseStyle;
  }, [data.shape]);

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <div style={innerContentStyle}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
      <Textarea
        placeholder="ここにタスクの詳細を記述..."
        className="nodrag bg-background/50 font-chat text-sm"
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
    </div>
  );
};

export default memo(CustomNode); 