import React from 'react';

const MessagesSkeletonLoader = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <div className="w-1/3 bg-white p-4 overflow-y-auto">
        {/* Header */}
        <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mb-6"></div>
        
        {/* Search bar */}
        <div className="relative w-[89%] mb-4">
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-full"></div>
        </div>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-8 w-20 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        
        {/* Contact list */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((contact) => (
            <div key={contact} className="flex items-center gap-2 p-2 rounded">
              {/* Avatar */}
              <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                {/* Name */}
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                {/* Time */}
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              {/* Status indicator */}
              <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Profile section */}
        <div className="flex flex-col items-center py-2 h-1/3">
          {/* Profile image */}
          <div className="w-28 h-28 bg-gray-200 rounded-full animate-pulse mb-4"></div>
          {/* Name */}
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
          {/* UID */}
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
          {/* Role */}
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between px-8 mt-4">
          <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Message bubbles skeleton */}
          {[1, 2, 3, 4, 5].map((message, index) => (
            <div key={message} className={`flex items-end gap-2 mb-2 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
              {/* Avatar for received messages */}
              {index % 2 === 0 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              )}
              
              {/* Message bubble */}
              <div className={`flex flex-col ${index % 2 === 0 ? "items-start" : "items-end"} max-w-lg w-fit`}>
                <div className={`relative px-4 py-2 rounded-2xl text-sm shadow ${
                  index % 2 === 0 
                    ? "bg-white border" 
                    : "bg-gray-200"
                }`} style={{ minWidth: "60px" }}>
                  {/* Message content */}
                  <div className="space-y-1">
                    <div className={`h-3 bg-gray-300 rounded animate-pulse ${index % 2 === 0 ? "w-32" : "w-24"}`}></div>
                    <div className={`h-3 bg-gray-300 rounded animate-pulse ${index % 2 === 0 ? "w-28" : "w-20"}`}></div>
                    {index % 3 === 0 && (
                      <div className={`h-3 bg-gray-300 rounded animate-pulse ${index % 2 === 0 ? "w-20" : "w-16"}`}></div>
                    )}
                  </div>
                  {/* Timestamp */}
                  <div className="h-2 bg-gray-300 rounded animate-pulse w-12 mt-1"></div>
                </div>
              </div>
              
              {/* Avatar for sent messages */}
              {index % 2 === 1 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>

        {/* Message input area */}
        <div className="border-t p-4 flex items-center gap-2">
          {/* User avatar */}
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          
          {/* Message input */}
          <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Attachment button */}
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          
          {/* Send button */}
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default MessagesSkeletonLoader; 