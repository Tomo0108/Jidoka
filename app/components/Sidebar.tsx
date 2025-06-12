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
  HardDriveUpload,
  RectangleHorizontal,
  Diamond,
  ChevronsRight,
  CircleDot,
  Minus,
  FileText,
  Replace,
  Link2
} from 'lucide-react';
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
    <aside className="w-64 bg-background border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Input placeholder="ノードを検索..." />
      </div>
      <div className="flex-grow overflow-y-auto">
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-4">図形</AccordionTrigger>
            <AccordionContent>
              <TooltipProvider>
                <div className="p-4 grid grid-cols-2 gap-4">
                  {nodeShapes.map((shape) => {
                    const Icon = shape.icon;
                    return (
                      <Tooltip key={shape.type}>
                        <TooltipTrigger asChild>
                          <div
                            className="flex flex-col items-center justify-center p-2 border rounded-md cursor-grab hover:bg-muted transition-colors"
                            onDragStart={(event) => onDragStart(event, shape.type as NodeShape)}
                            onDoubleClick={() => onDoubleClick(shape.type as NodeShape)}
                            draggable
                            title="ドラッグしてキャンバスに配置、またはダブルクリックで中央に追加"
                          >
                            <Icon size={24} />
                            <span className="text-xs mt-1">{shape.label}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{shape.label}</p>
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