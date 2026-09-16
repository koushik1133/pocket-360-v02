"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  MailIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/icons";
import {
  approveDraft,
  denyDraft,
  denyReasons,
  referenceCode,
  type DenyReasonId,
} from "@/lib/email-templates";

type Status = "pending" | "confirmed" | "cancelled" | "completed";

type AppointmentRecord = {
  id: string;
  service: string;
  packageType: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  state: string;
  city: string;
  locationVenue: string;
  preferredTimeToCall: string;
  eventDetails: string;
  projectDetails: string;
  status: Status;
  createdAt: string;
};

type SystemStatus = {
  ok: boolean;
  environment: string;
  siteUrl: string;
  storage: {
    kind: string;
    ready: boolean;
    durable: boolean;
    schemaUpToDate: boolean | null;
    note: string;
  };
  email: {
    transport: string;
    canEmailClients: boolean;
    sender: string | null;
    notify: string | null;
    note: string;
  };
  assistant: { configured: boolean; model: string };
  problems: string[];
};

type Composer = {
  appointment: AppointmentRecord;
  decision: "approve" | "deny";
  reason: DenyReasonId;
  subject: string;
  body: string;
};

const STATUS_OPTIONS: Status[] = ["pending", "confirmed", "completed", "cancelled"];

const statusTone: Record<Status, string> = {
  confirmed: "bg-emerald-950/60 text-emerald-300 border-emerald-700/40",
  pending: "bg-amber-950/60 text-amber-300 border-amber-700/40",
  cancelled: "bg-red-950/40 text-red-300 border-red-800/40",
  completed: "bg-white/10 text-white/70 border-white/15",
};

function waLink(apt: AppointmentRecord) {
  const ref = referenceCode(apt.id);
  return `https://wa.me/${apt.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Hi ${apt.name}, this is Pocket Reels 360 regarding your booking enquiry [${ref}] for ${apt.packageType || "our production"}.`,
  )}`;
}

function mailLink(apt: AppointmentRecord) {
  const ref = referenceCode(apt.id);
  return `mailto:${apt.email}?subject=${encodeURIComponent(
    `[${ref}] Pocket Reels 360 Booking: ${apt.packageType || "Production"}`,
  )}`;
}

export default function AdminDashboardPage() {
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<AppointmentRecord | null>(null);
  const [mountedTime, setMountedTime] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [showSystem, setShowSystem] = useState(false);
  const [composer, setComposer] = useState<Composer | null>(null);
  const [sending, setSending] = useState(false);

  // ─── Data ──────────────────────────────────────────────────────────────────

  const fetchSystem = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/status", { cache: "no-store" });
      if (res.ok) setSystem((await res.json()) as SystemStatus);
    } catch {
      /* status panel is best-effort */
    }
  }, []);

  // Session auth is an httpOnly cookie set by POST /api/admin/appointments.
  const fetchBookings = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/appointments", { cache: "no-store" });
      if (res.status === 401 || res.status === 429) {
        setIsAuthenticated(false);
        return false;
      }
      if (!res.ok) {
        setActionError("Bookings could not be loaded. Refresh to try again.");
        return false;
      }
      const data = (await res.json()) as { appointments?: AppointmentRecord[] };
      setAppointments(data.appointments || []);
      setIsAuthenticated(true);
      void fetchSystem();
      return true;
    } catch {
      setActionError("Failed to reach the server. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSystem]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedTime(Date.now());
      void fetchBookings().finally(() => setCheckingSession(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setAuthError(
          body?.error ||
            (res.status === 429
              ? "Too many attempts. Wait a few minutes and try again."
              : "Incorrect PIN. Check with the crew lead for access."),
        );
        return;
      }
      setPin("");
      await fetchBookings();
    } catch {
      setAuthError("Failed to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    void fetch("/api/admin/appointments", { method: "DELETE" }).catch(() => undefined);
    setIsAuthenticated(false);
    setAppointments([]);
    setPin("");
  };

  const applyUpdate = (updated: AppointmentRecord) => {
    setAppointments((current) =>
      current.map((apt) => (apt.id === updated.id ? { ...apt, ...updated } : apt)),
    );
    setSelectedBooking((current) =>
      current && current.id === updated.id ? { ...current, ...updated } : current,
    );
  };

  const updateStatus = async (id: string, status: Status) => {
    setUpdatingId(id);
    setActionError("");
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const body = (await res.json().catch(() => null)) as
        | { appointment?: AppointmentRecord; error?: string }
        | null;
      if (!res.ok || !body?.appointment) throw new Error(body?.error || "Status update failed");
      applyUpdate(body.appointment);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadCsv = async () => {
    setActionError("");
    try {
      const res = await fetch("/api/admin/appointments?format=csv");
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `pocket-reels-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setActionError("The CSV export could not be downloaded. Try again.");
    }
  };

  // ─── Approve / deny composer ───────────────────────────────────────────────

  const openComposer = (appointment: AppointmentRecord, decision: "approve" | "deny") => {
    const reason: DenyReasonId = "no-coverage";
    const draft =
      decision === "approve" ? approveDraft(appointment) : denyDraft(appointment, reason);
    setComposer({ appointment, decision, reason, ...draft });
    setActionError("");
    setNotice("");
  };

  const changeReason = (reason: DenyReasonId) => {
    setComposer((current) =>
      current ? { ...current, reason, ...denyDraft(current.appointment, reason) } : current,
    );
  };

  const sendDecision = async () => {
    if (!composer) return;
    setSending(true);
    setActionError("");
    try {
      const res = await fetch("/api/admin/appointments/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: composer.appointment.id,
          decision: composer.decision,
          subject: composer.subject,
          body: composer.body,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; appointment?: AppointmentRecord; error?: string; warning?: string }
        | null;
      if (!res.ok && res.status !== 207) {
        throw new Error(body?.error || "The email could not be sent.");
      }
      if (body?.appointment) applyUpdate(body.appointment);
      setNotice(
        body?.warning ||
          `${composer.decision === "approve" ? "Approval" : "Decline"} email sent to ${composer.appointment.email}.`,
      );
      setComposer(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The email could not be sent.");
    } finally {
      setSending(false);
    }
  };

  // ─── Derived ───────────────────────────────────────────────────────────────

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return appointments.filter((apt) => {
      const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
      const haystack = [
        apt.name,
        apt.email,
        apt.phone,
        apt.packageType,
        apt.city,
        apt.locationVenue,
        apt.eventDetails,
        referenceCode(apt.id),
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [appointments, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const pending = appointments.filter((a) => a.status === "pending").length;
    const confirmed = appointments.filter((a) => a.status === "confirmed").length;
    const next30Days = mountedTime
      ? appointments.filter((a) => {
          if (!a.date || a.status === "cancelled") return false;
          const diff = (new Date(a.date).getTime() - mountedTime) / (1000 * 3600 * 24);
          return diff >= 0 && diff <= 30;
        }).length
      : 0;
    return { total: appointments.length, pending, confirmed, next30Days };
  }, [appointments, mountedTime]);

  // ─── Login ─────────────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#181615] border border-white/15 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="eyebrow text-accent font-semibold tracking-wider text-xs">
              CREW PORTAL
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Pocket Reels 360 Admin
          </h1>
          <p className="text-xs text-white/60 mb-6 leading-relaxed">
            Enter your admin access PIN to view and respond to client booking enquiries.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="admin-pin"
                className="block text-xs font-mono uppercase text-white/70 mb-2"
              >
                Access PIN / Password
              </label>
              <input
                id="admin-pin"
                type="password"
                maxLength={64}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter access PIN"
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white font-mono text-lg tracking-widest focus:outline-hidden focus:border-accent"
                autoFocus
              />
            </div>

            {authError ? (
              <p
                role="alert"
                className="text-xs text-red-300 bg-red-950/40 p-2.5 rounded-lg border border-red-800/40 font-mono"
              >
                {authError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || checkingSession || !pin}
              className="w-full py-3.5 px-6 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating…" : checkingSession ? "Checking session…" : "Unlock Dashboard"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeftIcon size={14} /> Back to site
            </Link>
            <span>v1.1 · Phase 1</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d0c0c] text-white flex flex-col">
      <header className="border-b border-white/10 bg-[#141211]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="View Website"
            >
              <ArrowLeftIcon size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    system ? (system.ok ? "bg-emerald-500" : "bg-amber-400 animate-pulse") : "bg-white/30"
                  }`}
                />
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  <span className="hidden sm:inline">Pocket Reels 360 · </span>Bookings Manager
                </h1>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">
                Dallas, NYC, Chicago, Charlotte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowSystem((open) => !open)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                system && !system.ok
                  ? "bg-amber-950/40 border-amber-700/40 text-amber-200"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }`}
              aria-expanded={showSystem}
            >
              System{system && !system.ok ? ` · ${system.problems.length}` : ""}
            </button>
            <button
              type="button"
              onClick={() => void downloadCsv()}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer border border-white/10"
            >
              <DownloadIcon size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => void fetchBookings()}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80 transition-colors cursor-pointer"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-white/40 hover:text-white/80 transition-colors px-2 py-1"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-4 sm:gap-6">
        {actionError ? (
          <p role="alert" className="text-xs text-red-300 bg-red-950/40 p-3 rounded-xl border border-red-800/40">
            {actionError}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="text-xs text-emerald-200 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            {notice}
          </p>
        ) : null}

        {/* ─── System status ─── */}
        {showSystem && system ? (
          <section className="p-4 sm:p-5 rounded-2xl bg-[#181615] border border-white/10 text-xs" aria-label="System status">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white text-sm">System status · {system.environment}</h2>
              <span className="text-white/40 font-mono">{system.siteUrl}</span>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <dt className="uppercase font-mono text-[10px] text-white/50">Database</dt>
                <dd className="mt-1 text-white font-semibold">
                  {system.storage.kind}
                  {system.storage.durable ? "" : " · not durable"}
                  {system.storage.schemaUpToDate === false ? " · needs migration 002" : ""}
                </dd>
                <dd className="mt-1 text-white/60 leading-relaxed">{system.storage.note}</dd>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <dt className="uppercase font-mono text-[10px] text-white/50">Email</dt>
                <dd className="mt-1 text-white font-semibold">
                  {system.email.transport}
                  {system.email.canEmailClients ? " · can email clients" : " · internal only"}
                </dd>
                <dd className="mt-1 text-white/60 leading-relaxed">
                  {system.email.note}
                  {system.email.notify ? ` Alerts go to ${system.email.notify}.` : ""}
                </dd>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <dt className="uppercase font-mono text-[10px] text-white/50">AI assistant</dt>
                <dd className="mt-1 text-white font-semibold">
                  {system.assistant.configured ? `Groq · ${system.assistant.model}` : "Knowledge base only"}
                </dd>
              </div>
            </dl>
            {system.problems.length ? (
              <ul className="mt-3 flex flex-col gap-1.5 text-amber-200">
                {system.problems.map((problem) => (
                  <li key={problem} className="flex gap-2">
                    <span aria-hidden="true">⚠</span>
                    {problem}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-emerald-300">Everything is configured for production.</p>
            )}
          </section>
        ) : null}

        {/* ─── Metrics ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ["Total Enquiries", stats.total, "text-white"],
            ["Pending Review", stats.pending, "text-amber-400"],
            ["Confirmed Shoots", stats.confirmed, "text-emerald-400"],
            ["Next 30 Days", stats.next30Days, "text-accent"],
          ].map(([label, value, tone]) => (
            <div key={String(label)} className="p-4 sm:p-5 rounded-2xl bg-[#181615] border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">{label}</span>
              <p className={`text-3xl font-bold mt-1 ${tone}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ─── Filters ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#181615] border border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-[260px] bg-black/40 border border-white/15 rounded-xl px-3 py-2">
            <SearchIcon size={16} className="text-white/40" />
            <input
              type="text"
              placeholder="Search by client, email, phone, city, reference, or package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-hidden"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-white/40 hover:text-white"
                aria-label="Clear search"
              >
                <CloseIcon size={14} />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {["all", ...STATUS_OPTIONS].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? "bg-accent text-white font-semibold"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ─── List ─── */}
        <div className="bg-[#181615] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-white/50 text-sm">Loading booking enquiries…</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-white/50 text-sm">
              {appointments.length === 0
                ? "No booking enquiries yet. New submissions from /book appear here."
                : "No booking enquiries match your criteria."}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/60 uppercase tracking-wider font-mono text-[10px]">
                      <th className="p-4">Ref &amp; Date</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Package</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Respond</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 font-mono">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(apt)}
                            className="inline-block px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/90 text-[10px] font-semibold tracking-wider mb-1"
                          >
                            {referenceCode(apt.id)}
                          </button>
                          <strong className="text-white block text-sm">{apt.date}</strong>
                          <span className="text-white/50 text-[11px]">{apt.preferredTimeToCall || apt.time}</span>
                        </td>
                        <td className="p-4">
                          <strong className="text-white block font-medium">{apt.name}</strong>
                          <span className="text-white/60 block text-[11px]">{apt.phone}</span>
                          <span className="text-white/40 block text-[11px]">{apt.email}</span>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-accent/20 border border-accent/40 text-accent-soft font-semibold text-[11px]">
                            {apt.packageType || apt.service}
                          </span>
                        </td>
                        <td className="p-4 text-white/80">
                          <span className="block font-medium">{apt.locationVenue || "Venue TBD"}</span>
                          <span className="text-white/50 text-[11px]">
                            {[apt.city, apt.state, apt.country].filter(Boolean).join(", ") || "United States"}
                          </span>
                        </td>
                        <td className="p-4">
                          <label className="sr-only" htmlFor={`status-${apt.id}`}>
                            Status for {apt.name}
                          </label>
                          <select
                            id={`status-${apt.id}`}
                            value={apt.status}
                            disabled={updatingId === apt.id}
                            onChange={(e) => void updateStatus(apt.id, e.target.value as Status)}
                            className={`admin-status-select ${statusTone[apt.status]}`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {apt.status === "pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openComposer(apt, "approve")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                                >
                                  <CheckIcon size={12} /> Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openComposer(apt, "deny")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-900/50 text-white/80 hover:text-white text-[11px] font-semibold transition-colors border border-white/10"
                                >
                                  <CloseIcon size={12} /> Deny
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedBooking(apt)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[11px] font-semibold border border-white/10"
                              >
                                Details
                              </button>
                            )}
                            <a
                              href={waLink(apt)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 transition-colors"
                              title="Chat on WhatsApp"
                              aria-label={`WhatsApp ${apt.name}`}
                            >
                              <WhatsAppIcon size={14} />
                            </a>
                            <a
                              href={mailLink(apt)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                              title="Send Email"
                              aria-label={`Email ${apt.name}`}
                            >
                              <MailIcon size={14} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-white/5">
                {filteredAppointments.map((apt) => (
                  <div key={apt.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[9px] font-semibold">
                          {referenceCode(apt.id)}
                        </span>
                        <strong className="text-white block font-medium text-sm mt-1">{apt.name}</strong>
                        <span className="text-white/50 text-[11px] block">{apt.phone}</span>
                        <span className="text-white/40 text-[11px] block">{apt.email}</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${statusTone[apt.status]}`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-white/60">
                      <span className="font-mono text-white/80">{apt.date}</span>
                      <span>·</span>
                      <span>{apt.preferredTimeToCall || apt.time}</span>
                      {apt.city ? (
                        <>
                          <span>·</span>
                          <span>{apt.city}</span>
                        </>
                      ) : null}
                    </div>
                    <span className="inline-block px-2.5 py-1 rounded-md bg-accent/20 border border-accent/40 text-accent-soft font-semibold text-[10px] mb-3">
                      {apt.packageType || apt.service}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {apt.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openComposer(apt, "approve")}
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openComposer(apt, "deny")}
                            className="px-3 py-2 rounded-lg bg-white/10 text-white/80 text-[11px] font-semibold border border-white/10"
                          >
                            Deny
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(apt)}
                        className="px-3 py-2 rounded-lg bg-white/5 text-white/70 text-[11px] font-semibold border border-white/10"
                      >
                        Details
                      </button>
                      <a
                        href={waLink(apt)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-emerald-900/30 text-emerald-400 border border-emerald-800/40"
                        aria-label={`WhatsApp ${apt.name}`}
                      >
                        <WhatsAppIcon size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Details modal ─── */}
      {selectedBooking ? (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-details-title"
        >
          <div className="bg-[#181615] border border-white/15 rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[85dvh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <h3 id="booking-details-title" className="text-lg font-bold text-white">
                  Booking Details
                </h3>
                <span className="px-2 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-mono text-xs font-semibold">
                  {referenceCode(selectedBooking.id)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-white/60 hover:text-white p-1"
                aria-label="Close details"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-xs">
              {[
                ["Client Name", selectedBooking.name],
                ["Package", selectedBooking.packageType || selectedBooking.service],
                ["Event Date", selectedBooking.date],
                ["Call Window", selectedBooking.preferredTimeToCall || selectedBooking.time],
                ["Phone", selectedBooking.phone],
                ["Email", selectedBooking.email],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-white/50 uppercase font-mono text-[10px]">{label}</dt>
                  <dd className="text-sm text-white mt-1 break-words">{value}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <dt className="text-white/50 uppercase font-mono text-[10px]">Location &amp; Venue</dt>
                <dd className="text-white mt-1">
                  {[selectedBooking.locationVenue, selectedBooking.city, selectedBooking.state, selectedBooking.country]
                    .filter(Boolean)
                    .join(", ") || "Not provided"}
                </dd>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/10">
                <dt className="text-white/50 uppercase font-mono text-[10px] mb-1">Event details</dt>
                <dd className="text-white/80 whitespace-pre-wrap bg-black/40 p-3.5 rounded-xl border border-white/10 text-xs leading-relaxed">
                  {selectedBooking.eventDetails || selectedBooking.projectDetails || "Standard booking enquiry"}
                </dd>
              </div>
              <div className="col-span-2 text-white/40 font-mono text-[10px]">
                ID: {selectedBooking.id} · Received {new Date(selectedBooking.createdAt).toLocaleString()}
              </div>
            </dl>
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openComposer(selectedBooking, "approve");
                    setSelectedBooking(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                >
                  Approve &amp; email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openComposer(selectedBooking, "deny");
                    setSelectedBooking(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-900/50 text-white/80 text-[11px] font-semibold border border-white/10"
                >
                  Deny &amp; email
                </button>
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={updatingId === selectedBooking.id || selectedBooking.status === option}
                    onClick={() => void updateStatus(selectedBooking.id, option)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-colors disabled:cursor-default ${
                      selectedBooking.status === option
                        ? "bg-accent text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {selectedBooking.status === option ? `✓ ${option}` : option}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── Approve / deny composer ─── */}
      {composer ? (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="composer-title"
        >
          <div className="bg-[#181615] border border-white/15 rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10 mb-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                  {composer.decision === "approve" ? "Approve booking" : "Decline booking"} · {referenceCode(composer.appointment.id)}
                </p>
                <h3 id="composer-title" className="text-lg font-bold text-white mt-1">
                  Email to {composer.appointment.name}
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  To: {composer.appointment.email} · Sent from{" "}
                  {system?.email.sender ?? "the configured sender"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComposer(null)}
                className="text-white/60 hover:text-white p-1"
                aria-label="Close composer"
                disabled={sending}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {system && !system.email.canEmailClients ? (
              <p className="mb-4 text-xs text-amber-200 bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
                {system.email.note}
              </p>
            ) : null}

            <div className="flex flex-col gap-4">
              {composer.decision === "deny" ? (
                <div>
                  <label htmlFor="deny-reason" className="block text-[10px] font-mono uppercase text-white/50 mb-1.5">
                    Reason (fills the template; edit freely below)
                  </label>
                  <select
                    id="deny-reason"
                    value={composer.reason}
                    onChange={(e) => changeReason(e.target.value as DenyReasonId)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:outline-hidden focus:border-accent"
                  >
                    {denyReasons.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label htmlFor="composer-subject" className="block text-[10px] font-mono uppercase text-white/50 mb-1.5">
                  Subject
                </label>
                <input
                  id="composer-subject"
                  value={composer.subject}
                  onChange={(e) => setComposer({ ...composer, subject: e.target.value })}
                  maxLength={200}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:outline-hidden focus:border-accent"
                />
              </div>

              <div>
                <label htmlFor="composer-body" className="block text-[10px] font-mono uppercase text-white/50 mb-1.5">
                  Message
                </label>
                <textarea
                  id="composer-body"
                  value={composer.body}
                  onChange={(e) => setComposer({ ...composer, body: e.target.value })}
                  rows={14}
                  maxLength={6000}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-sm leading-relaxed focus:outline-hidden focus:border-accent font-sans"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Plain text. Blank lines become paragraphs in the branded email.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-white/50">
                Sending marks the booking{" "}
                <strong className="text-white">{composer.decision === "approve" ? "confirmed" : "cancelled"}</strong>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComposer(null)}
                  disabled={sending}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void sendDecision()}
                  disabled={sending || composer.subject.trim().length < 3 || composer.body.trim().length < 10}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 ${
                    composer.decision === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-accent hover:bg-accent-dark"
                  }`}
                >
                  <MailIcon size={14} />
                  {sending ? "Sending…" : composer.decision === "approve" ? "Send approval" : "Send decline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
