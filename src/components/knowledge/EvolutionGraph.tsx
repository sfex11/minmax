"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMetricsStore, useKnowledgeStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function EvolutionGraph() {
  const { metrics } = useMetricsStore();
  const { rules } = useKnowledgeStore();

  const activeRules = rules.filter((r) => r.isActive).length;
  const avgConfidence =
    rules.length > 0
      ? rules.reduce((acc, r) => acc + r.confidence, 0) / rules.length
      : 0;

  // Calculate trends
  const recentIterations = metrics.iterations.slice(-5);
  const previousIterations = metrics.iterations.slice(-10, -5);

  const avgRecentScore =
    recentIterations.length > 0
      ? recentIterations.reduce((acc, i) => acc + i.averageScore, 0) /
        recentIterations.length
      : 0;
  const avgPreviousScore =
    previousIterations.length > 0
      ? previousIterations.reduce((acc, i) => acc + i.averageScore, 0) /
        previousIterations.length
      : 0;

  const scoreTrend = avgRecentScore - avgPreviousScore;

  // Transform data for charts
  const chartData = metrics.iterations.map((iteration, index) => ({
    name: `#${iteration.iteration}`,
    score: iteration.averageScore,
    documents: iteration.documentsGenerated,
    rules: iteration.rulesLearned,
  }));

  // Generate sample data if no real data
  const sampleData =
    chartData.length === 0
      ? Array.from({ length: 10 }, (_, i) => ({
          name: `#${i + 1}`,
          score: 60 + Math.random() * 30,
          documents: Math.floor(5 + Math.random() * 10),
          rules: Math.floor(1 + Math.random() * 3),
        }))
      : chartData;

  const TrendIcon = scoreTrend > 0 ? TrendingUp : scoreTrend < 0 ? TrendingDown : Minus;
  const trendColor =
    scoreTrend > 0 ? "text-emerald-400" : scoreTrend < 0 ? "text-red-400" : "text-slate-400";

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">학습 효율</p>
                <p className="text-xl font-bold text-emerald-400">
                  {(metrics.learningEfficiency * 100).toFixed(1)}%
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  trendColor
                )}
              >
                <TrendIcon className="w-3 h-3" />
                {Math.abs(scoreTrend).toFixed(1)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3">
            <div>
              <p className="text-xs text-slate-400">활성 규칙</p>
              <p className="text-xl font-bold text-blue-400">{activeRules}</p>
              <p className="text-xs text-slate-500">
                평균 신뢰도 {(avgConfidence * 100).toFixed(0)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Evolution Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>품질 점수 추이</span>
            {metrics.iterations.length === 0 && (
              <Badge variant="outline" className="text-xs">
                샘플 데이터
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#F1F5F9",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="url(#scoreGradient)"
                  strokeWidth={2}
                  name="품질 점수"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Learning Progress Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">학습 진행 상황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#F1F5F9",
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#94A3B8", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="documents"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2 }}
                  name="생성 문서"
                />
                <Line
                  type="monotone"
                  dataKey="rules"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: "#F59E0B", strokeWidth: 2 }}
                  name="학습 규칙"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">총 반복</p>
          <p className="text-lg font-bold text-white">
            {metrics.iterations.length || "0"}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">생성 속도</p>
          <p className="text-lg font-bold text-white">
            {metrics.generationSpeed.toFixed(1)}
            <span className="text-xs text-slate-400">/min</span>
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">반려율 감소</p>
          <p className="text-lg font-bold text-emerald-400">
            {((1 - metrics.rejectionRate) * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
