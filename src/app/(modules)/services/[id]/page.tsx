
import { Suspense } from "react";
import ServiceDetailsClient from "./ServiceDetailsClient";

export default function ServiceDetailsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#061418] text-white">
                    Loading service details...
                </div>
            }
        >
            <ServiceDetailsClient />
        </Suspense>
    );
}
