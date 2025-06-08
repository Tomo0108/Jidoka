"use client";

import { useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUp, Paperclip } from 'lucide-react';
import { CustomNodeData } from '@/lib/types';
import { cn } from '@/lib/utils';

const shapeWrapperStyles = {
  rectangle: 'p-4 rounded-md',
  diamond: 'p-4',
  parallelogram: 'p-4 transform -skew-x-12',
  startEnd: 'p-4 rounded-full',
  custom: 'p-4 rounded-lg',
};

const shapeContentStyles = {
  rectangle: '',
  diamond: 'text-center',
  parallelogram: 'transform skew-x-12',
  startEnd: 'text-center',
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
    "shadow-md bg-card border-2 border-primary text-foreground relative",
    {
      'w-48': shape === 'rectangle' || shape === 'parallelogram' || shape === 'startEnd',
      'w-40 h-40': shape === 'diamond',
      'w-64': shape === 'custom',
    }
  );

  return (
    <div className={containerClassName}>
      {shape === 'diamond' && (
        <div className="absolute inset-0 bg-card border-2 border-primary transform rotate-45 rounded-md -z-10"></div>
      )}
      
      <Handle type="target" position={Position.Top} className={cn("!bg-primary", { '!top-0 !left-1/2 -translate-x-1/2': shape === 'diamond' })} />
      <Handle type="source" position={Position.Bottom} className={cn("!bg-primary", { '!bottom-0 !left-1/2 -translate-x-1/2': shape === 'diamond' })} />
      {(shape === 'diamond' || shape === 'parallelogram') && (
        <>
          <Handle type="source" position={Position.Right} className={cn("!bg-primary", { '!right-0 !top-1/2 -translate-y-1/2': shape === 'diamond' })}/>
          <Handle type="target" position={Position.Left} className={cn("!bg-primary", { '!left-0 !top-1/2 -translate-y-1/2': shape === 'diamond' })}/>
        </>
      )}

      <div className={cn("flex flex-col h-full", shapeWrapperStyles[shape])}>
        <div className={cn("font-bold text-lg mb-2", shapeContentStyles[shape])}>
          {label}
        </div>
        <Textarea
          placeholder="詳細を記述..."
          className="nodrag bg-background/50 font-chat text-sm my-2 flex-grow"
          value={description || ''}
          onChange={onDescriptionChange}
        />
        <div className="mt-auto">
          <input 
            type="file" 
            id={`file-input-${id}`} 
            className="hidden" 
            onChange={onFileChange} 
          />
          <Button variant="ghost" size="sm" onClick={triggerFileInput} className="w-full justify-start">
            <FileUp className="h-4 w-4 mr-2" />
            ファイル
          </Button>
          {file && (
            <div className="flex items-center text-xs mt-1 text-muted-foreground truncate">
              <Paperclip className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{typeof file === 'string' ? file : file.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CustomNode); 