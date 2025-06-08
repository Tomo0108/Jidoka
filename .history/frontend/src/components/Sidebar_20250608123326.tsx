'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, Star } from 'lucide-react';
import { Button } from './ui/button';

// デフォルトのライブラリ
const defaultLibraries = [
  {
    name: 'Flowchart',
    shapes: [
      { type: 'rectangle', label: 'Process', icon: '▭' },
      { type: 'diamond', label: 'Decision', icon: '◇' },
      { type: 'parallelogram', label: 'Data', icon: '▱' },
      { type: 'startEnd', label: 'Terminator', icon: '⬭' },
    ],
  },
  {
    name: 'General',
    shapes: [
        { type: 'rectangle', label: 'Rectangle', icon: '▭' },
    ]
  }
];

const Sidebar = () => {
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-full h-full border-r bg-background p-4 overflow-y-auto">
      <Input placeholder="Search shapes..." className="mb-4" />
      <TooltipProvider>
        <Accordion type="multiple" defaultValue={['Flowchart']} className="w-full">
          {defaultLibraries.map((library) => (
            <AccordionItem value={library.name} key={library.name}>
              <AccordionTrigger>{library.name}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                  {library.shapes.map((shape) => (
                    <div
                      key={shape.type + shape.label}
                      className="relative group p-2 border rounded-md cursor-grab hover:bg-muted/50 flex flex-col items-center justify-center gap-2"
                      onDragStart={(event) =>
                        onDragStart(event, shape.type)
                      }
                      draggable
                    >
                      <div className="text-4xl text-primary">{shape.icon}</div>
                      <span className="text-xs text-center text-muted-foreground">
                        {shape.label}
                      </span>
                      <div className="absolute top-1 right-1 hidden group-hover:flex items-center space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{shape.label}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Star className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                             <TooltipContent>
                                <p>Add to favorites</p>
                            </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </TooltipProvider>
    </aside>
  );
};

export default Sidebar; 