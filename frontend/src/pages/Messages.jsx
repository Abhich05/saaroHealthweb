import React, { useState, useContext } from "react";
import { FiSend, FiPaperclip, FiSearch } from "react-icons/fi";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import { contacts } from "../data/MessagesDummyData";
import { DoctorIdContext } from '../App';
import axiosInstance from '../api/axiosInstance';
import MessagesSkeletonLoader from "../components/ui/MessagesSkeletonLoader";
import useMessagesLogic from "../logic/MessagesLogic";

// Set your WhatsApp Business Account (WABA) number in .env as VITE_WABA_NUMBER=+919999999999
const WABA_NUMBER = import.meta.env.VITE_WABA_NUMBER || '+911234567890'; // <-- PLACEHOLDER, replace with your real WABA number

const Messages = () => {
  const {
    contacts,
    selectedContact,
    setSelectedContact,
    message,
    setMessage,
    messages,
    setMessages,
    status,
    setStatus,
    searchText,
    setSearchText,
    filterCategory,
    setFilterCategory,
    loading,
    error,
    handleKeyDown,
    callUser,
    shareFile,
    filteredData,
    isPlaceholderWaba
  } = useMessagesLogic();
  const doctorId = useContext(DoctorIdContext);

  // Show a warning if using the placeholder WABA number
  // const isPlaceholderWaba = WABA_NUMBER === '+911234567890'; // This line is now handled by useMessagesLogic

  // Fetch chat history when contact changes
  React.useEffect(() => {
    if (!selectedContact || !selectedContact.phone) return;
    // setLoading(true); // This is now handled by useMessagesLogic
    // setError(''); // This is now handled by useMessagesLogic
    // axiosInstance.get(`/chat-messages`, { // This is now handled by useMessagesLogic
    //   params: {
    //     wabaNumber: WABA_NUMBER,
    //     customerNumber: selectedContact.phone,
    //   },
    // })
    //   .then(res => {
    //     setMessages(Array.isArray(res.data.messages) ? res.data.messages : []);
    //     setLoading(false);
    //   })
    //   .catch(() => {
    //     setMessages([]);
    //     setError('Failed to fetch messages');
    //     setLoading(false);
    //   });
  }, [selectedContact]);

  // Send message via backend
  // const sendMessage = () => { // This is now handled by useMessagesLogic
  //   if (!message.trim() || !selectedContact?.phone) return;
  //   setError('');
  //   setLoading(true);
  //   const payload = {
  //     from: WABA_NUMBER,
  //     to: selectedContact.phone,
  //     messageId: crypto.randomUUID(),
  //     content: { text: message },
  //   };
  //   axiosInstance.post(`/whatsapp/message/text`, payload)
  //     .then(() => {
  //       setMessages(prev => [
  //         ...prev,
  //         {
  //           sender: WABA_NUMBER,
  //           recipient: selectedContact.phone,
  //           message: message,
  //           timestamp: new Date().toISOString(),
  //           status: 'sent',
  //         },
  //       ]);
  //       setMessage("");
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       setError('Failed to send message');
  //       setLoading(false);
  //     });
  // };

  // const handleKeyDown = (e) => { // This is now handled by useMessagesLogic
  //   if (e.key === "Enter") sendMessage();
  // };

  // const callUser = () => alert("Calling " + selectedContact.name); // This is now handled by useMessagesLogic
  // const shareFile = () => alert("Opening file dialog"); // This is now handled by useMessagesLogic

  // const filteredData = contacts.filter((contact) => { // This is now handled by useMessagesLogic
  //   const matchesSearch = contact.name.toLowerCase().includes(searchText.toLowerCase());
  //   const matchesCategory =
  //     filterCategory === "All" ||
  //     contact.role.toLowerCase() + 's' === filterCategory.toLowerCase() ||
  //     contact.role.toLowerCase() === filterCategory.toLowerCase();
  //   const matchStatus = status ? contact.status === "unread" : true;

  //   return matchesSearch && matchesCategory && matchStatus;
  // });

  // 1. Add state for editing and copying messages
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  // 2. Mock WhatsApp API integration for sending messages
  const mockWhatsAppSend = (msg) => {
    console.log("Mock WhatsApp API: Sending message:", msg);
    // Simulate network delay
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
  };

  // 3. Add handlers for delete, edit, and copy
  const handleDelete = (index) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };
  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditValue(messages[index].content || messages[index].message);
  };
  const handleEditSave = (index) => {
    setMessages((prev) => prev.map((msg, i) => i === index ? { ...msg, content: editValue } : msg));
    setEditingIndex(null);
    setEditValue("");
  };
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  // 4. Update sendMessage to use mock WhatsApp API
  const sendMessage = async () => {
    if (!message.trim() || !selectedContact) return;
    setError("");
    setLoading(true);
    const payload = {
      doctorId,
      patientId: selectedContact.id,
      sender: "doctor",
      content: message,
    };
    await mockWhatsAppSend(payload);
    setMessages((prev) => [...prev, payload]);
    setMessage("");
    setLoading(false);
    // Mock patient reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "patient", content: "Thank you, doctor!" },
      ]);
    }, 1500);
  };

  // Show skeleton loader when initially loading contacts
  if (loading && contacts.length === 0) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 bg-white overflow-hidden">
            <div className="max-w-[100%] mx-auto h-full flex flex-col">
              <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow-lg">
                <MessagesSkeletonLoader />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-red-100 text-red-700 p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-white overflow-hidden">
          <div className="max-w-[100%] mx-auto  h-full flex flex-col">
            <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow-lg">
              
              {/* Sidebar */}
              <div className="w-1/3 bg-white p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100
">
                <h1 className="text-3xl leading-10 text-[#120F1A] font-semibold mb-6">Chat</h1>

                <div className="relative w-[89%] mb-4">
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#665491] text-lg" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by Name / UID / Role"
className="w-full pl-10 pr-10 py-2 border rounded-xl bg-[#c5c7c9] bg-opacity-20 text-[#5e3bea] focus:outline-none text-sm"
                  />
                </div>
                

                <div className="flex flex-wrap gap-2 mb-4">
                  {["All", "Patients", "Staff", "Doctors"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-1 py-1 text-xs rounded-full ${
                        filterCategory === cat
                          ? "bg-[#6B3DD6] text-[#FAFAFA] h-[32px] w-[82px] rounded-2xl"
                          : "bg-[#EBE8F2] h-[32px] w-[81px] text-[#120F1A] hover:bg-purple-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    onClick={() => setStatus(!status)}
                    className={`px-1 py-1 text-xs rounded-full ${
                      status
                        ? "bg-[#6B3DD6] text-[#FAFAFA] h-[32px] w-[82px] rounded-2xl"
                        : "bg-[#EBE8F2] h-[32px] w-[81px] text-[#120F1A] hover:bg-purple-300"
                    }`}
                  >
                    Unread
                  </button>
                </div>

                {filteredData.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-purple-100 ${selectedContact.id === contact.id ? "bg-purple-50" : ""}`}
                  >
                    <img
                      src={contact.img}
                      alt="avatar"
                      className="w-[56px] h-[56px] rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-[16px] text-[#120F1A]">{contact.name}</p>
                      <p className="text-xs text-[#665491]">{contact.time}</p>
                    </div>
                    {contact.status === 'unread' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  </div>
                ))}
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedContact ? (
                  <>
                    <div className="flex flex-col items-center py-2 h-1/3">
                      <img
                        src={selectedContact.img || "/profile.png"}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover mb-4"
                      />
                      <h2 className="text-xl font-semibold text-gray-900">{selectedContact.name}</h2>
                      <p className="text-sm text-[#665491]">UID: {selectedContact.uid || "-"}</p>
                      <p className="text-sm text-[#665491] font-medium">
                        {selectedContact.name?.toLowerCase().startsWith("dr.")
                          ? "Doctor"
                          : selectedContact.role || "Patient"}
                      </p>
                    </div>

                    <div className="flex justify-between px-8 mt-4">
                      <button
                        onClick={callUser}
                        className="px-4 py-1 rounded-full h-[40px] w-[84px] bg-[#EBE8F2] text-sm font-medium"
                      >
                        Call
                      </button>
                      <button
                        onClick={shareFile}
                        className="px-4 py-1 rounded-full bg-[#EBE8F2] h-[40px] w-[100px] text-sm font-medium"
                      >
                        Share File
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-none ">
                      {loading && contacts.length > 0 ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-end gap-2 mb-2 justify-start">
                              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="flex flex-col items-start max-w-lg w-fit">
                                <div className="relative px-4 py-2 rounded-2xl text-sm shadow bg-white border" style={{ minWidth: "60px" }}>
                                  <div className="space-y-1">
                                    <div className="h-3 bg-gray-300 rounded animate-pulse w-32"></div>
                                    <div className="h-3 bg-gray-300 rounded animate-pulse w-24"></div>
                                  </div>
                                  <div className="h-2 bg-gray-300 rounded animate-pulse w-12 mt-1"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <p className="text-center py-8 text-red-500">{error}</p>
                      ) : messages.length === 0 ? (
                        <p className="text-center py-8">No messages yet. Start a conversation!</p>
                      ) : (
                        messages.map((msg, index) => {
                          const isDoctor = msg.sender === "doctor";
                          return (
                            <div
                              key={index}
                              className={`flex items-end gap-2 mb-2 ${isDoctor ? "justify-end" : "justify-start"}`}
                              style={{ position: "relative" }}
                            >
                              {!isDoctor && (
                                <img
                                  src={selectedContact.img || "/profile.png"}
                                  alt="Patient"
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div className="flex flex-col items-end max-w-lg w-fit">
                                <div
                                  className={`relative px-4 py-2 rounded-2xl text-sm shadow ${isDoctor
                                    ? "bg-[#DCF8C6] text-gray-900 self-end"
                                    : "bg-white text-gray-900 self-start border"
                                  }`}
                                  style={{ minWidth: "60px" }}
                                >
                                  {editingIndex === index ? (
                                    <>
                                      <input
                                        className="border rounded px-2 py-1 text-sm w-full"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleEditSave(index)}
                                        autoFocus
                                      />
                                      <button className="text-xs text-green-600 ml-2" onClick={() => handleEditSave(index)}>Save</button>
                                    </>
                                  ) : (
                                    <span>{msg.content || msg.message}</span>
                                  )}
                                  <span className="block text-[10px] text-gray-400 mt-1 text-right">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
                                  {/* Hover actions */}
                                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                    <button className="text-xs text-blue-500" onClick={() => handleCopy(msg.content || msg.message)}>Copy</button>
                                    {isDoctor && (
                                      <>
                                        <button className="text-xs text-yellow-600" onClick={() => handleEdit(index)}>Edit</button>
                                        <button className="text-xs text-red-500" onClick={() => handleDelete(index)}>Delete</button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isDoctor && (
                                <img
                                  src={"/karen.png"}
                                  alt="Doctor"
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t p-4 flex items-center gap-2">
                      <img
                        src={"/karen.png"}
                        className="w-8 h-8 rounded-full"
                        alt="You"
                      />
                      <div className="relative flex items-center w-full">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          className="flex-1 p-2 pr-32 rounded bg-gray-200"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />

                        <div className="absolute right-2 flex items-center gap-2">
                          <button className="text-gray-500">
                            <FiPaperclip />
                          </button>
                          <button className="text-gray-500">
                            <img src="/mic.svg" className="w-5 h-5" />
                          </button>
                          <button className="text-gray-500">
                            <img src="/emo.svg" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={sendMessage}
                        className="bg-[#6B3DD6] text-white px-4 py-2 rounded flex items-center gap-1"
                      >
                        <FiSend /> Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">No patient selected or no patients available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;