"use client";

import React from "react";
import {
  ChevronLeft,
  MessageSquare,
  BarChart3,
  CheckCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useAgentStore, useDebateStore, useMetricsStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentStatusPod } from "@/components/agents/AgentStatusPod";
import { DebateStream } from "@/components/agents/DebateStream";
import { EvolutionGraph } from "@/components/knowledge/EvolutionGraph";
import type { AgentType } from "@/types";

export function RightPanel() {
  const { rightPanel, updateRightPanel } = useUIStore();
  const { agents } = useAgentStore();
  const { messages, isDebating } = useDebateStore();
  const { metrics } = useMetricsStore();

  const agentList = Object.values(agents) as typeof agents[AgentType][];
  const activeAgents = agentList.filter((a) => a.status !== "idle");

  if (rightPanel.isCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-l border-slate-700 flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => updateRightPanel({ isCollapsed: false })}
          className="text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col gap-2">
          {agentList.map((agent) => (
            <div
              key={agent.id}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                agent.status === "idle" && "bg-slate-600",
                agent.status !== "idle" && "status-active",
                agent.id === "decision-maker" && agent.status !== "idle" && "bg-blue-500",
                agent.id === "judge" && agent.status !== "idle" && "bg-red-500",
                agent.id === "auditor" && agent.status !== "idle" && "bg-emerald-500"
              )}
            />
          ))}
        </div>
        {messages.length > 0 && (
          <Badge variant="secondary" className="text-xs px-1.5">
            {messages.length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col">
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm text-slate-200">에이전트 활동</h2>
          {isDebating && (
            <Badge variant="default" className="text-xs animate-pulse">
              진행 중
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-400 hover:text-white"
          onClick={() => updateRightPanel({ isCollapsed: true })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Agent Status Pods */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex gap-2">
          {agentList.map((agent) => (
            <AgentStatusPod key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <Tabs
        value={rightPanel.activeTab}
        onValueChange={(value) =>
          updateRightPanel({ activeTab: value as typeof rightPanel.activeTab })
        }
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-3 mt-2 bg-slate-800">
          <TabsTrigger value="debate" className="text-xs flex-1">
            <MessageSquare className="w-3 h-3 mr-1" />
            토론
            {messages.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1">
                {messages.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="text-xs flex-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            평가
          </TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs flex-1">
            <BarChart3 className="w-3 h-3 mr-1" />
            지표
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debate" className="flex-1 mt-0 overflow-hidden">
          <DebateStream />
        </TabsContent>

        <TabsContent value="evaluation" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              {metrics.iterations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>평가 결과가 없습니다</p>
                  <p className="text-xs mt-1">문서 생성 후 평가 결과를 확인하세요</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-400">총 문서</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {metrics.totalDocuments}
                      </p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-400">승인됨</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {metrics.approvedDocuments}
                      </p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-400">반려율</p>
                      <p className="text-2xl font-bold text-red-400">
                        {(metrics.rejectionRate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-400">평균 점수</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {metrics.averageScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="metrics" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <EvolutionGraph />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
