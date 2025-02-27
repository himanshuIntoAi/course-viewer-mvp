'use client'

import React, {useState} from 'react';

export const ˘: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const suggestions = [
      'How can you help in my project?',
      'I have fixed timelines, can you spend 1 hour daily?',
      'Can you help with mock interviews?',
      'Could you assist with Next.js tutoring?'
    ];
  
    const addMessage = (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    };
  
    return (
      <div className="w-full md:w-1/4 bg-gray-50 p-4 border-l border-gray-200">
        <h3 className="font-bold mb-2">Messaging</h3>
        <div className="border border-gray-300 rounded p-2 h-48 overflow-y-scroll mb-4">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className="p-2 bg-gray-100 mb-2 rounded">
                {msg}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Start a conversation...</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold mb-2">Suggestions</h4>
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => addMessage(suggestion)}
              className="block w-full text-left bg-gray-100 hover:bg-gray-200 p-2 rounded mb-2 text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };