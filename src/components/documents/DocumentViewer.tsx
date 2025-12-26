"use client";

import React from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Document } from "@/types";

interface DocumentViewerProps {
  document: Document | null | undefined;
}

const statusConfig = {
  draft: { label: "초안", icon: FileText, color: "text-slate-400", bg: "bg-slate-500" },
  reviewing: { label: "검토 중", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500" },
  approved: { label: "승인됨", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500" },
  rejected: { label: "반려됨", icon: XCircle, color: "text-red-400", bg: "bg-red-500" },
};

export function DocumentViewer({ document }: DocumentViewerProps) {
  if (!document) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">문서를 선택하거나</p>
          <p className="text-sm">새 프로젝트를 시작하세요</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[document.status];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Document Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Badge
            variant={
              document.type === "blueprint"
                ? "decision"
                : document.type === "module"
                ? "warning"
                : document.type === "detail"
                ? "secondary"
                : "success"
            }
          >
            {document.type.toUpperCase()}
          </Badge>
          <Badge variant="outline" className={cn(status.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
          <span className="text-xs text-slate-500">v{document.version}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{document.title}</h1>
        <p className="text-sm text-slate-500">
          마지막 수정: {formatDate(new Date(document.updatedAt))}
        </p>
      </div>

      {/* Evaluation Score */}
      {document.score && (
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              평가 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">전략적 적합성</span>
                  <span className="text-white">{document.score.strategicFit}%</span>
                </div>
                <Progress value={document.score.strategicFit} indicatorClassName="bg-blue-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">실행 가능성</span>
                  <span className="text-white">{document.score.feasibility}%</span>
                </div>
                <Progress value={document.score.feasibility} indicatorClassName="bg-emerald-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">완성도</span>
                  <span className="text-white">{document.score.completeness}%</span>
                </div>
                <Progress value={document.score.completeness} indicatorClassName="bg-yellow-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">명확성</span>
                  <span className="text-white">{document.score.clarity}%</span>
                </div>
                <Progress value={document.score.clarity} indicatorClassName="bg-purple-500" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <span className="text-sm text-slate-400">종합 점수</span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  document.score.overall >= 80
                    ? "text-emerald-400"
                    : document.score.overall >= 60
                    ? "text-yellow-400"
                    : "text-red-400"
                )}
              >
                {document.score.overall}점
              </span>
            </div>
            {document.score.feedback && (
              <p className="text-sm text-slate-400 mt-3 p-3 bg-slate-900/50 rounded-lg">
                {document.score.feedback}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ADR (Architecture Decision Record) */}
      {document.adr && (
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              의사결정 기록 (ADR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-slate-400 mb-1">컨텍스트</h4>
                <p className="text-sm text-slate-300">{document.adr.context}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-slate-400 mb-1">결정</h4>
                <p className="text-sm text-slate-300">{document.adr.decision}</p>
              </div>
              {document.adr.alternatives.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-400 mb-1">고려된 대안</h4>
                  <ul className="text-sm text-slate-400 list-disc list-inside">
                    {document.adr.alternatives.map((alt, i) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
              {document.adr.consequences.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-400 mb-1">결과</h4>
                  <ul className="text-sm text-slate-300 list-disc list-inside">
                    {document.adr.consequences.map((cons, i) => (
                      <li key={i}>{cons}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Content */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="markdown-content prose prose-invert max-w-none">
            {document.content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h1 key={index}>{line.slice(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={index}>{line.slice(3)}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={index}>{line.slice(4)}</h3>;
              }
              if (line.startsWith('- ')) {
                return <li key={index}>{line.slice(2)}</li>;
              }
              if (line.startsWith('> ')) {
                return <blockquote key={index}>{line.slice(2)}</blockquote>;
              }
              if (line.trim() === '') {
                return <br key={index} />;
              }
              return <p key={index}>{line}</p>;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
