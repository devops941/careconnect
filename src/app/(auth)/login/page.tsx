import React, { Suspense } from "react";
import { Metadata } from "next";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | CareConnect Hospital Portal",
  description: "Sign in to CareConnect to access your hospital portal, medical appointments, and queues.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in with your registered credentials or Google account to access your CareConnect portal."
      >
        <Suspense fallback={<div className="py-8 text-center text-sm text-[#64748B]">Loading sign-in form...</div>}>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
