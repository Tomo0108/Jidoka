"use client";

import React, { useEffect, useState } from 'react';
import { useFlowStore } from '@/hooks/useFlowStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  NodeShape, 
  Priority, 
  NodeStatus, 
  BusinessAttributes,
  ValidationError 
} from '@/lib/types';
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  User, 
  Building, 
  Tag,
  Calendar,
  CheckCircle
} from 'lucide-react';

const shapeOptions: { value: NodeShape; label: string; icon?: string }[] = [
  { value: 'rectangle', label: '処理' },
  { value: 'diamond', label: '条件分岐' },
  { value: 'parallelogram', label: 'データ' },
  { value: 'startEnd', label: '開始/終了' },
  { value: 'predefinedProcess', label: '定義済み処理' },
  { value: 'document', label: '書類' },
  { value: 'custom', label: 'カスタム' },
];

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: '低', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: '最重要', color: 'bg-red-100 text-red-800' },
];

const statusOptions: { value: NodeStatus; label: string; color: string }[] = [
  { value: 'draft', label: '下書き', color: 'bg-gray-100 text-gray-800' },
  { value: 'in-progress', label: '進行中', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: '完了', color: 'bg-green-100 text-green-800' },
  { value: 'on-hold', label: '保留', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cancelled', label: 'キャンセル', color: 'bg-red-100 text-red-800' },
];

export function Inspector() {
  const selectedNodeId = useFlowStore(state => state.selectedNodeId);
  const nodes = useFlowStore(state => state.nodes);
  const updateNodeData = useFlowStore(state => state.updateNodeData);
  const validationErrors = useFlowStore(state => state.validationErrors);
  
  const [isBusinessAttributesOpen, setIsBusinessAttributesOpen] = useState(true);
  const [isValidationOpen, setIsValidationOpen] = useState(true);
  const [tagInput, setTagInput] = useState('');
  
  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;
  
  // 選択されたノードに関連するバリデーションエラー
  const nodeErrors = selectedNodeId 
    ? validationErrors.filter(error => error.nodeId === selectedNodeId)
    : [];

  if (!selectedNode) {
    return (
      <Card className="w-full h-full border-accent/20">
        <CardHeader className="bg-accent/10 border-b border-accent/20">
          <CardTitle className="flex items-center gap-2 text-accent-foreground">
            <div className="p-1.5 bg-accent/20 rounded-md">
              <Building className="h-5 w-5 text-accent-foreground" />
            </div>
            プロパティ
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="p-3 bg-accent/10 rounded-full inline-block mb-2">
              <Building className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">ノードを選択してください</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const businessAttributes = selectedNode.data.businessAttributes || {};

  // 基本プロパティの更新
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(selectedNode.id, { label: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(selectedNode.id, { description: e.target.value });
  };

  const handleShapeChange = (value: string) => {
    updateNodeData(selectedNode.id, { shape: value as NodeShape });
  };

  // 業務属性の更新
  const updateBusinessAttribute = (key: keyof BusinessAttributes, value: any) => {
    const newBusinessAttributes = { ...businessAttributes, [key]: value };
    updateNodeData(selectedNode.id, { businessAttributes: newBusinessAttributes });
  };

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBusinessAttribute('owner', e.target.value);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBusinessAttribute('department', e.target.value);
  };

  const handleEstimatedTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    updateBusinessAttribute('estimatedTime', value);
  };

  const handlePriorityChange = (value: string) => {
    updateBusinessAttribute('priority', value as Priority);
  };

  const handleStatusChange = (value: string) => {
    updateBusinessAttribute('status', value as NodeStatus);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBusinessAttribute('dueDate', e.target.value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBusinessAttribute('notes', e.target.value);
  };

  // タグの管理
  const addTag = () => {
    if (tagInput.trim() && !businessAttributes.tags?.includes(tagInput.trim())) {
      const newTags = [...(businessAttributes.tags || []), tagInput.trim()];
      updateBusinessAttribute('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = businessAttributes.tags?.filter(tag => tag !== tagToRemove) || [];
    updateBusinessAttribute('tags', newTags);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  return (
    <Card className="w-full h-full border-accent/20">
      <CardHeader className="bg-accent/10 border-b border-accent/20">
        <CardTitle className="flex items-center gap-2 text-accent-foreground">
          <div className="p-1.5 bg-accent/20 rounded-md">
            <Building className="h-5 w-5 text-accent-foreground" />
          </div>
          プロパティ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* 基本プロパティ */}
        <div className="space-y-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <h3 className="text-sm font-semibold text-accent-foreground flex items-center gap-2">
            <div className="w-1 h-4 bg-accent rounded-full"></div>
            基本設定
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="node-label" className="text-accent-foreground font-medium">ラベル</Label>
            <Input 
              id="node-label" 
              value={selectedNode.data.label}
              onChange={handleLabelChange}
              placeholder="ノードのラベルを入力"
              className="border-accent/30 focus:border-accent focus:ring-accent/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-description" className="text-accent-foreground font-medium">詳細</Label>
            <Textarea
              id="node-description"
              value={selectedNode.data.description || ''}
              onChange={handleDescriptionChange}
              rows={3}
              placeholder="詳細な説明を入力"
              className="border-accent/30 focus:border-accent focus:ring-accent/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-shape" className="text-accent-foreground font-medium">形状</Label>
            <Select value={selectedNode.data.shape} onValueChange={handleShapeChange}>
              <SelectTrigger id="node-shape" className="border-accent/30 focus:border-accent focus:ring-accent/20">
                <SelectValue placeholder="形状を選択" />
              </SelectTrigger>
              <SelectContent className="border-accent/30">
                {shapeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="focus:bg-accent/10">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* 業務属性 */}
        <Collapsible open={isBusinessAttributesOpen} onOpenChange={setIsBusinessAttributesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-accent text-accent-foreground w-full p-3 bg-accent/5 rounded-lg border border-accent/20">
            <div className="p-1 bg-accent/20 rounded">
              {isBusinessAttributesOpen ? <ChevronDown className="h-4 w-4 text-accent-foreground" /> : <ChevronRight className="h-4 w-4 text-accent-foreground" />}
            </div>
            <div className="w-1 h-4 bg-accent rounded-full"></div>
            業務属性
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20 border-t-0 rounded-t-none">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="node-owner" className="flex items-center gap-1 text-accent-foreground font-medium">
                  <div className="p-0.5 bg-accent/20 rounded">
                    <User className="h-3 w-3 text-accent-foreground" />
                  </div>
                  責任者
                </Label>
                <Input 
                  id="node-owner"
                  value={businessAttributes.owner || ''}
                  onChange={handleOwnerChange}
                  placeholder="責任者名"
                  className="border-accent/30 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-department" className="flex items-center gap-1 text-accent-foreground font-medium">
                  <div className="p-0.5 bg-accent/20 rounded">
                    <Building className="h-3 w-3 text-accent-foreground" />
                  </div>
                  部署
                </Label>
                <Input 
                  id="node-department"
                  value={businessAttributes.department || ''}
                  onChange={handleDepartmentChange}
                  placeholder="部署名"
                  className="border-accent/30 focus:border-accent focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="node-time" className="flex items-center gap-1 text-accent-foreground font-medium">
                  <div className="p-0.5 bg-accent/20 rounded">
                    <Clock className="h-3 w-3 text-accent-foreground" />
                  </div>
                  想定時間（分）
                </Label>
                <Input 
                  id="node-time"
                  type="number"
                  value={businessAttributes.estimatedTime || ''}
                  onChange={handleEstimatedTimeChange}
                  placeholder="0"
                  min="0"
                  className="border-accent/30 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-due-date" className="flex items-center gap-1 text-accent-foreground font-medium">
                  <div className="p-0.5 bg-accent/20 rounded">
                    <Calendar className="h-3 w-3 text-accent-foreground" />
                  </div>
                  期限
                </Label>
                <Input 
                  id="node-due-date"
                  type="date"
                  value={businessAttributes.dueDate || ''}
                  onChange={handleDueDateChange}
                  className="border-accent/30 focus:border-accent focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-accent-foreground font-medium">優先度</Label>
                <Select 
                  value={businessAttributes.priority || 'medium'} 
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger className="border-accent/30 focus:border-accent focus:ring-accent/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-accent/30">
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="focus:bg-accent/10">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-accent-foreground font-medium">ステータス</Label>
                <Select 
                  value={businessAttributes.status || 'draft'} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="border-accent/30 focus:border-accent focus:ring-accent/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-accent/30">
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="focus:bg-accent/10">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* タグ */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                タグ
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="タグを追加..."
                />
                <Button onClick={addTag} size="sm">
                  追加
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {businessAttributes.tags?.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-notes">備考</Label>
              <Textarea
                id="node-notes"
                value={businessAttributes.notes || ''}
                onChange={handleNotesChange}
                rows={3}
                placeholder="備考を入力..."
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* バリデーションエラー */}
        {nodeErrors.length > 0 && (
          <Collapsible open={isValidationOpen} onOpenChange={setIsValidationOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
              {isValidationOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              検証結果 ({nodeErrors.length})
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-4">
              {nodeErrors.map((error) => (
                <div 
                  key={error.id}
                  className={`p-2 rounded text-sm border-l-4 ${
                    error.type === 'error' 
                      ? 'bg-red-50 border-red-500 text-red-700' 
                      : 'bg-yellow-50 border-yellow-500 text-yellow-700'
                  }`}
                >
                  {error.message}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* システム情報 */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <Separator />
          <div>
            <strong>ID:</strong> {selectedNode.id}
          </div>
          <div>
            <strong>位置:</strong> ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 