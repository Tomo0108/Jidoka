"use client";

import { Flowchart } from '@/components/Flowchart';
import { Inspector } from '@/components/Inspector';
import { Toaster } from '@/components/ui/toaster';

export default function TestFlowPage() {
  return (
    <div className="h-screen w-full">
      <h1 className="text-center p-4 text-2xl font-bold">フローチャートテストページ</h1>
      <div className="flex h-[calc(100vh-80px)]">
        {/* メインフローチャートエリア */}
        <div className="flex-1 min-w-0 border">
          <Flowchart />
        </div>
        
        {/* インスペクターサイドバー */}
        <div className="w-80 border bg-background">
          <Inspector />
        </div>
      </div>
      
      {/* トースト通知 */}
      <Toaster />
    </div>
  );
} 