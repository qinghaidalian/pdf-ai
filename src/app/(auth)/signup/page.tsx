"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { NavBar } from "@/components/layout/nav-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/upload`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("注册成功！请检查邮箱确认链接。");
      router.push("/upload");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">注册</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="密码（至少 6 位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "注册中..." : "注册"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              已有账号？{" "}
              <Link href="/login" className="text-primary hover:underline">
                登录
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
