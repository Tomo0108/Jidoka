"use client";

import React, { useState } from 'react';
import { useFlowStore } from '@/hooks/useFlowStore';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Upload,
  FileText,
  Image,
  Code,
  Save,
  FolderOpen,
  RefreshCw,
  Palette,
  Settings,
  Layers,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  MoreHorizontal,
  Workflow
} from 'lucide-react';
import { FlowchartExporter, FlowchartImporter } from '@/lib/exportUtils';
import { ExportFormat, FlowchartData } from '@/lib/types';

export function FlowchartToolbar() {
  const { toast } = useToast();
  
  const nodes = useFlowStore(state => state.nodes);
  const edges = useFlowStore(state => state.edges);
  const metadata = useFlowStore(state => state.metadata);
  const validationErrors = useFlowStore(state => state.validationErrors);
  const currentProjectId = useFlowStore(state => state.currentProjectId);
  const setFlow = useFlowStore(state => state.setFlow);
  const updateMetadata = useFlowStore(state => state.updateMetadata);
  const resetFlowchart = useFlowStore(state => state.resetFlowchart);
  const saveProjectFlow = useFlowStore(state => state.saveProjectFlow);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 現在のフローチャートデータを取得
  const getCurrentFlowchartData = (): FlowchartData => ({
    metadata,
    nodes,
    edges,
    validationErrors
  });

  // エクスポート処理
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const data = getCurrentFlowchartData();
      await FlowchartExporter.export(format, data, 'flowchart-canvas', metadata.title);
      
      toast({
        title: "エクスポート完了",
        description: `フローチャートを${format.toUpperCase()}形式でエクスポートしました。`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: "destructive",
        title: "エクスポートエラー",
        description: "ファイルのエクスポートに失敗しました。",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // インポート処理
  const handleImport = async () => {
    setIsImporting(true);
    try {
      const data = await FlowchartImporter.selectAndImport();
      setFlow(data);
      updateMetadata(data.metadata);
      
      toast({
        title: "インポート完了",
        description: "フローチャートをインポートしました。",
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        variant: "destructive",
        title: "インポートエラー",
        description: "ファイルのインポートに失敗しました。",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // 保存処理（プロジェクト別にLocalStorageに保存）
  const handleSave = () => {
    if (currentProjectId === null) {
      toast({
        variant: "destructive",
        title: "保存エラー",
        description: "プロジェクトが選択されていません。",
      });
      return;
    }

    try {
      saveProjectFlow(currentProjectId);
      
      toast({
        title: "保存完了",
        description: "フローチャートを保存しました。",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        variant: "destructive",
        title: "保存エラー",
        description: "フローチャートの保存に失敗しました。",
      });
    }
  };

  // 新規作成
  const handleNew = () => {
    if (confirm('現在の作業内容は失われます。新しいフローチャートを作成しますか？')) {
      resetFlowchart();
      toast({
        title: "新規作成",
        description: "新しいフローチャートを作成しました。",
      });
    }
  };

  // バリデーション状態の取得
  const getValidationStatus = () => {
    const errorCount = validationErrors.filter(v => v.type === 'error').length;
    const warningCount = validationErrors.filter(v => v.type === 'warning').length;
    
    if (errorCount > 0) {
      return { 
        type: 'error' as const, 
        count: errorCount, 
        icon: AlertTriangle, 
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800'
      };
    }
    if (warningCount > 0) {
      return { 
        type: 'warning' as const, 
        count: warningCount, 
        icon: Info, 
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      };
    }
    return { 
      type: 'success' as const, 
      count: 0, 
      icon: CheckCircle, 
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800'
    };
  };

  const validationStatus = getValidationStatus();
  const StatusIcon = validationStatus.icon;

  return (
    <div className="bg-white dark:bg-[#2C3E50] border-b border-slate-200 dark:border-slate-600 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* 左側: プロジェクト情報とナビゲーション */}
        <div className="flex items-center gap-4">
          {/* プロジェクトアイコンとタイトル */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-xl flex items-center justify-center shadow-lg">
              <Workflow className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {metadata.title || 'フローチャート'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {nodes.length} ノード • {edges.length} 接続
              </p>
            </div>
          </div>

          {/* ステータスインジケーター */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${validationStatus.bgColor} ${validationStatus.borderColor}`}>
            <StatusIcon className={`h-4 w-4 ${validationStatus.color}`} />
            <span className={`text-sm font-medium ${validationStatus.color}`}>
              {validationStatus.type === 'success' ? '正常' : 
               validationStatus.type === 'warning' ? `警告 ${validationStatus.count}件` : 
               `エラー ${validationStatus.count}件`}
            </span>
          </div>
        </div>

        {/* 中央: 主要アクション */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNew}
            className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            新規
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Save className="h-4 w-4" />
            保存
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleImport}
            disabled={isImporting}
            className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {isImporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            インポート
          </Button>

          {/* エクスポートドロップダウン */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isExporting}
                className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                エクスポート
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2">
                <Code className="h-4 w-4 text-blue-500" />
                JSON ファイル
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('png')} className="gap-2">
                <Image className="h-4 w-4 text-green-500" />
                PNG 画像
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('svg')} className="gap-2">
                <Palette className="h-4 w-4 text-purple-500" />
                SVG ベクター
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 右側: 設定とその他 */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-700">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                設定
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <Info className="h-4 w-4" />
                ヘルプ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 