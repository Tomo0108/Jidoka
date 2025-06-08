"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, CornerDownLeft, PlusCircle, Settings, Share2, FolderKanban, LoaderCircle, FileCode, Download, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Flowchart } from "@/components/Flowchart";
import { Sidebar } from "@/components/Sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

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
  const [generatedCode, setGeneratedCode] = useState({
    explanation: "これは、ユーザーの指示に基づいてAIが生成したVBAコードのサンプルです。ボタンをクリックすると、メッセージボックスに「Hello, World!」と表示されます。",
    code: `Sub HelloWorld()\n  MsgBox "Hello, World!"\nEnd Sub`,
    filename: "HelloWorld.vba"
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

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
  }, []);

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

  const handleSendMessage = async (e: React.FormEvent) => {
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

  const handleCreateProject = async (isInitial = false) => {
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
        <aside className="w-72 flex flex-col border-r bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/img/logo_192.png"
                alt="Jido-ka Logo"
                width={32}
                height={32}
                className="rounded-md"
              />
              <h2 className="text-xl font-bold tracking-tight">Jido-ka</h2>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCreateProject()}>
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">New Project</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>新規プロジェクト</TooltipContent>
            </Tooltip>
          </div>
          <div className="mt-4">
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            <div className="space-y-1">
              {projects.map((proj) => (
                <Button
                  key={proj.id}
                  variant={activeProject?.id === proj.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-9"
                  onClick={() => setActiveProject(proj)}
                >
                  <FolderKanban className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{proj.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <div className="flex flex-1 flex-col h-screen">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <h1 
              className="text-xl font-semibold truncate cursor-pointer hover:text-primary"
              onClick={() => setMainView('chat')}
            >
              {activeProject ? activeProject.name : "プロジェクトを選択してください"}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={mainView === 'flow' ? 'secondary' : 'outline'} size="icon" className="h-9 w-9" onClick={() => setMainView('flow')}>
                    <Workflow className="h-4 w-4" />
                    <span className="sr-only">Flowchart</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>フローチャート</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={mainView === 'code' ? 'secondary' : 'outline'} size="icon" className="h-9 w-9" onClick={() => setMainView('code')}>
                    <FileCode className="h-4 w-4" />
                    <span className="sr-only">Code</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>コードを表示</TooltipContent>
              </Tooltip>
              <div className="h-6 w-px bg-border mx-2" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>共有</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>設定</TooltipContent>
              </Tooltip>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {mainView === 'flow' ? (
              <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                <ResizablePanel defaultSize={25} minSize={15}>
                  <Sidebar />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                  <Flowchart />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : mainView === 'chat' ? (
              <main className="h-full p-4 md:p-6">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.length === 0 && !isLoading && (
                       <div className="text-center text-muted-foreground mt-16">
                         <Workflow size={48} className="mx-auto" />
                         <p className="mt-4 text-lg">Jido-kaへようこそ</p>
                         <p className="mt-2">下の入力欄から、自動化したい作業をAIに指示してください。</p>
                       </div>
                    )}
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={cn("flex items-start gap-4", msg.sender === "user" ? "justify-end" : "")}
                      >
                         {msg.sender === 'ai' && (
                            <Avatar className="h-9 w-9 border">
                              <AvatarFallback><Bot size={20} /></AvatarFallback>
                            </Avatar>
                         )}
                        <div
                          className={cn("max-w-2xl rounded-lg p-3 text-base", msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}
                        >
                           <ReactMarkdown className="prose dark:prose-invert" remarkPlugins={[remarkGfm]}>
                              {msg.text}
                           </ReactMarkdown>
                        </div>
                        {msg.sender === 'user' && (
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback><User size={20} /></AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-4">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                        <div className="max-w-2xl rounded-lg p-3 bg-muted flex items-center">
                          <LoaderCircle className="animate-spin h-5 w-5 mr-3" />
                          <span>AIが応答を生成中...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </main>
            ) : ( // mainView === 'code'
              <main className="p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-4">
                      <ReactMarkdown className="prose dark:prose-invert" remarkPlugins={[remarkGfm]}>
                        {generatedCode.explanation}
                      </ReactMarkdown>
                    </div>
                    <div className="relative bg-muted/50 rounded-b-lg">
                      <pre className="p-4 text-sm overflow-x-auto font-mono">{generatedCode.code}</pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleDownloadCode}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </main>
            )}
          </div>
          
          {mainView === 'chat' && (
            <footer className="sticky bottom-0 z-10 border-t bg-background px-4 py-3 md:px-6">
              <form
                onSubmit={handleSendMessage}
                className="relative max-w-4xl mx-auto"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="AIに指示を送る..."
                  className="pr-12 text-base"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  disabled={isLoading || input.trim() === ""}
                >
                  <CornerDownLeft className="h-4 w-4" />
                </Button>
              </form>
            </footer>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
