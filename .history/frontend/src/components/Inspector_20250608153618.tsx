"use client";

import React, { useEffect, useState } from 'react';
import useFlowStore from '@/hooks/useFlowStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { shallow } from 'zustand/shallow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NodeShape } from '@/hooks/useFlowStore';

const shapeOptions: { value: NodeShape; label: string }[] = [
  { value: 'rectangle', label: '処理' },
  { value: 'diamond', label: '条件分岐' },
  { value: 'parallelogram', label: 'データ' },
  { value: 'startEnd', label: '開始/終了' },
  { value: 'predefinedProcess', label: '定義済み処理' },
  { value: 'document', label: '書類' },
  { value: 'custom', label: 'カスタム' },
];

export function Inspector() {
  const { selectedNode, updateNodeData } = useFlowStore(
    (state) => ({
      selectedNode: state.nodes.find((node) => node.id === state.selectedNodeId),
      updateNodeData: state.updateNodeData,
    }),
    shallow
  );

  if (!selectedNode) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>プロパティ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">ノードを選択してください</p>
        </CardContent>
      </Card>
    );
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(selectedNode.id, { label: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(selectedNode.id, { description: e.target.value });
  };

  const handleShapeChange = (value: string) => {
    updateNodeData(selectedNode.id, { shape: value as NodeShape });
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>プロパティ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="node-label">ラベル</Label>
          <Input 
            id="node-label" 
            value={selectedNode.data.label}
            onChange={handleLabelChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="node-description">詳細</Label>
          <Textarea
            id="node-description"
            value={selectedNode.data.description || ''}
            onChange={handleDescriptionChange}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="node-shape">形状</Label>
          <Select value={selectedNode.data.shape} onValueChange={handleShapeChange}>
            <SelectTrigger id="node-shape">
              <SelectValue placeholder="形状を選択" />
            </SelectTrigger>
            <SelectContent>
              {shapeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>ID</Label>
          <p className="text-sm text-muted-foreground break-all">{selectedNode.id}</p>
        </div>
      </CardContent>
    </Card>
  );
} 