import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const riskColor: Record<string, string> = {
  "低": "bg-green-100 text-green-700",
  "中": "bg-yellow-100 text-yellow-700",
  "高": "bg-orange-100 text-orange-700",
  "极高": "bg-red-100 text-red-700",
};

const statusIcon: Record<string, string> = {
  normal: "✅",
  warning: "⚠️",
  high_risk: "🔴",
};

export function ContractResult({ data }: { data: Record<string, unknown> }) {
  const d = data as any;
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{d.contract_type || "合同"}</h2>
              <p className="text-sm text-muted-foreground">
                {d.parties?.join(" vs ") || ""}
              </p>
            </div>
            <Badge className={riskColor[d.overall_risk] || ""}>
              {d.overall_risk}风险
            </Badge>
          </div>
          <p className="text-sm">{d.risk_summary}</p>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">20 项风险检查</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(d.checklist || []).map((item: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {statusIcon[item.status] || ""} {item.dimension}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.detail}
                    </p>
                  </div>
                </div>
                {item.original_text && (
                  <blockquote className="mt-2 pl-3 border-l-2 text-xs text-muted-foreground">
                    {item.original_text}
                  </blockquote>
                )}
                {item.suggestion && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    💡 {item.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High risk details */}
      {d.high_risk_details?.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">🔴 高风险条款详解</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {d.high_risk_details.map((item: any, i: number) => (
              <div key={i} className="border-b last:border-b-0 pb-3 last:pb-0">
                <p className="font-medium text-sm">{item.dimension}</p>
                <blockquote className="mt-1 pl-3 border-l-2 text-xs">
                  {item.original_text}
                </blockquote>
                <p className="mt-1 text-sm">{item.risk_explanation}</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  ✅ {item.suggested_fix}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Negotiation priorities */}
      {d.negotiation_priorities?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">谈判优先级</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside">
              {d.negotiation_priorities.map((item: any, i: number) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{item.clause}</span>
                  <p className="ml-5 text-muted-foreground">{item.reason}</p>
                  <p className="ml-5 text-green-600 dark:text-green-400">
                    {item.suggested_wording}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Conclusion */}
      <Card>
        <CardContent className="p-6">
          <p className="font-medium">📝 {d.conclusion}</p>
        </CardContent>
      </Card>
    </div>
  );
}
