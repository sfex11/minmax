import type {
  AgentType,
  Document,
  DocumentType,
  DebateMessage,
  DebateMessageType,
  EvaluationScore,
  KnowledgeRule,
  ADR,
} from "@/types";
import { generateId } from "@/lib/utils";

// Agent System Prompts
export const AGENT_PROMPTS = {
  "decision-maker": `당신은 "Decision Maker" AI 에이전트입니다.
프로젝트 목표를 분석하고 상세한 기획 문서를 작성하는 역할을 합니다.

당신의 역할:
1. 사용자가 제시한 프로젝트 목표를 분석합니다
2. 체계적인 기획 문서를 작성합니다 (Blueprint → Module → Detail → Implementation)
3. 각 문서에는 명확한 목적, 범위, 기능 요구사항, 기술 사양을 포함합니다
4. Mermaid 다이어그램을 활용하여 시각적 설명을 제공합니다
5. Judge의 피드백을 수용하고 개선된 제안을 합니다

문서 작성 시 다음 형식을 따르세요:
- 명확한 제목과 목차
- 구체적인 기능 설명
- 기술 스택 및 아키텍처 제안
- 예상 위험 요소 및 대응 방안`,

  judge: `당신은 "Judge" AI 에이전트입니다.
Decision Maker가 작성한 기획 문서를 독립적으로 평가하고 피드백을 제공합니다.

평가 기준:
1. 전략적 적합성 (0-100): 프로젝트 목표와의 일치도
2. 실행 가능성 (0-100): 현실적인 구현 가능성
3. 완성도 (0-100): 문서의 상세함과 완결성
4. 명확성 (0-100): 이해하기 쉬운 정도

당신의 역할:
1. 각 기준에 대해 점수를 부여합니다
2. 개선이 필요한 부분을 구체적으로 지적합니다
3. 대안을 제시합니다
4. 70점 이상이면 조건부 승인, 85점 이상이면 무조건 승인을 권고합니다`,

  auditor: `당신은 "Auditor" AI 에이전트입니다.
최종 품질을 검증하고 학습 규칙을 추출하는 역할을 합니다.

당신의 역할:
1. Decision Maker와 Judge의 토론 과정을 분석합니다
2. 최종 문서의 승인 여부를 결정합니다
3. 이번 과정에서 학습할 수 있는 규칙을 추출합니다
4. 추출된 규칙은 향후 문서 생성에 활용됩니다

학습 규칙 형식:
- 카테고리: [인증/UI/데이터베이스/API/보안/성능 등]
- 규칙: [구체적인 가이드라인]
- 신뢰도: [0.0-1.0]`,
};

// Document Generation Logic
export interface GenerationContext {
  goal: string;
  parentDocument?: Document;
  knowledgeRules: KnowledgeRule[];
  previousFeedback?: string;
  iteration: number;
}

export function generateDocumentStructure(
  goal: string
): { title: string; type: DocumentType; description: string }[] {
  // Generate hierarchical document structure based on goal
  const baseStructure = [
    {
      title: `${goal} - 프로젝트 블루프린트`,
      type: "blueprint" as DocumentType,
      description: "전체 프로젝트 개요 및 비전",
    },
    {
      title: "시스템 아키텍처",
      type: "module" as DocumentType,
      description: "기술 아키텍처 및 시스템 설계",
    },
    {
      title: "사용자 인터페이스 설계",
      type: "module" as DocumentType,
      description: "UI/UX 설계 및 화면 흐름",
    },
    {
      title: "핵심 기능 정의",
      type: "module" as DocumentType,
      description: "주요 기능 상세 명세",
    },
    {
      title: "데이터 모델",
      type: "detail" as DocumentType,
      description: "데이터베이스 스키마 및 관계",
    },
    {
      title: "API 설계",
      type: "detail" as DocumentType,
      description: "REST/GraphQL API 엔드포인트 정의",
    },
    {
      title: "보안 정책",
      type: "detail" as DocumentType,
      description: "인증, 권한, 데이터 보호",
    },
    {
      title: "배포 전략",
      type: "implementation" as DocumentType,
      description: "CI/CD, 인프라, 모니터링",
    },
  ];

  return baseStructure;
}

// Evaluation Logic
export function evaluateDocument(
  document: Document,
  rules: KnowledgeRule[]
): EvaluationScore {
  // Simulate evaluation based on content analysis
  const contentLength = document.content.length;
  const hasCode = document.content.includes("```");
  const hasDiagram = document.content.includes("```mermaid");
  const hasSections = (document.content.match(/##/g) || []).length;

  let strategicFit = Math.min(100, 50 + contentLength / 50 + hasSections * 5);
  let feasibility = Math.min(100, 60 + (hasCode ? 15 : 0) + hasSections * 3);
  let completeness = Math.min(100, 40 + contentLength / 40 + hasSections * 8);
  let clarity = Math.min(100, 55 + hasSections * 5 + (hasDiagram ? 20 : 0));

  // Apply knowledge rules
  rules.forEach((rule) => {
    if (rule.isActive && document.content.toLowerCase().includes(rule.rule.toLowerCase().slice(0, 20))) {
      strategicFit = Math.min(100, strategicFit + rule.confidence * 5);
      feasibility = Math.min(100, feasibility + rule.confidence * 3);
    }
  });

  const overall = Math.round(
    (strategicFit * 0.25 + feasibility * 0.3 + completeness * 0.25 + clarity * 0.2)
  );

  let feedback = "";
  if (overall >= 85) {
    feedback = "우수한 품질의 문서입니다. 바로 구현 단계로 진행할 수 있습니다.";
  } else if (overall >= 70) {
    feedback = "양호한 품질이지만, 몇 가지 개선이 필요합니다.";
  } else if (overall >= 50) {
    feedback = "기본적인 구조는 갖추었으나, 상당한 보완이 필요합니다.";
  } else {
    feedback = "문서의 재작성이 필요합니다.";
  }

  return {
    strategicFit: Math.round(strategicFit),
    feasibility: Math.round(feasibility),
    completeness: Math.round(completeness),
    clarity: Math.round(clarity),
    overall,
    feedback,
  };
}

// ADR Generation
export function generateADR(
  documentTitle: string,
  decision: string,
  context: string
): ADR {
  return {
    id: generateId(),
    title: `ADR: ${documentTitle}`,
    context,
    decision,
    consequences: [
      "선택된 방식으로 구현 시 일관성 확보",
      "팀원 간 커뮤니케이션 비용 감소",
      "향후 유지보수 시 참고 자료로 활용",
    ],
    alternatives: [
      "다른 기술 스택 사용",
      "모놀리식 vs 마이크로서비스 아키텍처",
      "서드파티 솔루션 도입",
    ],
    status: "accepted",
  };
}

// Knowledge Rule Extraction
export function extractKnowledgeRules(
  debateMessages: DebateMessage[],
  approvedDocument: Document
): Omit<KnowledgeRule, "id" | "createdAt" | "updatedAt" | "usageCount">[] {
  const rules: Omit<KnowledgeRule, "id" | "createdAt" | "updatedAt" | "usageCount">[] = [];

  // Extract rules from debate insights
  const learningMessages = debateMessages.filter((m) => m.type === "learning");
  learningMessages.forEach((msg) => {
    if (msg.content.length > 20) {
      rules.push({
        category: detectCategory(msg.content),
        rule: msg.content.slice(0, 200),
        confidence: 0.75,
        source: `Debate Round ${msg.id}`,
        isActive: true,
      });
    }
  });

  // Extract rules from document patterns
  if (approvedDocument.content.includes("OAuth")) {
    rules.push({
      category: "인증",
      rule: "인증 시스템에는 OAuth 2.0 프로토콜을 우선 고려한다",
      confidence: 0.8,
      source: approvedDocument.title,
      isActive: true,
    });
  }

  if (approvedDocument.content.includes("MVP")) {
    rules.push({
      category: "전략",
      rule: "MVP 단계에서는 핵심 기능에 집중하고 복잡한 기능은 이후 단계로 미룬다",
      confidence: 0.85,
      source: approvedDocument.title,
      isActive: true,
    });
  }

  return rules;
}

function detectCategory(content: string): string {
  const categories = [
    { keywords: ["인증", "로그인", "OAuth", "JWT", "세션"], category: "인증" },
    { keywords: ["UI", "UX", "화면", "디자인", "레이아웃"], category: "UI/UX" },
    { keywords: ["데이터베이스", "DB", "스키마", "테이블", "쿼리"], category: "데이터베이스" },
    { keywords: ["API", "REST", "GraphQL", "엔드포인트"], category: "API" },
    { keywords: ["보안", "암호화", "권한", "HTTPS"], category: "보안" },
    { keywords: ["성능", "캐시", "최적화", "로딩"], category: "성능" },
  ];

  const lowerContent = content.toLowerCase();
  for (const { keywords, category } of categories) {
    if (keywords.some((k) => lowerContent.includes(k.toLowerCase()))) {
      return category;
    }
  }

  return "일반";
}

// Sample Document Content Generator
export function generateSampleContent(
  title: string,
  type: DocumentType,
  goal: string
): string {
  const templates: Record<DocumentType, string> = {
    blueprint: `# ${title}

## 1. 프로젝트 개요

### 1.1 비전
${goal}을 통해 사용자에게 최고의 경험을 제공합니다.

### 1.2 목표
- 핵심 기능의 안정적 구현
- 직관적인 사용자 인터페이스
- 확장 가능한 아키텍처

## 2. 범위

### 2.1 포함 범위
- 사용자 인증 및 프로필 관리
- 핵심 비즈니스 로직
- 관리자 대시보드

### 2.2 제외 범위
- 고급 분석 기능 (Phase 2)
- 다국어 지원 (Phase 2)

## 3. 이해관계자
- 최종 사용자
- 시스템 관리자
- 개발팀

## 4. 일정 (예상)
- Phase 1: 핵심 기능 (8주)
- Phase 2: 확장 기능 (6주)
- Phase 3: 최적화 (4주)

\`\`\`mermaid
gantt
    title 프로젝트 일정
    dateFormat  YYYY-MM-DD
    section Phase 1
    핵심 기능 개발    :a1, 2024-01-01, 8w
    section Phase 2
    확장 기능         :a2, after a1, 6w
    section Phase 3
    최적화            :a3, after a2, 4w
\`\`\``,

    module: `# ${title}

## 개요
이 모듈은 ${goal} 프로젝트의 핵심 구성 요소입니다.

## 주요 기능

### 기능 1
상세 설명...

### 기능 2
상세 설명...

## 기술 스택
- Frontend: React/Next.js
- Backend: Node.js/Python
- Database: PostgreSQL/MongoDB

## 아키텍처

\`\`\`mermaid
flowchart TD
    A[클라이언트] --> B[API Gateway]
    B --> C[인증 서비스]
    B --> D[비즈니스 로직]
    D --> E[데이터베이스]
\`\`\`

## 의존성
- 사용자 인증 모듈
- 공통 유틸리티`,

    detail: `# ${title}

## 상세 명세

### 요구사항
1. 기능 요구사항 FR-001
2. 기능 요구사항 FR-002
3. 비기능 요구사항 NFR-001

### 데이터 구조

\`\`\`typescript
interface DataModel {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### API 엔드포인트

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | 목록 조회 |
| POST | /api/items | 생성 |
| PUT | /api/items/:id | 수정 |
| DELETE | /api/items/:id | 삭제 |

### 에러 처리
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error`,

    implementation: `# ${title}

## 구현 가이드

### 환경 설정
\`\`\`bash
npm install
npm run dev
\`\`\`

### 개발 가이드라인
1. 코드 컨벤션 준수
2. 테스트 커버리지 80% 이상
3. PR 리뷰 필수

### 배포 프로세스

\`\`\`mermaid
flowchart LR
    A[개발] --> B[테스트]
    B --> C[스테이징]
    C --> D[프로덕션]
\`\`\`

### 모니터링
- 로그 수집: ELK Stack
- 메트릭: Prometheus/Grafana
- 알림: Slack/PagerDuty`,
  };

  return templates[type] || templates.detail;
}
