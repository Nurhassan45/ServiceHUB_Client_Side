"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../../lib/axios";
// import axiosInstance from "@/lib/axios";

interface TechnicianProfile {
  id: string;
  user_id: string;
  experience: number;
  address: string;
  bio: string | null;
  is_verified: boolean;
  is_available: boolean;
}

type ApiError = { response?: { data?: { message?: string } } };

// Fonts load from Google Fonts via the @import line in globals.css.
const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";
const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";
const field =
  "w-full rounded-xl border border-[#1F3F46] bg-[#0D2227] px-4 py-3.5 text-white " +
  "placeholder:text-slate-500 outline-none transition [color-scheme:dark] " +
  "focus:border-[#3DDBC0] focus:ring-4 focus:ring-[#3DDBC0]/15";
const label = "block text-sm font-medium text-slate-300";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
      <main className="mx-auto max-w-2xl px-6 py-14">{children}</main>
    </div>
  );
}

export default function TechnicianProfilePage() {
  const reduce = useReducedMotion();

  const [profile, setProfile] = useState<TechnicianProfile | null>(null);

  const [experience, setExperience] = useState("0");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/technicians/me");

      const data: TechnicianProfile = response.data.data;

      setProfile(data);
      setExperience(String(data.experience));
      setAddress(data.address);
      setBio(data.bio || "");
      setIsAvailable(data.is_available);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Success messages fade out on their own
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  // Update profile
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const experienceNumber = Number(experience);

    if (
      !Number.isInteger(experienceNumber) ||
      experienceNumber < 0
    ) {
      setError("Experience must be a valid non-negative number");
      return;
    }

    if (!address.trim()) {
      setError("Address is required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axiosInstance.patch("/technicians/me", {
        experience: experienceNumber,
        address: address.trim(),
        bio: bio.trim(),
        is_available: isAvailable,
      });

      setProfile(response.data.data);
      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div role="status" aria-label="Loading profile" className="animate-pulse motion-reduce:animate-none">
          <div className="mb-8 h-12 w-2/3 rounded-xl bg-[#0A2228]" />
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="h-24 rounded-2xl bg-[#0A2228]" />
            <div className="h-24 rounded-2xl bg-[#0A2228]" />
          </div>
          <div className="h-64 rounded-3xl bg-[#0A2228]" />
        </div>
      </Shell>
    );
  }

  if (!profile) {
    return (
      <Shell>
        <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-8 text-center">
          <p className="text-red-300">{error || "Technician profile not found."}</p>
          <p className="mt-2 text-sm text-slate-400">Please create your technician profile first.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <h1 className={`${display} text-4xl font-bold text-white sm:text-5xl`}>My technician profile</h1>

        {!editing && (
          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setEditing(true);
            }}
            className={`rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10 ${focus}`}
          >
            Edit profile
          </button>
        )}
      </motion.div>

      {/* Status */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-5">
          <p className="text-sm text-slate-400">Verification status</p>
          <span
            className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
              profile.is_verified ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${profile.is_verified ? "bg-emerald-400" : "bg-amber-400"}`} />
            {profile.is_verified ? "Verified" : "Pending"}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-5">
          <p className="text-sm text-slate-400">Availability</p>
          <span
            className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
              profile.is_available ? "bg-emerald-400/10 text-emerald-300" : "bg-white/10 text-slate-300"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${profile.is_available ? "bg-emerald-400" : "bg-slate-500"}`} />
            {profile.is_available ? "Available" : "Unavailable"}
          </span>
        </div>
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
            className="mt-6 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
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
            className="mt-6 overflow-hidden rounded-xl border border-[#3DDBC0]/30 bg-[#3DDBC0]/10 px-4 py-3 text-sm text-[#3DDBC0]"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View or edit */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#0A2228] p-7 shadow-xl shadow-black/30 md:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {editing ? (
            <motion.form
              key="edit"
              onSubmit={handleUpdate}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label htmlFor="experience" className={label}>Experience (years)</label>
                <input
                  id="experience"
                  type="number"
                  min="0"
                  step="1"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={field}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className={label}>Address</label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className={`${field} resize-none`}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className={label}>Professional bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className={`${field} resize-none`}
                />
              </div>

              {/* Availability switch */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#1F3F46] bg-[#0D2227] p-4">
                <div>
                  <p id="availability-label" className="font-medium text-white">Available for bookings</p>
                  <p className="text-sm text-slate-400">Allow customers to select you for new bookings.</p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isAvailable}
                  aria-labelledby="availability-label"
                  onClick={() => setIsAvailable((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    isAvailable ? "bg-[#3DDBC0]" : "bg-[#1F3F46]"
                  } ${focus}`}
                >
                  <motion.span
                    layout
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${isAvailable ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={reduce || submitting ? undefined : { y: -2 }}
                  whileTap={reduce || submitting ? undefined : { scale: 0.98 }}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-xl bg-[#3DDBC0] px-5 py-3.5 font-semibold text-[#04181C] shadow-lg shadow-[#3DDBC0]/20 transition-colors hover:bg-[#6AEAD3] disabled:cursor-not-allowed disabled:opacity-70 ${focus}`}
                >
                  {submitting && (
                    <motion.span
                      aria-hidden
                      className="h-4 w-4 rounded-full border-2 border-[#04181C]/30 border-t-[#04181C]"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {submitting ? "Saving" : "Save changes"}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setExperience(String(profile.experience));
                    setAddress(profile.address);
                    setBio(profile.bio || "");
                    setIsAvailable(profile.is_available);
                    setEditing(false);
                    setError("");
                  }}
                  className={`rounded-xl border border-white/15 px-5 py-3.5 font-semibold text-slate-200 transition-colors hover:bg-white/10 ${focus}`}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.dl
              key="view"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <dt className="text-sm text-slate-500">Experience</dt>
                <dd className={`${display} mt-1 text-2xl font-bold text-[#3DDBC0]`}>
                  {profile.experience} {profile.experience === 1 ? "year" : "years"}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-slate-500">Address</dt>
                <dd className="mt-1 font-medium text-slate-200">{profile.address}</dd>
              </div>

              <div>
                <dt className="text-sm text-slate-500">Professional bio</dt>
                <dd className="mt-1 leading-relaxed text-slate-300">{profile.bio || "No bio provided"}</dd>
              </div>
            </motion.dl>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}