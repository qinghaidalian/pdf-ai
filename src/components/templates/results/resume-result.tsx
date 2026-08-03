import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ratingColor: Record<string, string> = {
  "强烈推荐": "bg-green-100 text-green-700",
  "推荐": "bg-blue-100 text-blue-700",
  "待定": "bg-yellow-100 text-yellow-700",
  "不推荐": "bg-red-100 text-red-700",
};

export function ResumeResult({ data }: { data: Record<string, unknown> }) {
  const d = data as any;
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {d.candidate_label}
                <Badge className={`ml-2 ${ratingColor[d.overall_rating] || ""}`}>
                  {d.overall_rating}
                </Badge>
              </h2>
              <p className="text-sm text-muted-foreground">
                {d.current_position} · {d.years_of_experience} 年经验 · {d.highest_degree} {d.major}
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{d.match_score}</p>
              <p className="text-xs text-muted-foreground">匹配度</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">评分详情</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {d.score_breakdown && Object.entries(d.score_breakdown).map(([key, val]: [string, any]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">
                  {key === "skill_match" ? "技能匹配" : key === "experience_match" ? "经验匹配" : key === "education_match" ? "学历匹配" : "加分项"}
                </span>
                <span className="font-mono">{val.score}/{val.max}</span>
              </div>
              <Progress value={(val.score / val.max) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{val.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">核心优势</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(d.strengths || []).map((s: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="font-medium text-sm">{s.point}</p>
                <p className="text-xs text-muted-foreground mt-1">📄 {s.evidence}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {d.concerns?.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader><CardTitle className="text-lg text-yellow-600">⚠️ 需要关注</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(d.concerns || []).map((c: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {c.severity === "high" ? "重点关注" : c.severity === "medium" ? "需留意" : "轻微"}
                  </Badge>
                  <div>
                    <p className="font-medium">{c.concern}</p>
                    <p className="text-muted-foreground text-xs">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">面试建议问题</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(d.interview_suggestions || []).map((q: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="font-medium text-sm">{i + 1}. {q.question}</p>
                <p className="text-xs text-muted-foreground mt-1">🎯 考察：{q.purpose}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
