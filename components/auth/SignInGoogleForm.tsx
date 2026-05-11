"use client";

import { signIn } from "next-auth/react";

export function SignInGoogleForm({
  callbackUrl,
  disabled = false,
}: {
  callbackUrl: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => void signIn("google", { callbackUrl })}
    >
      Continuar con Google
    </button>
  );
}
