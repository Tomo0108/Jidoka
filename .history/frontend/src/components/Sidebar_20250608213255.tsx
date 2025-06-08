"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFlowStore } from '@/hooks/useFlowStore';
import { NodeShape } from '@/lib/types';
import { 
  Search, 
  CircleDot,
  RectangleHorizontal,
  Diamond,
  FileText,
  Zap,
  ChevronsRight,
  Minus,
  ArrowRight,
  TrendingUp,
  MoreHorizontal,
  Eye,
  EyeOff,
  Layers,
  Grid3X3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const nodeShapes = [
  { 
    type: 'startEnd', 
    label: '開始/終了', 
    icon: CircleDot, 
    color: '#2ECC71',
    description: 'プロセスの開始点と終了点'
  },
  { 
    type: 'rectangle', 
    label: '処理', 
    icon: RectangleHorizontal, 
    color: '#3498DB',
    description: '一般的な処理ステップ'
  },
  { 
    type: 'diamond', 
    label: '判断', 
    icon: Diamond, 
    color: '#E67E22',
    description: '条件分岐や意思決定'
  },
  { 
    type: 'parallelogram', 
    label: 'データ', 
    icon: ChevronsRight, 
    color: '#9B59B6',
    description: '入力/出力データ'
  },
  { 
    type: 'predefinedProcess', 
    label: '定義済み処理', 
    icon: Zap, 
    color: '#3498DB',
    description: '既に定義済みのプロセス'
  },
  { 
    type: 'document', 
    label: '文書', 
    icon: FileText, 
    color: '#F1C40F',
    description: '文書や記録'
  },
];

const edgeTypes = [
  { type: 'step', label: 'ステップ線（推奨）', description: '業務フローに最適' },
  { type: 'default', label: 'ベジェ曲線', description: '滑らかな接続線' },
  { type: 'straight', label: '直線', description: 'シンプルな直線' },
  { type: 'smoothstep', label: 'スムーズステップ', description: '段階的な接続' },
];

export function Sidebar() {
  const activeEdgeType = useFlowStore((state) => state.activeEdgeType);
  const setActiveEdgeType = useFlowStore((state) => state.setActiveEdgeType);
  const addNode = useFlowStore((state) => state.addNode);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'process' | 'data' | 'flow'>('all');

  const onDragStart = (event: React.DragEvent, shape: NodeShape) => {
    event.dataTransfer.setData('application/reactflow-shape', shape);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDoubleClick = (shape: NodeShape) => {
    const centerX = 400;
    const centerY = 200;
    addNode(shape, centerX, centerY);
  };

  const filteredShapes = nodeShapes.filter(shape =>
    shape.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shape.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getShapesByCategory = () => {
    switch (selectedCategory) {
      case 'process':
        return filteredShapes.filter(shape => ['rectangle', 'predefinedProcess'].includes(shape.type));
      case 'data':
        return filteredShapes.filter(shape => ['parallelogram', 'document'].includes(shape.type));
      case 'flow':
        return filteredShapes.filter(shape => ['startEnd', 'diamond'].includes(shape.type));
      default:
        return filteredShapes;
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-[#2C3E50] border-r border-slate-200 dark:border-slate-600 flex flex-col">
      {/* ヘッダー */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-lg flex items-center justify-center">
            <Grid3X3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">ツールパレット</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">図形とコネクタ</p>
          </div>
        </div>
        
        {/* 検索 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="図形を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
          />
        </div>

        {/* カテゴリフィルター */}
        <div className="flex gap-1 mt-3">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'flow', label: 'フロー' },
            { key: 'process', label: '処理' },
            { key: 'data', label: 'データ' }
          ].map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.key as any)}
              className="text-xs h-7"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 統計情報 */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{nodes.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">ノード</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{edges.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">接続</div>
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-y-auto">
        {/* 図形パレット */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">図形</h3>
            <Badge variant="secondary" className="ml-auto">
              {getShapesByCategory().length}
            </Badge>
          </div>

          <TooltipProvider>
            <div className="grid grid-cols-2 gap-3">
              {getShapesByCategory().map((shape) => {
                const Icon = shape.icon;
                return (
                  <Tooltip key={shape.type}>
                    <TooltipTrigger asChild>
                      <Card
                        className="group relative p-4 cursor-grab hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                        style={{ borderColor: `${shape.color}20` }}
                        onDragStart={(event) => onDragStart(event, shape.type as NodeShape)}
                        onDoubleClick={() => onDoubleClick(shape.type as NodeShape)}
                        draggable
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: `${shape.color}15`, border: `1.5px solid ${shape.color}` }}
                          >
                            <Icon size={18} style={{ color: shape.color }} />
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {shape.label}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {shape.description}
                            </div>
                          </div>
                        </div>
                        
                        {/* ドラッグインジケーター */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-3 w-3 text-slate-400" />
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-medium">{shape.label}</p>
                      <p className="text-xs text-muted-foreground">{shape.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">ドラッグまたはダブルクリック</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>

        <Separator />

        {/* 接続線タイプ */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">接続線</h3>
          </div>

          <RadioGroup
            value={activeEdgeType}
            onValueChange={setActiveEdgeType}
            className="space-y-3"
          >
            {edgeTypes.map((edge) => (
              <div 
                key={edge.type} 
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
              >
                <RadioGroupItem 
                  value={edge.type} 
                  id={edge.type} 
                  className="mt-0.5"
                  style={{ borderColor: '#7F8C8D', color: '#7F8C8D' }}
                />
                <Label htmlFor={edge.type} className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-[#3498DB]">
                    {edge.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {edge.description}
                  </div>
                </Label>
                {edge.type === 'step' && (
                  <Badge variant="secondary" className="text-xs">推奨</Badge>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* フッター */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            図形をキャンバスにドラッグ&ドロップ
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            またはダブルクリックで中央に追加
          </div>
        </div>
      </div>
    </div>
  );
} 