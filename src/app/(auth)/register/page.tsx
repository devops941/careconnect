import { Metadata } from "next";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Patient Registration | CareConnect Hospital Portal",
  description: "Create your CareConnect patient account to book consultations and join digital clinic queues.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Create Patient Account"
        description="Register for digital appointments, clinic queue notifications, and secure health check-ins."
      >
        <RegisterForm />
      </AuthCard>
    </AuthLayout>
  );
}
