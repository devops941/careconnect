"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [errorMessage, setErrorMessage] = useState<string>(
    token ? "" : "No verification token found in URL."
  );

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(data.error?.message || "Verification token is invalid or expired.");
        }
      } catch {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage("Network error during verification. Please try again.");
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="text-center py-6 space-y-5">
      {status === "loading" && (
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#0F766E] mx-auto" />
          <h3 className="text-lg font-bold text-[#16324F]">Verifying your email...</h3>
          <p className="text-sm text-[#64748B]">
            Please hold on while we cryptographically validate your verification token.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="w-12 h-12 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full flex items-center justify-center mx-auto text-[#15803D]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#16324F]">Email successfully verified!</h3>
            <p className="text-sm text-[#64748B]">
              Your CareConnect patient account is activated. You can now access full appointment scheduling and digital check-ins.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full">Sign In to CareConnect</Button>
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="w-12 h-12 bg-[#FEF2F2] border border-[#FECACA] rounded-full flex items-center justify-center mx-auto text-[#B91C1C]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#16324F]">Verification Failed</h3>
            <p className="text-sm text-[#B91C1C]">{errorMessage}</p>
          </div>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Email Verification"
        description="CareConnect email confirmation and patient portal account activation."
      >
        <Suspense fallback={<div className="p-6 text-center text-sm text-[#64748B]">Loading token...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
