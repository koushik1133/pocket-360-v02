import { getSystemStatus } from "@/server/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public liveness probe (used by the Docker HEALTHCHECK and uptime monitors).
 * Returns the storage kind only; the full configuration report lives behind
 * the admin PIN at /api/admin/status.
 */
export async function GET() {
  try {
    const status = await getSystemStatus();
    return Response.json(
      {
        status: status.storage.ready ? "ready" : "not-ready",
        storage: status.storage.kind,
        durable: status.storage.durable,
        email: status.email.transport,
      },
      {
        status: status.storage.ready ? 200 : 503,
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
