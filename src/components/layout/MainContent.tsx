"use client";

import React, { useState } from "react";
import {
  Play,
  Loader2,
  FileText,
  GitBranch,
  Columns,
  ZoomIn,
  ZoomOut,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useDocumentStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { DiagramViewer } from "@/components/documents/DiagramViewer";

interface MainContentProps {
  onStartGeneration: (goal: string) => void;
}

export function MainContent({ onStartGeneration }: MainContentProps) {
  const { mainPanel, updateMainPanel, projectGoal, setProjectGoal, isProcessing } = useUIStore();
  const { documents, selectedDocumentId, getDocumentById } = useDocumentStore();
  const [inputGoal, setInputGoal] = useState("");

  const selectedDocument = selectedDocumentId
    ? getDocumentById(selectedDocumentId)
    : null;

  const handleStartGeneration = () => {
    if (inputGoal.trim()) {
      setProjectGoal(inputGoal);
      onStartGeneration(inputGoal);
    }
  };

  // Show welcome screen if no project goal
  if (!projectGoal && documents.length === 0) {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              AI 자율 진화형 기획 엔진
            </h1>
            <p className="text-slate-400">
              프로젝트 목표를 입력하면 세 AI 에이전트가 협력하여
              <br />
              완벽한 기획 문서를 생성합니다
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              프로젝트 목표
            </label>
            <Textarea
              placeholder="예: 배달의 민족 같은 배달 앱을 기획해줘"
              value={inputGoal}
              onChange={(e) => setInputGoal(e.target.value)}
              className="min-h-[120px] text-base mb-4 bg-slate-800 border-slate-600"
            />
            <Button
              onClick={handleStartGeneration}
              disabled={!inputGoal.trim() || isProcessing}
              className="w-full h-12 text-base"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  기획 시작
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-medium text-sm text-white mb-1">Decision Maker</h3>
              <p className="text-xs text-slate-500">초기 기획안 작성</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <GitBranch className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-medium text-sm text-white mb-1">Judge</h3>
              <p className="text-xs text-slate-500">평가 및 피드백</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <Columns className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-medium text-sm text-white mb-1">Auditor</h3>
              <p className="text-xs text-slate-500">승인 및 학습</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4 bg-slate-900">
        <div className="flex items-center gap-2">
          <Button
            variant={mainPanel.activeView === "document" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => updateMainPanel({ activeView: "document" })}
          >
            <FileText className="w-4 h-4 mr-1" />
            문서
          </Button>
          <Button
            variant={mainPanel.activeView === "diagram" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => updateMainPanel({ activeView: "diagram" })}
          >
            <GitBranch className="w-4 h-4 mr-1" />
            다이어그램
          </Button>
          <Button
            variant={mainPanel.activeView === "split" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => updateMainPanel({ activeView: "split" })}
          >
            <Columns className="w-4 h-4 mr-1" />
            분할
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() =>
                updateMainPanel({ zoomLevel: Math.max(50, mainPanel.zoomLevel - 10) })
              }
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-xs text-slate-400 w-12 text-center">
              {mainPanel.zoomLevel}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() =>
                updateMainPanel({ zoomLevel: Math.min(200, mainPanel.zoomLevel + 10) })
              }
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      {selectedDocument && (
        <div className="h-8 border-b border-slate-800 flex items-center px-4 bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">{projectGoal}</span>
            <span>/</span>
            <Badge
              variant={
                selectedDocument.type === "blueprint"
                  ? "decision"
                  : selectedDocument.type === "module"
                  ? "warning"
                  : "secondary"
              }
              className="text-xs"
            >
              {selectedDocument.type}
            </Badge>
            <span className="text-white">{selectedDocument.title}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {mainPanel.activeView === "document" && (
          <ScrollArea className="h-full">
            <div className="p-6" style={{ zoom: mainPanel.zoomLevel / 100 }}>
              <DocumentViewer document={selectedDocument} />
            </div>
          </ScrollArea>
        )}

        {mainPanel.activeView === "diagram" && (
          <div className="h-full p-4" style={{ zoom: mainPanel.zoomLevel / 100 }}>
            <DiagramViewer />
          </div>
        )}

        {mainPanel.activeView === "split" && (
          <div className="h-full flex">
            <div className="flex-1 border-r border-slate-700 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6" style={{ zoom: mainPanel.zoomLevel / 100 }}>
                  <DocumentViewer document={selectedDocument} />
                </div>
              </ScrollArea>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="h-full p-4" style={{ zoom: mainPanel.zoomLevel / 100 }}>
                <DiagramViewer />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
