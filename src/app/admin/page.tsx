"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DownloadIcon,
  MailIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/icons";

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
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] =
    useState<AppointmentRecord | null>(null);
  const [mountedTime, setMountedTime] = useState<number | null>(null);

  const fetchBookings = useCallback(
    async (pinToUse?: string) => {
      const activePin = pinToUse ?? pin;
      if (!activePin) return;

      setLoading(true);
      setAuthError("");

      try {
        const res = await fetch("/api/admin/appointments", {
          headers: { "x-admin-pin": activePin },
        });

        if (!res.ok) {
          setIsAuthenticated(false);
          setAuthError("Incorrect password PIN (default: 9912)");
          return;
        }

        const data = (await res.json()) as {
          appointments?: AppointmentRecord[];
        };
        setAppointments(data.appointments || []);
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("pr360_admin_pin", activePin);
        }
      } catch {
        setAuthError("Failed to reach the server. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [pin],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedTime(Date.now());
      const saved =
        typeof window !== "undefined"
          ? sessionStorage.getItem("pr360_admin_pin")
          : null;
      if (saved) {
        setPin(saved);
        void fetchBookings(saved);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    void fetchBookings(pin);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        apt.name.toLowerCase().includes(q) ||
        apt.email.toLowerCase().includes(q) ||
        apt.phone.toLowerCase().includes(q) ||
        (apt.packageType || "").toLowerCase().includes(q) ||
        (apt.city || "").toLowerCase().includes(q) ||
        (apt.locationVenue || "").toLowerCase().includes(q) ||
        (apt.eventDetails || "").toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const pending = appointments.filter((a) => a.status === "pending").length;
    const confirmed = appointments.filter(
      (a) => a.status === "confirmed",
    ).length;
    const next30Days = mountedTime
      ? appointments.filter((a) => {
          if (!a.date) return false;
          const diff =
            (new Date(a.date).getTime() - mountedTime) / (1000 * 3600 * 24);
          return diff >= 0 && diff <= 30;
        }).length
      : 0;

    return { total: appointments.length, pending, confirmed, next30Days };
  }, [appointments, mountedTime]);

  const downloadCsv = () => {
    const a = document.createElement("a");
    a.href = `/api/admin/appointments?format=csv&x-admin-pin=${encodeURIComponent(pin)}`;
    a.download = `pocket-reels-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-ink text-white flex flex-col items-center justify-center p-6">
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
            Enter your 4-digit admin access PIN to view client booking enquiries.
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
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (e.g. 9912)"
                className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white font-mono text-lg tracking-widest focus:outline-hidden focus:border-accent"
                autoFocus
              />
            </div>

            {authError ? (
              <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-800/40 font-mono">
                {authError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-3.5 px-6 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating…" : "Unlock Dashboard"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <Link
              href="/"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeftIcon size={14} /> Back to site
            </Link>
            <span>v1.0 · Phase 1</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0c0c] text-white flex flex-col">
      {/* ─── Top Header Bar ─── */}
      <header className="border-b border-white/10 bg-[#141211]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
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
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  <span className="hidden sm:inline">Pocket Reels 360 · </span>Bookings Manager
                </h1>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">
                Phase 1 Admin · Dallas, NYC, Chicago, Charlotte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer border border-white/10"
            >
              <DownloadIcon size={14} />
              Export CSV
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
              onClick={() => {
                sessionStorage.removeItem("pr360_admin_pin");
                setIsAuthenticated(false);
              }}
              className="text-xs text-white/40 hover:text-white/80 transition-colors px-2 py-1"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-4 sm:gap-6">
        {/* ─── Metrics Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181615] border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">
              Total Enquiries
            </span>
            <p className="text-3xl font-bold mt-1 text-white">
              {stats.total}
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181615] border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">
              Pending Review
            </span>
            <p className="text-3xl font-bold mt-1 text-amber-400">
              {stats.pending}
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181615] border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">
              Confirmed Shoots
            </span>
            <p className="text-3xl font-bold mt-1 text-emerald-400">
              {stats.confirmed}
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181615] border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-mono">
              Next 30 Days
            </span>
            <p className="text-3xl font-bold mt-1 text-accent">
              {stats.next30Days}
            </p>
          </div>
        </div>

        {/* ─── Filters & Search ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#181615] border border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-[260px] bg-black/40 border border-white/15 rounded-xl px-3 py-2">
            <SearchIcon size={16} className="text-white/40" />
            <input
              type="text"
              placeholder="Search by client, email, phone, city, or package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-hidden"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-white/40 hover:text-white"
              >
                ✕
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {["all", "pending", "confirmed", "completed"].map((tab) => (
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

        {/* ─── Table / Data List ─── */}
        <div className="bg-[#181615] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-white/50 text-sm">
              Loading booking enquiries…
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-white/50 text-sm">
              No booking enquiries match your criteria.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/60 uppercase tracking-wider font-mono text-[10px]">
                      <th className="p-4">Date &amp; Time</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Package</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAppointments.map((apt) => {
                      const waLink = `https://wa.me/${apt.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hi ${apt.name}, this is Pocket Reels 360 regarding your reel booking enquiry for ${apt.packageType || "our production"}.`)}`;
                      const mailLink = `mailto:${apt.email}?subject=${encodeURIComponent(`Pocket Reels 360 Booking: ${apt.packageType || "Production"}`)}`;

                      return (
                        <tr
                          key={apt.id}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="p-4 font-mono">
                            <strong className="text-white block text-sm">
                              {apt.date}
                            </strong>
                            <span className="text-white/50 text-[11px]">
                              {apt.preferredTimeToCall || apt.time}
                            </span>
                          </td>
                          <td className="p-4">
                            <strong className="text-white block font-medium">
                              {apt.name}
                            </strong>
                            <span className="text-white/60 block text-[11px]">
                              {apt.phone}
                            </span>
                            <span className="text-white/40 block text-[11px]">
                              {apt.email}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-accent/20 border border-accent/40 text-accent-soft font-semibold text-[11px]">
                              {apt.packageType || apt.service}
                            </span>
                          </td>
                          <td className="p-4 text-white/80">
                            <span className="block font-medium">
                              {apt.locationVenue || "Venue TBD"}
                            </span>
                            <span className="text-white/50 text-[11px]">
                              {[apt.city, apt.state, apt.country]
                                .filter(Boolean)
                                .join(", ") || "United States"}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs truncate text-white/70">
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(apt)}
                              className="text-left hover:text-white underline underline-offset-2 decoration-white/30"
                            >
                              {apt.eventDetails ||
                                apt.projectDetails ||
                                "No additional notes"}
                            </button>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                apt.status === "confirmed"
                                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-700/40"
                                  : apt.status === "pending"
                                    ? "bg-amber-950/60 text-amber-300 border border-amber-700/40"
                                    : "bg-white/10 text-white/60"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  apt.status === "confirmed"
                                    ? "bg-emerald-400"
                                    : apt.status === "pending"
                                      ? "bg-amber-400 animate-pulse"
                                      : "bg-white/40"
                                }`}
                              />
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <WhatsAppIcon size={14} />
                              </a>
                              <a
                                href={mailLink}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                                title="Send Email"
                              >
                                <MailIcon size={14} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-white/5">
                {filteredAppointments.map((apt) => {
                  const waLink = `https://wa.me/${apt.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hi ${apt.name}, this is Pocket Reels 360 regarding your reel booking enquiry for ${apt.packageType || "our production"}.`)}`;
                  const mailLink = `mailto:${apt.email}?subject=${encodeURIComponent(`Pocket Reels 360 Booking: ${apt.packageType || "Production"}`)}`;

                  return (
                    <div key={apt.id} className="p-4 hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <strong className="text-white block font-medium text-sm">{apt.name}</strong>
                          <span className="text-white/50 text-[11px] block">{apt.phone}</span>
                          <span className="text-white/40 text-[11px] block">{apt.email}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          apt.status === "confirmed" ? "bg-emerald-950/60 text-emerald-300 border border-emerald-700/40"
                          : apt.status === "pending" ? "bg-amber-950/60 text-amber-300 border border-amber-700/40"
                          : "bg-white/10 text-white/60"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            apt.status === "confirmed" ? "bg-emerald-400"
                            : apt.status === "pending" ? "bg-amber-400 animate-pulse"
                            : "bg-white/40"
                          }`} />
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-white/60">
                        <span className="font-mono text-white/80">{apt.date}</span>
                        <span>·</span>
                        <span>{apt.preferredTimeToCall || apt.time}</span>
                        {apt.city ? <><span>·</span><span>{apt.city}</span></> : null}
                      </div>
                      <span className="inline-block px-2.5 py-1 rounded-md bg-accent/20 border border-accent/40 text-accent-soft font-semibold text-[10px] mb-3">
                        {apt.packageType || apt.service}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(apt)}
                          className="text-[11px] text-white/60 hover:text-white underline underline-offset-2 decoration-white/30 text-left truncate max-w-[180px]"
                        >
                          {apt.eventDetails || apt.projectDetails || "View details"}
                        </button>
                        <div className="flex gap-2 shrink-0">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 transition-colors"
                          >
                            <WhatsAppIcon size={13} />
                          </a>
                          <a
                            href={mailLink}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 transition-colors"
                          >
                            <MailIcon size={13} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Details Modal ─── */}
      {selectedBooking ? (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181615] border border-white/15 rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[85dvh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white">Booking Details</h3>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-white/60 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-white/50 uppercase font-mono text-[10px]">
                  Client Name
                </dt>
                <dd className="text-sm font-semibold text-white mt-1">
                  {selectedBooking.name}
                </dd>
              </div>
              <div>
                <dt className="text-white/50 uppercase font-mono text-[10px]">
                  Package
                </dt>
                <dd className="text-sm font-semibold text-accent mt-1">
                  {selectedBooking.packageType || selectedBooking.service}
                </dd>
              </div>
              <div>
                <dt className="text-white/50 uppercase font-mono text-[10px]">
                  Event Date
                </dt>
                <dd className="text-white mt-1 font-mono">
                  {selectedBooking.date}
                </dd>
              </div>
              <div>
                <dt className="text-white/50 uppercase font-mono text-[10px]">
                  Call Window
                </dt>
                <dd className="text-white mt-1">
                  {selectedBooking.preferredTimeToCall || selectedBooking.time}
                </dd>
              </div>
              <div>
                <dt className="text-white/50 uppercase font-mono text-[10px]">
                  Phone
                </dt>
                <dd className="text-white mt-1 font-mono">
                  {selectedBooking.phone}
                </dd>
              </div>
              <div>
                <dt className="text-white/50 uppercase font-mono text-[10px]">
                  Email
                </dt>
                <dd className="text-white mt-1">{selectedBooking.email}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-white/50 uppercase font-mono text-[10px]">
                  Location &amp; Venue
                </dt>
                <dd className="text-white mt-1">
                  {[
                    selectedBooking.locationVenue,
                    selectedBooking.city,
                    selectedBooking.state,
                    selectedBooking.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/10">
                <dt className="text-white/50 uppercase font-mono text-[10px] mb-1">
                  Project Scope &amp; Deliverables
                </dt>
                <dd className="text-white/80 whitespace-pre-wrap bg-black/40 p-3.5 rounded-xl border border-white/10 text-xs leading-relaxed">
                  {selectedBooking.eventDetails ||
                    selectedBooking.projectDetails ||
                    "Standard booking enquiry"}
                </dd>
              </div>
              <div className="col-span-2 text-white/40 font-mono text-[10px]">
                Reference ID: {selectedBooking.id}
              </div>
            </dl>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
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
    </main>
  );
}
