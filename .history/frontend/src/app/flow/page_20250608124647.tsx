'use client';

import FlowCanvas from '@/components/flow/FlowCanvas';
import Sidebar from '@/components/Sidebar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useTemporalStore } from '@/hooks/useFlowStore';
import { Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
    undo: state.undo,
    redo: state.redo,
    futureStates: state.futureStates,
    pastStates: state.pastStates,
});

export default function FlowEditorPage() {
  const { undo, redo, futureStates, pastStates } = useTemporalStore(
    selector,
    shallow
  );

  return (
    <div className="w-screen h-screen flex flex-col bg-background">
      <header className="h-14 border-b flex items-center px-6 flex-shrink-0">
        <h1 className="text-xl font-semibold">Jido-ka Flow</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => undo()}
            disabled={pastStates.length === 0}
          >
            <Undo className="w-4 h-4" />
            <span className="sr-only">Undo</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => redo()}
            disabled={futureStates.length === 0}
          >
            <Redo className="w-4 h-4" />
            <span className="sr-only">Redo</span>
          </Button>
        </div>
      </header>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-grow"
      >
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <FlowCanvas />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
