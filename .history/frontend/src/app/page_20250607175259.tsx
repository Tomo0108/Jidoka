"use client";

import { useState, useEffect } from "react";

interface Message {
  text: string;
  sender: "user" | "ai";
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Initial message from AI
    setMessages([
      {
        text: "こんにちは。どのような作業を自動化したいですか？",
        sender: "ai",
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { text: input, sender: "user" };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const aiResponse: Message = { text: data.response, sender: "ai" };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse: Message = {
        text: "エラーが発生しました。バックエンドに接続できません。",
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Jidoka - Chat</h1>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">Project: New Automation</p>
          <button className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            New Project
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-y-auto p-4">
        <div className="flex w-full flex-col space-y-4">
          {/* Chat Messages */}
          <div className="flex-1 space-y-6 overflow-y-auto rounded-lg bg-white p-4 shadow">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start ${
                  msg.sender === "user" ? "justify-end" : ""
                }`}
              >
                <div
                  className={`max-w-lg rounded-lg px-4 py-2 ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message here..."
                className="flex-1 rounded-md border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="ml-4 rounded-md bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
