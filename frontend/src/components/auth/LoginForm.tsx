import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

import { loginUserSchema, type LoginFormData } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Props ────────────────────────────────────────────────────────────────────
// LoginForm is a pure presentational form component.
// All async logic (API call, redirect, toast) lives in LoginPage.

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  serverError?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginForm({
  onSubmit,
  isLoading = false,
  serverError,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

      {/* ── Email ──────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="login-email" className="text-zinc-300 text-sm font-medium">
          Email address
        </Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500
                     focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20
                     aria-invalid:border-red-500/60 transition-all"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* ── Password ───────────────────────────────────────── */}
      <div className="space-y-1.5">
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
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500
                       focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20
                       aria-invalid:border-red-500/60 pr-10 transition-all"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* ── Server error ───────────────────────────────────── */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
          {serverError}
        </div>
      )}

      {/* ── Submit ─────────────────────────────────────────── */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold
                   transition-all duration-200 shadow-lg shadow-teal-900/40
                   hover:shadow-teal-900/60 hover:-translate-y-0.5 active:translate-y-0"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <span>Sign in</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {/* ── Footer ─────────────────────────────────────────── */}
      <p className="text-center text-sm text-zinc-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline transition-colors"
        >
          Create one free
        </Link>
      </p>

    </form>
  );
}