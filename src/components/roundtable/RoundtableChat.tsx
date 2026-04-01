import { useRef, useEffect } from 'react';
import { RoundtableMessage } from '@/types';
import { ThinkerBubble } from './ThinkerBubble';

interface RoundtableChatProps {
  messages: RoundtableMessage[];
  streamingMessageId?: string | null;
  className?: string;
}

export function RoundtableChat({ messages, streamingMessageId, className }: RoundtableChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessageId]);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {messages.map(msg => (
        <ThinkerBubble
          key={msg.id}
          message={msg}
          isStreaming={msg.id === streamingMessageId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
