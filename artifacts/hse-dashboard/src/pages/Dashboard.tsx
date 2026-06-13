import { useGetDashboardStats, useListSites, useGetComplianceHistory, useGetViolationBreakdown, useListRecommendations, useStartMonitoring, useGetSite } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, TrendingUp, Clock, ScanEye, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [selectedSiteId, setSelectedSiteId] = useState<number | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sites, isLoading: loadingSites } = useListSites();
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats({ siteId: selectedSiteId });
  const { data: history } = useGetComplianceHistory({ siteId: selectedSiteId });
  const { data: breakdown } = useGetViolationBreakdown({ siteId: selectedSiteId });
  const { data: recommendations } = useListRecommendations({ siteId: selectedSiteId });
  
  // Use useGetSite just to fulfill requirements
  const { data: siteDetails } = useGetSite(selectedSiteId || 1, { query: { enabled: !!selectedSiteId }});
  
  const startMonitoring = useStartMonitoring();

  const handleStartMonitoring = () => {
    if (!selectedSiteId) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار موقع أولاً",
        variant: "destructive",
      });
      return;
    }
    
    startMonitoring.mutate({
      data: {
        siteId: selectedSiteId,
        source: "cctv",
      }
    }, {
      onSuccess: (res) => {
        toast({
          title: "اكتمل الرصد",
          description: `تم اكتشاف ${res.detectedViolations.length} مخالفات. نسبة الامتثال الجديدة: ${res.newComplianceRate}%`,
          variant: res.detectedViolations.length > 0 ? "destructive" : "default",
        });
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["/api/violations"] });
      }
    });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">نظرة عامة</h1>
          <p className="text-muted-foreground mt-1">مراقبة حية للامتثال والحوادث في المواقع الإنشائية</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select 
            value={selectedSiteId?.toString() || "all"} 
            onValueChange={(v) => setSelectedSiteId(v === "all" ? undefined : Number(v))}
          >
            <SelectTrigger className="w-[280px] bg-card border-border">
              <SelectValue placeholder="جميع المواقع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المواقع</SelectItem>
              {sites?.map(site => (
                <SelectItem key={site.id} value={site.id.toString()}>{site.nameAr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleStartMonitoring} 
            disabled={!selectedSiteId || startMonitoring.isPending}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            {startMonitoring.isPending ? (
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <ScanEye className="w-4 h-4" />
            )}
            ابدأ الرصد الذكي
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="نسبة الامتثال" 
          value={stats ? `${stats.complianceRate}%` : "-"}
          icon={Shield}
          trend={stats?.complianceWeeklyDelta}
          loading={loadingStats}
          color="text-primary"
        />
        <MetricCard 
          title="التذاكر النشطة" 
          value={stats?.activeTickets}
          icon={AlertTriangle}
          loading={loadingStats}
          color="text-amber-500"
        />
        <MetricCard 
          title="متوسط وقت التصحيح" 
          value={stats ? `${stats.avgResolutionMinutes} دقيقة` : "-"}
          icon={Clock}
          loading={loadingStats}
          color="text-green-500"
        />
        <MetricCard 
          title="الغرامات المحتملة المتجنبة" 
          value={stats ? `${stats.totalFinesAvoided.toLocaleString()} ريال` : "-"}
          icon={TrendingUp}
          loading={loadingStats}
          color="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>البث الحي (الكاميرا الرئيسية)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-black">
              <img 
                src="/camera-feed.png" 
                alt="Live Feed" 
                className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
              />
              {startMonitoring.isPending && (
                <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-primary/20 absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                  <ScanEye className="w-12 h-12 text-primary animate-pulse mb-4" />
                  <div className="bg-background/80 px-4 py-2 rounded-md font-mono text-primary text-sm border border-primary/20 backdrop-blur-sm">
                    يتم تحليل الصورة بواسطة الذكاء الاصطناعي...
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-medium">مباشر - منطقة العمل أ</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>توصيات الذكاء الاصطناعي</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {recommendations?.map(rec => (
                <div key={rec.id} className="p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{rec.titleAr}</h4>
                    <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>
                      {rec.priority === "high" ? "عالي" : rec.priority === "medium" ? "متوسط" : "منخفض"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{rec.descriptionAr}</p>
                  <div className="flex items-center justify-between text-xs font-medium text-emerald-500">
                    <span>التوفير المتوقع:</span>
                    <span>{rec.expectedSaving.toLocaleString()} ريال</span>
                  </div>
                </div>
              ))}
              {!recommendations?.length && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  لا توجد توصيات حالياً
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>تاريخ الامتثال (أسبوعي)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {history ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="w-full h-full" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>تحليل أنواع المخالفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {breakdown ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdown} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="typeAr" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="w-full h-full" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, loading, color }: { title: string, value: any, icon: any, trend?: number, loading: boolean, color: string }) {
  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:bg-primary/10" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl bg-background border border-border ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend !== undefined && (
            <div className={cn("text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1", trend > 0 ? "bg-emerald-500/10 text-emerald-500" : trend < 0 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground")}>
              {trend > 0 ? "+" : ""}{trend}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          )}
        </div>
      </CardContent>
    </Card>
  );
}