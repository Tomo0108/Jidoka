"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, CornerDownLeft, Mic, Paperclip, PlusCircle, Settings, Share2, FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Type definitions
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch all projects on initial load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/projects");
        const data: Project[] = await response.json();
        setProjects(data);
        if (data.length > 0) {
          setActiveProject(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch messages when active project changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeProject) return;
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${activeProject.id}/messages`);
        const data: Message[] = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
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
      const errorResponse: Message = { text: "Error connecting to the backend.", sender: "ai" };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    const newProjectName = prompt("Enter the name for the new project:", `New Project ${projects.length + 1}`);
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
      <div className="grid h-screen w-full pl-[56px]">
        <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r bg-background">
          <div className="border-b p-2">
            <Button variant="outline" size="icon" aria-label="Home">
              <FolderKanban className="size-5" />
            </Button>
          </div>
          <nav className="grid gap-1 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg bg-muted"
                  aria-label="Projects"
                >
                  <FolderKanban className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Projects
              </TooltipContent>
            </Tooltip>
          </nav>
          <nav className="mt-auto grid gap-1 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Settings"
                >
                  <Settings className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            </Tooltip>
          </nav>
        </aside>
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">
              {activeProject ? activeProject.name : "Jidoka"}
            </h1>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5 text-sm"
              onClick={() => handleCreateProject()}
            >
              <PlusCircle className="size-3.5" />
              New Project
            </Button>
          </header>
          <main className="flex-1 overflow-y-auto">
            <ScrollArea className="h-[calc(100vh-12rem)]" ref={scrollAreaRef}>
              <div className="grid gap-4 p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-4",
                      msg.sender === "user" ? "justify-end" : ""
                    )}
                  >
                    {msg.sender === "ai" && (
                      <Avatar className="h-9 w-9">
                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-xl rounded-lg p-3 text-sm prose dark:prose-invert",
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          pre: ({node, ...props}) => <pre {...props} className="bg-background/20 p-2 rounded" />,
                          code: ({node, ...props}) => <code {...props} className="bg-background/20 px-1 rounded" />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                     {msg.sender === "user" && (
                      <Avatar className="h-9 w-9">
                        <AvatarFallback><User size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback><Bot size={20} /></AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="max-w-xl animate-pulse rounded-lg bg-muted p-3 text-sm">
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </main>
          <footer className="sticky bottom-0 border-t bg-background/95 py-3 backdrop-blur-sm">
            <div className="relative mx-auto max-w-2xl px-4">
              <form onSubmit={handleSendMessage}>
                <Input
                  placeholder="Ask me to automate a task..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pr-16"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                  disabled={isLoading}
                >
                  <CornerDownLeft className="size-4" />
                </Button>
              </form>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
