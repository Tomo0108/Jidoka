"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFlowStore } from '@/hooks/useFlowStore';
import { NodeShape } from '@/lib/types';
import { 
  Shapes, 
  RectangleHorizontal,
  Diamond,
  ChevronsRight,
  CircleDot,
  FileText,
  Replace,
  Link2,
  Search,
  Grid3X3
} from 'lucide-react';


const nodeShapes = [
  { type: 'startEnd', label: '開始/終了', icon: CircleDot },
  { type: 'rectangle', label: 'タスク', icon: RectangleHorizontal },
  { type: 'diamond', label: '判断', icon: Diamond },
  { type: 'parallelogram', label: '入出力', icon: ChevronsRight },
  { type: 'predefinedProcess', label: 'サブプロセス', icon: Replace },
  { type: 'document', label: 'ドキュメント', icon: FileText },
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
    <aside className="w-64 bg-background border-r border-border flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-border bg-accent/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-accent/20 rounded-md">
            <Shapes className="h-4 w-4 text-accent-foreground" />
          </div>
          <h2 className="font-semibold text-sm text-accent-foreground">ツールパレット</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="ノードを検索..." 
            className="pl-9 h-8 text-sm border-accent/30 focus:border-accent focus:ring-accent/20" 
          />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
          <AccordionItem value="item-1" className="border-accent/20">
            <AccordionTrigger className="px-4 hover:bg-accent/10 text-accent-foreground">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-accent/20 rounded">
                  <Grid3X3 className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="font-medium">図形</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <TooltipProvider>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {nodeShapes.map((shape) => {
                    const Icon = shape.icon;
                    return (
                      <Tooltip key={shape.type}>
                        <TooltipTrigger asChild>
                          <div
                            className="group flex flex-col items-center justify-center p-3 border border-accent/30 rounded-md cursor-grab hover:bg-accent/10 hover:border-accent transition-all duration-200 hover:shadow-sm"
                            onDragStart={(event) => onDragStart(event, shape.type as NodeShape)}
                            onDoubleClick={() => onDoubleClick(shape.type as NodeShape)}
                            draggable
                            title="ドラッグしてキャンバスに配置、またはダブルクリックで中央に追加"
                          >
                            <div className="p-1.5 bg-accent/20 rounded group-hover:bg-accent/30 transition-colors">
                              <Icon size={16} className="text-accent-foreground" />
                            </div>
                            <span className="text-xs text-center mt-1 text-accent-foreground">{shape.label}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-accent text-accent-foreground border-accent">
                          <p className="font-medium">{shape.label}</p>
                          <p className="text-xs opacity-80">ドラッグまたはダブルクリック</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <span>接続線</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4">
                <RadioGroup
                  value={activeEdgeType}
                  onValueChange={setActiveEdgeType}
                  className="space-y-2"
                >
                  {edgeTypes.map((edge) => (
                    <div key={edge.type} className="flex items-center space-x-2">
                      <RadioGroupItem value={edge.type} id={edge.type} />
                      <Label htmlFor={edge.type} className="text-sm cursor-pointer">
                        {edge.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
} 