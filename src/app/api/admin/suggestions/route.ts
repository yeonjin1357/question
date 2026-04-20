import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { listSuggestionsByStatus } from "@/lib/db/queries/admin";
import { errorResponse } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

const statusSchema = z.enum(["pending", "approved", "rejected"]).default("pending");

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = statusSchema.safeParse(url.searchParams.get("status") ?? "pending");
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid status filter.");
  }
  const items = await listSuggestionsByStatus(parsed.data);
  return NextResponse.json({ data: { items } });
}
