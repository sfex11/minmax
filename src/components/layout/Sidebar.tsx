"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FolderOpen,
  Folder,
  Brain,
  Settings,
  Plus,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentStore, useUIStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Document, DocumentType } from "@/types";

interface TreeNodeProps {
  document: Document;
  level: number;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const documentTypeIcons: Record<DocumentType, React.ReactNode> = {
  blueprint: <FolderOpen className="w-4 h-4 text-blue-400" />,
  module: <Folder className="w-4 h-4 text-yellow-400" />,
  detail: <FileText className="w-4 h-4 text-slate-400" />,
  implementation: <FileText className="w-4 h-4 text-emerald-400" />,
};

function TreeNode({ document, level, onSelect, selectedId }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { getChildDocuments } = useDocumentStore();
  const children = getChildDocuments(document.id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 cursor-pointer rounded-md transition-colors",
          "hover:bg-slate-800",
          selectedId === document.id && "bg-slate-700 text-white"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(document.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-slate-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-slate-400" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        {documentTypeIcons[document.type]}
        <span className="text-sm truncate flex-1">{document.title}</span>
        {document.status === "approved" && (
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
        {document.status === "reviewing" && (
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        )}
        {document.status === "rejected" && (
          <span className="w-2 h-2 rounded-full bg-red-500" />
        )}
      </div>
      {isExpanded && hasChildren && (
        <div className="tree-line ml-4">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              document={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { sidebar, updateSidebar } = useUIStore();
  const { documents, selectedDocumentId, selectDocument, rootDocumentId } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState("");

  const rootDocuments = documents.filter((doc) => !doc.parentId);
  const filteredDocuments = searchQuery
    ? documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rootDocuments;

  if (sidebar.isCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => updateSidebar({ isCollapsed: false })}
          className="text-slate-400 hover:text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-slate-400 hover:text-white",
            sidebar.activeTab === "documents" && "text-blue-400"
          )}
          onClick={() => updateSidebar({ activeTab: "documents", isCollapsed: false })}
        >
          <FileText className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-slate-400 hover:text-white",
            sidebar.activeTab === "knowledge" && "text-emerald-400"
          )}
          onClick={() => updateSidebar({ activeTab: "knowledge", isCollapsed: false })}
        >
          <Brain className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-slate-400 hover:text-white",
            sidebar.activeTab === "settings" && "text-slate-200"
          )}
          onClick={() => updateSidebar({ activeTab: "settings", isCollapsed: false })}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-slate-200">프로젝트 탐색기</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-400 hover:text-white"
          onClick={() => updateSidebar({ isCollapsed: true })}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </Button>
      </div>

      <Tabs
        value={sidebar.activeTab}
        onValueChange={(value) => updateSidebar({ activeTab: value as typeof sidebar.activeTab })}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-2 mt-2 bg-slate-800">
          <TabsTrigger value="documents" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            문서
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="text-xs">
            <Brain className="w-3 h-3 mr-1" />
            지식
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="flex-1 flex flex-col mt-0">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="문서 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-slate-800 border-slate-700"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>문서가 없습니다</p>
                  <p className="text-xs mt-1">프로젝트 목표를 입력하여 시작하세요</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <TreeNode
                    key={doc.id}
                    document={doc}
                    level={0}
                    onSelect={selectDocument}
                    selectedId={selectedDocumentId}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="knowledge" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 text-center text-slate-500 text-sm">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Knowledge Base 탭에서</p>
              <p>학습된 규칙을 확인하세요</p>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <div>
                <h4 className="text-xs font-medium text-slate-400 mb-2">API 설정</h4>
                <Input
                  type="password"
                  placeholder="OpenAI API Key"
                  className="h-8 text-sm bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <h4 className="text-xs font-medium text-slate-400 mb-2">에이전트 설정</h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    자동 학습 활성화
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    실시간 피드백 표시
                  </label>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
