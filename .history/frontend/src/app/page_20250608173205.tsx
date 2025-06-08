"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, CornerDownLeft, PlusCircle, Settings, Share2, FolderKanban, LoaderCircle, FileCode, Download, Workflow, MessageSquarePlus, Undo, Redo, MessageSquare, Link, Code, Twitter, Facebook, Linkedin, Copy, Edit, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Flowchart } from "@/components/Flowchart";
import { Sidebar } from "@/components/Sidebar";
import { Inspector } from "@/components/Inspector";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useFlowStore, useTemporalStore } from '@/hooks/useFlowStore';

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

interface Message {
  text: string;
  sender: "user" | "ai";
}

interface Project {
  id: number;
  name: string;
  description?: string;
}

export default function Home() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mainView, setMainView] = useState<'chat' | 'code' | 'flow'>('chat');
  const [generatedCode] = useState({
    explanation: "これは、ユーザーの指示に基づいてAIが生成したVBAコードのサンプルです。ボタンをクリックすると、メッセージボックスに「Hello, World!」と表示されます。",
    code: `Sub HelloWorld()\n  MsgBox "Hello, World!"\nEnd Sub`,
    filename: "HelloWorld.vba"
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [editingProjectDescription, setEditingProjectDescription] = useState("");

  const setFlow = useFlowStore((state) => state.setFlow);
  const loadProjectFlow = useFlowStore((state) => state.loadProjectFlow);
  const saveProjectFlow = useFlowStore((state) => state.saveProjectFlow);
  const currentProjectId = useFlowStore((state) => state.currentProjectId);
  const undo = useTemporalStore(state => state.undo);
  const redo = useTemporalStore(state => state.redo);
  const pastStates = useTemporalStore(state => state.pastStates);
  const futureStates = useTemporalStore(state => state.futureStates);

  // URLパラメーターからプロジェクトデータを読み込む
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectData = urlParams.get('project');
    
    if (projectData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(projectData));
        
        // 共有されたプロジェクトデータをセット
        if (decodedData.project && decodedData.messages) {
          setActiveProject(decodedData.project);
          setMessages(decodedData.messages);
          setMainView('chat'); // チャットビューに切り替え
          
          toast({
            title: "プロジェクト読み込み完了",
            description: `プロジェクト「${decodedData.project.name}」を読み込みました。`,
          });
        }
        
        // URLパラメーターをクリア（履歴を汚さないため）
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
  }, [setFlow, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleCreateProject = useCallback(async (isInitial = false) => {
    const newProjectName = isInitial ? "New Project" : prompt("Enter the name for the new project:", `Project ${projects.length + 1}`);
    if (!newProjectName) return;

    try {
      const response = await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      });
      const newProject: Project = await response.json();
      setProjects(prev => [newProject, ...prev]);
      
      // 前のプロジェクトのフローを保存
      if (currentProjectId !== null) {
        saveProjectFlow(currentProjectId);
      }
      
      // 新しいプロジェクトに切り替えてフローを読み込み
      setActiveProject(newProject);
      loadProjectFlow(newProject.id);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  }, [projects.length, currentProjectId, saveProjectFlow, loadProjectFlow]);

  const handleProjectSwitch = useCallback((project: Project) => {
    // 現在のプロジェクトのフローを保存
    if (currentProjectId !== null && currentProjectId !== project.id) {
      saveProjectFlow(currentProjectId);
    }
    
    // 新しいプロジェクトに切り替えてフローを読み込み
    setActiveProject(project);
    loadProjectFlow(project.id);
  }, [currentProjectId, saveProjectFlow, loadProjectFlow]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/projects");
        const data: Project[] = await response.json();
        setProjects(data);
        if (data.length > 0) {
          setActiveProject(data[0]);
          loadProjectFlow(data[0].id);
        } else {
          await handleCreateProject(true);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, [handleCreateProject]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeProject) return;
      setIsLoading(true);
      setMessages([]);
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${activeProject.id}/messages`);
        const data: Message[] = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (mainView === 'chat') {
      fetchMessages();
    }
  }, [activeProject, mainView]);

  const handleGenerateFlow = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    setInput('');

    // --- AI/Backend API Call (Mock) ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    const mockApiResponse = {
      nodes: [
        { id: '1', type: 'custom', position: { x: 400, y: 50 }, data: { id: '1', shape: 'startEnd', label: '顧客からの問い合わせ', description: '電話またはメールで受け付け' } },
        { id: '2', type: 'custom', position: { x: 400, y: 200 }, data: { id: '2', shape: 'predefinedProcess', label: '問い合わせ内容の記録', description: 'CRMシステムに入力' } },
        { id: '3', type: 'custom', position: { x: 400, y: 350 }, data: { id: '3', shape: 'diamond', label: '緊急案件か？', description: 'SLA（サービスレベル契約）に基づく' } },
        { id: '4', type: 'custom', position: { x: 150, y: 500 }, data: { id: '4', shape: 'rectangle', label: '担当者へ即時通知', description: 'チャットとメールで通知' } },
        { id: '5', type: 'custom', position: { x: 650, y: 500 }, data: { id: '5', shape: 'rectangle', label: '通常キューに追加', description: '翌営業日までに対応' } },
        { id: '6', type: 'custom', position: { x: 400, y: 650 }, data: { id: '6', shape: 'document', label: '対応記録の作成', description: '対応結果をまとめる' } },
        { id: '7', type: 'custom', position: { x: 400, y: 800 }, data: { id: '7', shape: 'startEnd', label: 'クローズ', description: '顧客に完了を通知' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'step', animated: true },
        { id: 'e2-3', source: '2', target: '3', type: 'step', animated: true },
        { id: 'e3-4', source: '3', target: '4', type: 'step', label: 'はい' },
        { id: 'e3-5', source: '3', target: '5', type: 'step', label: 'いいえ' },
        { id: 'e4-6', source: '4', target: '6', type: 'step' },
        { id: 'e5-6', source: '5', target: '6', type: 'step' },
        { id: 'e6-7', source: '6', target: '7', type: 'step' },
      ],
    };

    setFlow(mockApiResponse);
    setIsGenerating(false);
    // --- End of Mock ---
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "" || !activeProject || isLoading) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: activeProject.id, message: currentInput }),
      });
      const data = await response.json();
      const aiResponse: Message = { text: data.response, sender: "ai" };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse: Message = { text: "バックエンドへの接続でエラーが発生しました。", sender: "ai" };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generatedCode.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // プロジェクトシェア機能
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
    const description = encodeURIComponent(`このプロジェクトをご確認ください（${messages.length}メッセージ）`);
    
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

  // Web Share API を使用したネイティブシェア
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
      // Web Share API がサポートされていない場合はURLコピーにフォールバック
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
        // エラーの場合はURLコピーにフォールバック
        await handleShareProjectUrl();
      }
    }
  };

  // プロジェクト設定機能
  const handleOpenSettings = () => {
    if (activeProject) {
      setEditingProjectName(activeProject.name);
      setEditingProjectDescription(activeProject.description || "");
      setIsSettingsOpen(true);
    }
  };

  const handleUpdateProject = async () => {
    if (!activeProject) return;

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${activeProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: editingProjectName.trim(),
          description: editingProjectDescription.trim()
        }),
      });
      
      if (response.ok) {
        const updatedProject: Project = await response.json();
        
        // プロジェクトリストを更新
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
      toast({
        variant: "destructive",
        title: "更新エラー",
        description: "プロジェクトの更新に失敗しました。",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    
    const confirmDelete = confirm(`プロジェクト「${activeProject.name}」を削除しますか？この操作は取り消せません。`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${activeProject.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // プロジェクトリストから削除
        const updatedProjects = projects.filter(p => p.id !== activeProject.id);
        setProjects(updatedProjects);
        
        // 他のプロジェクトに切り替えまたは新規作成
        if (updatedProjects.length > 0) {
          setActiveProject(updatedProjects[0]);
          loadProjectFlow(updatedProjects[0].id);
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
      toast({
        variant: "destructive",
        title: "削除エラー",
        description: "プロジェクトの削除に失敗しました。",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background text-foreground">
        <aside className="w-72 flex-col border-r bg-muted/20 p-4">
          <div className="flex items-center justify-start gap-2">
            <Image
              src="/img/logo_192.png"
              alt="Jido-ka Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <h2 className="text-2xl font-bold tracking-tight">Jido-ka</h2>
          </div>
          <div className="mt-4">
            <Button className="w-full" onClick={() => handleCreateProject()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
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
          </ScrollArea>
        </aside>

        <div className="flex flex-1 flex-col h-screen">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-4 border-b bg-background px-4 shadow-sm">
            <h1 
              className="text-xl font-semibold truncate cursor-pointer"
              onClick={() => setMainView('chat')}
            >
              {activeProject ? activeProject.name : "プロジェクトを選択してください"}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={mainView === 'chat' ? 'default' : 'outline'}
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setMainView('chat')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>チャット</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={mainView === 'flow' ? 'default' : 'outline'}
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setMainView('flow')}
                  >
                    <Workflow className="h-4 w-4" />
                    <span className="sr-only">Flowchart</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>フローチャート</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={mainView === 'code' ? 'default' : 'outline'}
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setMainView('code')}
                  >
                    <FileCode className="h-4 w-4" />
                    <span className="sr-only">Code</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>コードを表示</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleNativeShareProject}>
                    <Share2 className="h-4 w-4 mr-2" />
                    プロジェクトをシェア
                  </DropdownMenuItem>
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
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleOpenSettings}>
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
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
                  <Button variant="outline" size="icon" onClick={() => undo()} disabled={pastStates.length === 0}>
                    <Undo className="h-4 w-4" />
                    <span className="sr-only">元に戻す</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>元に戻す</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => redo()} disabled={futureStates.length === 0}>
                    <Redo className="h-4 w-4" />
                    <span className="sr-only">やり直す</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>やり直す</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleGenerateFlow} disabled={isGenerating}>
                    {isGenerating ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                    )}
                    フロー生成
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>テキストからフローを生成</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">

            {mainView === 'flow' ? (
              <ErrorBoundary>
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
              </ErrorBoundary>
            ) : mainView === 'chat' ? (
              <main className="h-full p-4 md:p-6">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                  <div className="space-y-6">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={cn("flex items-start gap-4", msg.sender === "user" ? "flex-row-reverse" : "")}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}</AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "max-w-2xl rounded-lg p-3 text-base prose",
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
                    {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
                      <div className="flex items-start gap-4">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-2">
                          <LoaderCircle className="animate-spin h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </main>
            ) : mainView === 'code' ? (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">コードの説明</h2>
                    <div className="p-4 prose dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {generatedCode.explanation}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <h2 className="text-2xl font-semibold mb-2">生成されたコード</h2>
                    <Button 
                      onClick={handleDownloadCode}
                      variant="outline" 
                      size="sm" 
                      className="absolute top-0 right-0"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {generatedCode.filename}
                    </Button>
                    <div className="bg-secondary rounded-md mt-4">
                      <pre className="p-4 text-sm overflow-x-auto font-mono">{generatedCode.code}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 h-full">
                <Flowchart />
              </div>
            )}
          </div>

          <footer className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur-sm">
            <div className="relative">
              <form onSubmit={handleSendMessage}>
                <Input
                  placeholder="メッセージを送信..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pr-16 h-12 text-base font-chat"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8"
                  disabled={isLoading || input.trim() === ""}
                >
                  <CornerDownLeft className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </footer>
        </div>
    </div>
    <Toaster />
    </TooltipProvider>
  );
}
