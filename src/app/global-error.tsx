"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold">出错了</h1>
          <p className="text-muted-foreground text-sm break-all">
            {error.message || "未知错误"}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
