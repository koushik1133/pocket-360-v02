import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { listAppointments } from "@/server/appointments/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyAdminAuth(request: NextRequest): boolean {
  const pinHeader = request.headers.get("x-admin-pin");
  const authHeader = request.headers.get("authorization");
  const bearerPin = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const cookiePin = request.cookies.get("admin_pin")?.value;

  const candidate = pinHeader || bearerPin || cookiePin;
  return candidate === env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid admin password." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const appointments = await listAppointments();
  const format = request.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const headers = [
      "ID",
      "Created At",
      "Package / Service",
      "Event Date",
      "Call Window / Time",
      "Client Name",
      "Phone",
      "Email",
      "Country",
      "State",
      "City",
      "Venue",
      "Project Details",
      "Status",
    ];

    const escapeCsv = (val: string | undefined | null) => {
      const text = String(val ?? "").replace(/"/g, '""');
      return `"${text}"`;
    };

    const rows = appointments.map((apt) => [
      escapeCsv(apt.id),
      escapeCsv(apt.createdAt),
      escapeCsv(apt.packageType || apt.service),
      escapeCsv(apt.date),
      escapeCsv(apt.preferredTimeToCall || apt.time),
      escapeCsv(apt.name),
      escapeCsv(apt.phone),
      escapeCsv(apt.email),
      escapeCsv(apt.country),
      escapeCsv(apt.state),
      escapeCsv(apt.city),
      escapeCsv(apt.locationVenue),
      escapeCsv(apt.eventDetails || apt.projectDetails),
      escapeCsv(apt.status),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pocket-reels-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    { ok: true, count: appointments.length, appointments },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { pin?: string } | null;
  const pin = body?.pin?.trim();

  if (pin === env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ ok: true, message: "Authenticated" });
    response.cookies.set("admin_pin", pin, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json(
    { ok: false, error: "Invalid password PIN. Please try again." },
    { status: 401 },
  );
}
