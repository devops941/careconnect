"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, User, ShieldCheck, Stethoscope, Lock, KeyRound, CheckCircle2, UserPlus, Loader2 } from "lucide-react";
import { loginSchema, LoginInput } from "@/features/auth/schemas/auth.schema";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { PasswordField } from "./PasswordField";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { FormError } from "./FormError";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [portalType, setPortalType] = useState<"patient" | "staff">("patient");

  const registeredSuccess = searchParams.get("registered") === "true";
  const initialEmail = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (initialEmail) {
      setValue("email", initialEmail, { shouldValidate: true });
    }
  }, [initialEmail, setValue]);

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
        if (data.error?.code === "ACCOUNT_NOT_FOUND") {
          setIsRedirecting(true);
          toast.error("User Not Found! Redirecting to Create Account page...");
          setFormError("User Not Found: No registered account found with this email. Redirecting to Create Account...");
          setTimeout(() => {
            router.push(`/register?email=${encodeURIComponent(values.email)}`);
          }, 1200);
          return;
        }

        setFormError(data.error?.message || "Invalid credentials. Please verify and try again.");
        return;
      }

      toast.success("Welcome back! Signing you in...");
      const target = portalType === "patient" || data.data?.user?.role === "PATIENT"
        ? "/patient/dashboard"
        : "/staff/dashboard";
      window.location.href = target;
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

      {registeredSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Account created successfully!</p>
            <p className="text-emerald-700 mt-0.5">You can now sign in with your email and password.</p>
          </div>
        </div>
      )}

      {isRedirecting && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800 animate-in fade-in">
          <Loader2 className="w-4 h-4 text-red-600 animate-spin shrink-0" />
          <div>
            <p className="font-semibold text-sm">User Not Found</p>
            <p className="text-red-700 mt-0.5">No registered account exists with this email. Redirecting to Create Account page...</p>
          </div>
        </div>
      )}

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

          {/* Patient Quick Auto-Fill */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
              <KeyRound className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Demo Patient (Click to Auto-fill):</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill("murugan@gmail.com", "Password123!")}
              className="w-full text-xs font-medium py-1.5 px-3 bg-white hover:bg-slate-100 rounded-lg border border-[#CBD5E1] text-[#1E293B] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0F766E]" />
                <span className="font-semibold">Murugan S</span>
              </div>
              <span className="text-slate-400 text-[11px]">murugan@gmail.com</span>
            </button>
          </div>
        </div>
      ) : (
        /* Staff Quick-Fill Demo Helpers */
        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
            <KeyRound className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Staff Quick Auto-fill (Click to Select):</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill("gokul@gmail.com", "Password123!")}
              className="text-xs font-medium py-1.5 px-2.5 bg-white hover:bg-emerald-50 rounded-lg border border-[#CBD5E1] hover:border-emerald-300 text-[#1E293B] transition-colors flex items-center justify-between"
              title="Dr. Gokul (General Medicine)"
            >
              <div className="flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">Dr. Gokul</span>
              </div>
              <span className="text-slate-400 text-[10px]">DOC-101</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("anitha@gmail.com", "Password123!")}
              className="text-xs font-medium py-1.5 px-2.5 bg-white hover:bg-sky-50 rounded-lg border border-[#CBD5E1] hover:border-sky-300 text-[#1E293B] transition-colors flex items-center justify-between"
              title="Nurse Anitha (Triage)"
            >
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span className="font-semibold text-sky-800">Nurse Anitha</span>
              </div>
              <span className="text-slate-400 text-[10px]">NUR-101</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("ramesh@gmail.com", "Password123!")}
              className="text-xs font-medium py-1.5 px-2.5 bg-white hover:bg-purple-50 rounded-lg border border-[#CBD5E1] hover:border-purple-300 text-[#1E293B] transition-colors flex items-center justify-between"
              title="Receptionist Ramesh"
            >
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-semibold text-purple-800">Reception</span>
              </div>
              <span className="text-slate-400 text-[10px]">REC-101</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("admin@gmail.com", "Admin@123")}
              className="text-xs font-medium py-1.5 px-2.5 bg-white hover:bg-slate-100 rounded-lg border border-[#CBD5E1] text-[#1E293B] transition-colors flex items-center justify-between"
              title="Super Admin"
            >
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                <span className="font-semibold">Super Admin</span>
              </div>
              <span className="text-slate-400 text-[10px]">Admin</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
