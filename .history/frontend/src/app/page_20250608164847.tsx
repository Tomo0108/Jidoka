"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, CornerDownLeft, PlusCircle, Settings, Share2, FolderKanban, LoaderCircle, FileCode, Download, Workflow, MessageSquarePlus, Undo, Redo } from "lucide-react";
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
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface Message {
  text: string;
  sender: "user" | "ai";
}

interface Project {
  id: number;
  name: string;
}

export default function Home() {
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

  const setFlow = useFlowStore((state) => state.setFlow);
  const undo = useTemporalStore(state => state.undo);
  const redo = useTemporalStore(state => state.redo);
  const pastStates = useTemporalStore(state => state.pastStates);
  const futureStates = useTemporalStore(state => state.futureStates);

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
      setActiveProject(newProject);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  }, [projects.length]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/projects");
        const data: Project[] = await response.json();
        setProjects(data);
        if (data.length > 0) {
          setActiveProject(data[0]);
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
                <Button
                  key={proj.id}
                  variant={activeProject?.id === proj.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveProject(proj)}
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  <span className="truncate">{proj.name}</span>
                </Button>
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
                    variant="outline" 
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
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMainView('code')}>
                    <FileCode className="h-4 w-4" />
                    <span className="sr-only">Code</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>コードを表示</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>共有</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>設定</TooltipContent>
              </Tooltip>
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
