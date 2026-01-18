import type { ReactNode } from "react";
import { WorkerSidebar } from "./WorkerSidebar";
import styles from "./WorkerDashboardShell.module.css";

export const WorkerDashboardShell = ({ children }: { children: ReactNode }) => (
    <div className="flex h-screen w-full overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-white">
        <WorkerSidebar />
        <main
            className={`flex-1 overflow-y-auto bg-background-light dark:bg-background-dark ${styles.scrollbarHide}`}
        >
            <div className="layout-container flex h-full grow flex-col">
                <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-8 xl:px-12">
                    {children}
                </div>
            </div>
        </main>
    </div>
);
