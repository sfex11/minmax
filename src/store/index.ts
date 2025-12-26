import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Agent,
  AgentType,
  AgentStatus,
  Document,
  DebateMessage,
  KnowledgeRule,
  ProjectMetrics,
  SidebarState,
  MainPanelState,
  RightPanelState,
  EvaluationScore,
} from "@/types";
import { generateId } from "@/lib/utils";

// Agent Store
interface AgentStore {
  agents: Record<AgentType, Agent>;
  updateAgentStatus: (agentId: AgentType, status: AgentStatus, task?: string) => void;
  resetAgents: () => void;
}

const initialAgents: Record<AgentType, Agent> = {
  "decision-maker": {
    id: "decision-maker",
    name: "Decision Maker",
    nameKo: "의사결정자",
    description: "초기 기획안을 작성하고 제안합니다",
    color: "#3B82F6",
    glowColor: "rgba(59, 130, 246, 0.5)",
    status: "idle",
  },
  judge: {
    id: "judge",
    name: "Judge",
    nameKo: "평가자",
    description: "기획안을 평가하고 피드백을 제공합니다",
    color: "#EF4444",
    glowColor: "rgba(239, 68, 68, 0.5)",
    status: "idle",
  },
  auditor: {
    id: "auditor",
    name: "Auditor",
    nameKo: "감사자",
    description: "최종 승인 및 학습 규칙을 추출합니다",
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.5)",
    status: "idle",
  },
};

export const useAgentStore = create<AgentStore>((set) => ({
  agents: initialAgents,
  updateAgentStatus: (agentId, status, task) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: { ...state.agents[agentId], status, currentTask: task },
      },
    })),
  resetAgents: () => set({ agents: initialAgents }),
}));

// Debate Store
interface DebateStore {
  messages: DebateMessage[];
  isDebating: boolean;
  currentRound: number;
  addMessage: (message: Omit<DebateMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;
  setDebating: (isDebating: boolean) => void;
  incrementRound: () => void;
}

export const useDebateStore = create<DebateStore>((set) => ({
  messages: [],
  isDebating: false,
  currentRound: 0,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: generateId(), timestamp: new Date() },
      ],
    })),
  clearMessages: () => set({ messages: [], currentRound: 0 }),
  setDebating: (isDebating) => set({ isDebating }),
  incrementRound: () => set((state) => ({ currentRound: state.currentRound + 1 })),
}));

// Document Store
interface DocumentStore {
  documents: Document[];
  selectedDocumentId: string | null;
  rootDocumentId: string | null;
  addDocument: (document: Omit<Document, "id" | "createdAt" | "updatedAt">) => string;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  selectDocument: (id: string | null) => void;
  setRootDocument: (id: string) => void;
  getDocumentById: (id: string) => Document | undefined;
  getChildDocuments: (parentId: string) => Document[];
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  selectedDocumentId: null,
  rootDocumentId: null,
  addDocument: (document) => {
    const id = generateId();
    const now = new Date();
    set((state) => ({
      documents: [
        ...state.documents,
        { ...document, id, createdAt: now, updatedAt: now },
      ],
    }));
    return id;
  },
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
      ),
    })),
  deleteDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),
  selectDocument: (id) => set({ selectedDocumentId: id }),
  setRootDocument: (id) => set({ rootDocumentId: id }),
  getDocumentById: (id) => get().documents.find((doc) => doc.id === id),
  getChildDocuments: (parentId) =>
    get().documents.filter((doc) => doc.parentId === parentId),
}));

// Knowledge Base Store
interface KnowledgeStore {
  rules: KnowledgeRule[];
  addRule: (rule: Omit<KnowledgeRule, "id" | "createdAt" | "updatedAt" | "usageCount">) => void;
  updateRule: (id: string, updates: Partial<KnowledgeRule>) => void;
  deleteRule: (id: string) => void;
  toggleRuleActive: (id: string) => void;
  incrementUsage: (id: string) => void;
}

export const useKnowledgeStore = create<KnowledgeStore>()(
  persist(
    (set) => ({
      rules: [],
      addRule: (rule) =>
        set((state) => ({
          rules: [
            ...state.rules,
            {
              ...rule,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date(),
              usageCount: 0,
            },
          ],
        })),
      updateRule: (id, updates) =>
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, ...updates, updatedAt: new Date() } : rule
          ),
        })),
      deleteRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== id),
        })),
      toggleRuleActive: (id) =>
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
          ),
        })),
      incrementUsage: (id) =>
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, usageCount: rule.usageCount + 1 } : rule
          ),
        })),
    }),
    { name: "knowledge-store" }
  )
);

// Metrics Store
interface MetricsStore {
  metrics: ProjectMetrics;
  updateMetrics: (updates: Partial<ProjectMetrics>) => void;
  addIteration: (metric: Omit<ProjectMetrics["iterations"][0], "timestamp">) => void;
  resetMetrics: () => void;
}

const initialMetrics: ProjectMetrics = {
  totalDocuments: 0,
  approvedDocuments: 0,
  rejectionRate: 0,
  averageScore: 0,
  generationSpeed: 0,
  learningEfficiency: 0,
  iterations: [],
};

export const useMetricsStore = create<MetricsStore>((set) => ({
  metrics: initialMetrics,
  updateMetrics: (updates) =>
    set((state) => ({
      metrics: { ...state.metrics, ...updates },
    })),
  addIteration: (metric) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        iterations: [
          ...state.metrics.iterations,
          { ...metric, timestamp: new Date() },
        ],
      },
    })),
  resetMetrics: () => set({ metrics: initialMetrics }),
}));

// UI Store
interface UIStore {
  sidebar: SidebarState;
  mainPanel: MainPanelState;
  rightPanel: RightPanelState;
  projectGoal: string;
  isProcessing: boolean;
  updateSidebar: (updates: Partial<SidebarState>) => void;
  updateMainPanel: (updates: Partial<MainPanelState>) => void;
  updateRightPanel: (updates: Partial<RightPanelState>) => void;
  setProjectGoal: (goal: string) => void;
  setProcessing: (isProcessing: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebar: {
    isCollapsed: false,
    activeTab: "documents",
    selectedDocumentId: undefined,
  },
  mainPanel: {
    activeView: "document",
    zoomLevel: 100,
  },
  rightPanel: {
    isCollapsed: false,
    activeTab: "debate",
  },
  projectGoal: "",
  isProcessing: false,
  updateSidebar: (updates) =>
    set((state) => ({
      sidebar: { ...state.sidebar, ...updates },
    })),
  updateMainPanel: (updates) =>
    set((state) => ({
      mainPanel: { ...state.mainPanel, ...updates },
    })),
  updateRightPanel: (updates) =>
    set((state) => ({
      rightPanel: { ...state.rightPanel, ...updates },
    })),
  setProjectGoal: (goal) => set({ projectGoal: goal }),
  setProcessing: (isProcessing) => set({ isProcessing }),
}));
