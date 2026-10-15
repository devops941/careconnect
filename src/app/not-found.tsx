import Link from "next/link";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-sm space-y-5">
        <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full flex items-center justify-center mx-auto text-[#64748B]">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#16324F]">Page Not Found</h1>
          <p className="text-sm text-[#64748B]">
            The requested hospital page or resource could not be found. Please check the URL.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to CareConnect Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
