"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { TEMPLATE_META } from "@/types";
import { formatFileSize } from "@/lib/utils";
import type { TemplateKey, Document } from "@/types";

const templateKeys: TemplateKey[] = [
  "contract",
  "paper",
  "financial",
  "resume",
  "longread",
];

type Step = "upload" | "select" | "analyzing";

const ANALYSIS_STEPS = [
  { key: "parse", label: "PDF 解析中..." },
  { key: "extract", label: "内容提取中..." },
  { key: "analyze", label: "AI 分析中..." },
  { key: "report", label: "正在生成报告..." },
];

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateKey | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);

  // --- Upload ---
  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (f) {
      if (f.type !== "application/pdf") {
        toast.error("仅支持 PDF 文件");
        return;
      }
      if (f.size > 50 * 1024 * 1024) {
        toast.error("文件大小不能超过 50MB");
        return;
      }
      setFile(f);
      handleUpload(f);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  async function handleUpload(f: File) {
    setUploading(true);
    const supabase = createClient();
    const formData = new FormData();
    formData.append("file", f);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message);
      setUploading(false);
      return;
    }

    const { data } = await res.json();
    setDocument(data);
    setUploading(false);
    setStep("select");
  }

  // --- Analyze ---
  async function handleAnalyze() {
    if (!document || !selectedTemplate) return;
    setStep("analyzing");

    // Simulate progress
    let progress = 0;
    const timer = setInterval(() => {
      progress++;
      setAnalyzingStep(Math.min(progress, ANALYSIS_STEPS.length - 1));
      if (progress >= ANALYSIS_STEPS.length) clearInterval(timer);
    }, 1500);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_id: document.id,
        template_key: selectedTemplate,
      }),
    });

    clearInterval(timer);
    setAnalyzingStep(ANALYSIS_STEPS.length - 1);

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message);
      setStep("select");
      return;
    }

    const { data: analysis } = await res.json();
    router.push(`/analyze/${analysis.id}`);
  }

  // --- Render ---
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      {/* Step 1: Upload */}
      {step === "upload" && (
        <div>
          <h1 className="text-2xl font-bold mb-2">上传 PDF</h1>
          <p className="text-muted-foreground mb-8">
            拖拽 PDF 到下方区域，或点击上传
          </p>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">正在上传和解析...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium">
                  {isDragActive ? "松开即可上传" : "拖拽 PDF 到此处，或点击上传"}
                </p>
                <p className="text-sm text-muted-foreground">
                  支持 PDF，最大 50MB
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select template */}
      {step === "select" && document && (
        <div>
          <h1 className="text-2xl font-bold mb-2">选择分析模板</h1>
          <p className="text-muted-foreground mb-6">
            选一个模板，AI 会自动按对应结构为你分析文档
          </p>

          {/* Document preview */}
          <Card className="mb-6 bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{document.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(document.file_size)}
                  {document.page_count ? ` · ${document.page_count} 页` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setStep("upload");
                  setFile(null);
                  setDocument(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Template cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {templateKeys.map((key) => {
              const t = TEMPLATE_META[key];
              const isSelected = selectedTemplate === key;
              return (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary ring-1 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTemplate(key)}
                >
                  <CardContent className="p-4">
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <p className="font-semibold text-sm mb-1">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!selectedTemplate}
            onClick={handleAnalyze}
          >
            {selectedTemplate ? "🚀 开始分析" : "请先选择一个模板"}
          </Button>
        </div>
      )}

      {/* Step 3: Analyzing */}
      {step === "analyzing" && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-6">正在分析...</h2>
          <div className="max-w-sm mx-auto space-y-4">
            {ANALYSIS_STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                {i < analyzingStep ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : i === analyzingStep ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    i <= analyzingStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(analyzingStep / ANALYSIS_STEPS.length) * 100} className="max-w-sm mx-auto mt-6" />
        </div>
      )}
    </div>
  );
}
