"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_tier")
        .single();
      if (sub) setPlan(sub.plan_tier);
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">设置</h1>

      <div className="space-y-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">账户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">邮箱</p>
              <Input value={email} disabled />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">当前套餐</p>
              <div className="flex items-center gap-2">
                <span className="font-semibold capitalize">{plan}</span>
                {plan === "free" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/pricing")}
                  >
                    升级 Pro
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">退出登录</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> 退出登录
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
