"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFlowStore } from '@/hooks/useFlowStore';
import { NodeShape } from '@/lib/types';
import { 
  Shapes, 
  HardDriveUpload,
  RectangleHorizontal,
  Diamond,
  ChevronsRight,
  CircleDot,
  Minus,
  FileText,
  Replace,
  Link2,
  Search,
  Star,
  Palette,
  Grid3X3,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const nodeShapes = [
  { type: 'startEnd', label: '開始/終了', icon: CircleDot },
  { type: 'rectangle', label: '処理', icon: RectangleHorizontal },
  { type: 'diamond', label: '条件分岐', icon: Diamond },
  { type: 'parallelogram', label: 'データ', icon: ChevronsRight },
  { type: 'predefinedProcess', label: '定義済み処理', icon: Replace },
  { type: 'document', label: '書類', icon: FileText },
];

const edgeTypes = [
  { type: 'step', label: 'ステップ線 (既定)' },
  { type: 'default', label: 'ベジェ曲線' },
  { type: 'straight', label: '直線' },
  { type: 'smoothstep', label: 'スムーズステップ' },
  { type: 'dashed', label: '破線' },
];

export function Sidebar() {
  const activeEdgeType = useFlowStore((state) => state.activeEdgeType);
  const setActiveEdgeType = useFlowStore((state) => state.setActiveEdgeType);
  const addNode = useFlowStore((state) => state.addNode);

  const onDragStart = (event: React.DragEvent, shape: NodeShape) => {
    event.dataTransfer.setData('application/reactflow-shape', shape);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDoubleClick = (shape: NodeShape) => {
    // キャンバスの中央にノードを追加
    const centerX = 400;
    const centerY = 200;
    addNode(shape, centerX, centerY);
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-r border-border/50 flex flex-col shadow-lg">
      {/* ヘッダー */}
      <div className="p-4 border-b border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
            <Shapes className="h-3 w-3 text-white" />
          </div>
          <h2 className="font-semibold text-sm">ツールパレット</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="ノードを検索..." className="pl-9 h-8 text-sm" />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-white/50 dark:hover:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-blue-500" />
                <span className="font-medium">図形</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <TooltipProvider>
                <div className="p-3 grid grid-cols-2 gap-3">
                  {nodeShapes.map((shape) => {
                    const Icon = shape.icon;
                    return (
                      <Tooltip key={shape.type}>
                        <TooltipTrigger asChild>
                          <Card
                            className="flex flex-col items-center justify-center p-3 cursor-grab hover:shadow-md transition-all duration-200 hover:scale-105 border-border/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm"
                            onDragStart={(event) => onDragStart(event, shape.type as NodeShape)}
                            onDoubleClick={() => onDoubleClick(shape.type as NodeShape)}
                            draggable
                            title="ドラッグしてキャンバスに配置、またはダブルクリックで中央に追加"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-2">
                              <Icon size={16} className="text-white" />
                            </div>
                            <span className="text-xs font-medium text-center leading-tight">{shape.label}</span>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{shape.label}</p>
                          <p className="text-xs text-muted-foreground">ドラッグまたはダブルクリック</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="px-4">線の種類</AccordionTrigger>
            <AccordionContent>
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    <h4 className="font-semibold">接続線</h4>
                  </div>
                  <Minus className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <div className="p-4">
                    <RadioGroup
                      value={activeEdgeType}
                      onValueChange={setActiveEdgeType}
                    >
                      {edgeTypes.map((edge) => (
                        <div key={edge.type} className="flex items-center space-x-2">
                          <RadioGroupItem value={edge.type} id={edge.type} />
                          <Label htmlFor={edge.type}>{edge.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center justify-center p-2 border rounded-md hover:bg-muted">
            <HardDriveUpload size={20} className="mr-2"/>
            お気に入りを保存
        </button>
      </div>
    </aside>
  );
} 