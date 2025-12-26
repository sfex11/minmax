"use client";

import React from "react";
import {
  Brain,
  Lightbulb,
  PenTool,
  CheckCircle,
  Clock,
  Scale,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Agent, AgentStatus, AgentType } from "@/types";

interface AgentStatusPodProps {
  agent: Agent;
  compact?: boolean;
}

const statusIcons: Record<AgentStatus, React.ReactNode> = {
  idle: <Clock className="w-3 h-3" />,
  thinking: <Brain className="w-3 h-3 animate-pulse" />,
  writing: <PenTool className="w-3 h-3" />,
  evaluating: <Scale className="w-3 h-3" />,
  complete: <CheckCircle className="w-3 h-3" />,
};

const statusLabels: Record<AgentStatus, string> = {
  idle: "대기 중",
  thinking: "분석 중",
  writing: "작성 중",
  evaluating: "평가 중",
  complete: "완료",
};

const agentIcons: Record<AgentType, React.ReactNode> = {
  "decision-maker": <Lightbulb className="w-4 h-4" />,
  judge: <Scale className="w-4 h-4" />,
  auditor: <Shield className="w-4 h-4" />,
};

export function AgentStatusPod({ agent, compact = false }: AgentStatusPodProps) {
  const isActive = agent.status !== "idle";

  const getGlowClass = () => {
    if (!isActive) return "";
    switch (agent.id) {
      case "decision-maker":
        return "agent-glow-decision";
      case "judge":
        return "agent-glow-judge";
      case "auditor":
        return "agent-glow-auditor";
      default:
        return "";
    }
  };

  const getBorderColor = () => {
    switch (agent.id) {
      case "decision-maker":
        return isActive ? "border-blue-500" : "border-slate-600";
      case "judge":
        return isActive ? "border-red-500" : "border-slate-600";
      case "auditor":
        return isActive ? "border-emerald-500" : "border-slate-600";
      default:
        return "border-slate-600";
    }
  };

  const getTextColor = () => {
    switch (agent.id) {
      case "decision-maker":
        return "text-blue-400";
      case "judge":
        return "text-red-400";
      case "auditor":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  const getBgColor = () => {
    switch (agent.id) {
      case "decision-maker":
        return isActive ? "bg-blue-500/10" : "bg-slate-800";
      case "judge":
        return isActive ? "bg-red-500/10" : "bg-slate-800";
      case "auditor":
        return isActive ? "bg-emerald-500/10" : "bg-slate-800";
      default:
        return "bg-slate-800";
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                getBorderColor(),
                getBgColor(),
                getGlowClass()
              )}
            >
              <span className={cn(getTextColor())}>{agentIcons[agent.id]}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{agent.nameKo}</p>
            <p className="text-xs text-slate-400">{statusLabels[agent.status]}</p>
            {agent.currentTask && (
              <p className="text-xs text-slate-500 mt-1">{agent.currentTask}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 rounded-lg border-2 p-2 transition-all",
        getBorderColor(),
        getBgColor(),
        getGlowClass()
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={cn(getTextColor())}>{agentIcons[agent.id]}</span>
        <span className={cn("text-xs font-medium", getTextColor())}>
          {agent.nameKo}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "text-slate-500",
            isActive && getTextColor()
          )}
        >
          {statusIcons[agent.status]}
        </span>
        <span className="text-xs text-slate-400">
          {statusLabels[agent.status]}
        </span>
      </div>
      {isActive && agent.status === "thinking" && (
        <div className="flex gap-1 mt-2">
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-current" style={{ color: agent.color }} />
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-current" style={{ color: agent.color }} />
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-current" style={{ color: agent.color }} />
        </div>
      )}
      {agent.currentTask && (
        <p className="text-xs text-slate-500 mt-1 truncate">{agent.currentTask}</p>
      )}
    </div>
  );
}
