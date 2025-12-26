"use client";

import React, { useCallback, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { RightPanel } from "@/components/layout/RightPanel";
import {
  useAgentStore,
  useDebateStore,
  useDocumentStore,
  useKnowledgeStore,
  useMetricsStore,
  useUIStore,
} from "@/store";

export default function HomePage() {
  const { updateAgentStatus, resetAgents } = useAgentStore();
  const { addMessage, clearMessages, setDebating, incrementRound } = useDebateStore();
  const { addDocument, updateDocument, selectDocument, setRootDocument } = useDocumentStore();
  const { addRule, rules } = useKnowledgeStore();
  const { updateMetrics, addIteration } = useMetricsStore();
  const { setProcessing, updateRightPanel } = useUIStore();

  const [generationError, setGenerationError] = useState<string | null>(null);

  const simulateAgentThinking = async (
    agentId: "decision-maker" | "judge" | "auditor",
    task: string,
    duration: number
  ) => {
    updateAgentStatus(agentId, "thinking", task);
    await new Promise((resolve) => setTimeout(resolve, duration));
  };

  const handleStartGeneration = useCallback(
    async (goal: string) => {
      setProcessing(true);
      setGenerationError(null);
      clearMessages();
      resetAgents();
      updateRightPanel({ isCollapsed: false, activeTab: "debate" });

      try {
        // Phase 1: Decision Maker generates initial structure
        await simulateAgentThinking("decision-maker", "프로젝트 구조 분석 중...", 1000);

        const structureResponse = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start-generation", goal, rules }),
        });

        const structureData = await structureResponse.json();

        if (!structureData.success) {
          throw new Error("문서 구조 생성 실패");
        }

        // Add documents to store
        let rootId: string | null = null;
        const documentIds: string[] = [];

        for (const doc of structureData.documents) {
          updateAgentStatus("decision-maker", "writing", `${doc.title} 작성 중...`);
          await new Promise((resolve) => setTimeout(resolve, 300));

          const docId = addDocument({
            ...doc,
            parentId: rootId ? rootId : undefined,
            children: [],
          });

          if (!rootId) {
            rootId = docId;
            setRootDocument(docId);
          }
          documentIds.push(docId);
        }

        // Decision Maker proposal
        addMessage({
          agentId: "decision-maker",
          type: "proposal",
          content: `프로젝트 "${goal}"에 대한 초기 기획안을 작성했습니다.\n\n총 ${documentIds.length}개의 문서가 생성되었습니다:\n- Blueprint: 1개\n- Module: 3개\n- Detail: 3개\n- Implementation: 1개\n\n주요 특징:\n- OAuth 2.0 기반 인증\n- Next.js + Node.js 기술 스택\n- PostgreSQL 데이터베이스`,
        });

        updateAgentStatus("decision-maker", "complete");
        incrementRound();

        // Phase 2: Judge evaluates
        await simulateAgentThinking("judge", "기획안 평가 중...", 1500);
        setDebating(true);

        addMessage({
          agentId: "judge",
          type: "critique",
          content: `기획안을 검토했습니다.\n\n✓ 긍정적:\n- 기술 스택 선택이 적절합니다\n- 문서 구조가 체계적입니다\n\n✗ 개선 필요:\n- MVP 범위가 다소 넓습니다\n- 구체적인 사용자 시나리오 보완 필요`,
          score: 75,
          highlights: [
            { type: "improvement", text: "체계적인 문서 구조" },
            { type: "issue", text: "MVP 범위 축소 필요", suggestion: "핵심 기능 3개로 제한" },
          ],
        });

        updateAgentStatus("judge", "evaluating");

        // Update document with evaluation
        if (rootId) {
          updateDocument(rootId, {
            status: "reviewing",
            score: {
              strategicFit: 78,
              feasibility: 82,
              completeness: 72,
              clarity: 75,
              overall: 77,
              feedback: "양호한 품질이지만 MVP 범위 조정이 필요합니다.",
            },
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Decision Maker responds
        updateAgentStatus("decision-maker", "writing", "피드백 반영 중...");
        await new Promise((resolve) => setTimeout(resolve, 800));

        addMessage({
          agentId: "decision-maker",
          type: "counter-proposal",
          content: `피드백을 반영하여 수정했습니다.\n\nMVP 핵심 기능 (Phase 1):\n1. 소셜 로그인 (Google/Kakao)\n2. 핵심 CRUD 기능\n3. 기본 알림\n\nPhase 2 이후:\n- 고급 검색\n- 분석 대시보드`,
        });

        updateAgentStatus("decision-maker", "complete");
        incrementRound();

        // Judge approves
        await simulateAgentThinking("judge", "수정안 재평가 중...", 1000);

        addMessage({
          agentId: "judge",
          type: "approval",
          content: `수정된 제안이 개선되었습니다.\n\n평가 결과:\n- 전략적 적합성: 85/100\n- 실행 가능성: 88/100\n- 완성도: 80/100\n- 명확성: 83/100\n\n종합: 84점 - ✓ 승인 권고`,
          score: 84,
        });

        updateAgentStatus("judge", "complete");

        // Update document status
        if (rootId) {
          updateDocument(rootId, {
            status: "approved",
            score: {
              strategicFit: 85,
              feasibility: 88,
              completeness: 80,
              clarity: 83,
              overall: 84,
              feedback: "우수한 품질의 기획안입니다. 구현을 진행할 수 있습니다.",
            },
          });
        }

        // Phase 3: Auditor approves and extracts learning
        await simulateAgentThinking("auditor", "최종 검증 및 학습 규칙 추출 중...", 1200);

        addMessage({
          agentId: "auditor",
          type: "approval",
          content: `검토 결과를 최종 승인합니다.\n\n승인 사유:\n- 평가 점수 84점 (기준: 70점 이상)\n- Judge의 승인 권고\n- 명확한 Phase 구분\n\n문서가 정식 승인되었습니다.`,
        });

        // Extract and add knowledge rules
        addMessage({
          agentId: "auditor",
          type: "learning",
          content: `이번 세션에서 학습한 규칙:\n\n1. MVP 단계에서는 핵심 기능 3개 이하로 제한\n2. 한국 시장 타겟 시 Kakao 로그인 필수\n3. 명확한 Phase 구분으로 범위 관리`,
        });

        // Add knowledge rules
        addRule({
          category: "전략",
          rule: "MVP 단계에서는 핵심 기능 3개 이하로 제한한다",
          confidence: 0.85,
          source: `${goal} 프로젝트`,
          isActive: true,
        });

        addRule({
          category: "인증",
          rule: "한국 시장 타겟 시 Kakao 로그인을 필수로 지원한다",
          confidence: 0.9,
          source: `${goal} 프로젝트`,
          isActive: true,
        });

        addRule({
          category: "기획",
          rule: "기능을 명확한 Phase로 구분하여 로드맵을 작성한다",
          confidence: 0.8,
          source: `${goal} 프로젝트`,
          isActive: true,
        });

        updateAgentStatus("auditor", "complete");

        // Update metrics
        updateMetrics({
          totalDocuments: documentIds.length,
          approvedDocuments: 1,
          rejectionRate: 0.15,
          averageScore: 84,
          generationSpeed: documentIds.length / 2,
          learningEfficiency: 0.75,
        });

        addIteration({
          iteration: 1,
          documentsGenerated: documentIds.length,
          averageScore: 84,
          rulesLearned: 3,
        });

        setDebating(false);

        // Select the first document
        if (rootId) {
          selectDocument(rootId);
        }
      } catch (error) {
        console.error("Generation error:", error);
        setGenerationError(error instanceof Error ? error.message : "알 수 없는 오류");
      } finally {
        setProcessing(false);
        resetAgents();
      }
    },
    [
      addDocument,
      addMessage,
      addRule,
      addIteration,
      clearMessages,
      incrementRound,
      resetAgents,
      rules,
      selectDocument,
      setDebating,
      setProcessing,
      setRootDocument,
      updateAgentStatus,
      updateDocument,
      updateMetrics,
      updateRightPanel,
    ]
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="h-12 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-lg font-semibold text-white">
              자율 진화형 기획 엔진
            </h1>
          </div>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            v0.1.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">
            Powered by 3-Agent System
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MainContent onStartGeneration={handleStartGeneration} />
        <RightPanel />
      </div>

      {/* Error Toast */}
      {generationError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-medium">오류</span>
            <span>{generationError}</span>
            <button
              onClick={() => setGenerationError(null)}
              className="ml-2 text-red-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
