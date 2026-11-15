"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../../lib/axios";
// import axiosInstance from "@/lib/axios";

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  experience: number;
  address: string;
  bio: string | null;
  created_at: string;
}

// Fonts load from Google Fonts via the @import line in globals.css.
const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";
const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
      <main className="mx-auto max-w-7xl px-6 py-14">{children}</main>
    </div>
  );
}

export default function AdminTechniciansPage() {
  const reduce = useReducedMotion();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch pending technicians
  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/technicians/pending");

      setTechnicians(response.data.data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError.response?.data?.message ||
          "Failed to load pending technicians"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  // Success messages fade out on their own
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  // Verify technician
  const handleVerify = async (technicianId: string) => {
    try {
      setVerifyingId(technicianId);
      setError("");
      setSuccess("");

      const response = await axiosInstance.patch(
        `/technicians/${technicianId}/verify`
      );

      setSuccess(
        response.data.message || "Technician verified successfully"
      );

      // Remove verified technician from pending list
      setTechnicians((prev) =>
        prev.filter((technician) => technician.id !== technicianId)
      );
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError.response?.data?.message ||
          "Failed to verify technician"
      );
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div role="status" aria-label="Loading technicians" className="animate-pulse motion-reduce:animate-none">
          <div className="mb-10 h-28 w-full rounded-2xl bg-[#0A2228] sm:w-64" />
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-[#0A2228]" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Header */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className={`${display} text-4xl font-bold text-white sm:text-5xl`}>Technician verification</h1>
        <p className="mt-3 text-lg text-slate-400">
          Review technician profiles and approve qualified technicians.
        </p>
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
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        className="mb-12 w-full rounded-2xl border border-white/10 bg-[#0A2228] p-6 sm:w-64"
      >
        <p className="text-sm text-slate-400">Pending verification</p>
        <p className={`${display} mt-2 text-5xl font-bold text-amber-300`}>{technicians.length}</p>
      </motion.div>

      {/* Technician List */}
      {technicians.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-10 text-center">
          <h2 className={`${display} text-xl font-bold text-white`}>No pending technicians</h2>
          <p className="mt-2 text-slate-400">All technician profiles have been reviewed.</p>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {technicians.map((technician, i) => {
              const busy = verifyingId === technician.id;
              return (
                <motion.li
                  key={technician.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: Math.min(i, 8) * 0.06 }}
                  className="flex flex-col rounded-2xl border border-white/10 bg-[#0A2228] p-6 shadow-xl shadow-black/30"
                >
                  {/* Technician Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden
                        className={`${display} flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#102E35] text-xl font-bold text-[#3DDBC0]`}
                      >
                        {technician.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h2 className={`${display} text-xl font-bold text-white`}>{technician.name}</h2>
                        <p className="mt-0.5 text-sm text-slate-400">{technician.email}</p>
                      </div>
                    </div>

                    <span className="flex shrink-0 items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Pending
                    </span>
                  </div>

                  {/* Details */}
                  <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Phone</dt>
                      <dd className="mt-0.5 font-medium text-slate-200">{technician.phone || "Not provided"}</dd>
                    </div>

                    <div>
                      <dt className="text-slate-500">Experience</dt>
                      <dd className="mt-0.5 font-medium text-slate-200">{technician.experience} years</dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">Address</dt>
                      <dd className="mt-0.5 font-medium text-slate-200">{technician.address}</dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">Bio</dt>
                      <dd className="mt-0.5 text-slate-300">{technician.bio || "No bio provided"}</dd>
                    </div>

                    <div>
                      <dt className="text-slate-500">Applied</dt>
                      <dd className="mt-0.5 font-medium text-slate-200">
                        {new Date(technician.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </dd>
                    </div>
                  </dl>

                  {/* Verify Button */}
                  <motion.button
                    onClick={() => handleVerify(technician.id)}
                    disabled={busy}
                    whileHover={reduce || busy ? undefined : { y: -2 }}
                    whileTap={reduce || busy ? undefined : { scale: 0.98 }}
                    className={`mt-auto flex w-full items-center justify-center gap-3 rounded-xl bg-[#3DDBC0] px-5 py-3 font-semibold text-[#04181C] shadow-lg shadow-[#3DDBC0]/20 transition-colors hover:bg-[#6AEAD3] disabled:cursor-not-allowed disabled:opacity-60 ${focus}`}
                  >
                    {busy && (
                      <motion.span
                        aria-hidden
                        className="h-4 w-4 rounded-full border-2 border-[#04181C]/30 border-t-[#04181C]"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    {busy ? "Verifying" : "Verify technician"}
                  </motion.button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </Shell>
  );
}