import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
        <Input 
          type="search" 
          placeholder="ابحث عن مخالفة، موقع، أو تقرير..." 
          className="pr-10 bg-background/50 border-border/50 focus-visible:ring-primary/20"
        />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive animate-pulse" />
        </Button>
      </div>
    </header>
  );
}