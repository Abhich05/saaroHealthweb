import React, { useState, useRef, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";

const AiModal = ({ onClose }) => {
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
      text: "Common symptoms of the flu include...",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      from: "doctor",
      name: "Dr. Ethan Carter",
      avatar: "/profile2.png",
      text: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-20 right-9 z-50 w-[360px] h-[490px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
      {/* Modal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#7047D1] text-white rounded-t-xl">
        <span className="font-semibold text-lg">AI Assistant</span>
        <button onClick={onClose} className="hover:text-gray-300">
          <RxCross2 size={20} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#fafafa] hide-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full px-2 ${
              msg.from === "doctor" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-end gap-2 max-w-[80%] ${
                msg.from === "doctor"
                  ? "flex-row-reverse text-right"
                  : "flex-row text-left"
              }`}
            >
              <img
                src={msg.avatar}
                alt={msg.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-[13px] text-[#69578F] text-400   mb-1">
                  {msg.name}
                </p>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm  break-words max-w-[230px] ${
                    msg.from === "doctor"
                      ? "bg-[#7a4de6] text-[#FAFAFA] text-400 text-right h-[38px]"
                      : "bg-[#EBE8F2] text-[#120F1A] text-400"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <div className="px-4 py-3 border-t bg-[#f4f2fa]">
        <div className="flex items-center bg-[#e8e3f3] px-4 py-2 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chat with me..."
            className="flex-1 bg-transparent focus:outline-none text-purple-700 text-sm"
          />
          <button className="text-purple-600 hover:text-purple-800 mr-4">
            <img src="/attatch.svg" alt="Attach" />
          </button>
          <button
            onClick={handleSend}
            className="bg-[#7a4de6] text-white px-4 py-1.5 rounded-full text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiModal;
