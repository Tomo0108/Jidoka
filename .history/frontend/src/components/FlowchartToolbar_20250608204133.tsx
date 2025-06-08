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
  Info
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





  return (
    <Card className="m-2 shadow-lg border-border/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
      <div className="flowchart-toolbar flex items-center justify-between p-3">
        {/* 左側: メイン操作 */}
        <div className="flex items-center gap-3">
          {/* プロジェクト情報 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h3 className="font-semibold text-sm">フローチャート</h3>
              <p className="text-xs text-muted-foreground">
                {nodes.length} ノード, {edges.length} 接続
              </p>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* ファイル操作 */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleNew} className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">新規</span>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">保存</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleImport}
              disabled={isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">インポート</span>
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* エクスポート */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isExporting} className="gap-2">
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">エクスポート</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
                <FileText className="h-4 w-4" />
                PDFファイル
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('png')} className="gap-2">
                <Image className="h-4 w-4" />
                PNG画像
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('svg')} className="gap-2">
                <Code className="h-4 w-4" />
                SVGファイル
              </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('json')}>
              <FolderOpen className="h-4 w-4 mr-2" />
              JSONデータ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>


      </div>

      {/* 右側: 基本情報 */}
      <div className="text-sm text-muted-foreground">
        {nodes.length}ノード • {edges.length}エッジ
      </div>
    </div>
  );
} 