import LoginForm from "@/components/auth/LoginForm";
import { useLogin } from "@/hooks/useAuth";
import type { LoginFormData } from "@/schemas/auth.schema";

// ─── LoginPage ────────────────────────────────────────────────────────────────
// Responsibilities:
//   - Call the login API (via useMutation once wired up)
//   - Handle redirect on success
//   - Pass loading/error state down to LoginForm
//   - Show toast notifications
//
// LoginForm handles everything visual: fields, validation, layout.

export default function LoginPage() {
  const { mutateAsync, isPending, error } = useLogin();

  const handleSubmit = async (data: LoginFormData) => {
    await mutateAsync(data);
  };
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / heading */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white font-syne tracking-tight">
            Sign in to Notiq
          </h1>
          <p className="text-sm text-zinc-400">Your notes, everywhere.</p>
        </div>

        {/* Form lives here — no form fields in this file */}
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          serverError={error?.message ?? null}
        />
      </div>
    </div>
  );
}
