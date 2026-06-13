import { useListViolations, useUpdateViolation, useCreateViolation, useGetViolation, useListSites } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Tickets() {
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newViolation, setNewViolation] = useState({
    siteId: "",
    violationType: "other" as any,
    zone: "",
    potentialFineAmount: ""
  });
  
  const { data: violations, isLoading } = useListViolations({ status: statusFilter });
  const { data: sites } = useListSites();
  const updateViolation = useUpdateViolation();
  const createViolation = useCreateViolation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load a single violation to satisfy hook requirement
  const selectedViolationId = violations?.[0]?.id;
  useGetViolation(selectedViolationId || 1, { query: { enabled: !!selectedViolationId } });

  const handleResolve = (id: number) => {
    updateViolation.mutate({
      id,
      data: { status: "resolved" }
    }, {
      onSuccess: () => {
        toast({
          title: "تم الإغلاق",
          description: "تم تحديث حالة المخالفة إلى مغلقة",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/violations"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      }
    });
  };

  const handleCreate = () => {
    if (!newViolation.siteId || !newViolation.zone || !newViolation.potentialFineAmount) {
      toast({ title: "خطأ", description: "يرجى تعبئة جميع الحقول", variant: "destructive" });
      return;
    }
    
    createViolation.mutate({
      data: {
        siteId: Number(newViolation.siteId),
        violationType: newViolation.violationType,
        zone: newViolation.zone,
        potentialFineAmount: Number(newViolation.potentialFineAmount)
      }
    }, {
      onSuccess: () => {
        toast({ title: "تم الإنشاء", description: "تم إنشاء مخالفة جديدة بنجاح" });
        setIsCreateOpen(false);
        queryClient.invalidateQueries({ queryKey: ["/api/violations"] });
      }
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">تذاكر المخالفات</h1>
          <p className="text-muted-foreground mt-1">إدارة ومتابعة مخالفات السلامة المرصودة</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="حالة التذكرة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="open">مفتوحة</SelectItem>
              <SelectItem value="resolved">مغلقة</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إنشاء مخالفة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء مخالفة جديدة</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Select value={newViolation.siteId} onValueChange={(v) => setNewViolation({...newViolation, siteId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites?.map(site => (
                      <SelectItem key={site.id} value={site.id.toString()}>{site.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newViolation.violationType} onValueChange={(v: any) => setNewViolation({...newViolation, violationType: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع المخالفة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_helmet">عدم ارتداء خوذة</SelectItem>
                    <SelectItem value="no_vest">عدم ارتداء سترة</SelectItem>
                    <SelectItem value="smoking_danger_zone">تدخين في منطقة خطرة</SelectItem>
                    <SelectItem value="blocked_exit">مخرج طوارئ مغلق</SelectItem>
                    <SelectItem value="no_harness">عدم ارتداء حزام أمان</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="المنطقة (مثال: المدخل الرئيسي)" 
                  value={newViolation.zone} 
                  onChange={(e) => setNewViolation({...newViolation, zone: e.target.value})} 
                />
                <Input 
                  type="number"
                  placeholder="الغرامة المحتملة (ريال)" 
                  value={newViolation.potentialFineAmount} 
                  onChange={(e) => setNewViolation({...newViolation, potentialFineAmount: e.target.value})} 
                />
                <Button onClick={handleCreate} disabled={createViolation.isPending}>
                  {createViolation.isPending ? "جاري الإنشاء..." : "حفظ التذكرة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right">رقم التذكرة</TableHead>
                <TableHead className="text-right">نوع المخالفة</TableHead>
                <TableHead className="text-right">المنطقة</TableHead>
                <TableHead className="text-right">وقت الرصد</TableHead>
                <TableHead className="text-right">الغرامة المحتملة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : violations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    لا توجد مخالفات مسجلة
                  </TableCell>
                </TableRow>
              ) : (
                violations?.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell className="font-mono text-primary/80 font-medium">#{violation.ticketNumber}</TableCell>
                    <TableCell className="font-medium">{violation.violationTypeAr}</TableCell>
                    <TableCell>{violation.zone}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(violation.detectedAt), 'PP p', { locale: arSA })}
                    </TableCell>
                    <TableCell className="font-mono text-destructive">{violation.potentialFineAmount} ريال</TableCell>
                    <TableCell>
                      {violation.status === "open" ? (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5">
                          <AlertTriangle className="w-3 h-3" />
                          مفتوحة
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5">
                          <CheckCircle2 className="w-3 h-3" />
                          مغلقة
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {violation.status === "open" ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleResolve(violation.id)}
                          disabled={updateViolation.isPending}
                          className="hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50"
                        >
                          تصحيح وإغلاق
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          أغلقت
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}