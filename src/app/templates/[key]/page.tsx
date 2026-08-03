import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, FileText } from "lucide-react";
import { TEMPLATE_META } from "@/types";
import type { TemplateKey } from "@/types";

const DETAIL: Record<
  TemplateKey,
  {
    title: string;
    subtitle: string;
    useCases: string[];
    outputItems: string[];
    demoTitle: string;
    demoContent: string[];
  }
> = {
  contract: {
    title: "合同体检",
    subtitle: "上传合同，AI 逐条审查风险条款，标注高/中/低风险，给出具体修改建议。",
    useCases: ["租房合同", "劳动合同", "合作协议", "保密协议 (NDA)", "服务协议"],
    outputItems: [
      "20 项风险检查清单（✅正常 / ⚠️关注 / 🔴高风险）",
      "高风险条款详解 + 原文引用",
      "谈判优先级排序 + 修改建议措辞",
      "合同总体风险等级评估",
    ],
    demoTitle: "示例：租房合同审查",
    demoContent: [
      "合同类型：房屋租赁合同",
      "总体风险等级：⚠️ 中等",
      "发现 3 项高风险条款：押金退还条款、维修责任划分、单方解约权",
      "给出 5 条具体修改建议，含替代措辞",
    ],
  },
  paper: {
    title: "论文拆解",
    subtitle: "上传论文 PDF，自动拆解为「背景→方法→结果→局限」结构化解读。",
    useCases: ["学术论文", "学位论文", "arXiv 预印本", "会议论文", "综述文章"],
    outputItems: [
      "论文速览卡片（标题/作者/发表信息/一句话核心观点）",
      "研究背景与问题 + 方法概述",
      "核心发现列表 + 关键数据表格",
      "创新点、局限性、启发与延伸",
      "关键术语表",
    ],
    demoTitle: "示例：NLP 论文拆解",
    demoContent: [
      "标题：基于大语言模型的文档理解框架",
      "核心发现：在 5 个基准数据集上平均提升 12%",
      "方法：将 LLM 与文档布局分析结合的新框架",
      "局限：仅在英文文档上测试，中文场景待验证",
    ],
  },
  financial: {
    title: "财报速读",
    subtitle: "上传年报/招股书，提取核心财务指标，标注同比变化和风险警示。",
    useCases: ["公司年报", "招股说明书", "季度财报", "IPO 文件", "券商研报"],
    outputItems: [
      "公司概况卡片（名称/代码/行业/报告期）",
      "核心财务指标 KPI 仪表盘（收入/利润/毛利率/ROE…）",
      "收入结构分析 + 同比变化（▲涨 ▼跌 →平）",
      "⚠️ 风险警示（红色高亮）",
      "一句话总结核心信号",
    ],
    demoTitle: "示例：科技公司年报速读",
    demoContent: [
      "公司：XX 科技股份有限公司 (300XXX)",
      "营业收入：52.3 亿 ▲18.5%",
      "净利润：8.7 亿 ▲23.1%",
      "风险提示：应收账款同比增加 45%，远超收入增速",
    ],
  },
  resume: {
    title: "简历快筛",
    subtitle: "上传简历 + 输入岗位 JD，AI 给出匹配度评分和面试建议。",
    useCases: ["技术岗位筛选", "校招简历评估", "内推简历预审", "跨行业转岗评估"],
    outputItems: [
      "候选人速览（工作年限/学历/当前职位）",
      "匹配度评分 0-100 + 四维度得分明细",
      "核心优势列表（与 JD 最匹配的亮点）",
      "⚠️ 潜在疑虑（频繁跳槽/职业空档/技能缺失）",
      "3-5 个面试建议问题",
      "综合评级：强烈推荐 / 推荐 / 待定 / 不推荐",
    ],
    demoTitle: "示例：前端工程师简历评估",
    demoContent: [
      "候选人：5 年经验，硕士，高级前端工程师",
      "匹配度评分：82 分（推荐）",
      "优势：React 源码级理解，有 2 年团队管理经验",
      "疑虑：最近两段工作均不足 1 年",
      "面试建议：重点考察实际项目经验和稳定性",
    ],
  },
  longread: {
    title: "长文精读",
    subtitle: "上传长文档，AI 提炼三句话摘要、思维导图、关键引用和行动启发。",
    useCases: ["行业报告", "白皮书", "政策文件", "书籍章节", "深度长文"],
    outputItems: [
      "三句话摘要（一眼看懂全文）",
      "章节脉络大纲（可折叠层级结构）",
      "5-10 个核心观点/洞察",
      "5-10 条关键原文引用（标注位置）",
      "思维导图（Markdown 大纲树形渲染）",
      "3-5 条可执行的行动启发",
      "推荐延伸阅读方向",
    ],
    demoTitle: "示例：AI 产业报告精读",
    demoContent: [
      "文档：2025 年中国人工智能产业发展报告（中国信通院）",
      "三句话摘要：产业规模突破 XXX 亿元 / 大模型从卷参数转向卷落地 / 算力数据人才三大瓶颈突出",
      "核心洞察：AI 落地正在从「能用」向「好用」过渡",
      "行动启发：关注国产算力、从行业大模型切入成本最低",
    ],
  },
};

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  if (!(key in DETAIL)) {
    notFound();
  }

  const tk = key as TemplateKey;
  const meta = TEMPLATE_META[tk];
  const detail = DETAIL[tk];

  return (
    <>
      <NavBar />

      {/* Header */}
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <div className="text-5xl mb-4">{meta.icon}</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{detail.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {detail.subtitle}
        </p>
        <div className="mt-6">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              ✨ 免费试用 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-xl font-bold mb-4">📋 适用场景</h2>
        <div className="flex flex-wrap gap-2">
          {detail.useCases.map((uc) => (
            <Badge key={uc} variant="secondary" className="text-sm px-3 py-1">
              {uc}
            </Badge>
          ))}
        </div>
      </section>

      {/* Output */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-xl font-bold mb-4">📊 分析报告包含什么</h2>
        <div className="space-y-3">
          {detail.outputItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-lg">{detail.demoTitle}</h2>
            </div>
            <div className="space-y-2">
              {detail.demoContent.map((line, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm p-2 rounded bg-muted/50"
                >
                  <span className="text-primary font-medium shrink-0">
                    {i + 1}.
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">
          上传你的文档，马上试试 {detail.title}
        </h2>
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

// Generate static params for SEO
export function generateStaticParams() {
  return (Object.keys(DETAIL) as TemplateKey[]).map((key) => ({ key }));
}
