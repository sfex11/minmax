import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "AI 자율 진화형 기획 엔진",
  description: "세 AI 에이전트가 협력하여 대규모 기획 문서를 자동 생성하는 B2B SaaS 플랫폼",
  keywords: ["AI", "기획", "문서 자동화", "에이전트", "B2B", "SaaS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
