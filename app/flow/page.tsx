"use client";

import { Flowchart } from '@/components/Flowchart';
import { Inspector } from '@/components/Inspector';
import { Toaster } from '@/components/ui/toaster';

export default function FlowPage() {
  return (
    <div className="h-screen w-full flex">
      {/* メインフローチャートエリア */}
      <div className="flex-1 min-w-0">
        <Flowchart />
      </div>
      
      {/* インスペクターサイドバー */}
      <div className="w-80 border-l border-border bg-background">
        <Inspector />
      </div>
      
      {/* トースト通知 */}
      <Toaster />
    </div>
  );
}
