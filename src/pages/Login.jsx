import { useState } from "react";
import { Flame, Lock, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Login({ users, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const match = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!match) {
      setError("That username or password isn't right. Try again.");
      return;
    }
    setError("");
    onLogin(match);
  }

  return (
    <div className="min-h-screen bg-[#F6EFE3] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="overflow-hidden rounded-[1rem] border border-[#E2D4BC] bg-[#FFFCF6] shadow-[0_12px_32px_rgba(60,42,30,0.1)]">
          <CardHeader className="space-y-3 bg-[#FEFBF6] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.625rem] bg-[#C1622B] text-[#FFFCF6]">
                <Flame size={20} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold font-serif text-[#3C2A1E]">Ember & Clay</CardTitle>
                <CardDescription className="text-xs text-[#6B5544]">Studio console sign-in</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User size={15} className="pointer-events-none absolute left-3 top-3 text-[#6B5544]" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="owner"
                    autoFocus
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-3 top-3 text-[#6B5544]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-[#F4DCD5] px-3 py-2 text-sm font-semibold text-[#9C3B2A]">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full justify-center" variant="default" size="lg">
                <ShieldCheck size={15} /> Sign in
              </Button>
            </form>

            <div className="mt-6 rounded-2xl bg-[#F6EFE3] p-4 text-[0.9rem] leading-6 text-[#6B5544]">
              Demo accounts — owner / owner123, manager / manager123, employee / employee123. Roles change what each sign-in can see and edit.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
