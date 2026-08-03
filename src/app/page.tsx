import Link from "next/link";
import { NavBar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Upload, FileSearch, Download } from "lucide-react";
import { TEMPLATE_META } from "@/types";
import type { TemplateKey } from "@/types";

const templateKeys: TemplateKey[] = [
  "contract",
  "paper",
  "financial",
  "resume",
  "longread",
];

const comparisons = [
  { left: "你需要知道问什么 → 自己组织问题", right: "选模板就行 → 一键出结果" },
  {
    left: "结果格式不固定 → 每次都要调",
    right: "表格、清单、思维导图 → 标准化输出",
  },
  { left: "英文思维 → 中文像翻译", right: "中文原生 → 专门优化中文文档" },
  { left: "$20/月订阅费", right: "免费开始，Pro ¥29/月" },
];

export default function Home() {
  return (
    <>
      <NavBar />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <Badge variant="outline" className="mb-4 text-sm">
          🚀 5 个专业模板 · 中文原生支持
        </Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          上传 PDF，选模板
          <br />
          <span className="text-primary">一键出结果</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          不需要会提问 — 选一个模板，AI
          自动帮你分析任何文档。合同审查、论文拆解、财报分析、简历快筛、长文精读。
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              ✨ 免费开始使用 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/templates">
            <Button size="lg" variant="outline">
              查看模板
            </Button>
          </Link>
        </div>
      </section>

      {/* Templates */}
      <section className="container mx-auto px-4 py-16 border-t">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          5 个专业分析模板
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {templateKeys.map((key) => {
            const t = TEMPLATE_META[key];
            return (
              <Link key={key} href={`/templates/${key}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-3">{t.icon}</div>
                    <h3 className="font-semibold text-lg mb-1">{t.label}</h3>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* vs ChatGPT */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          为什么不用通用 AI 聊天？
        </h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {comparisons.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4"
            >
              <div className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-red-400 shrink-0 mt-0.5">✕</span>
                {row.left}
              </div>
              <div className="text-sm font-medium flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                {row.right}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16 border-t">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          三步完成分析
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">1. 上传 PDF</h3>
            <p className="text-sm text-muted-foreground">
              拖拽或点击上传，支持 50MB 以内的 PDF
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">2. 选择模板</h3>
            <p className="text-sm text-muted-foreground">
              选一个模板，不用想怎么提问
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">3. 获取结果</h3>
            <p className="text-sm text-muted-foreground">
              AI 自动输出结构化报告，可复制可导出
            </p>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold">你的文档安全是我们的首要任务</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> 加密存储
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />{" "}
              分析后随时删除
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />{" "}
              不用于 AI 训练
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">准备好了吗？</h2>
        <p className="text-muted-foreground mb-6">
          免费开始，Pro 无限使用仅需 ¥29/月
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg">✨ 免费开始</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              查看定价
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
