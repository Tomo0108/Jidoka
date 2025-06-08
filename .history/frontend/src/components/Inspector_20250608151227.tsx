"use client";

import React, { useEffect, useState } from 'react';
import useFlowStore from '@/hooks/useFlowStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { shallow } from 'zustand/shallow';

export function Inspector() {
  const { selectedNodeId, nodes, updateNodeData } = useFlowStore(
    (state) => ({
      selectedNodeId: state.selectedNodeId,
      nodes: state.nodes,
      updateNodeData: state.updateNodeData,
    }),
    shallow
  );

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const [label, setLabel] = useState(selectedNode?.data?.label || '');
  const [description, setDescription] = useState(selectedNode?.data?.description || '');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label);
      setDescription(selectedNode.data.description || '');
    }
  }, [selectedNode]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { label: e.target.value });
    }
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { description: e.target.value });
    }
  };

  if (!selectedNode) {
    return (
      <div className="h-full p-4 bg-muted/40 border-l">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="text-sm text-muted-foreground">
          Select a node to view and edit its properties.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 bg-muted/40 border-l flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <p className="text-xs text-muted-foreground">ID: {selectedNode.id}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input 
          id="label" 
          value={label} 
          onChange={handleLabelChange} 
          className="nodrag"
        />
      </div>

      <div className="space-y-2 flex-grow flex flex-col">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={handleDescriptionChange} 
          className="nodrag flex-grow"
        />
      </div>
    </div>
  );
} 