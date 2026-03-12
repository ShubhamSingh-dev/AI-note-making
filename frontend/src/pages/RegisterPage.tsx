import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { type RegisterUserFormData } from "@/schemas/auth.schema";
import RegisterForm from "@/components/auth/RegisterForm";

// ─── RegisterPage ─────────────────────────────────────────────────────────────
// Responsibilities:
//   - Call the register API (via useMutation once wired up)
//   - Handle redirect on success
//   - Pass loading/error state down to RegisterForm
//   - Show toast notifications
//
// RegisterForm handles everything visual: fields, validation, layout.

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // TODO: replace with useMutation from @/hooks/useAuth once the hook is wired
  const handleSubmit = async (data: RegisterUserFormData) => {
    setIsLoading(true);
    setServerError(null);

    // Strip confirmPassword before sending to API
    const { confirmPassword: _, ...payload } = data;

    try {
      // Placeholder — swap with: await registerMutation.mutateAsync(payload)
      console.log("Register payload:", payload);
      await new Promise((r) => setTimeout(r, 800)); // simulate network

      toast.success("Account created! Welcome to Notiq 🎉");
      navigate("/notes");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
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
          isLoading={isLoading}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
