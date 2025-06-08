"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const onDragStart = (event, nodeType, shape) => {
  const nodeInfo = { nodeType, shape };
  event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeInfo));
  event.dataTransfer.effectAllowed = 'move';
};

const nodeTypes = [
  { type: 'custom', shape: 'rectangle', label: '処理' },
  { type: 'custom', shape: 'diamond', label: '分岐' },
  { type: 'custom', shape: 'terminator', label: '開始/終了' },
  { type: 'custom', shape: 'parallelogram', label: 'データ入出力' },
  // { type: 'custom', shape: 'cylinder', label: 'データベース' },
  // { type: 'custom', shape: 'hexagon', label: '準備' },
  // { type: 'custom', shape: 'subroutine', label: 'サブルーチン' },
];

export function FlowchartSidebar() {
  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>ノードを追加</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          以下のノードをキャンバスにドラッグ＆ドロップしてください。
        </p>
        <Separator />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {nodeTypes.map(({ type, shape, label }) => (
            <div
              key={`${type}-${shape}`}
              className="p-3 border rounded-lg flex flex-col items-center justify-center cursor-grab text-center text-sm hover:bg-muted"
              onDragStart={(event) => onDragStart(event, type, shape)}
              draggable
            >
              {/* ここで形状に応じた簡易的なアイコンを表示することも可能 */}
              <div className="mb-1 h-8 w-12 border border-dashed rounded-md" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 