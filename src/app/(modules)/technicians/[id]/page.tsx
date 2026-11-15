
import { Suspense } from "react";
import TechnicianProfileClient from "./TechnicianProfileClient";

export default function TechnicianProfilePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#061418] text-white">
                    Loading technician profile...
                </div>
            }
        >
            <TechnicianProfileClient />
        </Suspense>
    );
}
