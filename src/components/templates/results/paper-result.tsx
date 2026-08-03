import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PaperResult({ data }: { data: Record<string, unknown> }) {
  const d = data as any;
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold">{d.title_cn}</h2>
          <p className="text-sm text-muted-foreground">{d.title_en}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge variant="secondary">{d.first_author} 等</Badge>
            <Badge variant="outline">{d.year} · {d.venue}</Badge>
          </div>
          <p className="mt-4 font-medium">{d.one_liner}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">研究背景</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{d.background?.problem}</p>
          <p className="text-sm text-muted-foreground mt-2">{d.background?.importance}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">研究方法</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>方法：</strong>{d.method?.approach}</p>
          {d.method?.novelty && <p><strong>新颖之处：</strong>{d.method.novelty}</p>}
          <p><strong>实验设计：</strong>{d.method?.experiment_design}</p>
          <p><strong>数据来源：</strong>{d.method?.data_source}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">核心发现</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(d.key_findings || []).map((f: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="font-medium text-sm">{f.finding}</p>
                <p className="text-xs text-muted-foreground mt-1">📄 {f.evidence}</p>
                <p className="text-xs mt-1">{f.significance}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {d.key_metrics?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">关键数据</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">指标</th>
                    <th className="text-left py-2">数值</th>
                    <th className="text-left py-2">基准</th>
                    <th className="text-left py-2">对比</th>
                  </tr>
                </thead>
                <tbody>
                  {d.key_metrics.map((m: any, i: number) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-2">{m.metric}</td>
                      <td className="py-2 font-mono">{m.value}</td>
                      <td className="py-2 text-muted-foreground">{m.benchmark}</td>
                      <td className="py-2">{m.comparison}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">创新点</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm list-disc list-inside">
            {(d.innovations || []).map((inn: string, i: number) => (
              <li key={i}>{inn}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">局限性</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(d.limitations || []).map((lim: any, i: number) => (
              <div key={i} className="text-sm flex items-start gap-2">
                <Badge variant="outline" className="shrink-0 text-xs">
                  {lim.source === "author_mentioned" ? "作者自述" : "审稿视角"}
                </Badge>
                <span>{lim.limitation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">启发与延伸</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm list-disc list-inside">
            {(d.implications || []).map((imp: string, i: number) => (
              <li key={i}>{imp}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {d.glossary?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">关键术语</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(d.glossary || []).map((g: any, i: number) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{g.term}</span>
                  <span className="text-muted-foreground"> — {g.explanation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
