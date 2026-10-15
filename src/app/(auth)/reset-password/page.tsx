"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Lock } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/auth/PasswordField";
import { FormError } from "@/components/auth/FormError";
import { resetPasswordSchema, ResetPasswordInput } from "@/features/auth/schemas/auth.schema";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    try {
      setFormError(null);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error?.message || "Password reset failed. The token may be expired.");
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch {
      setFormError("Unable to reach server. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full flex items-center justify-center mx-auto text-[#15803D]">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#16324F]">Password updated</h3>
          <p className="text-sm text-[#64748B]">
            Your CareConnect password has been securely updated. You can now log in with your new password.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login">
            <Button className="w-full">Proceed to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormError message={formError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Hidden or read-only token */}
        <input type="hidden" {...register("token")} value={tokenFromUrl} />

        {!tokenFromUrl && (
          <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-xs text-[#B45309]">
            ⚠️ Missing reset token in URL. Please use the exact link sent to your email.
          </div>
        )}

        <PasswordField
          id="reset-new-password"
          label="New Password"
          placeholder="Min 8 chars, uppercase, symbol"
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordField
          id="reset-confirm-password"
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          id="reset-submit-button"
          isLoading={isSubmitting}
          disabled={!tokenFromUrl}
          className="w-full"
        >
          Update Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Set New Password"
        description="Choose a strong, unique password to secure your CareConnect health portal."
      >
        <Suspense fallback={<div className="p-6 text-center text-sm text-[#64748B]">Loading security parameters...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
