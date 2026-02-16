import React from 'react';
import { Agent, AgentStatus, AgentType } from '../types';
import { Bot, BrainCircuit, Search, Database, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  agents: Agent[];
}

const getIcon = (type: AgentType) => {
  switch (type) {
    case AgentType.OVERSEER: return <BrainCircuit className="w-6 h-6" />;
    case AgentType.RESEARCHER: return <Search className="w-5 h-5" />;
    case AgentType.CRITIC: return <Bot className="w-5 h-5" />;
    case AgentType.SYNTHESIZER: return <FileText className="w-5 h-5" />;
    default: return <Bot className="w-5 h-5" />;
  }
};

const getStatusColor = (status: AgentStatus) => {
  switch (status) {
    case AgentStatus.THINKING: return 'border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
    case AgentStatus.SEARCHING: return 'border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
    case AgentStatus.ANALYZING: return 'border-purple-500 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
    case AgentStatus.COMPLETE: return 'border-green-500 text-green-500 bg-green-900/10';
    case AgentStatus.FAILED: return 'border-red-500 text-red-500';
    default: return 'border-gray-700 text-gray-500';
  }
};

const AgentNode: React.FC<{ agent: Agent }> = ({ agent }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex flex-col items-center p-4 m-2 rounded-lg border bg-cyber-gray transition-all duration-300 w-48 ${getStatusColor(agent.status)}`}
    >
      <div className="mb-2">
        {getIcon(agent.type)}
      </div>
      <div className="text-xs font-bold font-mono text-center truncate w-full">{agent.name}</div>
      <div className="text-[10px] uppercase opacity-70 mt-1">{agent.status}</div>
      
      {agent.status === AgentStatus.SEARCHING && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse-fast"></div>
      )}
    </motion.div>
  );
};

export const AgentGraph: React.FC<Props> = ({ agents }) => {
  const overseer = agents.find(a => a.type === AgentType.OVERSEER);
  const others = agents.filter(a => a.type !== AgentType.OVERSEER);

  return (
    <div className="w-full h-full p-6 flex flex-col items-center overflow-y-auto">
      {overseer && (
        <div className="mb-8">
          <AgentNode agent={overseer} />
          {others.length > 0 && <div className="h-8 w-px bg-gray-700 mx-auto my-2"></div>}
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-4">
        {others.map(agent => (
           <AgentNode key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};