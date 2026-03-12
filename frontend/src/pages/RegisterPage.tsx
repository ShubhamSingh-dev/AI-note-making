import RegisterForm from "@/components/auth/RegisterForm";
import { useRegister } from "@/hooks/useAuth";
import type { RegisterUserFormData } from "@/schemas/auth.schema";

// ─── RegisterPage ─────────────────────────────────────────────────────────────
// Responsibilities:
//   - Call the register API (via useMutation once wired up)
//   - Handle redirect on success
//   - Pass loading/error state down to RegisterForm
//   - Show toast notifications
//
// RegisterForm handles everything visual: fields, validation, layout.

export default function RegisterPage() {
  const { mutateAsync, isPending, error } = useRegister();

  const handleSubmit = async (data: RegisterUserFormData) => {
    await mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / heading */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white font-syne tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-zinc-400">
            Start organising your thoughts today.
          </p>
        </div>

        {/* Form lives here — no form fields in this file */}
        <RegisterForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          serverError={error?.message ?? null}
        />
      </div>
    </div>
  );
}
