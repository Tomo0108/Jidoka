"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, CornerDownLeft, PlusCircle, Settings, Share2, FolderKanban, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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
  const [previewHtml, setPreviewHtml] = useState<string | null>(`
    <body style="font-family: sans-serif; background-color: #f0f0f0; color: #333; padding: 2rem;">
      <h1 style="color: #007BFF;">Preview Area</h1>
      <p>AIが生成したアプリがここに表示されます。</p>
      <button onclick="alert('Hello from the preview!')" style="padding: 10px 15px; border: none; background-color: #007BFF; color: white; border-radius: 5px; cursor: pointer;">
        Click me
      </button>
    </body>
  `);
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
          // プロジェクトがない場合は新しいプロジェクトを作成
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
    fetchMessages();
  }, [activeProject]);

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

        <ResizablePanelGroup
          direction="vertical"
          className="flex-1"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-1">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0 rounded-md"
                  sandbox="allow-scripts allow-modals"
                  title="Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <p>ここにプレビューが表示されます</p>
                </div>
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex flex-col h-full">
              <header className="sticky top-0 z-10 flex h-[57px] items-center gap-4 border-b bg-background px-4 shadow-sm">
                <h1 className="text-xl font-semibold truncate">
                  {activeProject ? activeProject.name : "プロジェクトを選択してください"}
                </h1>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto p-4">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                  <div className="space-y-6">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-4",
                          msg.sender === "user" ? "flex-row-reverse" : ""
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}</AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "max-w-2xl rounded-lg p-3 text-sm font-chat",
                            msg.sender === "user"
                              ? "bg-accent text-accent-foreground"
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              pre: ({...props}) => <pre {...props} className="p-2 rounded-md" />,
                              code: ({...props}) => <code {...props} className="px-1 py-0.5 rounded-sm" />,
                            }}
                          >
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
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      disabled={isLoading || !input.trim()}
                    >
                      <CornerDownLeft size={20} />
                    </Button>
                  </form>
                </div>
              </footer>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}
