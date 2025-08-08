import React, { useState, useEffect, useRef, useContext } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import aiService from "../api/aiService";
import { toast } from "react-hot-toast";
import { DoctorIdContext, DoctorNameContext, UserContext } from "../App";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      name: "AI Assistant",
      avatar: "/ai.png",
      text: "Hello! I'm your AI medical assistant. I can help you with medical information, symptom analysis, medication details, and more. How can I assist you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const messagesEndRef = useRef(null);

  // Get context values
  const contextDoctorId = useContext(DoctorIdContext);
  const contextDoctorName = useContext(DoctorNameContext);
  const user = useContext(UserContext);

  const isDevelopment = import.meta.env.DEV;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    if (isDevelopment) {
      console.log('AI Assistant - Authentication Debug:', {
        isUserLogin,
        contextDoctorId,
        localStorageDoctorId: localStorage.getItem('doctorId'),
        userDoctorId: user?.doctorId,
        currentDoctorId,
        currentDoctorName
      });
    }

    if (currentDoctorId) {
      setDoctorId(currentDoctorId);
      setDoctorName(currentDoctorName);
    } else {
      if (isDevelopment) {
        console.log('No doctor ID found - user may not be authenticated');
      }
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
      avatar: doctorName ? "/profile2.png" : "/default-avatar.png",
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

      if (isDevelopment) {
        console.log('Sending AI request:', {
          doctorId,
          message: input,
          conversationHistoryLength: conversationHistory.length
        });
      }

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

  const quickActions = [
    { label: "Symptom Analysis", query: "Can you help me analyze symptoms?" },
    { label: "Medication Info", query: "I need information about medications" },
    { label: "Diagnostic Tests", query: "What diagnostic tests might be relevant?" },
    { label: "Medical Terms", query: "Can you explain medical terminology?" },
    { label: "Treatment Guidelines", query: "What are the current treatment guidelines?" },
    { label: "Emergency Signs", query: "What are the signs of medical emergencies?" }
  ];

  const handleQuickAction = async (query) => {
    if (!doctorId) {
      toast.error('Please log in to use the AI assistant');
      return;
    }
    
    setInput(query);
    // Trigger send after setting input
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  // Check if user is authenticated
  const isAuthenticated = !!doctorId;
  const isUserLogin = localStorage.getItem('isUserLogin') === 'true';

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Full width content area */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 bg-white overflow-y-auto">
          <div className="flex flex-col h-full bg-[#fafafa]">
            <div className="text-center py-6 font-bold text-2xl text-gray-900">
              AI Medical Assistant
            </div>

            {/* Quick Actions */}
            <div className="px-10 pb-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.query)}
                      disabled={isLoading || !isAuthenticated}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-10 space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-end ${
                    msg.from === "doctor" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className={`flex items-center gap-2 max-w-[70%] ${
                    msg.from === "doctor" ? "flex-row-reverse" : "flex-row"
                  }`}>
                    {msg.from === "ai" && (
                      <img
                        src={msg.avatar}
                        alt={msg.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className={`${msg.from === "doctor" ? "text-right" : "text-left"}`}>
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
                      {msg.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      )}
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
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-end justify-start">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <img
                      src="/ai.png"
                      alt="AI"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="text-left">
                      <p className="text-xs text-purple-600 font-medium mb-1">
                        AI Assistant
                      </p>
                      <div className="px-4 py-2 rounded-2xl text-sm font-medium bg-[#eeeafc] text-gray-800">
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
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="px-4 py-4 border-t bg-[#f4f2fa]">
              <div className="flex items-center bg-[#e8e3f3] px-4 py-3 rounded-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isAuthenticated ? "Ask me anything about medical topics..." : "Please log in to use the AI assistant"}
                  disabled={isLoading || !isAuthenticated}
                  className="flex-1 bg-transparent focus:outline-none text-purple-700 text-sm disabled:opacity-50"
                />
                <button 
                  className="text-purple-600 hover:text-purple-800 mr-8 disabled:opacity-50"
                  disabled={isLoading || !isAuthenticated}
                >
                  <img src="/attatch.svg" alt="Attach"/>
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !isAuthenticated}
                  className="bg-[#7a4de6] text-white px-5 py-1.5 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6a3dd6] transition-colors"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
              
              {!isAuthenticated && (
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-600">
                    Please log in to access the AI medical assistant
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AiAssistant;
