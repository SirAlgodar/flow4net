import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="ml-64 w-full p-8 text-foreground">
            {children}
        </main>
      </div>
    </div>
  );
}
