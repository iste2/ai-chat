'use client';

import { useChat } from '@ai-sdk/react';
import { useRef } from 'react';
import { Paperclip, Mic, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const formRef = useRef<HTMLFormElement>(null);
  
  /**
   * Handles form submission for sending messages
   */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  /**
   * Handles keyboard input in the chat input field
   */
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        formRef.current?.requestSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <ChatMessageList smooth={true}>
          {messages.map(message => (
            <div key={message.id} className="whitespace-pre-wrap">
              {message.role === 'user' ? 'User: ' : 'AI: '}
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <div key={`${message.id}-${i}`} className='text-sm'>{part.text}</div>;
                  case 'tool-invocation':
                    switch (part.toolInvocation.state) {
                      case 'result':
                        return <div key={`${message.id}-${i}`} className='text-sm'>Result from {part.toolInvocation.toolName}: {part.toolInvocation.result.content[0].text}</div>;
                    }
                  default:
                    console.log('Unknown part type:', part);
                }
              })}
            </div>
          ))}
        </ChatMessageList>
      </div>

      <div className="fixed bottom-0 w-full max-w-2xl p-4 bg-background/80 backdrop-blur-sm">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            value={input}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="rounded-lg bg-background border-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>

            <Button
              disabled={!input}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}