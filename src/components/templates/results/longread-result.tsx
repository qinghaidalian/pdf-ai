import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LongreadResult({ data }: { data: Record<string, unknown> }) {
  const d = data as any;
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold">{d.title}</h2>
          <div className="flex gap-2 mt-2">
            {d.author && <Badge variant="secondary">{d.author}</Badge>}
            {d.doc_type && <Badge variant="outline">{d.doc_type}</Badge>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader><CardTitle className="text-lg">三句话摘要</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            {(d.three_line_summary || []).map((line: string, i: number) => (
              <li key={i} className="font-medium">{line}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">章节脉络</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(d.chapter_outline || []).map((ch: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3">
                <p className="font-medium text-sm">{ch.chapter}</p>
                <p className="text-sm text-muted-foreground">{ch.summary}</p>
                {ch.subsections?.map((sub: any, j: number) => (
                  <div key={j} className="ml-3 mt-1 text-xs text-muted-foreground">
                    · {sub.title}: {sub.summary}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">核心观点</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(d.core_insights || []).map((ins: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="font-medium text-sm">{ins.insight}</p>
                <p className="text-xs text-muted-foreground mt-1">{ins.importance}</p>
                <p className="text-xs text-muted-foreground">📄 {ins.location}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {d.key_quotes?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">关键引用</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(d.key_quotes || []).map((q: any, i: number) => (
                <blockquote key={i} className="border-l-4 border-primary/30 pl-4">
                  <p className="text-sm italic">&ldquo;{q.quote}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-1">— {q.location}</p>
                  {q.context && <p className="text-xs text-muted-foreground">{q.context}</p>}
                </blockquote>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {d.facts_and_figures?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">数据与事实</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(d.facts_and_figures || []).map((f: any, i: number) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {f.category && <Badge variant="outline" className="text-xs">{f.category}</Badge>}
                    <span className="text-sm">{f.fact}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">📄 {f.source}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {d.mind_map_markdown && (
        <Card>
          <CardHeader><CardTitle className="text-lg">思维导图</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
              {d.mind_map_markdown}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">行动启发</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(d.action_items || []).map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 border rounded-lg p-3">
                <span className="text-lg shrink-0">
                  {a.difficulty === "easy" ? "🟢" : a.difficulty === "medium" ? "🟡" : "🔴"}
                </span>
                <div>
                  <p className="font-medium text-sm">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.why}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">延伸探索</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(d.further_reading || []).map((fr: any, i: number) => (
              <div key={i} className="text-sm">
                <span className="font-medium">🔍 {fr.keyword}</span>
                <span className="text-muted-foreground"> — {fr.reason}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
