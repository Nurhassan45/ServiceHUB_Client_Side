"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        switch (user.role) {
            case "customer":
                router.replace("/dashboard/bookings");
                break;

            case "technician":
    router.replace("/dashboard/assigned-bookings");
    break;

case "admin":
    router.replace("/dashboard/admin/bookings");
    break;

            default:
                router.replace("/");
        }
    }, [user, loading, router]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#24434A] border-t-[#3DDBC0]" />
                <p className="text-sm text-slate-400">
                    Redirecting to your dashboard...
                </p>
            </div>
        </div>
    );
}