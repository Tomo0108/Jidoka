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
import useFlowStore from "@/hooks/useFlowStore";
import { 
  Shapes, 
  HardDriveUpload,
  RectangleHorizontal,
  Diamond,
  ChevronsRight,
  CircleDot,
  Minus
} from 'lucide-react';

const nodeShapes = [
  { type: 'rectangle', label: '処理', icon: RectangleHorizontal },
  { type: 'diamond', label: '条件分岐', icon: Diamond },
  { type: 'parallelogram', label: 'データ', icon: ChevronsRight },
  { type: 'startEnd', label: '開始/終了', icon: CircleDot },
];

const edgeTypes = [
  { type: 'default', label: 'ベジェ曲線 (既定)' },
  { type: 'straight', label: '直線' },
  { type: 'step', label: 'ステップ' },
  { type: 'smoothstep', label: 'スムーズステップ' },
  { type: 'dashed', label: '破線' },
];

export function Sidebar() {
  const { activeEdgeType, setActiveEdgeType } = useFlowStore();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
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
                            className="flex flex-col items-center justify-center p-2 border rounded-md cursor-grab hover:bg-muted"
                            onDragStart={(event) => onDragStart(event, shape.type)}
                            draggable
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
              <div className="p-4">
                <RadioGroup
                  defaultValue={activeEdgeType}
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