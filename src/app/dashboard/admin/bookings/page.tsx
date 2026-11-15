"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../../lib/axios";
// import axiosInstance from "@/lib/axios";

interface Booking {
  id: string;
  customer_id: string;
  technician_id: string | null;
  service_id: string;
  service_name: string;
  customer_name: string;
  technician_name: string | null;
  scheduled_at: string;
  address: string;
  description: string | null;
  status: string;
  total_price: number;
  created_at: string;
}

interface Technician {
  id: string;
  name: string;
  experience: number;
  address: string;
  is_available: boolean;
}

// Fonts load from Google Fonts via the @import line in globals.css.
const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";
const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";
const select =
  "w-full rounded-xl border border-[#1F3F46] bg-[#0D2227] px-4 py-3 text-white outline-none transition [color-scheme:dark] " +
  "focus:border-[#3DDBC0] focus:ring-4 focus:ring-[#3DDBC0]/15 sm:max-w-sm";

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
      <main className="mx-auto max-w-7xl px-6 py-14">{children}</main>
    </div>
  );
}

export default function AdminBookingsPage() {
  const reduce = useReducedMotion();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] =
    useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch bookings and verified technicians
  // (the skeleton only shows on first load, so the list doesn't flash after assigning)
  const fetchData = async () => {
    try {
      setError("");

      const [bookingResponse, technicianResponse] = await Promise.all([
        axiosInstance.get("/bookings"),
        axiosInstance.get("/technicians"),
      ]);

      setBookings(bookingResponse.data.data);
      setTechnicians(
        technicianResponse.data.data.filter(
          (technician: Technician) => technician.is_available
        )
      );
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError.response?.data?.message || "Failed to load booking information"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Success messages fade out on their own
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  // Assign technician
  const handleAssign = async (bookingId: string) => {
    const technicianId = selectedTechnicians[bookingId];

    if (!technicianId) {
      setError("Please select a technician first");
      return;
    }

    try {
      setAssigningId(bookingId);
      setError("");
      setSuccess("");

      const response = await axiosInstance.patch(
        `/bookings/${bookingId}/assign`,
        { technician_id: technicianId }
      );

      setSuccess(response.data.message || "Technician assigned successfully");

      // Refresh booking list
      await fetchData();

      setSelectedTechnicians((prev) => ({
        ...prev,
        [bookingId]: "",
      }));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError.response?.data?.message || "Failed to assign technician"
      );
    } finally {
      setAssigningId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return { badge: "bg-amber-400/10 text-amber-300", dot: "bg-amber-400" };
      case "accepted":
        return { badge: "bg-sky-400/10 text-sky-300", dot: "bg-sky-400" };
      case "in_progress":
        return { badge: "bg-violet-400/10 text-violet-300", dot: "bg-violet-400" };
      case "completed":
        return { badge: "bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" };
      case "rejected":
        return { badge: "bg-red-400/10 text-red-300", dot: "bg-red-400" };
      default:
        return { badge: "bg-white/10 text-slate-300", dot: "bg-slate-400" };
    }
  };

  if (loading) {
    return (
      <Shell>
        <div role="status" aria-label="Loading bookings" className="animate-pulse motion-reduce:animate-none">
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-[#0A2228]" />
            ))}
          </div>
          <div className="space-y-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-[#0A2228]" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  const stats = [
    { label: "Total bookings", value: bookings.length, color: "text-white" },
    { label: "Pending", value: bookings.filter((b) => b.status === "pending").length, color: "text-amber-300" },
    { label: "In progress", value: bookings.filter((b) => b.status === "in_progress").length, color: "text-violet-300" },
    { label: "Completed", value: bookings.filter((b) => b.status === "completed").length, color: "text-emerald-300" },
  ];

  return (
    <Shell>
      {/* Header */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className={`${display} text-4xl font-bold text-white sm:text-5xl`}>Booking management</h1>
        <p className="mt-3 text-lg text-slate-400">Manage customer bookings and assign technicians.</p>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", x: reduce ? 0 : [0, -8, 8, -5, 5, 0] }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            key="success"
            role="status"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-xl border border-[#3DDBC0]/30 bg-[#3DDBC0]/10 px-4 py-3 text-sm text-[#3DDBC0]"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics */}
      <motion.div
        variants={list}
        initial={reduce ? "show" : "hidden"}
        animate="show"
        className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={rise} className="rounded-2xl border border-white/10 bg-[#0A2228] p-6">
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className={`${display} mt-2 text-5xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Booking Cards */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-10 text-center text-slate-400">
          No bookings found.
        </div>
      ) : (
        <motion.ul
          variants={list}
          initial={reduce ? "show" : "hidden"}
          animate="show"
          className="space-y-5"
        >
          {bookings.map((booking) => {
            const s = getStatusStyle(booking.status);
            const busy = assigningId === booking.id;
            return (
              <motion.li
                key={booking.id}
                variants={rise}
                className="rounded-2xl border border-white/10 bg-[#0A2228] p-6 shadow-xl shadow-black/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className={`${display} text-xl font-bold text-white`}>{booking.service_name}</h2>
                    <p className="mt-1 break-all text-xs text-slate-500">Booking {booking.id}</p>
                  </div>

                  <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium capitalize ${s.badge}`}>
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    {booking.status.replaceAll("_", " ")}
                  </span>
                </div>

                <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-slate-500">Customer</dt>
                    <dd className="mt-0.5 font-medium text-slate-200">{booking.customer_name}</dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Technician</dt>
                    <dd className="mt-0.5 font-medium text-slate-200">
                      {booking.technician_name || "Not assigned"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Scheduled</dt>
                    <dd className="mt-0.5 font-medium text-slate-200">
                      {new Date(booking.scheduled_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Total price</dt>
                    <dd className={`${display} mt-0.5 text-lg font-bold text-[#3DDBC0]`}>
                      ৳{Number(booking.total_price).toLocaleString("en-BD")}
                    </dd>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <dt className="text-slate-500">Address</dt>
                    <dd className="mt-0.5 font-medium text-slate-200">{booking.address}</dd>
                  </div>

                  {booking.description && (
                    <div className="sm:col-span-2 lg:col-span-4">
                      <dt className="text-slate-500">Notes</dt>
                      <dd className="mt-0.5 text-slate-300">{booking.description}</dd>
                    </div>
                  )}
                </dl>

                {/* Assign Technician */}
                {booking.status === "pending" && (
                  <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
                    <select
                      aria-label={`Technician for booking ${booking.id}`}
                      value={selectedTechnicians[booking.id] || ""}
                      onChange={(e) =>
                        setSelectedTechnicians((prev) => ({
                          ...prev,
                          [booking.id]: e.target.value,
                        }))
                      }
                      className={select}
                    >
                      <option value="">
                        {technicians.length === 0 ? "No technicians available" : "Select a technician"}
                      </option>

                      {technicians.map((technician) => (
                        <option key={technician.id} value={technician.id}>
                          {technician.name} ({technician.experience} years)
                        </option>
                      ))}
                    </select>

                    <motion.button
                      onClick={() => handleAssign(booking.id)}
                      disabled={busy}
                      whileHover={reduce || busy ? undefined : { y: -2 }}
                      whileTap={reduce || busy ? undefined : { scale: 0.98 }}
                      className={`flex items-center justify-center gap-3 rounded-xl bg-[#3DDBC0] px-6 py-3 font-semibold text-[#04181C] transition-colors hover:bg-[#6AEAD3] disabled:cursor-not-allowed disabled:opacity-60 ${focus}`}
                    >
                      {busy && (
                        <motion.span
                          aria-hidden
                          className="h-4 w-4 rounded-full border-2 border-[#04181C]/30 border-t-[#04181C]"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      {busy ? "Assigning" : "Assign technician"}
                    </motion.button>
                  </div>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </Shell>
  );
}