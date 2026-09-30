"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Field } from "@/components/Field";
import { signIn, signUp } from "@/lib/storage";

export default function LoginPage() {
  return (
    <main>
      <SiteHeader />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <SiteFooter />
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  // Only allow same-site redirects.
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await (mode === "signin" ? signIn : signUp)(email.trim(), password);
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 pt-6 pb-20">
      <div className="card p-8 md:p-10">
        <p className="font-display font-bold text-sm uppercase tracking-[0.18em] text-amber-pressed">
          Church login
        </p>
        <h1 className="mt-2 font-display font-black text-2xl text-ink">
          {mode === "signin" ? "Sign in to edit your campaign" : "Create your church login"}
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <Field label={mode === "signin" ? "Email or username" : "Email"} htmlFor="email">
            <input
              id="email"
              type={mode === "signin" ? "text" : "email"}
              autoComplete="username"
              autoCapitalize="none"
              className="input-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            hint={mode === "signup" ? "At least 8 characters." : undefined}
          >
            <input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="input-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && <p className="text-sm text-coral">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create login"}
          </button>
        </form>
        <p className="mt-6 text-sm text-ink/60 text-center">
          {mode === "signin" ? "New church? " : "Already have a login? "}
          <button
            type="button"
            className="font-bold text-ink underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
          >
            {mode === "signin" ? "Create a login" : "Sign in"}
          </button>
        </p>
        {mode === "signin" && (
          <p className="mt-3 text-xs text-ink/50 text-center">
            Forgot your password? Contact us and we&rsquo;ll reset it.{" "}
            <Link href="/start" className="underline">Or start a new campaign</Link>
          </p>
        )}
      </div>
    </section>
  );
}
