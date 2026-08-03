import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const severityColor: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

export function FinancialResult({ data }: { data: Record<string, unknown> }) {
  const d = data as any;
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{d.company_name}</h2>
              <p className="text-sm text-muted-foreground">
                {d.ticker} · {d.industry} · {d.report_period}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">核心财务数据</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">指标</th>
                  <th className="text-right py-2">数值</th>
                  <th className="text-right py-2">同比变化</th>
                  <th className="text-right py-2">来源</th>
                </tr>
              </thead>
              <tbody>
                {(d.key_metrics || []).map((m: any, i: number) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-2 font-medium">{m.metric}</td>
                    <td className="py-2 text-right font-mono">{m.value}</td>
                    <td className="py-2 text-right">{m.yoy_change}</td>
                    <td className="py-2 text-right text-muted-foreground text-xs">{m.page_ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {d.revenue_breakdown?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">收入结构</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(d.revenue_breakdown || []).map((seg: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <span className="text-sm">{seg.segment}</span>
                  <div className="text-right">
                    <span className="text-sm font-mono">{seg.amount}</span>
                    <span className="text-xs text-muted-foreground ml-2">({seg.percentage})</span>
                    <span className="text-xs ml-2">{seg.yoy_change}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">📈 亮点</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(d.highlights || []).map((h: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="font-medium text-sm">{h.item}</p>
                <p className="text-sm text-muted-foreground">{h.detail}</p>
                <p className="text-xs text-muted-foreground mt-1">📄 {h.data_support}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-lg text-red-600">⚠️ 风险警示</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(d.risk_alerts || []).map((r: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Badge className={severityColor[r.severity] || ""}>
                    {r.severity === "high" ? "高危" : r.severity === "medium" ? "中危" : "低危"}
                  </Badge>
                  <span className="font-medium text-sm">{r.risk}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{r.detail}</p>
                <p className="text-xs text-muted-foreground mt-1">📄 {r.data_support}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">管理层讨论</CardTitle></CardHeader>
        <CardContent><p className="text-sm">{d.management_discussion}</p></CardContent>
      </Card>

      {d.valuation && (
        <Card>
          <CardHeader><CardTitle className="text-lg">估值速览</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold">{d.valuation.pe || "N/A"}</p><p className="text-xs text-muted-foreground">P/E</p></div>
              <div><p className="text-2xl font-bold">{d.valuation.pb || "N/A"}</p><p className="text-xs text-muted-foreground">P/B</p></div>
              <div><p className="text-2xl font-bold">{d.valuation.ps || "N/A"}</p><p className="text-xs text-muted-foreground">P/S</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <p className="font-medium">📝 {d.one_liner_summary}</p>
        </CardContent>
      </Card>
    </div>
  );
}
