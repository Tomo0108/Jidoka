"use client";

// Vercelへのデプロイを再トリガーするためのコメント
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, CornerDownLeft, PlusCircle, Settings, Share2, FolderKanban, LoaderCircle, FileCode, Download, Workflow, MessageSquarePlus, MessageSquare, Link, Code, Twitter, Facebook, Linkedin, Edit, Trash2, Copy, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Flowchart } from "@/components/flow/Flowchart";
import { Sidebar } from "@/components/flow/Sidebar";
import { Inspector } from "@/components/flow/Inspector";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useFlowStore } from '@/hooks/useFlowStore';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { useMediaQuery } from "@/hooks/use-media-query";
import { Node, Edge } from 'reactflow';
import { CustomNodeData, CustomEdgeData } from '@/lib/types';

// 定数
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : ''
);

const MOCK_OFFLINE_MESSAGE = "現在オフラインモードで動作しています。バックエンドサーバーが利用できないため、実際のAI応答は提供できませんが、フローチャート機能やその他の機能は引き続きご利用いただけます。";

const GENERATED_CODE = {
  explanation: "これは、売上データを月ごとに集計して棒グラフを作成するVBAマクロです。Excelファイルから売上データを読み込み、月ごとに集計して棒グラフを生成し、保存します。",
  code: `Sub 売上データ集計グラフ作成()
    ' 変数宣言
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim dict As Object
    Dim ym As String
    Dim chartObj As ChartObject
    Dim dataRange As Range
    Dim summaryRange As Range
    
    ' 売上データシートを設定
    Set ws = ThisWorkbook.Sheets("売上データ")
    
    ' 最終行を取得
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    ' 辞書オブジェクトを作成（月ごとの集計用）
    Set dict = CreateObject("Scripting.Dictionary")
    
    ' データを読み込んで月ごとに集計
    For i = 2 To lastRow
        ' 日付から年月を取得
        ym = Year(ws.Cells(i, 1).Value) & "/" & Format(Month(ws.Cells(i, 1).Value), "00")
        
        ' 辞書に存在しない場合は初期化
        If Not dict.Exists(ym) Then
            dict.Add ym, 0
        End If
        
        ' 売上金額を加算
        dict(ym) = dict(ym) + ws.Cells(i, 2).Value
    Next i
    
    ' 集計結果を新しいシートに出力
    Dim summarySheet As Worksheet
    On Error Resume Next
    Set summarySheet = ThisWorkbook.Sheets("集計結果")
    On Error GoTo 0
    
    If summarySheet Is Nothing Then
        Set summarySheet = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        summarySheet.Name = "集計結果"
    End If
    
    ' ヘッダーを設定
    summarySheet.Cells(1, 1).Value = "年月"
    summarySheet.Cells(1, 2).Value = "売上合計"
    
    ' 集計データを出力
    Dim key As Variant
    Dim row As Long
    row = 2
    For Each key In dict.Keys
        summarySheet.Cells(row, 1).Value = key
        summarySheet.Cells(row, 2).Value = dict(key)
        row = row + 1
    Next key
    
    ' データ範囲を設定
    Set dataRange = summarySheet.Range("A1:B" & (row - 1))
    
    ' 棒グラフを作成
    Set chartObj = summarySheet.ChartObjects.Add(Left:=300, Width:=500, Top:=50, Height:=300)
    With chartObj.Chart
        .ChartType = xlColumnClustered
        .SetSourceData Source:=dataRange
        .ChartTitle.Text = "月別売上集計"
        .Axes(xlCategory).HasTitle = True
        .Axes(xlCategory).AxisTitle.Text = "年月"
        .Axes(xlValue).HasTitle = True
        .Axes(xlValue).AxisTitle.Text = "売上金額"
    End With
    
    ' 完了メッセージ
    MsgBox "売上データの集計とグラフ作成が完了しました。", vbInformation, "処理完了"
End Sub`,
  filename: "売上データ集計グラフ作成.vba"
};

const MACRO_TASK_TEMPLATE = `以下のマクロを作成してください。

【機能1】
マクロ実行ファイル「入力」シートのF列「番号」に記載したF2から始まる数字を参照し、
G2から始まるサービスコードが記載されている分だけ、「1」シートを複製し、
2,3,4とシート名を番号と同じ内容に書き換える

【機能2】
マクロ実行ファイル「入力」シートのG列に入力した「サービスコード」を検索キーとして、
案件管理マスター(C4セルにフォルダパス記載)の「NWSB記入項目」シートからデータを抽出し、
必要な情報を転記する。これは、F列に記載された番号と一致するシート名に行う。

■例
（案件管理マスターの列名）・・・（転記先のシート、セル）
顧客コード・・・C3
サービスコード・・・B5
契約種別・・・D5
契約企業名・・・B12
契約担当者・・・C14
契約担当e-mail・・・B16
拠点名・・・B25
設置先住所・・・B27
IPアドレス追加オプション・・・D29
オンサイト保守オプション・・・E29
月額プラン料金・・・B36
NWSB担当営業・・・B44`;

const GENERAL_TASK_TEMPLATE = `以下のタスクを自動化してください。

【タスク概要】
[ここにタスクの概要を記載]

【入力データ】
- データソース: [ファイル名/データベース名]
- データ形式: [Excel/CSV/JSON等]
- データ構造: [列名やフィールド名]

【処理内容】
1. [処理ステップ1]
2. [処理ステップ2]
3. [処理ステップ3]

【出力形式】
- 出力先: [ファイル名/フォルダ名]
- 出力形式: [Excel/CSV/PDF等]
- 出力内容: [具体的な出力項目]

【特殊要件】
- エラーハンドリング: [エラー時の処理]
- パフォーマンス: [処理時間の制約]
- セキュリティ: [アクセス制限等]`;

const DATA_PROCESSING_TEMPLATE = `以下のデータ処理を自動化してください。

【処理対象】
- ファイル: [ファイル名]
- シート: [シート名]
- 範囲: [セル範囲]

【処理内容】
1. データの読み込み
2. データの検証・クリーニング
3. データの変換・加工
4. 結果の出力

【変換ルール】
- [元データ] → [変換後データ]
- [条件] → [処理内容]

【出力形式】
- ファイル名: [出力ファイル名]
- 形式: [Excel/CSV/JSON等]
- 構造: [出力データの構造]`;

const WORKFLOW_TEMPLATE = `以下のワークフローを自動化してください。

【ワークフロー概要】
[業務プロセスの概要]

【参加者・システム】
- 担当者: [役割と担当者]
- システム: [使用システム]
- 外部連携: [外部API/サービス]

【フロー定義】
1. [ステップ1] - [担当者/システム] - [処理内容]
2. [ステップ2] - [担当者/システム] - [処理内容]
3. [ステップ3] - [担当者/システム] - [処理内容]

【分岐条件】
- [条件1] → [処理A]
- [条件2] → [処理B]

【完了条件】
- [完了の判定基準]
- [成果物の定義]`;

const TEMPLATES = {
  macro: {
    name: "VBAマクロ作成",
    description: "Excel VBAマクロの作成",
    template: MACRO_TASK_TEMPLATE
  },
  general: {
    name: "汎用タスク自動化",
    description: "一般的なタスクの自動化",
    template: GENERAL_TASK_TEMPLATE
  },
  data: {
    name: "データ処理",
    description: "データの変換・加工処理",
    template: DATA_PROCESSING_TEMPLATE
  },
  workflow: {
    name: "ワークフロー自動化",
    description: "業務プロセスの自動化",
    template: WORKFLOW_TEMPLATE
  }
};

interface Message {
  text: string;
  sender: "user" | "ai";
  description?: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
}

// Vercelへのデプロイを再トリガーするためのコメント
export default function Home() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mainView, setMainView] = useState<'chat' | 'code' | 'flow'>('chat');
  
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [editingProjectDescription, setEditingProjectDescription] = useState("");

  const setFlow = useFlowStore((state) => state.setFlow);
  const loadProjectFlow = useFlowStore((state) => state.loadProjectFlow);
  const saveProjectFlow = useFlowStore((state) => state.saveProjectFlow);
  const currentProjectId = useFlowStore((state) => state.currentProjectId);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectData = urlParams.get('project');
    const action = urlParams.get('action');
    const view = urlParams.get('view');
    
    if (action === 'new-project') {
      const createNewProject = async () => {
        const newProjectName = prompt("Enter the name for the new project:", `Project ${projects.length + 1}`);
        if (!newProjectName) return;

        try {
          const response = await fetch("http://localhost:8000/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newProjectName }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const newProject: Project = await response.json();
          setProjects(prev => [newProject, ...prev]);
          setActiveProject(newProject);
          loadProjectFlow(newProject.id);
        } catch (error) {
          console.error("Failed to create project:", error);
          // エラーが発生した場合はオフラインモードでプロジェクトを作成
          const newProject: Project = {
            id: Date.now(),
            name: newProjectName,
            description: "オフラインプロジェクト"
          };
          setProjects(prev => [newProject, ...prev]);
          setActiveProject(newProject);
          loadProjectFlow(newProject.id);
        }
      };
      createNewProject();
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      return;
    }
    
    if (view === 'flow') {
      setMainView('flow');
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      return;
    }
    
    if (projectData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(projectData));
        
        if (decodedData.project && decodedData.messages) {
          setActiveProject(decodedData.project);
          setMessages(decodedData.messages);
          setMainView('chat');
          
          toast({
            title: "プロジェクト読み込み完了",
            description: `プロジェクト「${decodedData.project.name}」を読み込みました。`,
          });
        }
        
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (error) {
        console.error('Failed to load shared project:', error);
        toast({
          variant: "destructive",
          title: "読み込みエラー",
          description: "共有されたプロジェクトの読み込みに失敗しました。",
        });
      }
    }
  }, [projects.length, setFlow, toast, loadProjectFlow]);

  const handleCreateProject = useCallback(async (isInitial = false) => {
    const newProjectName = isInitial ? "New Project" : prompt("Enter the name for the new project:", `Project ${projects.length + 1}`);
    if (!newProjectName) return;

    if (!API_BASE_URL) {
      const newProject: Project = {
        id: Date.now(),
        name: newProjectName,
        description: "オフラインプロジェクト"
      };
      setProjects(prev => [newProject, ...prev]);
      
      if (currentProjectId !== null) {
        saveProjectFlow(currentProjectId);
      }
      
      setActiveProject(newProject);
      loadProjectFlow(newProject.id);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newProject: Project = await response.json();
      setProjects(prev => [newProject, ...prev]);
      
      if (currentProjectId !== null) {
        saveProjectFlow(currentProjectId);
      }
      
      setActiveProject(newProject);
      loadProjectFlow(newProject.id);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({
        variant: "destructive",
        title: "プロジェクト作成エラー",
        description: "プロジェクトの作成に失敗しました。",
      });
    }
  }, [projects.length, currentProjectId, saveProjectFlow, loadProjectFlow, toast]);

  const handleProjectSwitch = useCallback((project: Project) => {
    if (currentProjectId !== null) {
      saveProjectFlow(currentProjectId);
    }
    setActiveProject(project);
    loadProjectFlow(project.id);
  }, [currentProjectId, saveProjectFlow, loadProjectFlow]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!API_BASE_URL) {
        const fallbackProject: Project = { id: 1, name: "Demo Project", description: "オフラインデモプロジェクト" };
        setProjects([fallbackProject]);
        setActiveProject(fallbackProject);
        loadProjectFlow(fallbackProject.id);
        
        // オフラインデモ用の初期メッセージを設定
        const demoMessages: Message[] = [
          { text: "Excelのデータを集計してグラフを作るマクロを作成したい。", sender: "user" },
          { text: "どのようなデータを集計し、どの種類のグラフを作成しますか？", sender: "ai" },
          { text: "売上データを月ごとに集計し、棒グラフにしたいです。", sender: "user" },
          { text: "了解しました。以下の手順でフローを作成します。\n\n1. Excelファイルを開く\n2. 売上データを読み込む\n3. 月ごとに集計\n4. 棒グラフを作成\n5. グラフを保存\n\nこのフローに基づいてVBAマクロを生成します。", sender: "ai" }
        ];
        setMessages(demoMessages);
        
        // オフラインデモ用のフローも設定
        const demoFlow = {
          nodes: [
            { 
              id: '1', 
              type: 'custom', 
              position: { x: 400, y: 50 }, 
              data: { 
                id: '1', 
                shape: 'startEnd' as const, 
                label: 'Excelファイルを開く', 
                description: '売上データが含まれるExcelファイルを開く', 
                file: null, 
                onChange: () => {} 
              } 
            },
            { 
              id: '2', 
              type: 'custom', 
              position: { x: 400, y: 150 }, 
              data: { 
                id: '2', 
                shape: 'document' as const, 
                label: '売上データを読み込む', 
                description: '売上データシートからデータを読み込む', 
                file: null, 
                onChange: () => {} 
              } 
            },
            { 
              id: '3', 
              type: 'custom', 
              position: { x: 400, y: 250 }, 
              data: { 
                id: '3', 
                shape: 'document' as const, 
                label: '月ごとに集計', 
                description: '売上データを月ごとに集計する', 
                file: null, 
                onChange: () => {} 
              } 
            },
            { 
              id: '4', 
              type: 'custom', 
              position: { x: 400, y: 350 }, 
              data: { 
                id: '4', 
                shape: 'document' as const, 
                label: '棒グラフを作成', 
                description: '集計データから棒グラフを作成する', 
                file: null, 
                onChange: () => {} 
              } 
            },
            { 
              id: '5', 
              type: 'custom', 
              position: { x: 400, y: 450 }, 
              data: { 
                id: '5', 
                shape: 'startEnd' as const, 
                label: 'グラフを保存', 
                description: '作成したグラフを保存する', 
                file: null, 
                onChange: () => {} 
              } 
            },
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'step', animated: true, data: { id: 'e1-2' } },
            { id: 'e2-3', source: '2', target: '3', type: 'step', animated: true, data: { id: 'e2-3' } },
            { id: 'e3-4', source: '3', target: '4', type: 'step', animated: true, data: { id: 'e3-4' } },
            { id: 'e4-5', source: '4', target: '5', type: 'step', animated: true, data: { id: 'e4-5' } },
          ],
        };
        setFlow(demoFlow);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Project[] = await response.json();
        setProjects(data);
        if (data.length > 0 && data[0]) {
          setActiveProject(data[0]);
          loadProjectFlow(data[0].id);
        } else {
          try {
            const createResponse = await fetch(`${API_BASE_URL}/api/projects`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "New Project" }),
            });
            if (!createResponse.ok) {
              throw new Error(`HTTP error! status: ${createResponse.status}`);
            }
            const newProject: Project = await createResponse.json();
            setProjects([newProject]);
            setActiveProject(newProject);
            loadProjectFlow(newProject.id);
          } catch (error) {
            console.error("Failed to create initial project:", error);
            const fallbackProject: Project = { id: 1, name: "Demo Project", description: "オフラインデモプロジェクト" };
            setProjects([fallbackProject]);
            setActiveProject(fallbackProject);
            loadProjectFlow(fallbackProject.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        const fallbackProject: Project = { id: 1, name: "Demo Project", description: "オフラインデモプロジェクト" };
        setProjects([fallbackProject]);
        setActiveProject(fallbackProject);
        loadProjectFlow(fallbackProject.id);
      }
    };
    fetchProjects();
  }, [loadProjectFlow]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeProject) return;
      
      // オフラインモードでDemoProjectの場合、既にメッセージが設定されているのでスキップ
      if (!API_BASE_URL && activeProject.name === "Demo Project" && messages.length > 0) {
        return;
      }
      
      setIsLoading(true);
      setMessages([]);
      
      if (!API_BASE_URL) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${activeProject.id}/messages`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Message[] = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (mainView === 'chat') {
      fetchMessages();
    }
  }, [activeProject, mainView]);

  const handleGenerateFlow = useCallback(async () => {
    if (!input.trim() && messages.length === 0) {
      toast({
        variant: "destructive",
        title: "タスク定義が必要",
        description: "チャットでタスクを定義してからフローを生成してください。",
      });
      return;
    }

    setIsGenerating(true);
    setInput('');

    // チャットの内容を分析してタスク定義を抽出
    const chatContent = messages.map(msg => msg.text).join('\n');
    const taskDefinition = input.trim() || chatContent;

    // タスク定義に基づいてフローを生成
    console.log('Task Definition:', taskDefinition);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // タスク定義に基づいてフローを生成
    const mockApiResponse: { nodes: Node<CustomNodeData>[]; edges: Edge<CustomEdgeData>[] } = {
      nodes: [
        { 
          id: '1', 
          type: 'custom', 
          position: { x: 400, y: 50 }, 
          data: { 
            id: '1', 
            shape: 'startEnd' as const, 
            label: 'タスク定義の確認', 
            description: 'チャットで定義されたタスクの内容を確認', 
            file: null, 
            onChange: () => {} 
          } 
        },
        { 
          id: '2', 
          type: 'custom', 
          position: { x: 400, y: 150 }, 
          data: { 
            id: '2', 
            shape: 'document' as const, 
            label: 'タスク分析', 
            description: 'AIがタスクを分析し、必要なステップを特定', 
            file: null, 
            onChange: () => {} 
          } 
        },
        { 
          id: '3', 
          type: 'custom', 
          position: { x: 400, y: 250 }, 
          data: { 
            id: '3', 
            shape: 'diamond' as const, 
            label: 'マクロ作成が必要？', 
            description: 'VBAマクロの作成が必要かどうかを判断', 
            file: null, 
            onChange: () => {} 
          } 
        },
        { 
          id: '4', 
          type: 'custom', 
          position: { x: 200, y: 350 }, 
          data: { 
            id: '4', 
            shape: 'rectangle' as const, 
            label: 'マクロ機能設計', 
            description: '必要なマクロ機能を設計', 
            file: null, 
            onChange: () => {} 
          } 
        },
        { 
          id: '5', 
          type: 'custom', 
          position: { x: 600, y: 350 }, 
          data: { 
            id: '5', 
            shape: 'rectangle' as const, 
            label: 'その他の処理', 
            description: 'マクロ以外の処理を実行', 
            file: null, 
            onChange: () => {} 
          } 
        },
        { 
          id: '6', 
          type: 'custom', 
          position: { x: 400, y: 450 }, 
          data: { 
            id: '6', 
            shape: 'document' as const, 
            label: 'コード生成', 
            description: 'VBAコードを生成', 
            file: null, 
            onChange: () => {} 
          } 
        },
        { 
          id: '7', 
          type: 'custom', 
          position: { x: 400, y: 550 }, 
          data: { 
            id: '7', 
            shape: 'document' as const, 
            label: 'テスト・検証', 
            description: '生成されたコードのテストと検証', 
            file: null, 
            onChange: () => {} 
          } 
        },
        { 
          id: '8', 
          type: 'custom', 
          position: { x: 400, y: 650 }, 
          data: { 
            id: '8', 
            shape: 'startEnd' as const, 
            label: '完了', 
            description: 'タスク完了', 
            file: null, 
            onChange: () => {} 
          } 
        },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'step', animated: true, data: { id: 'e1-2' } },
        { id: 'e2-3', source: '2', target: '3', type: 'step', animated: true, data: { id: 'e2-3' } },
        { id: 'e3-4', source: '3', target: '4', type: 'step', label: 'はい', data: { id: 'e3-4' } },
        { id: 'e3-5', source: '3', target: '5', type: 'step', label: 'いいえ', data: { id: 'e3-5' } },
        { id: 'e4-6', source: '4', target: '6', type: 'step', data: { id: 'e4-6' } },
        { id: 'e5-6', source: '5', target: '6', type: 'step', data: { id: 'e5-6' } },
        { id: 'e6-7', source: '6', target: '7', type: 'step', data: { id: 'e6-7' } },
        { id: 'e7-8', source: '7', target: '8', type: 'step', data: { id: 'e7-8' } },
      ],
    };

    setFlow(mockApiResponse);
    setMainView('flow');
    setIsGenerating(false);
    
    toast({
      title: "フロー生成完了",
      description: "タスク定義からフローを生成しました。フロービューで確認できます。",
    });
  }, [input, messages, setFlow, toast]);

  const handleSelectTemplate = useCallback((templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    setInput(template.template);
    toast({
      title: "テンプレート読み込み",
      description: `${template.name}のテンプレートを読み込みました。必要に応じて編集してください。`,
    });
  }, [toast]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "" || !activeProject || isLoading) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    if (!API_BASE_URL) {
      const mockResponse: Message = {
        text: MOCK_OFFLINE_MESSAGE,
        sender: "ai"
      };
      setMessages((prev) => [...prev, mockResponse]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: activeProject.id, message: currentInput }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const aiResponse: Message = { text: data.response, sender: "ai" };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const mockResponse: Message = {
        text: MOCK_OFFLINE_MESSAGE,
        sender: "ai"
      };
      setMessages((prev) => [...prev, mockResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([GENERATED_CODE.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = GENERATED_CODE.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
    await copyToClipboard(GENERATED_CODE.code, "コードをクリップボードにコピーしました。");
  };

  const generateProjectShareableUrl = () => {
    if (!activeProject) return '';
    
    const projectData = {
      project: {
        id: activeProject.id,
        name: activeProject.name,
      },
      messages: messages,
      timestamp: new Date().toISOString(),
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(projectData));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?project=${encodedData}`;
  };

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "コピー完了",
        description: successMessage,
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        variant: "destructive",
        title: "コピーエラー",
        description: "クリップボードへのコピーに失敗しました。",
      });
    }
  };

  const handleShareProjectUrl = async () => {
    if (!activeProject) {
      toast({
        variant: "destructive",
        title: "シェアエラー",
        description: "プロジェクトが選択されていません。",
      });
      return;
    }
    
    const shareUrl = generateProjectShareableUrl();
    await copyToClipboard(shareUrl, "プロジェクトの共有URLをクリップボードにコピーしました。");
  };

  const handleShareProjectEmbed = async () => {
    if (!activeProject) {
      toast({
        variant: "destructive",
        title: "シェアエラー",
        description: "プロジェクトが選択されていません。",
      });
      return;
    }
    
    const shareUrl = generateProjectShareableUrl();
    const embedCode = `<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`;
    await copyToClipboard(embedCode, "プロジェクトの埋め込みコードをクリップボードにコピーしました。");
  };

  const handleShareProjectSocial = (platform: string) => {
    if (!activeProject) return;
    
    const shareUrl = generateProjectShareableUrl();
    const title = encodeURIComponent(`プロジェクト: ${activeProject.name}`);
    
    let socialUrl = '';
    
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShareProject = async () => {
    if (!activeProject) {
      toast({
        variant: "destructive",
        title: "シェアエラー",
        description: "プロジェクトが選択されていません。",
      });
      return;
    }

    if (!navigator.share) {
      await handleShareProjectUrl();
      return;
    }

    const shareUrl = generateProjectShareableUrl();
    const title = `プロジェクト: ${activeProject.name}`;
    const text = `このプロジェクトをご確認ください（${messages.length}メッセージ）`;

    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
      
      toast({
        title: "シェア完了",
        description: "プロジェクトをシェアしました。",
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
        await handleShareProjectUrl();
      }
    }
  };

  const handleOpenSettings = () => {
    if (activeProject) {
      setEditingProjectName(activeProject.name);
      setEditingProjectDescription(activeProject.description || "");
      setIsSettingsOpen(true);
    }
  };

  const handleUpdateProject = async () => {
    if (!activeProject) return;

    const trimmedName = editingProjectName.trim();
    if (!trimmedName) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "プロジェクト名を入力してください。",
      });
      return;
    }

    if (!API_BASE_URL) {
      const updatedProject = {
        ...activeProject,
        name: trimmedName,
        description: editingProjectDescription.trim()
      };
      setActiveProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === activeProject.id ? updatedProject : p));
      setIsSettingsOpen(false);
      
      toast({
        title: "プロジェクト更新完了",
        description: "ローカルでプロジェクト情報を更新しました。",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${activeProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          description: editingProjectDescription.trim()
        }),
      });
      
      if (response.ok) {
        const updatedProject: Project = await response.json();
        
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        setActiveProject(updatedProject);
        setIsSettingsOpen(false);
        
        toast({
          title: "プロジェクト更新完了",
          description: "プロジェクト情報が更新されました。",
        });
      } else {
        throw new Error('Failed to update project');
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      const updatedProject: Project = {
        ...activeProject,
        name: trimmedName,
        description: editingProjectDescription.trim()
      };
      
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      setActiveProject(updatedProject);
      setIsSettingsOpen(false);
      
      toast({
        title: "プロジェクト更新完了（オフライン）",
        description: "ローカルでプロジェクト情報を更新しました。",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    
    const confirmDelete = window.confirm(`プロジェクト「${activeProject.name}」を削除しますか？この操作は取り消せません。`);
    if (!confirmDelete) return;

    if (!API_BASE_URL) {
      const updatedProjects = projects.filter(p => p.id !== activeProject.id);
      setProjects(updatedProjects);
      
      const nextProject = updatedProjects[0];
      if (nextProject) {
        setActiveProject(nextProject);
        loadProjectFlow(nextProject.id);
      } else {
        await handleCreateProject(true);
      }
      
      setIsSettingsOpen(false);
      
      toast({
        title: "プロジェクト削除完了",
        description: "ローカルでプロジェクトを削除しました。",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${activeProject.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        const updatedProjects = projects.filter(p => p.id !== activeProject.id);
        setProjects(updatedProjects);
        
        const nextProject = updatedProjects[0];
        if (nextProject) {
          setActiveProject(nextProject);
          loadProjectFlow(nextProject.id);
        } else {
          await handleCreateProject(true);
        }
        
        setIsSettingsOpen(false);
        
        toast({
          title: "プロジェクト削除完了",
          description: "プロジェクトが削除されました。",
        });
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      const updatedProjects = projects.filter(p => p.id !== activeProject.id);
      setProjects(updatedProjects);
      
      const nextProject = updatedProjects[0];
      if (nextProject) {
        setActiveProject(nextProject);
        loadProjectFlow(nextProject.id);
      } else {
        await handleCreateProject(true);
      }
      
      setIsSettingsOpen(false);
      
      toast({
        title: "プロジェクト削除完了（オフライン）",
        description: "ローカルでプロジェクトを削除しました。",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <aside
          className={cn(
            "w-72 flex flex-col border-r bg-muted/20 p-4 transition-transform duration-300 ease-in-out z-30",
            isMobile
              ? `fixed inset-y-0 left-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : "relative translate-x-0"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Image
                src="/img/logo_192.png"
                alt="Jido-ka Logo"
                width={40}
                height={40}
                className="rounded-md"
                priority
              />
              <h2 className="text-2xl font-bold tracking-tight">Jido-ka</h2>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="mt-4">
            <Button className="w-full" onClick={() => handleCreateProject()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
          <div className="h-[calc(100vh-8rem)] mt-4">
            <div className="space-y-2">
              {projects.map((proj) => (
                <Tooltip key={proj.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeProject?.id === proj.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto py-2"
                      onClick={() => handleProjectSwitch(proj)}
                    >
                      <FolderKanban className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div className="text-left min-w-0 flex-1">
                        <div className="truncate font-medium">{proj.name}</div>
                        {proj.description && (
                          <div className="truncate text-xs text-muted-foreground mt-1">
                            {proj.description}
                          </div>
                        )}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div>
                      <div className="font-medium">{proj.name}</div>
                      {proj.description && (
                        <div className="text-sm mt-1">{proj.description}</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col h-screen">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-2 border-b bg-background px-4 shadow-sm flex-shrink-0">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <h1
              className={cn(
                "font-semibold truncate cursor-pointer flex-1 min-w-0",
                isMobile ? "text-lg" : "text-xl"
              )}
              onClick={() => setMainView('chat')}
            >
              {activeProject ? activeProject.name : "プロジェクトを選択してください"}
            </h1>
            <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-2")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mainView === 'chat' ? 'default' : 'outline'}
                    size={isMobile ? "icon" : "default"}
                    className={cn(
                      "transition-all duration-200",
                      isMobile ? "h-8 w-8" : "",
                      mainView === 'chat' && "shadow-md"
                    )}
                    onClick={() => setMainView('chat')}
                  >
                    <MessageSquare className={cn("h-4 w-4", !isMobile && "mr-2")} />
                    {!isMobile && <span>チャット</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>チャット</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mainView === 'flow' ? 'default' : 'outline'}
                    size={isMobile ? "icon" : "default"}
                    className={cn(
                      "transition-all duration-200",
                      isMobile ? "h-8 w-8" : "",
                      mainView === 'flow' && "shadow-md"
                    )}
                    onClick={() => setMainView('flow')}
                  >
                    <Workflow className={cn("h-4 w-4", !isMobile && "mr-2")} />
                    {!isMobile && <span>フロー</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>フローチャート</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mainView === 'code' ? 'default' : 'outline'}
                    size={isMobile ? "icon" : "default"}
                    className={cn(
                      "transition-all duration-200",
                      isMobile ? "h-8 w-8" : "",
                      mainView === 'code' && "shadow-md"
                    )}
                    onClick={() => setMainView('code')}
                  >
                    <FileCode className={cn("h-4 w-4", !isMobile && "mr-2")} />
                    {!isMobile && <span>コード</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>コードを表示</TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className={isMobile ? "h-8 w-8" : ""}>
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleNativeShareProject}>
                    <Share2 className="h-4 w-4 mr-2" />
                    プロジェクトをシェア
                  </DropdownMenuItem>
                  {!isMobile && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleShareProjectUrl}>
                        <Link className="h-4 w-4 mr-2" />
                        URLをコピー
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShareProjectEmbed}>
                        <Code className="h-4 w-4 mr-2" />
                        埋め込みコード
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleShareProjectSocial('twitter')}>
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareProjectSocial('facebook')}>
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareProjectSocial('linkedin')}>
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className={isMobile ? "h-8 w-8" : ""} onClick={handleOpenSettings}>
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("sm:max-w-[500px]", isMobile && "w-[90vw]")}>
                  <DialogHeader>
                    <DialogTitle>プロジェクト設定</DialogTitle>
                    <DialogDescription>
                      プロジェクトの名前と説明を編集できます。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="project-name">プロジェクト名</Label>
                      <Input
                        id="project-name"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        placeholder="プロジェクト名を入力"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleUpdateProject();
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="project-description">説明（任意）</Label>
                      <Textarea
                        id="project-description"
                        value={editingProjectDescription}
                        onChange={(e) => setEditingProjectDescription(e.target.value)}
                        placeholder="プロジェクトの説明を入力..."
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            e.preventDefault();
                            handleUpdateProject();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteProject}
                      className="sm:mr-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      プロジェクトを削除
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleUpdateProject}>
                        <Edit className="h-4 w-4 mr-2" />
                        更新
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleGenerateFlow}
                    disabled={isGenerating || mainView !== 'chat'}
                    size={isMobile ? "icon" : "default"}
                    className={isMobile ? "h-8 w-8" : ""}
                  >
                    {isGenerating ? (
                      <LoaderCircle className={cn("h-4 w-4 animate-spin", !isMobile && "mr-2")} />
                    ) : (
                      <MessageSquarePlus className={cn("h-4 w-4", !isMobile && "mr-2")} />
                    )}
                    {!isMobile && "タスク定義からフロー生成"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>チャットで定義したタスクからフローを生成</p>
                </TooltipContent>
              </Tooltip>
              {mainView === 'chat' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size={isMobile ? "icon" : "default"}
                      className={isMobile ? "h-8 w-8" : ""}
                    >
                      <FileCode className={cn("h-4 w-4", !isMobile && "mr-2")} />
                      {!isMobile && "テンプレート"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleSelectTemplate('general')}>
                      <div className="flex flex-col">
                        <span className="font-medium">{TEMPLATES.general.name}</span>
                        <span className="text-xs text-muted-foreground">{TEMPLATES.general.description}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelectTemplate('macro')}>
                      <div className="flex flex-col">
                        <span className="font-medium">{TEMPLATES.macro.name}</span>
                        <span className="text-xs text-muted-foreground">{TEMPLATES.macro.description}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelectTemplate('data')}>
                      <div className="flex flex-col">
                        <span className="font-medium">{TEMPLATES.data.name}</span>
                        <span className="text-xs text-muted-foreground">{TEMPLATES.data.description}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelectTemplate('workflow')}>
                      <div className="flex flex-col">
                        <span className="font-medium">{TEMPLATES.workflow.name}</span>
                        <span className="text-xs text-muted-foreground">{TEMPLATES.workflow.description}</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className={cn(
              "h-full transition-all duration-300 ease-in-out",
              mainView === 'chat' ? "opacity-100" : "opacity-0"
            )}>
              {mainView === 'chat' && (
                <main className={cn("h-[calc(100vh-200px)]", isMobile ? "p-3" : "p-6")}>
                  <div className={cn("space-y-4", !isMobile && "space-y-6")}>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start",
                          isMobile ? "gap-3" : "gap-4",
                          msg.sender === "user" ? "flex-row-reverse" : ""
                        )}
                      >
                        <Avatar className={cn(isMobile ? "h-8 w-8" : "h-9 w-9", "flex-shrink-0")}>
                          <AvatarFallback>
                            {msg.sender === 'ai' ? <Bot size={isMobile ? 18 : 20} /> : <User size={isMobile ? 18 : 20} />}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "rounded-lg p-3 prose",
                            isMobile ? "text-sm max-w-[85%]" : "text-base max-w-2xl",
                            msg.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted dark:prose-invert"
                          )}
                        >
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.text}
                           </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length-1]?.sender === 'user' && (
                      <div className={cn("flex items-start", isMobile ? "gap-3" : "gap-4")}>
                        <Avatar className={cn(isMobile ? "h-8 w-8" : "h-9 w-9", "flex-shrink-0")}>
                          <AvatarFallback><Bot size={isMobile ? 18 : 20} /></AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-2">
                          <LoaderCircle className="animate-spin h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    )}
                    <div className="h-4"></div>
                  </div>
                </main>
              )}
            </div>

            <div className={cn(
              "h-full transition-all duration-300 ease-in-out",
              mainView === 'flow' ? "opacity-100" : "opacity-0"
            )}>
              {mainView === 'flow' && (
                <ErrorBoundary>
                  {isMobile ? (
                    <div className="h-full">
                      <Flowchart />
                    </div>
                  ) : (
                    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                      <ResizablePanel defaultSize={20} minSize={15}>
                        <ErrorBoundary>
                          <Sidebar />
                        </ErrorBoundary>
                      </ResizablePanel>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={80}>
                         <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={75}>
                              <ErrorBoundary>
                                <Flowchart />
                              </ErrorBoundary>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={25}>
                              <ErrorBoundary>
                                <Inspector />
                              </ErrorBoundary>
                            </ResizablePanel>
                         </ResizablePanelGroup>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                </ErrorBoundary>
              )}
            </div>

            <div className={cn(
              "h-full transition-all duration-300 ease-in-out",
              mainView === 'code' ? "opacity-100" : "opacity-0"
            )}>
              {mainView === 'code' && (
                <div className="h-full">
                  <div className={cn("mx-auto space-y-4", isMobile ? "p-3 max-w-full" : "p-6 max-w-6xl space-y-6")}>
                    <div className={cn("flex", isMobile ? "flex-col gap-3" : "items-center justify-between")}>
                      <div>
                        <h1 className={cn("font-semibold", isMobile ? "text-xl" : "text-2xl")}>生成されたコード</h1>
                        <p className="text-sm text-muted-foreground mt-1">{GENERATED_CODE.filename}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleCopyCode} size="sm">
                          <Copy className={cn("h-4 w-4", !isMobile && "mr-2")} />
                          {!isMobile && "コピー"}
                        </Button>
                        <Button onClick={handleDownloadCode} size="sm">
                          <Download className={cn("h-4 w-4", !isMobile && "mr-2")} />
                          {!isMobile && "ダウンロード"}
                        </Button>
                      </div>
                    </div>

                    <div className={cn("grid gap-4", !isMobile && "grid-cols-4 gap-6")}>
                      
                      {!isMobile && (
                        <div className="col-span-1 space-y-6">
                          <div>
                            <h3 className="text-sm font-medium mb-3">説明</h3>
                            <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {GENERATED_CODE.explanation}
                              </ReactMarkdown>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium mb-3">ファイル情報</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">言語</span>
                                <span>VBA</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">行数</span>
                                <span>{GENERATED_CODE.code.split('\n').length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">文字数</span>
                                <span>{GENERATED_CODE.code.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={cn(isMobile ? "" : "col-span-3")}>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">{GENERATED_CODE.filename}</CardTitle>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleDownloadCode}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <Separator />
                          <CardContent className="p-0">
                            <div className={cn("relative", isMobile ? "max-h-[400px]" : "max-h-[600px]")}>
                              <pre className={cn("font-mono leading-relaxed", isMobile ? "p-3 text-xs" : "p-4 text-sm")}>
                                {GENERATED_CODE.code.split('\n').map((line: string, index: number) => (
                                  <div key={index} className="flex">
                                    <span className={cn(
                                      "select-none text-right pr-3 text-muted-foreground/50 text-xs leading-relaxed",
                                      isMobile ? "w-6" : "w-8"
                                    )}>
                                      {index + 1}
                                    </span>
                                    <span className="flex-1 break-all">{line || ' '}</span>
                                  </div>
                                ))}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {mainView === 'chat' && (
            <footer className={cn(
              "sticky bottom-0 border-t bg-background/95 backdrop-blur-sm",
              isMobile ? "p-3" : "p-4"
            )}>
              <div className="relative">
                <form onSubmit={handleSendMessage}>
                  <div className="relative">
                    <Textarea
                      placeholder="メッセージを送信..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className={cn(
                        "pr-12 font-chat resize-y",
                        isMobile ? "min-h-[80px] max-h-[600px] text-sm" : "min-h-[100px] max-h-[800px] text-base"
                      )}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (input.trim() !== "" && !isLoading) {
                            // フォーム送信をシミュレート
                            const form = e.currentTarget.closest('form');
                            if (form) {
                              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                              form.dispatchEvent(submitEvent);
                            }
                          }
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className={cn(
                        "absolute bottom-2 right-2",
                        isMobile ? "h-8 w-8" : "h-8 w-8"
                      )}
                      disabled={isLoading || input.trim() === ""}
                    >
                      <CornerDownLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </footer>
          )}
        </div>
    </div>
    <Toaster />
    <PWAInstallPrompt />
    </TooltipProvider>
  );
}