"use client";

import React, { useEffect, useRef } from "react";
import {
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  BookOpen,
  Scale,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useDebateStore, useAgentStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { DebateMessage, DebateMessageType, AgentType } from "@/types";

const messageTypeConfig: Record<
  DebateMessageType,
  { icon: React.ReactNode; label: string; className: string }
> = {
  proposal: {
    icon: <Lightbulb className="w-4 h-4" />,
    label: "제안",
    className: "debate-proposal",
  },
  critique: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "반박",
    className: "debate-critique",
  },
  "counter-proposal": {
    icon: <RotateCcw className="w-4 h-4" />,
    label: "재제안",
    className: "debate-counter-proposal",
  },
  approval: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: "승인",
    className: "debate-approval",
  },
  learning: {
    icon: <BookOpen className="w-4 h-4" />,
    label: "학습",
    className: "debate-learning",
  },
};

const agentIcons: Record<AgentType, React.ReactNode> = {
  "decision-maker": <Lightbulb className="w-4 h-4" />,
  judge: <Scale className="w-4 h-4" />,
  auditor: <Shield className="w-4 h-4" />,
};

interface DebateMessageItemProps {
  message: DebateMessage;
}

function DebateMessageItem({ message }: DebateMessageItemProps) {
  const { agents } = useAgentStore();
  const agent = agents[message.agentId];
  const config = messageTypeConfig[message.type];

  return (
    <div
      className={cn(
        "bg-slate-800/50 rounded-lg p-3 mb-3",
        config.className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: agent.color + "20" }}
          >
            <span style={{ color: agent.color }}>{agentIcons[message.agentId]}</span>
          </div>
          <span className="text-sm font-medium" style={{ color: agent.color }}>
            {agent.nameKo}
          </span>
          <Badge
            variant={
              message.agentId === "decision-maker"
                ? "decision"
                : message.agentId === "judge"
                ? "judge"
                : "auditor"
            }
            className="text-xs"
          >
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
        </div>
        <span className="text-xs text-slate-500">
          {formatDate(new Date(message.timestamp))}
        </span>
      </div>

      <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
        {message.content}
      </div>

      {message.score !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-500">평가 점수:</span>
          <span
            className={cn(
              "text-sm font-bold",
              message.score >= 80
                ? "text-emerald-400"
                : message.score >= 60
                ? "text-yellow-400"
                : "text-red-400"
            )}
          >
            {message.score}점
          </span>
        </div>
      )}

      {message.highlights && message.highlights.length > 0 && (
        <div className="mt-2 space-y-1">
          {message.highlights.map((highlight, index) => (
            <div
              key={index}
              className={cn(
                "text-xs px-2 py-1 rounded",
                highlight.type === "improvement" && "bg-emerald-500/20 text-emerald-400",
                highlight.type === "issue" && "bg-red-500/20 text-red-400",
                highlight.type === "question" && "bg-yellow-500/20 text-yellow-400"
              )}
            >
              {highlight.type === "improvement" && "✓ "}
              {highlight.type === "issue" && "✗ "}
              {highlight.type === "question" && "? "}
              {highlight.text}
              {highlight.suggestion && (
                <span className="text-slate-400 ml-1">→ {highlight.suggestion}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DebateStream() {
  const { messages, isDebating, currentRound } = useDebateStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="flex justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-blue-400" />
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <Scale className="w-4 h-4 text-red-400" />
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-sm">에이전트 토론이 시작되면</p>
          <p className="text-sm">여기에 실시간으로 표시됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="p-3">
        {currentRound > 0 && (
          <div className="text-center mb-4">
            <Badge variant="outline" className="text-xs">
              라운드 {currentRound}
            </Badge>
          </div>
        )}
        {messages.map((message) => (
          <DebateMessageItem key={message.id} message={message} />
        ))}
        {isDebating && (
          <div className="flex justify-center">
            <div className="flex gap-1">
              <span className="thinking-dot w-2 h-2 rounded-full bg-blue-500" />
              <span className="thinking-dot w-2 h-2 rounded-full bg-red-500" />
              <span className="thinking-dot w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
