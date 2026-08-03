import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-3 text-sm">产品</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/templates" className="hover:text-foreground">
                分析模板
              </Link>
              <Link href="/pricing" className="hover:text-foreground">
                定价
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">公司</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground">
                关于我们
              </Link>
              <Link href="mailto:hello@shuitianban.xyz" className="hover:text-foreground">
                联系我们
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">法律</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                隐私政策
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                服务条款
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">安全承诺</h4>
            <p className="text-sm text-muted-foreground">
              文档加密存储，分析后可随时删除。我们不会使用你的文档训练 AI 模型。
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          © 2026 PDF AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
