"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronsUpDown, Info, Star, RectangleHorizontal, Diamond, Forward } from "lucide-react";

const shapeLibraries = [
  {
    name: "基本図形",
    shapes: [
      { type: "rectangle", label: "長方形", icon: <RectangleHorizontal className="h-5 w-5" /> },
      { type: "diamond", label: "ひし形", icon: <Diamond className="h-5 w-5" /> },
      { type: "parallelogram", label: "平行四辺形", icon: <Forward className="h-5 w-5" /> },
    ],
  },
];

const ShapeItem = ({ shape }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center p-2 rounded-md hover:bg-muted cursor-grab"
            onDragStart={(event) => onDragStart(event, shape.type)}
            draggable
          >
            {shape.icon}
            <span className="ml-2 text-sm">{shape.label}</span>
            <div className="ml-auto flex items-center">
              <button className="p-1 rounded hover:bg-secondary/80">
                <Star className="h-4 w-4 text-muted-foreground hover:text-yellow-400" />
              </button>
              <Info className="h-4 w-4 ml-1 text-muted-foreground" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{shape.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const Sidebar = () => {
  return (
    <div className="h-full border-r bg-card text-card-foreground overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">ライブラリ</h2>
      </div>
      <Accordion type="multiple" defaultValue={["基本図形"]} className="w-full">
        {shapeLibraries.map((lib) => (
          <AccordionItem value={lib.name} key={lib.name}>
            <AccordionTrigger className="px-4 text-sm font-medium">
              <div className="flex items-center">
                <ChevronsUpDown className="h-4 w-4 mr-2" />
                {lib.name}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-2">
              <div className="space-y-1">
                {lib.shapes.map((shape) => (
                  <ShapeItem shape={shape} key={shape.type} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}; 