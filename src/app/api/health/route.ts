import { appointmentStorageHealth } from "@/server/appointments/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const storage = await appointmentStorageHealth();
    return Response.json(
      {
        status: storage.ready ? "ready" : "not-ready",
        storage: storage.storage,
      },
      {
        status: storage.ready ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Health check failed", { error });
    return Response.json(
      { status: "not-ready" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
