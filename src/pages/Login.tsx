import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Authentication error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-port-gore p-12 text-port-gore-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-20 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute bottom-32 right-0 h-[300px] w-[300px] rounded-full bg-lime/15 blur-[100px]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
              BV
            </div>
            <span className="font-display text-lg font-bold">Board Vault</span>
          </div>
          <p className="text-sm text-port-gore-foreground/50">Governance Portal</p>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Your governance.<br />
            Organized. Transparent.<br />
            <span className="text-lime">AI-powered.</span>
          </h2>
          <p className="text-port-gore-foreground/60 max-w-md leading-relaxed text-body">
            Access your holdings, review governance documents, and get instant AI-powered answers — all in one secure portal.
          </p>
        </div>
        <p className="relative z-10 text-xs text-port-gore-foreground/30">
          © 2026 Nexus AI Holdings. All rights reserved.
        </p>
      </div>

      {/* Right — Login Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="space-y-2 lg:hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
                BV
              </div>
              <span className="font-display text-lg font-bold">Board Vault</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Sign up to access the portal" : "Enter your credentials to access the portal"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-label">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-label">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-label">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? "Please wait…" : isSignUp ? "Sign up" : "Sign in"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>Already have an account?{" "}
                <button type="button" onClick={() => setIsSignUp(false)} className="text-primary hover:underline font-medium">Sign in</button>
              </>
            ) : (
              <>Don't have an account?{" "}
                <button type="button" onClick={() => setIsSignUp(true)} className="text-primary hover:underline font-medium">Sign up</button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
