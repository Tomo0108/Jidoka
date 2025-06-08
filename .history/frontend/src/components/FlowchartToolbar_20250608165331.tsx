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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Upload,
  FileText,
  Image,
  Code,
  Save,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { FlowchartExporter, FlowchartImporter } from '@/lib/exportUtils';
import { ExportFormat, FlowchartData } from '@/lib/types';

interface FlowchartToolbarProps {
  onShowStatistics?: () => void;
}

export function FlowchartToolbar({ onShowStatistics }: FlowchartToolbarProps) {
  const { toast } = useToast();
  
  const nodes = useFlowStore(state => state.nodes);
  const edges = useFlowStore(state => state.edges);
  const metadata = useFlowStore(state => state.metadata);
  const validationErrors = useFlowStore(state => state.validationErrors);
  const isValidationEnabled = useFlowStore(state => state.isValidationEnabled);
  const setFlow = useFlowStore(state => state.setFlow);
  const validateFlowchart = useFlowStore(state => state.validateFlowchart);
  const toggleValidation = useFlowStore(state => state.toggleValidation);
  const updateMetadata = useFlowStore(state => state.updateMetadata);
  const resetFlowchart = useFlowStore(state => state.resetFlowchart);

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

  // 保存処理（LocalStorageに保存）
  const handleSave = () => {
    try {
      const data = getCurrentFlowchartData();
      localStorage.setItem(`flowchart_${metadata.id}`, JSON.stringify(data));
      updateMetadata({ lastModified: new Date() });
      
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

  // バリデーション実行
  const handleValidate = () => {
    validateFlowchart();
    toast({
      title: "バリデーション実行",
      description: `${validationErrors.length}件の問題が見つかりました。`,
    });
  };

  // エラー・警告の数を計算
  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;

  return (
    <div className="flowchart-toolbar flex flex-col gap-2">
      {/* 第1行: メイン操作 */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {/* ファイル操作 */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleNew}>
              <FileText className="h-4 w-4 mr-1" />
              新規
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              インポート
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* エクスポート */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                エクスポート
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDFファイル
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('png')}>
                <Image className="h-4 w-4 mr-2" />
                PNG画像
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('svg')}>
                <Code className="h-4 w-4 mr-2" />
                SVGファイル
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FolderOpen className="h-4 w-4 mr-2" />
                JSONデータ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* バリデーション */}
          <div className="flex items-center gap-1">
            <Button 
              variant={isValidationEnabled ? "default" : "outline"}
              size="sm" 
              onClick={toggleValidation}
            >
              {isValidationEnabled ? (
                <Eye className="h-4 w-4 mr-1" />
              ) : (
                <EyeOff className="h-4 w-4 mr-1" />
              )}
              検証
            </Button>

            {isValidationEnabled && (
              <Button variant="outline" size="sm" onClick={handleValidate}>
                <RefreshCw className="h-4 w-4 mr-1" />
                再検証
              </Button>
            )}
          </div>
        </div>

        {/* フローチャート情報 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{metadata.title}</span>
          <span>v{metadata.version}</span>
          {metadata.approvalStatus && (
            <Badge 
              variant={metadata.approvalStatus === 'approved' ? 'default' : 'secondary'}
            >
              {metadata.approvalStatus === 'draft' && '下書き'}
              {metadata.approvalStatus === 'pending' && '承認待ち'}
              {metadata.approvalStatus === 'approved' && '承認済み'}
              {metadata.approvalStatus === 'rejected' && '却下'}
            </Badge>
          )}
        </div>
      </div>

      {/* 第2行: ステータスと統計 */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {/* バリデーション結果 */}
          {isValidationEnabled && (
            <div className="flex items-center gap-1">
              {errorCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  エラー {errorCount}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  警告 {warningCount}
                </Badge>
              )}
              {errorCount === 0 && warningCount === 0 && (
                <Badge variant="outline" className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  エラーなし
                </Badge>
              )}
            </div>
          )}

          {/* ノード/エッジ数 */}
          <div className="text-sm text-muted-foreground">
            {nodes.length}ノード • {edges.length}エッジ
          </div>
        </div>

        {/* 統計ボタン */}
        {onShowStatistics && (
          <Button variant="ghost" size="sm" onClick={onShowStatistics}>
            <BarChart3 className="h-4 w-4 mr-1" />
            統計を表示
          </Button>
        )}
      </div>
    </div>
  );
} 