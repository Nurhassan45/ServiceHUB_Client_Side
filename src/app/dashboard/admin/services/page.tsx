
"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axiosInstance from "../../../../lib/axios";

interface ServiceForm {
    name: string;
    description: string;
    base_price: string;
    image_url: string;
}

export default function AddServicePage() {
    const [form, setForm] = useState<ServiceForm>({
        name: "",
        description: "",
        base_price: "",
        image_url: "",
    });

    const [imagePreview, setImagePreview] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Upload image to ImgBB
    const handleImageUpload = async (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setError("");
        setSuccess("");

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            e.target.value = "";
            return;
        }

        if (file.size > 32 * 1024 * 1024) {
            setError("Image size must be less than 32 MB.");
            e.target.value = "";
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

        if (!apiKey) {
            setError("ImgBB API key is missing. Check your .env.local file.");
            e.target.value = "";
            return;
        }

        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        const localPreview = URL.createObjectURL(file);
        setImagePreview(localPreview);

        try {
            setUploadingImage(true);

            const formData = new FormData();
            formData.append("image", file);

            const uploadResponse = await fetch(
                `https://api.imgbb.com/1/upload?key=${apiKey}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await uploadResponse.json();

            if (!uploadResponse.ok || !result.success || !result.data?.url) {
                throw new Error(
                    result.error?.message || "Image upload failed."
                );
            }

            const imageUrl = result.data.url;

            setForm((prev) => ({
                ...prev,
                image_url: imageUrl,
            }));

            URL.revokeObjectURL(localPreview);
            setImagePreview(imageUrl);

        } catch (err: any) {
            setError(err.message || "Unable to upload image to ImgBB.");
            setForm((prev) => ({
                ...prev,
                image_url: "",
            }));
        } finally {
            setUploadingImage(false);
            e.target.value = "";
        }
    };

    const removeImage = () => {
        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview("");

        setForm((prev) => ({
            ...prev,
            image_url: "",
        }));
    };

    // Create service
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (uploadingImage) {
            setError("Please wait until the image upload finishes.");
            return;
        }

        if (!form.name.trim()) {
            setError("Service name is required.");
            return;
        }

        if (!form.base_price || Number(form.base_price) <= 0) {
            setError("Please enter a valid service price.");
            return;
        }

        try {
            setLoading(true);

            const serviceData = {
                name: form.name.trim(),
                description: form.description.trim(),
                base_price: Number(form.base_price),
                image_url: form.image_url,
            };

            const response = await axiosInstance.post(
                "/services",
                serviceData
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message || "Failed to create service."
                );
            }

            setSuccess("Service created successfully!");

            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }

            setForm({
                name: "",
                description: "",
                base_price: "",
                image_url: "",
            });

            setImagePreview("");

        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl">

            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#3DDBC0]">
                        Admin Dashboard
                    </p>

                    <h1 className="text-3xl font-black text-white">
                        Add New Service
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Create a new home service for your customers.
                    </p>
                </div>

                <Link
                    href="/dashboard/admin/services"
                    className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                >
                    Service Management
                </Link>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/10 bg-[#0A2228] p-6 shadow-xl sm:p-9"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Service Name */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Service Name *
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Example: Plumbing Service"
                            required
                            className="w-full rounded-xl border border-white/10 bg-[#061418] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-[#3DDBC0]"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Describe the service..."
                            className="w-full resize-none rounded-xl border border-white/10 bg-[#061418] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-[#3DDBC0]"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Base Price (৳) *
                        </label>

                        <input
                            type="number"
                            name="base_price"
                            value={form.base_price}
                            onChange={handleChange}
                            placeholder="Enter service price"
                            min="0.01"
                            step="0.01"
                            required
                            className="w-full rounded-xl border border-white/10 bg-[#061418] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-[#3DDBC0]"
                        />
                    </div>

                    {/* ImgBB Image Upload */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Service Image
                        </label>

                        <div className="rounded-2xl border border-dashed border-white/20 bg-[#061418] p-5">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                className="block w-full cursor-pointer text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-[#3DDBC0] file:px-4 file:py-2 file:font-bold file:text-[#04181C] hover:file:bg-[#6AEAD3] disabled:opacity-50"
                            />

                            <p className="mt-3 text-xs text-slate-500">
                                Select an image to upload to ImgBB. Maximum size: 32 MB.
                            </p>

                            {uploadingImage && (
                                <div className="mt-4 flex items-center gap-3 text-sm text-[#3DDBC0]">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#24434A] border-t-[#3DDBC0]" />
                                    Uploading image to ImgBB...
                                </div>
                            )}

                            {imagePreview && (
                                <div className="mt-5">
                                    <img
                                        src={imagePreview}
                                        alt="Service preview"
                                        className="h-52 w-full rounded-xl border border-white/10 object-cover"
                                    />

                                    {form.image_url && (
                                        <p className="mt-2 break-all text-xs text-[#3DDBC0]">
                                            Image uploaded successfully!
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="mt-3 rounded-lg border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-400/10"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="rounded-xl border border-[#3DDBC0]/20 bg-[#3DDBC0]/10 p-4 text-sm text-[#3DDBC0]">
                            {success}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || uploadingImage}
                        className="w-full rounded-xl bg-[#3DDBC0] px-6 py-4 font-bold text-[#04181C] transition hover:bg-[#6AEAD3] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Creating Service..."
                            : uploadingImage
                                ? "Uploading Image..."
                                : "+ Create Service"}
                    </button>

                </form>
            </motion.div>
        </div>
    );
}
