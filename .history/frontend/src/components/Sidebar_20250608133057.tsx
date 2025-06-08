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
import { Shapes, HardDriveUpload } from 'lucide-react';

const nodeShapes = [
  { type: 'rectangle', label: 'Rectangle' },
  { type: 'diamond', label: 'Diamond' },
  { type: 'parallelogram', label: 'Parallelogram' },
  { type: 'startEnd', label: 'Start/End' },
];

const edgeTypes = [
  { type: 'default', label: 'Bezier (Default)' },
  { type: 'straight', label: 'Straight' },
  { type: 'step', label: 'Step' },
  { type: 'smoothstep', label: 'Smooth Step' },
  { type: 'smart', label: 'Smart' },
  { type: 'dashed', label: 'Dashed' },
];

export function Sidebar() {
  const { activeEdgeType, setActiveEdgeType } = useFlowStore();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Input placeholder="Search nodes..." />
      </div>
      <div className="flex-grow overflow-y-auto">
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-4">Shapes</AccordionTrigger>
            <AccordionContent>
              <TooltipProvider>
                <div className="p-4 grid grid-cols-2 gap-4">
                  {nodeShapes.map((shape) => (
                    <Tooltip key={shape.type}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex flex-col items-center justify-center p-2 border rounded-md cursor-grab hover:bg-gray-100"
                          onDragStart={(event) => onDragStart(event, shape.type)}
                          draggable
                        >
                          <Shapes size={24} />
                          <span className="text-xs mt-1">{shape.label}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{shape.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="px-4">Edge Types</AccordionTrigger>
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
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center p-2 border rounded-md hover:bg-gray-100">
            <HardDriveUpload size={20} className="mr-2"/>
            Save Favorites
        </button>
      </div>
    </aside>
  );
} 