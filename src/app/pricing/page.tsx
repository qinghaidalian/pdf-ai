"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { CheckCircle, Loader2 } from "lucide-react";

const proFeatures = [
  "无限分析次数",
  "全部 5 个模板",
  "100MB 文件上限",
  "高级 AI 模型",
  "无限历史记录",
  "Markdown 导出",
  "优先支持",
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");

    try {
      const plan = billing === "monthly" ? "pro_monthly" : "pro_yearly";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        // Check status BEFORE parsing JSON
        if (res.status === 401) {
          router.push("/login?redirect=/pricing");
          return;
        }

        // Try to parse error message
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          throw new Error(err.message || "创建支付链接失败");
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message !== text) throw parseErr;
          throw new Error(`服务器错误 (${res.status})`);
        }
      }

      const text = await res.text();
      const { data } = JSON.parse(text);
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "支付服务暂不可用，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">选择你的套餐</h1>
        <p className="text-muted-foreground mb-6">
          免费开始，随时升级。
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-muted rounded-lg p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billing === "monthly"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            月付
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billing === "yearly"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            年付
            <Badge variant="outline" className="ml-1 text-green-600 text-xs">
              省 34%
            </Badge>
          </button>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <Card>
            <CardContent className="p-6 pt-8">
              <h3 className="text-lg font-semibold mb-1">免费</h3>
              <p className="text-sm text-muted-foreground mb-4">试用体验</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">¥0</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  "每天 3 次分析",
                  "2 个模板（合同体检 + 长文精读）",
                  "20MB 文件上限",
                  "基础 AI 模型",
                  "最近 10 条历史记录",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  开始使用
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-primary relative shadow-lg">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              推荐
            </Badge>
            <CardContent className="p-6 pt-8">
              <h3 className="text-lg font-semibold mb-1">Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">个人专业版</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  {billing === "monthly" ? "¥29" : "¥19"}
                </span>
                <span className="text-muted-foreground">
                  {billing === "monthly" ? "/月" : "/月（年付）"}
                </span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {error && (
                <p className="text-sm text-destructive mb-2">{error}</p>
              )}
              <Button
                variant="default"
                className="w-full"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    正在跳转支付...
                  </>
                ) : (
                  "订阅 Pro"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardContent className="p-6 pt-8">
              <h3 className="text-lg font-semibold mb-1">Team</h3>
              <p className="text-sm text-muted-foreground mb-4">团队协作版</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">¥99</span>
                <span className="text-muted-foreground">/月</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  "Pro 全部功能",
                  "5 人团队协作",
                  "共享文档库",
                  "200MB 文件上限",
                  "所有 AI 模型",
                  "优先支持",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@shuitianban.xyz">
                <Button variant="outline" className="w-full">
                  联系我们
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          🔒 7 天无理由退款 · 随时取消 · 未使用天数按比例退款
        </p>
      </section>
      <Footer />
    </>
  );
}
