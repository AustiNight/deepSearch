import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Agent, AgentStatus, AgentType } from '../types';
import { Bot, BrainCircuit, Search, FileText } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface Props {
  agents: Agent[];
  motionEnabled?: boolean;
  linksEnabled?: boolean;
  focusEnabled?: boolean;
  compact?: boolean;
}

const SHOW_GRAPH_MOTION_V1 = (process.env.SHOW_GRAPH_MOTION_V1 || 'true').trim().toLowerCase() !== 'false';
const SPAWN_LINK_TTL_MS = 700;
const SPAWN_LINK_REFRESH_MS = 90;
const MAX_SPAWN_LINKS = 3;
const ACTIVE_STATUSES = new Set<AgentStatus>([
  AgentStatus.THINKING,
  AgentStatus.SEARCHING,
  AgentStatus.ANALYZING
]);

type SpawnEvent = {
  id: string;
  spawnedAt: number;
};

const getIcon = (type: AgentType, className = 'w-5 h-5') => {
  switch (type) {
    case AgentType.OVERSEER: return <BrainCircuit className={className} />;
    case AgentType.RESEARCHER: return <Search className={className} />;
    case AgentType.CRITIC: return <Bot className={className} />;
    case AgentType.SYNTHESIZER: return <FileText className={className} />;
    default: return <Bot className={className} />;
  }
};

const getStatusColor = (status: AgentStatus) => {
  switch (status) {
    case AgentStatus.THINKING: return 'border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
    case AgentStatus.SEARCHING: return 'border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
    case AgentStatus.ANALYZING: return 'border-purple-500 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
    case AgentStatus.COMPLETE: return 'border-green-500 text-green-500 bg-green-900/10';
    case AgentStatus.FAILED: return 'border-red-500 text-red-500';
    case AgentStatus.SKIPPED: return 'border-gray-600 text-gray-400 bg-gray-900/30';
    default: return 'border-gray-700 text-gray-500';
  }
};

type AgentNodeProps = {
  agent: Agent;
  reducedMotion: boolean;
  compact?: boolean;
  isOverseer?: boolean;
  isNew?: boolean;
  showActivityHalo?: boolean;
  dimmed?: boolean;
  highlighted?: boolean;
  setNodeRef?: (node: HTMLDivElement | null) => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
};

const AgentNode: React.FC<AgentNodeProps> = ({
  agent,
  reducedMotion,
  compact = false,
  isOverseer = false,
  isNew = false,
  showActivityHalo = false,
  dimmed = false,
  highlighted = false,
  setNodeRef,
  onHoverStart,
  onHoverEnd
}) => {
  const [flashComplete, setFlashComplete] = useState(false);
  const [flashFailed, setFlashFailed] = useState(false);
  const prevStatusRef = useRef(agent.status);

  useEffect(() => {
    const previous = prevStatusRef.current;
    if (!SHOW_GRAPH_MOTION_V1 || reducedMotion) {
      prevStatusRef.current = agent.status;
      return;
    }
    if (previous !== agent.status && agent.status === AgentStatus.COMPLETE) {
      setFlashComplete(true);
      const timer = window.setTimeout(() => setFlashComplete(false), 750);
      return () => window.clearTimeout(timer);
    }
    if (previous !== agent.status && agent.status === AgentStatus.FAILED) {
      setFlashFailed(true);
      const timer = window.setTimeout(() => setFlashFailed(false), 450);
      return () => window.clearTimeout(timer);
    }
    prevStatusRef.current = agent.status;
    return undefined;
  }, [agent.status, reducedMotion]);

  useEffect(() => {
    prevStatusRef.current = agent.status;
  }, [agent.status]);

  const iconAnimate = useMemo(() => {
    if (!SHOW_GRAPH_MOTION_V1 || reducedMotion) return {};
    switch (agent.status) {
      case AgentStatus.THINKING:
        return { scale: [1, 1.015, 1] };
      case AgentStatus.SEARCHING:
        return { opacity: [1, 0.8, 1] };
      case AgentStatus.ANALYZING:
        return { rotate: [0, -1.5, 1.5, 0] };
      default:
        return {};
    }
  }, [agent.status, reducedMotion]);

  const iconTransition = useMemo(() => {
    if (!SHOW_GRAPH_MOTION_V1 || reducedMotion) return undefined;
    switch (agent.status) {
      case AgentStatus.THINKING:
        return { duration: 1.4, repeat: Infinity };
      case AgentStatus.SEARCHING:
        return { duration: 1.0, repeat: Infinity };
      case AgentStatus.ANALYZING:
        return { duration: 1.35, repeat: Infinity };
      default:
        return undefined;
    }
  }, [agent.status, reducedMotion]);

  const emphasisClass = dimmed
    ? 'opacity-45 saturate-50'
    : highlighted
      ? 'ring-1 ring-cyber-blue/50'
      : '';

  const nodeAnimate = flashFailed && SHOW_GRAPH_MOTION_V1 && !reducedMotion
    ? { opacity: 1, scale: 1, x: [0, -2, 2, -1, 1, 0] }
    : { opacity: 1, scale: 1 };
  const nodeSizeClass = compact
    ? 'p-3 m-1 sm:m-1.5 w-full max-w-48 sm:w-48'
    : 'p-4 m-1.5 sm:m-2 w-full max-w-56 sm:w-56';
  const labelClass = compact ? 'text-[11px]' : 'text-xs';
  const statusClass = compact ? 'text-[9px]' : 'text-[10px]';
  const iconClass = isOverseer
    ? (compact ? 'w-5 h-5' : 'w-6 h-6')
    : (compact ? 'w-4 h-4' : 'w-5 h-5');

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={nodeAnimate}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className={`relative z-10 flex flex-col items-center rounded-lg border bg-cyber-gray transition-all duration-300 overflow-hidden ${nodeSizeClass} ${getStatusColor(agent.status)} ${emphasisClass}`}
    >
      {SHOW_GRAPH_MOTION_V1 && isOverseer && showActivityHalo && !reducedMotion && (
        <motion.div
          className="absolute -inset-2 rounded-xl border border-cyber-blue/40 pointer-events-none"
          animate={{ opacity: [0.2, 0.65, 0.2], scale: [1, 1.03, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
        />
      )}

      {SHOW_GRAPH_MOTION_V1 && isNew && !reducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-lg border border-cyber-blue/70 pointer-events-none"
          initial={{ opacity: 0.6, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.22 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      <motion.div className="mb-2" animate={iconAnimate} transition={iconTransition}>
        {getIcon(agent.type, iconClass)}
      </motion.div>
      <div className={`${labelClass} font-bold font-mono text-center break-words leading-snug w-full`} title={agent.name}>
        {agent.name}
      </div>
      <div className={`${statusClass} uppercase opacity-70 mt-1`}>{agent.status}</div>

      <AnimatePresence>
        {flashComplete && SHOW_GRAPH_MOTION_V1 && !reducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-green-400/35 to-transparent"
              initial={{ x: '-130%', opacity: 0 }}
              animate={{ x: '230%', opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {agent.status === AgentStatus.SEARCHING && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse-fast"></div>
      )}
    </motion.div>
  );
};

export const AgentGraph: React.FC<Props> = ({
  agents,
  motionEnabled = true,
  linksEnabled = true,
  focusEnabled = true,
  compact = false
}) => {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion || !SHOW_GRAPH_MOTION_V1 || !motionEnabled;
  const allowLinks = linksEnabled && !reducedMotion;
  const allowFocus = focusEnabled;
  const overseer = agents.find(a => a.type === AgentType.OVERSEER);
  const others = agents.filter(a => a.type !== AgentType.OVERSEER);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overseerNodeRef = useRef<HTMLDivElement | null>(null);
  const otherNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousOtherIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const [spawnEvents, setSpawnEvents] = useState<SpawnEvent[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [layoutTick, setLayoutTick] = useState(0);

  const resolveParentId = (agent: Agent) => {
    if (agent.type === AgentType.OVERSEER) return null;
    return agent.parentId || overseer?.id || null;
  };

  const parentById = useMemo(() => {
    const entries = new Map<string, string | null>();
    agents.forEach((agent) => {
      entries.set(agent.id, resolveParentId(agent));
    });
    return entries;
  }, [agents, overseer?.id]);

  const relatedIds = useMemo(() => {
    if (!allowFocus) return null;
    if (!hoveredId) return null;
    const related = new Set<string>([hoveredId]);
    const parent = parentById.get(hoveredId);
    if (parent) related.add(parent);
    parentById.forEach((parentId, nodeId) => {
      if (parentId === hoveredId) related.add(nodeId);
    });
    return related;
  }, [hoveredId, parentById, allowFocus]);

  useEffect(() => {
    const currentIds = new Set(others.map((agent) => agent.id));
    if (!SHOW_GRAPH_MOTION_V1 || reducedMotion) {
      previousOtherIdsRef.current = currentIds;
      initializedRef.current = true;
      return;
    }
    if (!initializedRef.current) {
      previousOtherIdsRef.current = currentIds;
      initializedRef.current = true;
      return;
    }
    const previous = previousOtherIdsRef.current;
    const newIds = Array.from(currentIds).filter((id) => !previous.has(id));
    if (newIds.length > 0) {
      const spawnedAt = Date.now();
      setSpawnEvents((existing) => {
        const merged = [
          ...existing,
          ...newIds.map((id) => ({ id, spawnedAt }))
        ];
        return merged.slice(-MAX_SPAWN_LINKS);
      });
    }
    previousOtherIdsRef.current = currentIds;
  }, [others, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || spawnEvents.length === 0) return undefined;
    const interval = window.setInterval(() => {
      const now = Date.now();
      setSpawnEvents((existing) => existing.filter((event) => now - event.spawnedAt < SPAWN_LINK_TTL_MS));
      setLayoutTick((n) => n + 1);
    }, SPAWN_LINK_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [spawnEvents.length, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const onResize = () => setLayoutTick((n) => n + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [reducedMotion]);

  const hasActiveWork = others.some((agent) => ACTIVE_STATUSES.has(agent.status));

  const freshSpawnEvents = useMemo(() => {
    const now = Date.now();
    return spawnEvents.filter((event) => now - event.spawnedAt < SPAWN_LINK_TTL_MS);
  }, [spawnEvents, layoutTick]);

  const freshSpawnIdSet = useMemo(() => new Set(freshSpawnEvents.map((event) => event.id)), [freshSpawnEvents]);

  const linePaths = useMemo(() => {
    if (!allowLinks) return [];
    const container = containerRef.current;
    const overseerNode = overseerNodeRef.current;
    if (!container || !overseerNode) return [];
    const containerRect = container.getBoundingClientRect();
    const sourceRect = overseerNode.getBoundingClientRect();
    const x1 = sourceRect.left - containerRect.left + sourceRect.width / 2;
    const y1 = sourceRect.top - containerRect.top + sourceRect.height / 2;
    return freshSpawnEvents
      .map((event) => {
        const targetNode = otherNodeRefs.current[event.id];
        if (!targetNode) return null;
        const targetRect = targetNode.getBoundingClientRect();
        const x2 = targetRect.left - containerRect.left + targetRect.width / 2;
        const y2 = targetRect.top - containerRect.top + targetRect.height / 2;
        const controlY = Math.max(y1 + 24, y2 - 36);
        const d = `M ${x1} ${y1} C ${x1} ${controlY}, ${x2} ${controlY}, ${x2} ${y2}`;
        return {
          key: `${event.id}-${event.spawnedAt}`,
          d
        };
      })
      .filter((entry): entry is { key: string; d: string } => Boolean(entry));
  }, [freshSpawnEvents, allowLinks, layoutTick]);

  const setOtherNodeRef = (agentId: string) => (node: HTMLDivElement | null) => {
    otherNodeRefs.current[agentId] = node;
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col items-center overflow-y-auto relative ${compact ? 'px-2 sm:px-4 py-2 sm:py-4' : 'px-2 sm:px-6 py-3 sm:py-6'}`}
    >
      {SHOW_GRAPH_MOTION_V1 && allowLinks && linePaths.length > 0 && (
        <svg className="absolute inset-0 pointer-events-none z-0" width="100%" height="100%">
          <AnimatePresence>
            {linePaths.map((path) => (
              <motion.path
                key={path.key}
                d={path.d}
                fill="none"
                stroke="rgba(0, 240, 255, 0.45)"
                strokeWidth={1.4}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0.7, 0.35, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: SPAWN_LINK_TTL_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </AnimatePresence>
        </svg>
      )}

      {overseer && (
        <div className={`relative z-10 ${compact ? 'mb-3 sm:mb-4' : 'mb-4 sm:mb-6'}`}>
          <AgentNode
            agent={overseer}
            reducedMotion={reducedMotion}
            compact={compact}
            isOverseer={true}
            showActivityHalo={hasActiveWork}
            highlighted={!relatedIds || relatedIds.has(overseer.id)}
            dimmed={Boolean(relatedIds && !relatedIds.has(overseer.id))}
            setNodeRef={(node) => { overseerNodeRef.current = node; }}
            onHoverStart={allowFocus ? () => setHoveredId(overseer.id) : undefined}
            onHoverEnd={allowFocus ? () => setHoveredId((current) => (current === overseer.id ? null : current)) : undefined}
          />
          {others.length > 0 && (
            <div className={`w-px bg-gray-700 mx-auto ${compact ? 'h-3 sm:h-4 my-1 sm:my-1.5' : 'h-4 sm:h-6 my-1.5 sm:my-2'}`}></div>
          )}
        </div>
      )}
      
      <div className={`flex flex-wrap justify-center relative z-10 w-full ${compact ? 'gap-1.5 sm:gap-3' : 'gap-2 sm:gap-4'}`}>
        {others.map(agent => (
          <AgentNode
            key={agent.id}
            agent={agent}
            reducedMotion={reducedMotion}
            compact={compact}
            isNew={freshSpawnIdSet.has(agent.id)}
            highlighted={!relatedIds || relatedIds.has(agent.id)}
            dimmed={Boolean(relatedIds && !relatedIds.has(agent.id))}
            setNodeRef={setOtherNodeRef(agent.id)}
            onHoverStart={allowFocus ? () => setHoveredId(agent.id) : undefined}
            onHoverEnd={allowFocus ? () => setHoveredId((current) => (current === agent.id ? null : current)) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
