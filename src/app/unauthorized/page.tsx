import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-sm space-y-5">
        <div className="w-14 h-14 bg-[#FEF2F2] border border-[#FECACA] rounded-full flex items-center justify-center mx-auto text-[#B91C1C]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#16324F]">Access Denied</h1>
          <p className="text-sm text-[#64748B]">
            You do not possess the required hospital role or permissions to view this resource.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
