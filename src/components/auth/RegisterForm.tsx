"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, User as UserIcon, Lock } from "lucide-react";
import { registerSchema, RegisterInput } from "@/features/auth/schemas/auth.schema";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { PasswordField } from "./PasswordField";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { FormError } from "./FormError";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: true,
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    try {
      setFormError(null);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error?.message || "Registration failed. Please try again.");
        return;
      }

      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch {
      setFormError("Unable to reach the server. Please verify your connection.");
    }
  };

  return (
    <div className="space-y-5">
      <FormError message={formError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="register-name"
          label="Full Legal Name"
          placeholder="e.g. Rahul Sharma"
          leftIcon={<UserIcon className="w-4 h-4" />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          id="register-email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="patient@careconnect.health"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <PasswordField
            id="register-password"
            label="Create Password"
            placeholder="Min 8 chars, uppercase, number & symbol"
            error={errors.password?.message}
            {...register("password")}
          />
          <p className="mt-1 text-[11px] text-[#64748B]">
            Must contain 8+ characters, uppercase, number, and special symbol.
          </p>
        </div>

        <PasswordField
          id="register-confirm-password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 rounded border-[#CBD5E1] text-[#0F766E] focus:ring-[#0F766E]/30"
              {...register("termsAccepted")}
            />
            <span className="text-xs text-[#64748B] leading-tight">
              I agree to the{" "}
              <span className="text-[#0F766E] font-medium">Terms of Service</span> and{" "}
              <span className="text-[#0F766E] font-medium">Privacy Policy</span>. Patient medical data is confidential.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-xs text-[#B91C1C] font-medium">{errors.termsAccepted.message}</p>
          )}
        </div>

        <Button
          type="submit"
          id="register-submit-button"
          isLoading={isSubmitting}
          className="w-full bg-[#0F766E] hover:bg-[#0D655E]"
        >
          Create Patient Account
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#E2E8F0] w-full" />
        <span className="bg-white px-3 text-xs uppercase tracking-wider text-[#94A3B8] font-medium absolute">
          or sign up with
        </span>
      </div>

      <GoogleSignInButton label="Sign up with Google" />

      {/* Login redirect */}
      <div className="text-center text-xs text-[#64748B]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#0F766E] hover:text-[#115E59] focus:outline-none focus:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
