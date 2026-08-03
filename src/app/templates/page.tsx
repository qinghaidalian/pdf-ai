import Link from "next/link";
import { NavBar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { TEMPLATE_META } from "@/types";
import type { TemplateKey } from "@/types";

const templateKeys: TemplateKey[] = [
  "contract",
  "paper",
  "financial",
  "resume",
  "longread",
];

export default function TemplatesPage() {
  return (
    <>
      <NavBar />
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <Badge variant="outline" className="mb-4 text-sm">
          5 个专业模板
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          选一个模板，一键出结果
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          每个模板针对特定场景深度优化，AI 自动输出结构化分析报告
        </p>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {templateKeys.map((key) => {
            const t = TEMPLATE_META[key];
            return (
              <Link key={key} href={`/templates/${key}`}>
                <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{t.icon}</div>
                    <h2 className="font-bold text-xl mb-2">{t.label}</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t.desc}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-primary font-medium">
                      了解详情 <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">准备好试试了吗？</h2>
        <Link href="/signup">
          <Button size="lg" className="gap-2">
            ✨ 免费开始使用 <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <Footer />
    </>
  );
}
