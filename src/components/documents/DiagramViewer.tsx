"use client";

import React, { useEffect, useRef, useState } from "react";
import { GitBranch, RefreshCw } from "lucide-react";
import { useDocumentStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Document, DocumentType } from "@/types";

const typeColors: Record<DocumentType, string> = {
  blueprint: "#3B82F6",
  module: "#F59E0B",
  detail: "#6B7280",
  implementation: "#10B981",
};

interface TreeNode {
  id: string;
  title: string;
  type: DocumentType;
  status: string;
  children: TreeNode[];
  x: number;
  y: number;
}

export function DiagramViewer() {
  const { documents, selectedDocumentId, selectDocument } = useDocumentStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const buildTree = (): TreeNode[] => {
    const rootDocs = documents.filter((doc) => !doc.parentId);

    const buildNode = (doc: Document, x: number, y: number): TreeNode => {
      const children = documents.filter((d) => d.parentId === doc.id);
      const childNodes: TreeNode[] = [];

      children.forEach((child, index) => {
        const childX = x + (index - (children.length - 1) / 2) * 180;
        const childY = y + 120;
        childNodes.push(buildNode(child, childX, childY));
      });

      return {
        id: doc.id,
        title: doc.title,
        type: doc.type,
        status: doc.status,
        children: childNodes,
        x,
        y,
      };
    };

    return rootDocs.map((doc, index) =>
      buildNode(doc, dimensions.width / 2 + (index - (rootDocs.length - 1) / 2) * 300, 60)
    );
  };

  const drawTree = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tree = buildTree();
    if (tree.length === 0) return;

    const drawNode = (node: TreeNode) => {
      // Draw connections to children
      node.children.forEach((child) => {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + 30);
        ctx.lineTo(node.x, node.y + 50);
        ctx.lineTo(child.x, node.y + 50);
        ctx.lineTo(child.x, child.y - 10);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw node box
      const boxWidth = 150;
      const boxHeight = 60;
      const x = node.x - boxWidth / 2;
      const y = node.y - 10;

      ctx.beginPath();
      ctx.roundRect(x, y, boxWidth, boxHeight, 8);
      ctx.fillStyle = selectedDocumentId === node.id ? "#1E3A5F" : "#1E293B";
      ctx.fill();
      ctx.strokeStyle = typeColors[node.type];
      ctx.lineWidth = selectedDocumentId === node.id ? 3 : 2;
      ctx.stroke();

      // Draw type indicator
      ctx.beginPath();
      ctx.arc(x + 12, y + 12, 4, 0, Math.PI * 2);
      ctx.fillStyle = typeColors[node.type];
      ctx.fill();

      // Draw status indicator
      const statusColors = {
        draft: "#6B7280",
        reviewing: "#F59E0B",
        approved: "#10B981",
        rejected: "#EF4444",
      };
      ctx.beginPath();
      ctx.arc(x + boxWidth - 12, y + 12, 4, 0, Math.PI * 2);
      ctx.fillStyle = statusColors[node.status as keyof typeof statusColors] || "#6B7280";
      ctx.fill();

      // Draw title
      ctx.fillStyle = "#F1F5F9";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "center";
      const title = node.title.length > 18 ? node.title.slice(0, 18) + "..." : node.title;
      ctx.fillText(title, node.x, y + 35);

      // Draw type label
      ctx.fillStyle = "#94A3B8";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText(node.type.toUpperCase(), node.x, y + 50);

      // Recursively draw children
      node.children.forEach(drawNode);
    };

    tree.forEach(drawNode);
  };

  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    drawTree();
  }, [documents, selectedDocumentId, dimensions]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const findNodeAt = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        const boxWidth = 150;
        const boxHeight = 60;
        const nodeX = node.x - boxWidth / 2;
        const nodeY = node.y - 10;

        if (x >= nodeX && x <= nodeX + boxWidth && y >= nodeY && y <= nodeY + boxHeight) {
          return node;
        }

        const found = findNodeAt(node.children);
        if (found) return found;
      }
      return null;
    };

    const tree = buildTree();
    const clickedNode = findNodeAt(tree);
    if (clickedNode) {
      selectDocument(clickedNode.id);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">문서 트리 다이어그램</p>
          <p className="text-sm">문서가 생성되면 여기에 표시됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-400">Blueprint</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-slate-400">Module</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-xs text-slate-400">Detail</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Implementation</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={drawTree}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <Card className="flex-1 bg-slate-900 border-slate-700 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          className="cursor-pointer"
        />
      </Card>
    </div>
  );
}
