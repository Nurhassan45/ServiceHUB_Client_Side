
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axiosInstance from "../../../../../lib/axios";

export default function CreateTechnicianProfile() {
  const router = useRouter();

  const [experience, setExperience] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (experience !== "" && Number(experience) < 0) {
      setError("Experience cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post("/technicians/profile", {
        experience: Number(experience) || 0,
        address: address.trim(),
        bio: bio.trim(),
      });

      setSuccess(
        response.data.message ||
          "Profile created successfully. Waiting for admin verification."
      );

      setTimeout(() => {
        router.push("/dashboard/technician");
      }, 1800);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create technician profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061418] px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#17434A] bg-[#0A2228] p-6 shadow-xl sm:p-9"
        >
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#3DDBC0]">
              Technician Registration
            </p>

            <h1 className="text-3xl font-bold">
              Create Your Technician Profile
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Complete your professional information to start offering
              services through ServiceHub.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Years of Experience
              </label>

              <input
                type="number"
                min="0"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-lg border border-[#24515A] bg-[#061418] px-4 py-3 outline-none transition focus:border-[#3DDBC0]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Professional Address *
              </label>

              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your working area or address"
                className="w-full rounded-lg border border-[#24515A] bg-[#061418] px-4 py-3 outline-none transition focus:border-[#3DDBC0]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Professional Bio
              </label>

              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your skills and professional experience..."
                className="w-full rounded-lg border border-[#24515A] bg-[#061418] px-4 py-3 outline-none transition focus:border-[#3DDBC0]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#3DDBC0] px-5 py-3 font-bold text-[#061418] transition hover:bg-[#2bc5aa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating Profile..." : "Create Technician Profile"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-500">
            Your profile will be submitted for admin verification.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
