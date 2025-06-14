"use client";

// Vercelへのデプロイを再トリガーするためのコメント
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, CornerDownLeft, PlusCircle, Settings, Share2, FolderKanban, LoaderCircle, FileCode, Download, Workflow, MessageSquarePlus, Undo, Redo, MessageSquare, Link, Code, Twitter, Facebook, Linkedin, Edit, Trash2, Copy, Menu, X } from "lucide-react";
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
import { Node, Edge } from 'reactflow';
import { CustomNodeData, CustomEdgeData } from '@/lib/types';
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : ''
  );
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
          const newProject: Project = await response.json();
          setProjects(prev => [newProject, ...prev]);
          setActiveProject(newProject);
          loadProjectFlow(newProject.id);
        } catch (error) {
          console.error("Failed to create project:", error);
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
      const newProject: Project = await response.json();
      setProjects(prev => [newProject, ...prev]);
      
      if (currentProjectId !== null) {
        saveProjectFlow(currentProjectId);
      }
      
      setActiveProject(newProject);
      loadProjectFlow(newProject.id);
    } catch (error) {
      console.error("Failed to create project:", error);
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
      
      toast({
        title: "オフラインモード",
        description: "バックエンドが利用できないため、ローカルでプロジェクトを作成しました。",
      });
    }
  }, [projects.length, currentProjectId, saveProjectFlow, loadProjectFlow, toast, API_BASE_URL]);

  const handleProjectSwitch = useCallback((project: Project) => {
    if (currentProjectId !== null && currentProjectId !== project.id) {
      saveProjectFlow(currentProjectId);
    }
    
    setActiveProject(project);
    loadProjectFlow(project.id);
  }, [currentProjectId, saveProjectFlow, loadProjectFlow]);

  useEffect(() => {
    const fetchProjects = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || (
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:8000'
          : ''
      );

      if (!apiUrl) {
        const fallbackProject: Project = { id: 1, name: "Demo Project", description: "オフラインデモプロジェクト" };
        setProjects([fallbackProject]);
        setActiveProject(fallbackProject);
        loadProjectFlow(fallbackProject.id);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/projects`);
        const data: Project[] = await response.json();
        setProjects(data);
        if (data.length > 0 && data[0]) {
          setActiveProject(data[0]);
          loadProjectFlow(data[0].id);
        } else {
          try {
            const createResponse = await fetch(`${apiUrl}/api/projects`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "New Project" }),
            });
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
      setIsLoading(true);
      setMessages([]);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || (
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:8000'
          : ''
      );

      if (!apiUrl) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/projects/${activeProject.id}/messages`);
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

  const handleGenerateFlow = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    setInput('');

    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockApiResponse: { nodes: Node<CustomNodeData>[]; edges: Edge<CustomEdgeData>[] } = {
      nodes: [
        { id: '1', type: 'custom', position: { x: 400, y: 50 }, data: { id: '1', shape: 'startEnd', label: '顧客からの問い合わせ', description: '電話またはメールで受け付け', file: null, onChange: () => {} } },
        { id: '2', type: 'custom', position: { x: 400, y: 200 }, data: { id: '2', shape: 'predefinedProcess', label: '問い合わせ内容の記録', description: 'CRMシステムに入力', file: null, onChange: () => {} } },
        { id: '3', type: 'custom', position: { x: 400, y: 350 }, data: { id: '3', shape: 'diamond', label: '緊急案件か？', description: 'SLA（サービスレベル契約）に基づく', file: null, onChange: () => {} } },
        { id: '4', type: 'custom', position: { x: 150, y: 500 }, data: { id: '4', shape: 'rectangle', label: '担当者へ即時通知', description: 'チャットとメールで通知', file: null, onChange: () => {} } },
        { id: '5', type: 'custom', position: { x: 650, y: 500 }, data: { id: '5', shape: 'rectangle', label: '通常キューに追加', description: '翌営業日までに対応', file: null, onChange: () => {} } },
        { id: '6', type: 'custom', position: { x: 400, y: 650 }, data: { id: '6', shape: 'document', label: '対応記録の作成', description: '対応結果をまとめる', file: null, onChange: () => {} } },
        { id: '7', type: 'custom', position: { x: 400, y: 800 }, data: { id: '7', shape: 'startEnd', label: 'クローズ', description: '顧客に完了を通知', file: null, onChange: () => {} } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'step', animated: true, data: { id: 'e1-2' } },
        { id: 'e2-3', source: '2', target: '3', type: 'step', animated: true, data: { id: 'e2-3' } },
        { id: 'e3-4', source: '3', target: '4', type: 'step', label: 'はい', data: { id: 'e3-4' } },
        { id: 'e3-5', source: '3', target: '5', type: 'step', label: 'いいえ', data: { id: 'e3-5' } },
        { id: 'e4-6', source: '4', target: '6', type: 'step', data: { id: 'e4-6' } },
        { id: 'e5-6', source: '5', target: '6', type: 'step', data: { id: 'e5-6' } },
        { id: 'e6-7', source: '6', target: '7', type: 'step', data: { id: 'e6-7' } },
      ],
    };

    setFlow(mockApiResponse);
    setIsGenerating(false);
  };

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
        text: "現在オフラインモードで動作しています。バックエンドサーバーが利用できないため、実際のAI応答は提供できませんが、フローチャート機能やその他の機能は引き続きご利用いただけます。",
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
      const data = await response.json();
      const aiResponse: Message = { text: data.response, sender: "ai" };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const mockResponse: Message = {
        text: "現在オフラインモードで動作しています。バックエンドサーバーが利用できないため、実際のAI応答は提供できませんが、フローチャート機能やその他の機能は引き続きご利用いただけます。",
        sender: "ai"
      };
      setMessages((prev) => [...prev, mockResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCode = () => {
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

  const handleCopyCode = async () => {
    await copyToClipboard(generatedCode.code, "コードをクリップボードにコピーしました。");
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
      <div style={{
        position: 'fixed',
        top: '60px',
        right: '10px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        zIndex: 9999,
        fontSize: '12px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}>
        <p>isMobile: <strong>{isMobile.toString()}</strong></p>
        <p>isSidebarOpen: <strong>{isSidebarOpen.toString()}</strong></p>
      </div>
      
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
                    className={isMobile ? "h-8 w-8" : ""}
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
                    className={isMobile ? "h-8 w-8" : ""}
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
                    className={isMobile ? "h-8 w-8" : ""}
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
              
              {!isMobile && (
                <>
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
                </>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleGenerateFlow}
                    disabled={isGenerating}
                    size={isMobile ? "icon" : "default"}
                    className={isMobile ? "h-8 w-8" : ""}
                  >
                    {isGenerating ? (
                      <LoaderCircle className={cn("h-4 w-4 animate-spin", !isMobile && "mr-2")} />
                    ) : (
                      <MessageSquarePlus className={cn("h-4 w-4", !isMobile && "mr-2")} />
                    )}
                    {!isMobile && "フロー生成"}
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
            ) : mainView === 'chat' ? (
              <main className={cn("h-full", isMobile ? "p-3" : "p-6")}>
                <ScrollArea className="h-full" ref={scrollAreaRef}>
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
                  </div>
                </ScrollArea>
              </main>
            ) : mainView === 'code' ? (
              <div className="flex-1 overflow-y-auto">
                <div className={cn("mx-auto space-y-4", isMobile ? "p-3 max-w-full" : "p-6 max-w-6xl space-y-6")}>
                  <div className={cn("flex", isMobile ? "flex-col gap-3" : "items-center justify-between")}>
                    <div>
                      <h1 className={cn("font-semibold", isMobile ? "text-xl" : "text-2xl")}>生成されたコード</h1>
                      <p className="text-sm text-muted-foreground mt-1">{generatedCode.filename}</p>
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
                              {generatedCode.explanation}
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
                              <span>{generatedCode.code.split('\n').length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">文字数</span>
                              <span>{generatedCode.code.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={cn(isMobile ? "" : "col-span-3")}>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                          <CardTitle className="text-base">{generatedCode.filename}</CardTitle>
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
                          <div className={cn("relative overflow-auto", isMobile ? "max-h-[400px]" : "max-h-[600px]")}>
                            <pre className={cn("font-mono leading-relaxed", isMobile ? "p-3 text-xs" : "p-4 text-sm")}>
                              <code>
                                {generatedCode.code.split('\n').map((line, index) => (
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
                              </code>
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
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

          <footer className={cn(
            "sticky bottom-0 border-t bg-background/95 backdrop-blur-sm",
            isMobile ? "p-3" : "p-4"
          )}>
            <div className="relative">
              <form onSubmit={handleSendMessage}>
                <Input
                  placeholder="メッセージを送信..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={cn(
                    "pr-12 font-chat",
                    isMobile ? "h-10 text-sm" : "h-12 text-base"
                  )}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2",
                    isMobile ? "right-1 h-8 w-8" : "right-2 h-8 w-8"
                  )}
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
    <PWAInstallPrompt />
    <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        zIndex: 9999,
        fontSize: '14px',
        borderRadius: '8px',
        fontFamily: 'monospace',
      }}>
        <p>isMobile: <strong>{isMobile.toString()}</strong></p>
    </div>
    </TooltipProvider>
  );
}