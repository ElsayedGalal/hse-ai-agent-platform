import { Link, useLocation } from "wouter";
import { LayoutDashboard, AlertTriangle, Building2, FileText, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/tickets", label: "تذاكر المخالفات", icon: AlertTriangle },
  { href: "/sites", label: "المواقع الإنشائية", icon: Building2 },
  { href: "/reports", label: "التقارير", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-l border-border bg-card hidden md:flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border text-primary">
        <ShieldAlert className="w-6 h-6 ml-3" />
        <span className="font-bold text-lg tracking-wide">منصة الرصد الذكي</span>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center px-3 py-3 rounded-md transition-colors font-medium text-sm",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}>
              <item.icon className="w-5 h-5 ml-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
            MS
          </div>
          <div>
            <div className="text-sm font-bold">محمد سالم</div>
            <div className="text-xs text-muted-foreground">مدير السلامة</div>
          </div>
        </div>
      </div>
    </div>
  );
}