"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetch all projects on initial load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/projects");
        const data: Project[] = await response.json();
        setProjects(data);
        if (data.length > 0) {
          // Activate the most recent project
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

  const handleSendMessage = async () => {
    if (input.trim() === "" || !activeProject || isLoading) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: activeProject.id, message: input }),
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
    const newProjectName = prompt("Enter the name for the new project:");
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Projects</h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {projects.map(p => (
            <a
              key={p.id}
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveProject(p); }}
              className={`block px-4 py-2 rounded-md text-sm font-medium ${activeProject?.id === p.id ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
            >
              {p.name}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleCreateProject}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            New Project
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">{activeProject ? activeProject.name : "Jidoka"}</h1>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start ${msg.sender === "user" ? "justify-end" : ""}`}>
                <div className={`max-w-2xl rounded-lg px-4 py-2 shadow ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-white text-gray-800"}`}>
                  <div className="prose">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex items-start">
                    <div className="max-w-lg rounded-lg px-4 py-2 bg-white text-gray-800 shadow">
                        <p className="text-sm">AI is thinking...</p>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        <div className="border-t bg-white p-4">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Type your message here..."
              className="flex-1 rounded-md border-gray-300 p-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="ml-4 rounded-md bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
