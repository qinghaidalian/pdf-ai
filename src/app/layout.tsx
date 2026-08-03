import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF AI 智能助手 — 上传 PDF，选模板，一键出结果",
  description:
    "不需要会提问，选一个模板，AI 自动帮你分析任何文档。支持合同审查、论文拆解、财报分析、简历快筛、长文精读。",
  keywords: [
    "PDF AI",
    "PDF 分析",
    "AI 读 PDF",
    "合同审查",
    "论文总结",
    "财报分析",
    "简历筛选",
  ],
  openGraph: {
    title: "PDF AI 智能助手",
    description: "上传 PDF，选模板，一键出结果",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
            <Toaster richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
