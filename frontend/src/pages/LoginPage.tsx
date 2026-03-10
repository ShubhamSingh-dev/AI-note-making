import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const FEATURES = [
  'AI-powered note summarization',
  'Smart search across all notes',
  'Natural language note creation',
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#07090f]">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-teal-500/15 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-teal-600/8 blur-[100px] animate-[pulse_12s_ease-in-out_infinite_4s]" />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 gap-0 px-4 lg:grid-cols-2 lg:px-0">
        {/* Left branding panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col justify-between rounded-l-2xl border border-white/[0.07] bg-white/[0.02] p-10 backdrop-blur-sm"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-500/30">
              <FileText className="h-4 w-4 text-teal-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white font-syne">
              Notiq
            </span>
            <Badge
              variant="secondary"
              className="ml-1 bg-teal-500/10 text-teal-300 border-teal-500/20 text-[10px]"
            >
              Beta
            </Badge>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl font-bold leading-tight tracking-tight text-white font-syne"
              >
                Capture ideas,{' '}
                <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                  amplified by AI.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-base text-zinc-400 leading-relaxed font-outfit"
              >
                Notiq turns your raw thoughts into structured, intelligent notes — in seconds.
              </motion.p>
            </div>

            {/* Feature list */}
            <ul className="space-y-3">
              {FEATURES.map((feat, i) => (
                <motion.li
                  key={feat}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                  <span className="text-sm text-zinc-300 font-outfit">{feat}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Footer quote */}
          <p className="text-xs text-zinc-500 font-outfit">
            Your AI-powered{' '}
            <span className="font-medium text-zinc-300">second brain</span>.
          </p>
        </motion.div>

        {/* Right form panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="rounded-2xl lg:rounded-l-none lg:rounded-r-2xl border border-white/[0.07] bg-zinc-900/70 backdrop-blur-xl shadow-2xl text-zinc-100 gap-0 py-0">
            <CardHeader className="px-8 pt-8 pb-6 space-y-1">
              {/* Mobile-only logo */}
              <div className="flex items-center gap-2 mb-4 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 border border-teal-500/30">
                  <FileText className="h-4 w-4 text-teal-400" />
                </div>
                <span className="font-semibold text-white font-syne">Notiq</span>
              </div>

              <Badge
                variant="outline"
                className="w-fit border-teal-500/30 text-teal-300 bg-teal-500/10 text-[11px] px-2.5 py-0.5"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Sign in to your account
              </Badge>
              <CardTitle className="text-2xl font-bold text-white pt-1 font-syne">
                Welcome back
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm font-outfit">
                Enter your credentials to access your workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-6 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <Label htmlFor="login-email" className="text-zinc-300 text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500 focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20 transition-all"
                  />
                </motion.div>

                {/* Password field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-zinc-300 text-sm font-medium">
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500 focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20 pr-10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Error banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Demo hint */}
                <p className="text-xs text-zinc-600 text-center">Demo: any email + any password works</p>

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.4 }}
                >
                  <Button
                    type="submit"
                    id="login-submit-btn"
                    disabled={isLoading}
                    className="w-full h-10 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold transition-all duration-200 shadow-lg shadow-teal-900/40 hover:shadow-teal-900/60 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-syne"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in to Notiq</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>

            <CardFooter className="flex-col gap-4 px-8 pb-8 pt-0">
              <div className="flex items-center gap-3 w-full">
                <Separator className="flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-500">New to Notiq?</span>
                <Separator className="flex-1 bg-zinc-800" />
              </div>
              <p className="text-center text-sm text-zinc-400 font-outfit">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline transition-colors"
                >
                  Create a free account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
