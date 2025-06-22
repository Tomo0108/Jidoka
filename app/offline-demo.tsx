import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, User, FileCode2, Workflow } from "lucide-react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

const demoMessages = [
  { sender: "user", text: "Excelのデータを集計してグラフを作るマクロを作成したい。" },
  { sender: "ai", text: "どのようなデータを集計し、どの種類のグラフを作成しますか？" },
  { sender: "user", text: "売上データを月ごとに集計し、棒グラフにしたいです。" },
  { sender: "ai", text: "了解しました。以下の手順でフローを作成します。" },
];

const demoNodes = [
  { id: "1", type: "input", data: { label: "Excelファイルを開く" }, position: { x: 0, y: 0 } },
  { id: "2", data: { label: "売上データを読み込む" }, position: { x: 200, y: 0 } },
  { id: "3", data: { label: "月ごとに集計" }, position: { x: 400, y: 0 } },
  { id: "4", data: { label: "棒グラフを作成" }, position: { x: 600, y: 0 } },
  { id: "5", type: "output", data: { label: "グラフを保存" }, position: { x: 800, y: 0 } },
];
const demoEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
  { id: "e4-5", source: "4", target: "5" },
];

const demoCode = `Sub 集計グラフ作成()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("売上データ")
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    Dim dict As Object
    Set dict = CreateObject("Scripting.Dictionary")
    Dim i As Long
    For i = 2 To lastRow
        Dim ym As String
        ym = Year(ws.Cells(i, 1).Value) & "/" & Month(ws.Cells(i, 1).Value)
        If Not dict.Exists(ym) Then
            dict.Add ym, 0
        End If
        dict(ym) = dict(ym) + ws.Cells(i, 2).Value
    Next i
    Dim chartObj As ChartObject
    Set chartObj = ws.ChartObjects.Add(Left:=300, Width:=400, Top:=10, Height:=300)
    chartObj.Chart.ChartType = xlColumnClustered
    chartObj.Chart.SetSourceData Source:=ws.Range("A1:B" & lastRow)
End Sub`;

export default function OfflineDemo() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>オフラインデモ：チャット例</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <ScrollArea className="h-64 pr-2">
            <div className="space-y-4">
              {demoMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-center gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <span className="inline-flex items-center justify-center rounded-full bg-muted w-8 h-8">
                      {msg.sender === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </span>
                    <span className={`rounded-lg px-3 py-2 ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4">
            <Textarea value="オフラインデモのため送信できません" disabled className="resize-none" />
            <Button className="mt-2 w-full" disabled>送信</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Workflow className="h-5 w-5 text-primary" />
          <CardTitle>生成されたフロー図</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="h-72 bg-background rounded">
            <ReactFlow nodes={demoNodes} edges={demoEdges} fitView>
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <FileCode2 className="h-5 w-5 text-primary" />
          <CardTitle>生成されたコード例</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <pre className="bg-muted rounded p-4 overflow-x-auto text-xs">
            <code>{demoCode}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 