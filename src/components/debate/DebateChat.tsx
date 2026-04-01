import { useRef, useEffect } from 'react';
import { DebateMessage } from '@/types';
import { DebateBubble } from './DebateBubble';

interface DebateChatProps {
  messages: DebateMessage[];
  userStance: 'pro' | 'con';
  streamingMessageId?: string | null;
  className?: string;
}

export function DebateChat({ messages, userStance, streamingMessageId, className }: DebateChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessageId]);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {messages.map(msg => (
        <DebateBubble
          key={msg.id}
          message={msg}
          userStance={userStance}
          isStreaming={msg.id === streamingMessageId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
