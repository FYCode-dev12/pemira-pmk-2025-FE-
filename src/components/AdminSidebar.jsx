import React from "react";
import {
  FileUser,
  BarChart2,
  PieChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  handleLogout,
  collapsed,
  onToggle,
}) => {
  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } min-h-screen bg-card border-r p-4 flex flex-col transition-all duration-300 overflow-hidden`}
    >
      <div className="mb-4 flex items-center justify-between">
        <a href="/" className="flex items-center space-x-2">
          <div className="rounded-xl">
            <img
              src="https://res.cloudinary.com/dm3zixaz4/image/upload/v1763313569/Logo_Utama_dxucb5.png"
              alt="Logo"
              className={`${collapsed ? "h-0" : "h-14"} w-auto object-contain transition-all`}
            />
          </div>
          <div
            className={`${collapsed ? "hidden" : "flex"} flex-col leading-none`}
          >
            <div className="text-xl text-primary leading-none">PEMIRA</div>
            <span className="text-sm font-semibold text-[hsl(var(--brand-orange))] -mt-1">
              PMK ITERA 2025
            </span>
          </div>
        </a>
        <button
          onClick={onToggle}
          className="shrink-0 inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className={`${collapsed ? "hidden" : "block"} mb-4`}>
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>

      <nav className="space-y-2 flex-1">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md ${
            collapsed ? "justify-center" : ""
          } ${
            activeTab === "candidates"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/10"
          }`}
        >
          <BarChart2 className="w-6 h-6" />
          <span className={`${collapsed ? "hidden" : "inline"}`}>
            Perolehan Suara
          </span>
        </button>

        <button
          onClick={() => setActiveTab("participation")}
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md ${
            collapsed ? "justify-center" : ""
          } ${
            activeTab === "participation"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/10"
          }`}
        >
          <PieChart className="w-6 h-6" />
          <span className={`${collapsed ? "hidden" : "inline"}`}>
            Partisipasi
          </span>
        </button>

        <button
          onClick={() => setActiveTab("voters")}
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md ${
            collapsed ? "justify-center" : ""
          } ${
            activeTab === "voters"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/10"
          }`}
        >
          <FileUser className="w-6 h-6" />
          <span className={`${collapsed ? "hidden" : "inline"}`}>Voters</span>
        </button>
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          <span className={`${collapsed ? "hidden" : "inline"}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
