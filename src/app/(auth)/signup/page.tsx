"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <Card className="border-0 shadow-xl shadow-rose-100/50 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center mb-2">
            <svg
              className="w-6 h-6 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-gray-900">
            Check your email
          </CardTitle>
          <CardDescription className="text-gray-500">
            We sent a confirmation link to{" "}
            <span className="font-medium text-gray-700">{email}</span>. Click
            the link to activate your account.
          </CardDescription>
        </CardHeader>
        <Separator className="bg-gray-100" />
        <CardFooter className="justify-center py-4">
          <p className="text-sm text-gray-500">
            Already confirmed?{" "}
            <Link
              href="/login"
              className="font-medium text-rose-600 hover:text-rose-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl shadow-rose-100/50 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2 pb-2">
        <CardTitle className="text-2xl font-semibold tracking-tight text-gray-900">
          Create your account
        </CardTitle>
        <CardDescription className="text-gray-500">
          Get started in just a few seconds
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-white/60 border-gray-200 focus-visible:ring-rose-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-white/60 border-gray-200 focus-visible:ring-rose-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-gray-700">
              Confirm password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-white/60 border-gray-200 focus-visible:ring-rose-300"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white shadow-md shadow-rose-200/50 transition-all",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>

      <Separator className="bg-gray-100" />

      <CardFooter className="justify-center py-4">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-rose-600 hover:text-rose-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
