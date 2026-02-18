import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

export const LogTerminal: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (!isAtBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isAtBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distance < 24);
  };

  // Helper to format timestamp with seconds
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      className="h-full min-h-0 bg-cyber-black border border-gray-800 rounded-lg p-4 font-mono text-xs overflow-hidden flex flex-col shadow-inner"
      data-testid="log-terminal"
    >
      <div className="uppercase text-gray-500 mb-2 border-b border-gray-800 pb-1 flex justify-between">
        <span className="font-bold">{'>'} OVERSEER_LOGS</span>
        <span className="text-cyber-green animate-pulse flex items-center gap-1">● LIVE_FEED</span>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
      >
        {logs.map(log => (
          <div
            key={log.id}
            className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 items-start"
            data-testid="log-entry"
          >
            <span className="text-gray-600 shrink-0 select-none border-r border-gray-800 pr-2">
              {formatTime(log.timestamp)}
            </span>
            <span className={`${
              log.type === 'error' ? 'text-red-500 bg-red-900/10 px-1' :
              log.type === 'success' ? 'text-cyber-green' :
              log.type === 'warning' ? 'text-yellow-500' :
              log.type === 'action' ? 'text-cyber-blue font-bold' :
              'text-gray-400'
            } break-words leading-relaxed`}>
              <span className="font-bold opacity-70 mr-2 text-[10px] tracking-wider">[{log.agentName.toUpperCase()}]</span> 
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
