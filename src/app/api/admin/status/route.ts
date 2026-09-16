import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/server/admin-auth";
import { getSystemStatus } from "@/server/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Full (non-secret) configuration report for the admin "System" panel. */
export async function GET(request: NextRequest) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return auth.response;

  const status = await getSystemStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
