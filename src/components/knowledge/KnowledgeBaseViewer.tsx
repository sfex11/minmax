"use client";

import React, { useState } from "react";
import {
  Brain,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useKnowledgeStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { KnowledgeRule } from "@/types";

interface RuleCardProps {
  rule: KnowledgeRule;
  onEdit: (rule: KnowledgeRule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

function RuleCard({ rule, onEdit, onDelete, onToggle }: RuleCardProps) {
  return (
    <Card
      className={cn(
        "bg-slate-800/50 border-slate-700 mb-3 transition-all",
        !rule.isActive && "opacity-50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {rule.category}
              </Badge>
              {rule.usageCount > 10 && (
                <Badge variant="success" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  자주 사용됨
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-200">{rule.rule}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(rule)}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-300"
              onClick={() => onDelete(rule.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>신뢰도: {(rule.confidence * 100).toFixed(0)}%</span>
            <span>사용: {rule.usageCount}회</span>
            <span>출처: {rule.source}</span>
          </div>
          <button
            onClick={() => onToggle(rule.id)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors",
              rule.isActive
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-slate-700 text-slate-400"
            )}
          >
            {rule.isActive ? (
              <>
                <Check className="w-3 h-3" /> 활성
              </>
            ) : (
              <>
                <X className="w-3 h-3" /> 비활성
              </>
            )}
          </button>
        </div>

        <div className="mt-2">
          <Progress
            value={rule.confidence * 100}
            indicatorClassName={cn(
              rule.confidence >= 0.8
                ? "bg-emerald-500"
                : rule.confidence >= 0.5
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function KnowledgeBaseViewer() {
  const { rules, addRule, updateRule, deleteRule, toggleRuleActive } = useKnowledgeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<KnowledgeRule | null>(null);
  const [newRule, setNewRule] = useState({ category: "", rule: "" });

  const categories = [...new Set(rules.map((r) => r.category))];

  const filteredRules = rules.filter((rule) => {
    const matchesSearch = rule.rule.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || rule.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddRule = () => {
    if (newRule.category && newRule.rule) {
      addRule({
        category: newRule.category,
        rule: newRule.rule,
        confidence: 0.7,
        source: "사용자 추가",
        isActive: true,
      });
      setNewRule({ category: "", rule: "" });
      setIsAddingRule(false);
    }
  };

  const handleEditRule = (rule: KnowledgeRule) => {
    setEditingRule(rule);
  };

  const handleSaveEdit = () => {
    if (editingRule) {
      updateRule(editingRule.id, {
        category: editingRule.category,
        rule: editingRule.rule,
      });
      setEditingRule(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-white">Knowledge Base</h2>
            <Badge variant="secondary">{rules.length}개 규칙</Badge>
          </div>
          <Button size="sm" onClick={() => setIsAddingRule(true)}>
            <Plus className="w-4 h-4 mr-1" />
            규칙 추가
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="규칙 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 bg-slate-800 border-slate-700"
            />
          </div>
          <Button
            variant={selectedCategory ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            <Filter className="w-4 h-4 mr-1" />
            전체
          </Button>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  setSelectedCategory(selectedCategory === category ? null : category)
                }
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {isAddingRule && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-sm font-medium mb-3">새 규칙 추가</h3>
          <Input
            placeholder="카테고리 (예: 인증, UI/UX, 데이터베이스)"
            value={newRule.category}
            onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
            className="mb-2 h-9 bg-slate-900"
          />
          <Textarea
            placeholder="규칙 내용"
            value={newRule.rule}
            onChange={(e) => setNewRule({ ...newRule, rule: e.target.value })}
            className="mb-2 bg-slate-900"
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddRule}>
              추가
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingRule(false);
                setNewRule({ category: "", rule: "" });
              }}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-sm font-medium mb-3">규칙 수정</h3>
          <Input
            placeholder="카테고리"
            value={editingRule.category}
            onChange={(e) =>
              setEditingRule({ ...editingRule, category: e.target.value })
            }
            className="mb-2 h-9 bg-slate-900"
          />
          <Textarea
            placeholder="규칙 내용"
            value={editingRule.rule}
            onChange={(e) =>
              setEditingRule({ ...editingRule, rule: e.target.value })
            }
            className="mb-2 bg-slate-900"
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit}>
              저장
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingRule(null)}>
              취소
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredRules.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">학습된 규칙이 없습니다</p>
              <p className="text-xs mt-1">AI가 문서를 생성하면서 규칙을 학습합니다</p>
            </div>
          ) : (
            filteredRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={handleEditRule}
                onDelete={deleteRule}
                onToggle={toggleRuleActive}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
