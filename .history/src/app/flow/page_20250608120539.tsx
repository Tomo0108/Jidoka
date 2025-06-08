"use client";

import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { Sidebar } from "@/components/flow/Sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useTemporalFlowStore } from "@/hooks/useFlowStore";
import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";

export default function FlowPage() {
  const { undo, redo, futureStates, pastStates } = useTemporalFlowStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    futureStates: state.futureStates,
    pastStates: state.pastStates,
  }));

  return (
    <div className="w-screen h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center px-4">
        <h1 className="text-xl font-bold">Flow Editor</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => undo()}
            disabled={pastStates.length === 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => redo()}
            disabled={futureStates.length === 0}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <div className="h-[calc(100vh-3.5rem)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <FlowCanvas />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
} 