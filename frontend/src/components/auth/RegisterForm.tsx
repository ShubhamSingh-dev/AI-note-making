import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  registerUserSchema,
  type RegisterUserFormData,
} from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Props ────────────────────────────────────────────────────────────────────
// RegisterForm is a pure presentational form component.
// All async logic (API call, redirect, toast) lives in RegisterPage.

interface RegisterFormProps {
  onSubmit: (data: RegisterUserFormData) => Promise<void>;
  isLoading?: boolean;
  serverError?: string | null;
}

// ─── Password strength indicator ─────────────────────────────────────────────

const passwordRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
];

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  return (
    <ul className="mt-2 space-y-1">
      {passwordRules.map(({ label, test }) => {
        const passed = test(value);
        return (
          <li key={label} className="flex items-center gap-1.5 text-xs">
            {passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-zinc-600  shrink-0" />
            )}
            <span className={passed ? "text-teal-400" : "text-zinc-500"}>
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterForm({
  onSubmit,
  isLoading = false,
  serverError,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterUserFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* ── Username ───────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="register-username"
          className="text-zinc-300 text-sm font-medium"
        >
          Username
        </Label>
        <Input
          id="register-username"
          type="text"
          placeholder="johndoe"
          autoComplete="username"
          aria-invalid={!!errors.username}
          className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500
                     focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20
                     aria-invalid:border-red-500/60 transition-all"
          {...register("username")}
        />
        {errors.username && (
          <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>
        )}
      </div>

      {/* ── Email ──────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="register-email"
          className="text-zinc-300 text-sm font-medium"
        >
          Email address
        </Label>
        <Input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500
                     focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20
                     aria-invalid:border-red-500/60 transition-all"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* ── Password ───────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="register-password"
          className="text-zinc-300 text-sm font-medium"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500
                       focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20
                       aria-invalid:border-red-500/60 pr-10 transition-all"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
        ) : (
          <PasswordStrength value={passwordValue} />
        )}
      </div>

      {/* ── Confirm password ───────────────────────────────── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="register-confirm"
          className="text-zinc-300 text-sm font-medium"
        >
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="register-confirm"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            className="h-10 bg-zinc-800/60 border-zinc-700/60 text-white placeholder:text-zinc-500
                       focus-visible:border-teal-500/70 focus-visible:ring-teal-500/20
                       aria-invalid:border-red-500/60 pr-10 transition-all"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-400 mt-1">
            {errors.confirmPassword.message}
          </p>
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
            <span>Creating account…</span>
          </>
        ) : (
          <>
            <span>Create account</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {/* ── Footer ─────────────────────────────────────────── */}
      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
