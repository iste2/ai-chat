'use client';

import { Chat } from '@/components/ui/chat';
import { useChat } from '@ai-sdk/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat()
 
  return (
    <div className='flex flex-col items-center'>
      <Chat
        className='max-w-2xl px-4 py-8 h-screen'
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isLoading}
        stop={stop}
      />
    </div>
    
  )
}