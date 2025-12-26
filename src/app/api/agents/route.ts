import { NextRequest, NextResponse } from "next/server";
import {
  generateDocumentStructure,
  generateSampleContent,
  evaluateDocument,
  generateADR,
  extractKnowledgeRules,
  AGENT_PROMPTS,
} from "@/lib/agents";
import { generateId } from "@/lib/utils";
import type {
  Document,
  DocumentType,
  DebateMessage,
  DebateMessageType,
  EvaluationScore,
  KnowledgeRule,
} from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, goal, documentId, iteration = 1, rules = [] } = body;

    switch (action) {
      case "start-generation":
        return handleStartGeneration(goal, rules);

      case "generate-document":
        return handleGenerateDocument(goal, documentId, iteration, rules);

      case "evaluate-document":
        return handleEvaluateDocument(body.document, rules);

      case "approve-document":
        return handleApproveDocument(body.document, body.debateMessages);

      case "simulate-debate":
        return handleSimulateDebate(goal, body.document);

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleStartGeneration(goal: string, rules: KnowledgeRule[]) {
  const structure = generateDocumentStructure(goal);

  const documents: Omit<Document, "id" | "createdAt" | "updatedAt">[] = structure.map(
    (item, index) => ({
      parentId: index === 0 ? undefined : "root",
      title: item.title,
      type: item.type,
      content: generateSampleContent(item.title, item.type, goal),
      status: "draft" as const,
      children: [],
      version: 1,
    })
  );

  return NextResponse.json({
    success: true,
    documents,
    message: `${documents.length}개의 문서 구조가 생성되었습니다.`,
  });
}

async function handleGenerateDocument(
  goal: string,
  documentId: string,
  iteration: number,
  rules: KnowledgeRule[]
) {
  // Simulate document generation with delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const content = generateEnhancedContent(goal, iteration, rules);

  return NextResponse.json({
    success: true,
    content,
    iteration,
  });
}

async function handleEvaluateDocument(
  document: Document,
  rules: KnowledgeRule[]
) {
  // Simulate evaluation
  await new Promise((resolve) => setTimeout(resolve, 300));

  const score = evaluateDocument(document, rules);

  return NextResponse.json({
    success: true,
    score,
    approved: score.overall >= 70,
  });
}

async function handleApproveDocument(
  document: Document,
  debateMessages: DebateMessage[]
) {
  const adr = generateADR(
    document.title,
    `${document.title}에 대해 제안된 구조와 기능을 채택합니다.`,
    `프로젝트 목표 달성을 위해 ${document.type} 레벨의 기획이 필요했습니다.`
  );

  const newRules = extractKnowledgeRules(debateMessages, document);

  return NextResponse.json({
    success: true,
    adr,
    newRules,
    message: "문서가 승인되었으며 학습 규칙이 추출되었습니다.",
  });
}

async function handleSimulateDebate(goal: string, document?: Document) {
  // Simulate a full debate cycle
  const messages: Omit<DebateMessage, "id" | "timestamp">[] = [];

  // Decision Maker proposes
  messages.push({
    agentId: "decision-maker",
    type: "proposal",
    content: `프로젝트 "${goal}"에 대한 초기 기획안을 제안합니다.\n\n핵심 기능:\n1. 사용자 인증 시스템 (OAuth 2.0 기반)\n2. 핵심 비즈니스 로직 구현\n3. 관리자 대시보드\n\n기술 스택: Next.js + Node.js + PostgreSQL`,
    score: undefined,
    highlights: [],
  });

  // Judge critiques
  messages.push({
    agentId: "judge",
    type: "critique",
    content: `제안된 기획안을 검토했습니다.\n\n긍정적인 부분:\n- OAuth 2.0 인증 방식 선택은 적절합니다\n- 기술 스택이 현실적입니다\n\n개선 필요:\n- MVP 범위가 너무 넓습니다\n- 구체적인 사용자 시나리오가 부족합니다`,
    score: 72,
    highlights: [
      { type: "improvement", text: "OAuth 2.0 인증 방식" },
      { type: "issue", text: "MVP 범위 축소 필요", suggestion: "핵심 기능 3개로 제한" },
      { type: "question", text: "목표 사용자 정의 필요" },
    ],
  });

  // Decision Maker counter-proposes
  messages.push({
    agentId: "decision-maker",
    type: "counter-proposal",
    content: `피드백을 반영하여 수정된 제안을 드립니다.\n\nMVP 핵심 기능 (Phase 1):\n1. 소셜 로그인 (Google/Kakao)\n2. 메인 기능 CRUD\n3. 기본 알림 시스템\n\n추가 기능은 Phase 2로 이동:\n- 고급 검색\n- 분석 대시보드\n- 다국어 지원`,
  });

  // Judge evaluates again
  messages.push({
    agentId: "judge",
    type: "approval",
    content: `수정된 제안이 크게 개선되었습니다.\n\n평가 결과:\n- 전략적 적합성: 85/100\n- 실행 가능성: 88/100\n- 완성도: 78/100\n- 명확성: 82/100\n\n종합: 83점 - 승인 권고`,
    score: 83,
  });

  // Auditor approves and learns
  messages.push({
    agentId: "auditor",
    type: "approval",
    content: `검토 결과를 승인합니다.\n\n추출된 학습 규칙:\n1. MVP 단계에서는 핵심 기능 3개 이하로 제한한다\n2. 소셜 로그인은 Google과 Kakao를 우선 지원한다\n3. 추가 기능은 명확히 Phase로 구분하여 로드맵을 작성한다`,
  });

  messages.push({
    agentId: "auditor",
    type: "learning",
    content: `이번 세션에서 학습한 규칙:\n- MVP 범위는 핵심 기능 3개 이하로 제한\n- 한국 시장 타겟 시 Kakao 로그인 필수\n- 명확한 Phase 구분으로 범위 관리`,
  });

  return NextResponse.json({
    success: true,
    messages,
  });
}

function generateEnhancedContent(
  goal: string,
  iteration: number,
  rules: KnowledgeRule[]
): string {
  let content = `# ${goal} - 상세 기획서 (v${iteration})\n\n`;

  content += `## 1. 프로젝트 개요\n\n`;
  content += `이 문서는 "${goal}" 프로젝트의 상세 기획을 담고 있습니다.\n\n`;

  content += `## 2. 적용된 지식 규칙\n\n`;

  if (rules.length > 0) {
    const activeRules = rules.filter((r) => r.isActive);
    activeRules.forEach((rule) => {
      content += `- **${rule.category}**: ${rule.rule}\n`;
    });
  } else {
    content += `- 아직 학습된 규칙이 없습니다.\n`;
  }

  content += `\n## 3. 핵심 기능\n\n`;
  content += `### 3.1 사용자 인증\n`;
  content += `OAuth 2.0 기반의 소셜 로그인을 지원합니다.\n\n`;

  content += `### 3.2 핵심 비즈니스 로직\n`;
  content += `${goal}의 주요 기능을 구현합니다.\n\n`;

  content += `## 4. 기술 아키텍처\n\n`;
  content += "```mermaid\n";
  content += "flowchart TD\n";
  content += "    A[사용자] --> B[웹 클라이언트]\n";
  content += "    B --> C[API Gateway]\n";
  content += "    C --> D[인증 서비스]\n";
  content += "    C --> E[핵심 서비스]\n";
  content += "    D --> F[(사용자 DB)]\n";
  content += "    E --> G[(메인 DB)]\n";
  content += "```\n\n";

  content += `## 5. 다음 단계\n\n`;
  content += `- Phase 1: MVP 개발 (4주)\n`;
  content += `- Phase 2: 베타 테스트 (2주)\n`;
  content += `- Phase 3: 정식 출시\n`;

  return content;
}
