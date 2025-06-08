"use client";

import { useCallback, memo, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUp, Paperclip, X } from 'lucide-react';
import { CustomNodeData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TextareaAutosize from 'react-textarea-autosize';

// Base styles for the node container
const containerBaseStyle = "shadow-md bg-card border-2 border-primary text-foreground relative flex items-center justify-center";

// Styles specific to each shape
const shapeStyles = {
  rectangle: "w-52 rounded-md",
  diamond: "w-40 h-40 bg-transparent border-none",
  parallelogram: "w-52 transform -skew-x-12",
  startEnd: "w-48 rounded-full",
  predefinedProcess: "w-52", // Will have inner borders
  document: "w-52", // Will have a wave shape at the bottom
  custom: "w-64 rounded-lg",
};

// Styles for the inner content wrapper
const contentWrapperBaseStyle = "p-3 flex flex-col w-full";
const contentShapeStyles = {
  rectangle: "",
  diamond: "text-center",
  parallelogram: "transform skew-x-12",
  startEnd: "text-center",
  predefinedProcess: "px-6", // Extra padding for inner borders
  document: "",
  custom: "",
}

const CustomNode = ({ id, data }: NodeProps<CustomNodeData>) => {
  const { shape, label, description, file, onChange } = data;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDataChange = useCallback((newData: Partial<CustomNodeData>) => {
    onChange({ ...data, id, ...newData });
  }, [id, data, onChange]);

  const onFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files && evt.target.files[0]) {
      handleDataChange({ file: evt.target.files[0] });
    }
  }, [handleDataChange]);

  const triggerFileInput = () => fileInputRef.current?.click();
  const removeFile = () => handleDataChange({ file: null });

  return (
    <TooltipProvider>
      <div className={cn(containerBaseStyle, shapeStyles[shape], "min-h-[6rem]")}>
        {/* Special background shapes */}
        {shape === 'diamond' && <div className="absolute inset-0 bg-card border-2 border-primary transform rotate-45 rounded-md -z-10"></div>}
        {shape === 'predefinedProcess' && (
          <>
            <div className="absolute top-0 left-0 h-full w-2 border-r-2 border-primary"></div>
            <div className="absolute top-0 right-0 h-full w-2 border-l-2 border-primary"></div>
          </>
        )}
        {shape === 'document' && (
           <svg className="absolute bottom-0 left-0 w-full h-4 text-primary" fill="currentColor" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,10 C25,0 75,20 100,10 L100,20 L0,20 Z" stroke="hsl(var(--primary))" strokeWidth="2" fill="hsl(var(--card))" />
           </svg>
        )}
        
        {/* Handles positioned based on shape */}
        <Handle type="target" position={Position.Top} className={cn("!bg-primary", {'!transform-none !top-0 !left-1/2 -translate-x-1/2': shape === 'diamond'})} />
        <Handle type="source" position={Position.Bottom} className={cn("!bg-primary", {'!transform-none !bottom-0 !left-1/2 -translate-x-1/2': shape === 'diamond'})} />
        <Handle type="target" position={Position.Left} className={cn("!bg-primary", {'!transform-none !left-0 !top-1/2 -translate-y-1/2': shape === 'diamond'})} />
        <Handle type="source" position={Position.Right} className={cn("!bg-primary", {'!transform-none !right-0 !top-1/2 -translate-y-1/2': shape === 'diamond'})} />

        <div className={cn(contentWrapperBaseStyle, contentShapeStyles[shape])}>
          <div className="font-bold text-base mb-2 flex-shrink-0">{label}</div>
          
          <div className="relative flex-grow flex flex-col min-h-0">
            <TextareaAutosize
              minRows={2}
              placeholder="詳細..."
              className="nodrag font-chat text-sm flex-grow w-full resize-none pr-8 bg-transparent border-0 focus:outline-none focus:ring-0"
              value={description || ''}
              onChange={(e) => handleDataChange({ description: e.target.value })}
            />
             <div className="absolute bottom-1 right-1">
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />
                {file ? (
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeFile}>
                         <X className="h-4 w-4 text-destructive" />
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>ファイルを削除</p>
                       <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {typeof file === 'string' ? file : file.name}
                       </p>
                     </TooltipContent>
                   </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={triggerFileInput}>
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>ファイルを添付</TooltipContent>
                  </Tooltip>
                )}
             </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default memo(CustomNode); 