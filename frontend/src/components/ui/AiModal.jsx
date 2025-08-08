import React, { useState, useRef, useEffect, useContext } from "react";
import { RxCross2 } from "react-icons/rx";
import { DoctorIdContext, DoctorNameContext, UserContext } from "../../App";
import aiService from "../../api/aiService";
import { toast } from "react-hot-toast";

const AiModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      name: "AI Assistant",
      avatar: "/ai.png",
      text: "Hello! I'm your AI medical assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const bottomRef = useRef(null);

  // Get context values
  const contextDoctorId = useContext(DoctorIdContext);
  const contextDoctorName = useContext(DoctorNameContext);
  const user = useContext(UserContext);

  useEffect(() => {
    // Get doctor ID from context or localStorage
    let currentDoctorId = null;
    let currentDoctorName = "";

    // Check if it's a user login or doctor login
    const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
    
    if (isUserLogin && user) {
      // User login - get doctorId from user context
      currentDoctorId = user.doctorId;
      currentDoctorName = user.doctorName || "";
    } else {
      // Doctor login - get from context or localStorage
      currentDoctorId = contextDoctorId || localStorage.getItem('doctorId');
      currentDoctorName = contextDoctorName || localStorage.getItem('doctorName') || "";
    }

    if (currentDoctorId) {
      setDoctorId(currentDoctorId);
      setDoctorName(currentDoctorName);
    }
  }, [contextDoctorId, contextDoctorName, user]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !doctorId) {
      if (!doctorId) {
        toast.error('Please log in to use the AI assistant');
      }
      return;
    }

    const userMessage = {
      from: "doctor",
      name: doctorName || "Doctor",
      avatar: "/profile2.png",
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        from: msg.from,
        text: msg.text
      }));

      const response = await aiService.getChatResponse(doctorId, input, conversationHistory);
      
      if (response.success) {
        const aiMessage = {
          from: "ai",
          name: "AI Assistant",
          avatar: "/ai.png",
          text: response.data.message,
          timestamp: response.data.timestamp
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Add error message
      const errorMessage = {
        from: "ai",
        name: "AI Assistant",
        avatar: "/ai.png",
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if user is authenticated
  const isAuthenticated = !!doctorId;

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
                <p className="text-[13px] text-[#69578F] text-400 mb-1">
                  {msg.name}
                </p>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm break-words max-w-[230px] ${
                    msg.from === "doctor"
                      ? "bg-[#7a4de6] text-[#FAFAFA] text-400 text-right"
                      : "bg-[#EBE8F2] text-[#120F1A] text-400"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex w-full px-2 justify-start">
            <div className="flex items-end gap-2 max-w-[80%] flex-row text-left">
              <img
                src="/ai.png"
                alt="AI"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-[13px] text-[#69578F] text-400 mb-1">
                  AI Assistant
                </p>
                <div className="px-4 py-2 rounded-2xl text-sm break-words max-w-[230px] bg-[#EBE8F2] text-[#120F1A] text-400">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <div className="px-4 py-3 border-t bg-[#f4f2fa]">
        <div className="flex items-center bg-[#e8e3f3] px-4 py-2 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isAuthenticated ? "Ask me anything..." : "Please log in to use the AI assistant"}
            disabled={isLoading || !isAuthenticated}
            className="flex-1 bg-transparent focus:outline-none text-purple-700 text-sm disabled:opacity-50"
          />
          <button 
            className="text-purple-600 hover:text-purple-800 mr-4 disabled:opacity-50"
            disabled={isLoading || !isAuthenticated}
          >
            <img src="/attatch.svg" alt="Attach" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !isAuthenticated}
            className="bg-[#7a4de6] text-white px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
        
        {!isAuthenticated && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-600">
              Please log in to access the AI assistant
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiModal;
