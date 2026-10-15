"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/auth/FormError";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/features/auth/schemas/auth.schema";

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      setFormError(null);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error?.message || "Failed to process request. Please try again.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setFormError("Unable to reach server. Please check your connection.");
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Reset your password"
        description="Enter your registered email address and we'll send you a secure verification link to reset your password."
      >
        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full flex items-center justify-center mx-auto text-[#15803D]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#16324F]">Check your inbox</h3>
              <p className="text-sm text-[#64748B] max-w-sm mx-auto">
                If an account exists with that email, a password reset link has been dispatched.
                The link is valid for 60 minutes.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <FormError message={formError} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                id="forgot-email"
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="name@careconnect.health"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              <Button
                type="submit"
                id="forgot-submit-button"
                isLoading={isSubmitting}
                className="w-full"
              >
                Send Recovery Link
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:text-[#115E59]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
