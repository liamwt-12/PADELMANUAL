"use client";
import { useState } from "react";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setStatus("done"); setEmail(""); }
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  if (status === "done") return <p className={`text-sm ${dark ? "text-pm-accent" : "text-pm-accent"}`}>You are in. Check your inbox.</p>;

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className={`flex-1 rounded-full border px-5 py-3 text-sm outline-none ${dark ? "border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-pm-accent/40" : "border-pm-border bg-white text-pm-text placeholder-pm-faint focus:border-pm-accent/40"}`}
      />
      <button type="submit" disabled={status === "loading"} className={`rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 ${dark ? "bg-pm-bg-card text-pm-text" : "bg-pm-text text-pm-bg"}`}>
        {status === "loading" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}
