"use client";

import { useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUp, Paperclip } from 'lucide-react';

export type CustomNodeData = {
  id: string;
  label: string;
  description: string;
  file: File | string | null;
  onChange: (data: Partial<CustomNodeData>) => void;
};

const CustomNode = ({ id, data }: NodeProps<CustomNodeData>) => {
  const onDescriptionChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.onChange({ ...data, id, description: evt.target.value });
  }, [id, data]);

  const onFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files && evt.target.files[0]) {
      data.onChange({ ...data, id, file: evt.target.files[0] });
    }
  }, [id, data]);

  const triggerFileInput = () => {
    document.getElementById(`file-input-${data.id}`)?.click();
  };

  return (
    <div className="p-4 border border-zinc-700 rounded-lg bg-secondary text-secondary-foreground shadow-md w-64">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <div className="font-bold text-base mb-2">{data.label}</div>
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
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  );
};

export default memo(CustomNode); 