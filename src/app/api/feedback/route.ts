import { NextRequest } from "next/server";
import { z } from "zod";
import { Feedback } from "@/models/Feedback";
import { Doctor } from "@/models/Doctor";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const createFeedbackSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  rating: z.number().min(1).max(5),
  waitingTimeRating: z.number().min(1).max(5).default(5),
  cleanlinessRating: z.number().min(1).max(5).default(5),
  comments: z.string().min(2, "Comments are required").max(500),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    const query: Record<string, any> = { status: "PUBLISHED" };
    if (doctorId) query.doctorId = doctorId;

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return sendSuccess(feedbacks);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = createFeedbackSchema.parse(body);

    const doc = await Doctor.findById(validated.doctorId);

    const feedback = await Feedback.create({
      ...validated,
      patientId: identity.id,
      patientName: identity.name || "Anonymous Patient",
      doctorName: doc?.name || "Specialist Doctor",
      departmentName: doc?.departmentName || doc?.specialization,
      status: "PUBLISHED",
    });

    return sendSuccess(feedback, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
