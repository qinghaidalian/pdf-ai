"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Loader2 } from "lucide-react";
import { TEMPLATE_META } from "@/types";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { Analysis } from "@/types";
import type { TemplateKey } from "@/types";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("analyses")
        .select("*, documents(filename, file_size)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) setAnalyses(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">历史记录</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">还没有分析记录</p>
          <Link
            href="/upload"
            className="text-primary hover:underline text-sm font-medium"
          >
            上传你的第一个 PDF →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {analyses.map((a) => {
            const key = a.template_key as TemplateKey;
            const meta = TEMPLATE_META[key];
            const doc = (a as any).documents;
            return (
              <Link key={a.id} href={`/analyze/${a.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-2xl shrink-0">{meta?.icon || "📄"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {doc?.filename || "未知文档"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {meta?.label || key}
                        </Badge>
                        <span>{formatDate(a.created_at)}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {a.status === "completed" ? (
                        <span className="text-green-500 text-xs">✓ 完成</span>
                      ) : a.status === "error" ? (
                        <span className="text-red-500 text-xs">✕ 失败</span>
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
