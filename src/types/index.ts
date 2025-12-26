// Agent Types
export type AgentType = "decision-maker" | "judge" | "auditor";
export type AgentStatus = "idle" | "thinking" | "writing" | "evaluating" | "complete";

export interface Agent {
  id: AgentType;
  name: string;
  nameKo: string;
  description: string;
  color: string;
  glowColor: string;
  status: AgentStatus;
  currentTask?: string;
}

// Debate/Discussion Types
export type DebateMessageType = "proposal" | "critique" | "counter-proposal" | "approval" | "learning";

export interface DebateMessage {
  id: string;
  agentId: AgentType;
  type: DebateMessageType;
  content: string;
  timestamp: Date;
  targetMessageId?: string;
  score?: number;
  highlights?: DebateHighlight[];
}

export interface DebateHighlight {
  type: "improvement" | "issue" | "question";
  text: string;
  suggestion?: string;
}

// Document Types
export type DocumentType = "blueprint" | "module" | "detail" | "implementation";
export type DocumentStatus = "draft" | "reviewing" | "approved" | "rejected";

export interface Document {
  id: string;
  parentId?: string;
  title: string;
  type: DocumentType;
  content: string;
  status: DocumentStatus;
  adr?: ADR;
  children: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
  score?: EvaluationScore;
}

export interface ADR {
  id: string;
  title: string;
  context: string;
  decision: string;
  consequences: string[];
  alternatives: string[];
  status: "proposed" | "accepted" | "deprecated" | "superseded";
}

export interface EvaluationScore {
  strategicFit: number;
  feasibility: number;
  completeness: number;
  clarity: number;
  overall: number;
  feedback: string;
}

// Knowledge Base Types
export interface KnowledgeRule {
  id: string;
  category: string;
  rule: string;
  confidence: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  source: string;
  isActive: boolean;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
  documents: Document[];
  knowledgeRules: KnowledgeRule[];
  metrics: ProjectMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMetrics {
  totalDocuments: number;
  approvedDocuments: number;
  rejectionRate: number;
  averageScore: number;
  generationSpeed: number;
  learningEfficiency: number;
  iterations: IterationMetric[];
}

export interface IterationMetric {
  iteration: number;
  timestamp: Date;
  documentsGenerated: number;
  averageScore: number;
  rulesLearned: number;
}

// UI State Types
export interface SidebarState {
  isCollapsed: boolean;
  activeTab: "documents" | "knowledge" | "settings";
  selectedDocumentId?: string;
}

export interface MainPanelState {
  activeView: "document" | "diagram" | "split";
  zoomLevel: number;
}

export interface RightPanelState {
  isCollapsed: boolean;
  activeTab: "debate" | "evaluation" | "metrics";
}
