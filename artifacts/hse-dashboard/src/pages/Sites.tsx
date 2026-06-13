import { useListSites } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, Camera, Calendar, ShieldCheck } from "lucide-react";

export default function Sites() {
  const { data: sites, isLoading } = useListSites();

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500";
    if (rate >= 60) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">المواقع الإنشائية</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على حالة الامتثال لكل موقع</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50 h-48 animate-pulse" />
          ))
        ) : (
          sites?.map(site => (
            <Card key={site.id} className="bg-card/50 border-border/50 hover:border-primary/50 transition-all cursor-default group">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{site.nameAr}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 gap-1">
                      <MapPin className="w-3 h-3" />
                      {site.location}
                    </div>
                  </div>
                  <Badge variant={site.status === "active" ? "default" : "secondary"}>
                    {site.status === "active" ? "نشط" : "متوقف"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium">نسبة الامتثال</span>
                      <span className="text-xl font-bold font-mono">{site.complianceRate}%</span>
                    </div>
                    <Progress 
                      value={site.complianceRate} 
                      className="h-2 bg-muted"
                      indicatorClassName={getComplianceColor(site.complianceRate)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Camera className="w-3 h-3" /> كاميرات الرصد
                      </span>
                      <span className="text-sm font-semibold">{site.cameraCount}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> آخر تفتيش
                      </span>
                      <span className="text-sm font-semibold">{site.lastInspection ? new Date(site.lastInspection).toLocaleDateString('ar-SA') : '-'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}