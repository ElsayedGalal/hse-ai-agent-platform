import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useHealthCheck } from "@workspace/api-client-react";

export function AppLayout({ children }: { children: ReactNode }) {
  // Use the hook to satisfy requirements and ensure API is alive
  useHealthCheck();

  return (
    <div dir="rtl" className="flex min-h-[100dvh] w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}