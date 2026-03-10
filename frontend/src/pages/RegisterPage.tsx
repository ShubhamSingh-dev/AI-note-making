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
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  FileText,
  BrainCircuit,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PERKS = [
  { icon: BrainCircuit, label: 'AI-powered summaries' },
  { icon: Zap, label: 'Instant note generation' },
  { icon: ShieldCheck, label: 'End-to-end encrypted' },
];

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(username, email, password);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#07090f]">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/15 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-500/12 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-purple-500/8 blur-[100px] animate-[pulse_12s_ease-in-out_infinite_4s]" />
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
        {/* Left form panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="rounded-2xl lg:rounded-r-none lg:rounded-l-2xl border border-white/[0.07] bg-zinc-900/70 backdrop-blur-xl shadow-2xl text-zinc-100 gap-0 py-0">
            <CardHeader className="px-8 pt-8 pb-6 space-y-1">
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
                Free forever — no credit card required
              </Badge>
              <CardTitle className="text-2xl font-bold text-white pt-1 font-syne">
                Create your account
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm font-outfit">
                Start building with Notiq in seconds.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-6 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Username */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.4 }}
                >
                  <Label htmlFor="register-username" className="text-zinc-300 text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500 focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20 transition-all"
                  />
                </motion.div>

                {/* Email */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.4 }}
                >
                  <Label htmlFor="register-email" className="text-zinc-300 text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500 focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20 transition-all"
                  />
                </motion.div>

                {/* Password */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Label htmlFor="register-password" className="text-zinc-300 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
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
                  {/* Password strength */}
                  {password.length > 0 && (
                    <div className="flex gap-1 pt-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            password.length >= (i + 1) * 3
                              ? password.length >= 12
                                ? 'bg-teal-500'
                                : password.length >= 8
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              : 'bg-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
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

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Button
                    type="submit"
                    id="register-submit-btn"
                    disabled={isLoading}
                    className="w-full h-10 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold transition-all duration-200 shadow-lg shadow-teal-900/40 hover:shadow-teal-900/60 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-syne"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Get started for free</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <p className="text-center text-[11px] text-zinc-500 leading-relaxed font-outfit">
                  By creating an account, you agree to our{' '}
                  <span className="text-zinc-400 underline underline-offset-2 cursor-pointer hover:text-zinc-200 transition-colors">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-zinc-400 underline underline-offset-2 cursor-pointer hover:text-zinc-200 transition-colors">
                    Privacy Policy
                  </span>
                  .
                </p>
              </form>
            </CardContent>

            <CardFooter className="flex-col gap-4 px-8 pb-8 pt-0">
              <div className="flex items-center gap-3 w-full">
                <Separator className="flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-500">Already a user?</span>
                <Separator className="flex-1 bg-zinc-800" />
              </div>
              <p className="text-center text-sm text-zinc-400 font-outfit">
                Have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Right branding panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col justify-between rounded-r-2xl border border-white/[0.07] border-l-0 bg-white/2 p-10 backdrop-blur-sm"
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
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white font-syne">
                Everything you need{' '}
                <span className="bg-linear-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                  to think smarter.
                </span>
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed font-outfit">
                Join thousands of professionals using AI to capture, organize, and recall knowledge
                effortlessly.
              </p>
            </div>

            {/* Perk cards */}
            <div className="space-y-3">
              {PERKS.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-4 rounded-xl border border-white/6 bg-white/3 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 border border-teal-500/20">
                    <Icon className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-200 font-outfit">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="space-y-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-xs text-zinc-500 font-outfit">
              <span className="font-medium text-zinc-300">4.9/5</span> from over 1,200 reviews
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
