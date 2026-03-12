import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { type LoginFormData } from '@/schemas/auth.schema';
import LoginForm from '@/components/auth/LoginForm';

// ─── LoginPage ────────────────────────────────────────────────────────────────
// Responsibilities:
//   - Call the login API (via useMutation once wired up)
//   - Handle redirect on success
//   - Pass loading/error state down to LoginForm
//   - Show toast notifications
//
// LoginForm handles everything visual: fields, validation, layout.

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading,   setIsLoading  ] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // TODO: replace with useMutation from @/hooks/useAuth once the hook is wired
  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // Placeholder — swap with: await loginMutation.mutateAsync(data)
      console.log('Login payload:', data);
      await new Promise((r) => setTimeout(r, 800)); // simulate network

      toast.success('Welcome back!');
      navigate('/notes');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
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
            Sign in to Notiq
          </h1>
          <p className="text-sm text-zinc-400">
            Your notes, everywhere.
          </p>
        </div>

        {/* Form lives here — no form fields in this file */}
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          serverError={serverError}
        />

      </div>
    </div>
  );
}