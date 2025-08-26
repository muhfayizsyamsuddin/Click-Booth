"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogIn,
  ArrowLeft,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setMessage(data?.message || "Login failed");
        setMessageType("error");
        setLoading(false);
        return;
      }

      // optional: immediately validate and warm /api/me (trusted)
      try {
        await fetch("/api/me", { method: "GET", credentials: "include" });
      } catch {
        /* ignore */
      }

      setMessage("Login successful! Redirecting...");
      setMessageType("success");
      setTimeout(() => router.push("/booth"), 600);
    } catch (err) {
      setMessage("An error occurred during login.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4 text-body transition-colors"
            style={{ color: "var(--color-foreground-secondary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="icon-container coral auth-icon">
            <LogIn className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-heading-2 mb-2">Welcome Back</h1>
          <p className="text-body">Sign in to your ClickBooth account</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`alert ${
              messageType === "success" ? "alert-success" : "alert-error"
            }`}
          >
            <div className="flex items-center gap-2">
              {messageType === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--color-foreground-muted)" }}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-12"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--color-foreground-muted)" }}
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-12"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full justify-center ${
              loading ? "btn-loading" : ""
            }`}
          >
            {!loading && <LogIn className="w-5 h-5" />}
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p className="text-body-small">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold transition-colors"
              style={{ color: "var(--color-primary)" }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
