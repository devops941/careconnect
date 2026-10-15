import { NextRequest } from "next/server";
import { Patient } from "@/models/Patient";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

export async function GET(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const query: Record<string, any> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const patients = await Patient.find(query)
      .select("name email phone bloodGroup dateOfBirth gender status createdAt")
      .sort({ name: 1 })
      .limit(100)
      .lean();

    return sendSuccess(patients);
  } catch (err) {
    return handleApiError(err);
  }
}
