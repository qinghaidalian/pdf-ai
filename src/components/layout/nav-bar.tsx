"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <FileText className="h-5 w-5 text-primary" />
          <span>PDF AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/templates"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            模板
          </Link>
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            定价
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {pathname === "/login" ? (
            <Link href="/signup">
              <Button variant="default" size="sm">
                注册
              </Button>
            </Link>
          ) : pathname === "/signup" ? (
            <Link href="/login">
              <Button variant="outline" size="sm">
                登录
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/signup" className="hidden sm:block">
                <Button variant="default" size="sm">
                  免费开始
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
