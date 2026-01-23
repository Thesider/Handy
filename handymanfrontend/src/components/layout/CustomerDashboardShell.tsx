import type { ReactNode } from "react";
import { CustomerSidebar } from "./CustomerSidebar";

export const CustomerDashboardShell = ({ children }: { children: ReactNode }) => (
    <div className="flex min-h-screen w-full bg-slate-50 font-display text-slate-900">
        <CustomerSidebar />
        <main className="flex-1 ml-64 min-h-screen">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-8 xl:px-12">
                {children}
            </div>
        </main>
    </div>
);
