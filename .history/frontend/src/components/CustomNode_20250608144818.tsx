"use client";

import { useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUp, Paperclip } from 'lucide-react';
import { CustomNodeData } from '@/lib/types';
import { cn } from '@/lib/utils';

const shapeStyles = {
  rectangle: 'rounded-md w-48',
  diamond: 'w-40 h-40',
  parallelogram: 'w-48 transform -skew-x-12',
  startEnd: 'rounded-full w-48',
  custom: 'rounded-lg w-64',
};

const shapeLabelStyles = {
  rectangle: '',
  diamond: 'absolute inset-0 flex items-center justify-center text-center',
  parallelogram: 'transform skew-x-12',
  startEnd: '',
  custom: '',
}

const CustomNode = ({ id, data }: NodeProps<CustomNodeData>) => {
  const { shape, label, description, file, onChange } = data;

  const onDescriptionChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, id, description: evt.target.value });
  }, [id, data, onChange]);

  const onFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files && evt.target.files[0]) {
      onChange({ ...data, id, file: evt.target.files[0] });
    }
  }, [id, data, onChange]);

  const triggerFileInput = () => {
    document.getElementById(`file-input-${id}`)?.click();
  };

  const containerClassName = cn(
    "p-4 shadow-md",
    "bg-card border-2 border-primary text-foreground",
    shapeStyles[shape]
  );
  
  const labelContainerClassName = cn(
    shapeLabelStyles[shape]
  );

  return (
    <div className={containerClassName}>
       {shape === 'diamond' && <div className="absolute inset-0 bg-card border-2 border-primary transform rotate-45 rounded-md -z-10"></div>}
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className={labelContainerClassName}>{label}</div>
      <Textarea
        placeholder="ここにタスクの詳細を記述..."
        className="nodrag bg-background/50 font-chat text-sm my-2"
        value={description || ''}
        onChange={onDescriptionChange}
      />
      <div className="mt-2">
        <input 
          type="file" 
          id={`file-input-${id}`} 
          className="hidden" 
          onChange={onFileChange} 
        />
        <Button variant="ghost" size="sm" onClick={triggerFileInput}>
          <FileUp className="h-4 w-4 mr-2" />
          ファイルを選択
        </Button>
        {file && (
          <div className="flex items-center text-xs mt-1 text-muted-foreground">
            <Paperclip className="h-3 w-3 mr-1" />
            <span>{typeof file === 'string' ? file : file.name}</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
       { (shape === 'diamond' || shape === 'parallelogram') && (
        <>
            <Handle type="source" position={Position.Right} className="!bg-primary" />
            <Handle type="target" position={Position.Left} className="!bg-primary" />
        </>
       )}
    </div>
  );
};

export default memo(CustomNode); 