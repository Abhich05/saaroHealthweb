import React, { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      from: "doctor",
      name: "Dr. Ethan Carter",
      avatar: "/profile2.png",
      text: "What",
    },
    {
      from: "ai",
      name: "AI",
      avatar: "/ai.png",
      text: "Common symptoms of the flu include",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      from: "doctor",
      name: "Dr. Ethan Carter",
      avatar: "/profile2.png",
      text: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Full width content area */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 bg-white overflow-y-auto">
          <div className="flex flex-col h-full bg-[#fafafa]">
            <div className="text-center py-6 font-bold text-2xl text-gray-900">
              AI Assistant
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-10 space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-end ${
                    msg.from === "doctor" ? "justify-end" : "justify-end"
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[70%]">
                    {msg.from === "ai" && (
                      <img
                        src={msg.avatar}
                        alt={msg.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="text-right">
                      <p className="text-xs text-purple-600 font-medium mb-1">
                        {msg.name}
                      </p>
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                          msg.from === "doctor"
                            ? "bg-[#7a4de6] text-white"
                            : "bg-[#eeeafc] text-gray-800"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                    {msg.from === "doctor" && (
                      <img
                        src={msg.avatar}
                        alt={msg.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="px-4 py-4 border-t bg-[#f4f2fa]">
              <div className="flex items-center bg-[#e8e3f3] px-4 py-3 rounded-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Chat with me..."
                  className="flex-1 bg-transparent focus:outline-none text-purple-700 text-sm"
                />
                <button className="text-purple-600 hover:text-purple-800 mr-8">
                  <img src="/attatch.svg"/>
                </button>
                <button
                  onClick={handleSend}
                  className="bg-[#7a4de6] text-white px-5 py-1.5 rounded-full text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AiAssistant;
