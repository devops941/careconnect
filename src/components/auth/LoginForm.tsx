"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, User, ShieldCheck, Stethoscope, Lock, KeyRound } from "lucide-react";
import { loginSchema, LoginInput } from "@/features/auth/schemas/auth.schema";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { PasswordField } from "./PasswordField";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { FormError } from "./FormError";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [portalType, setPortalType] = useState<"patient" | "staff">("patient");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginInput) => {
    try {
      setFormError(null);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error?.message || "Invalid credentials. Please verify and try again.");
        return;
      }

      toast.success("Welcome back! Signing you in...");
      if (portalType === "patient" || data.data?.user?.role === "PATIENT") {
        router.push("/patient/dashboard");
      } else {
        router.push("/staff/dashboard");
      }
      router.refresh();
    } catch {
      setFormError("Unable to reach the server. Please verify your connection.");
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setFormError(null);
  };

  return (
    <div className="space-y-5">
      {/* Portal Selection Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => {
            setPortalType("patient");
            setFormError(null);
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            portalType === "patient"
              ? "bg-white text-[#0F766E] shadow-xs"
              : "text-[#64748B] hover:text-[#1F2937]"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Patient Portal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPortalType("staff");
            setFormError(null);
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            portalType === "staff"
              ? "bg-[#16324F] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1F2937]"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Hospital Staff</span>
        </button>
      </div>

      <FormError message={formError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="login-email"
          label={portalType === "patient" ? "Patient Email Address" : "Staff Email or Employee ID"}
          type="text"
          autoComplete={portalType === "patient" ? "email" : "username"}
          placeholder={
            portalType === "patient"
              ? "patient@careconnect.health"
              : "e.g. DOC-101 or doctor@careconnect.health"
          }
          leftIcon={
            portalType === "patient" ? <Mail className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />
          }
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-[#1F2937]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59] focus:outline-none focus:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your secure password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[#CBD5E1] text-[#0F766E] focus:ring-[#0F766E]/30"
              {...register("rememberMe")}
            />
            <span className="text-xs text-[#64748B]">Keep me signed in</span>
          </label>
        </div>

        <Button
          type="submit"
          id="login-submit-button"
          isLoading={isSubmitting}
          className={`w-full ${
            portalType === "staff" ? "bg-[#16324F] hover:bg-[#11273E]" : "bg-[#0F766E] hover:bg-[#0D655E]"
          }`}
        >
          {portalType === "patient" ? "Sign In to Patient Portal" : "Sign In to Staff Console"}
        </Button>
      </form>

      {/* Patient Google OAuth & Register Option */}
      {portalType === "patient" ? (
        <div className="space-y-4 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E2E8F0] w-full" />
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-[#94A3B8] font-medium absolute">
              or continue with
            </span>
          </div>

          <GoogleSignInButton />

          <div className="text-center text-xs text-[#64748B]">
            New patient at CareConnect?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#0F766E] hover:text-[#115E59] focus:outline-none focus:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      ) : (
        /* Staff Quick-Fill Demo Helpers */
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
            <KeyRound className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Demo Staff Accounts (Click to Auto-fill):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@careconnect.health", "Admin@12345")}
              className="text-[11px] font-medium py-1.5 px-2 bg-white hover:bg-slate-100 rounded-lg border border-[#CBD5E1] text-[#1E293B] transition-colors truncate"
              title="Super Admin: admin@careconnect.health"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("doctor.chen@careconnect.health", "Doctor@12345")}
              className="text-[11px] font-medium py-1.5 px-2 bg-white hover:bg-slate-100 rounded-lg border border-[#CBD5E1] text-[#1E293B] transition-colors truncate"
              title="Doctor: doctor.chen@careconnect.health"
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("receptionist@careconnect.health", "Recept@12345")}
              className="text-[11px] font-medium py-1.5 px-2 bg-white hover:bg-slate-100 rounded-lg border border-[#CBD5E1] text-[#1E293B] transition-colors truncate"
              title="Receptionist: receptionist@careconnect.health"
            >
              📋 Receptionist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
