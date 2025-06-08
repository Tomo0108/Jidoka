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
  Share2,
  Link,
  Twitter,
  Facebook,
  Linkedin,
  Copy
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
  const [isSharing, setIsSharing] = useState(false);

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

  // シェア機能
  const generateShareableUrl = () => {
    const data = getCurrentFlowchartData();
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?flow=${encodedData}`;
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

  const handleShareUrl = async () => {
    const shareUrl = generateShareableUrl();
    await copyToClipboard(shareUrl, "共有URLをクリップボードにコピーしました。");
  };

  const handleShareEmbed = async () => {
    const shareUrl = generateShareableUrl();
    const embedCode = `<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`;
    await copyToClipboard(embedCode, "埋め込みコードをクリップボードにコピーしました。");
  };

  const handleShareSocial = (platform: string) => {
    const shareUrl = generateShareableUrl();
    const title = encodeURIComponent(`フローチャート: ${metadata.title || '無題'}`);
    const description = encodeURIComponent(`このフローチャートをご確認ください（${nodes.length}ノード、${edges.length}エッジ）`);
    
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



  return (
    <div className="flowchart-toolbar flex items-center justify-between">
      {/* 左側: メイン操作 */}
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

        {/* シェア */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isSharing}>
              <Share2 className="h-4 w-4 mr-1" />
              シェア
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleShareUrl}>
              <Link className="h-4 w-4 mr-2" />
              URLをコピー
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareEmbed}>
              <Code className="h-4 w-4 mr-2" />
              埋め込みコード
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleShareSocial('twitter')}>
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShareSocial('facebook')}>
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShareSocial('linkedin')}>
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
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