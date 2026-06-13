import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileBarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { toast } = useToast();

  const handleDownload = (reportName: string) => {
    // Mock download functionality
    const blob = new Blob(["تقرير منصة الرصد الذكي HSE AI Agent\n\nتاريخ التقرير: " + new Date().toLocaleDateString('ar-SA')], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportName}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "تم التحميل",
      description: `تم تحميل ${reportName} بنجاح`,
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">التقارير التحليلية</h1>
        <p className="text-muted-foreground mt-1">توليد وتحميل تقارير الامتثال والمخالفات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>التقرير الشامل للامتثال</CardTitle>
            <CardDescription>تقرير مفصل يحتوي على نسب الامتثال لجميع المواقع وتاريخ المخالفات المسجلة.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleDownload("التقرير_الشامل_للامتثال")} className="w-full gap-2">
              <Download className="w-4 h-4" />
              تحميل التقرير (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
              <FileBarChart className="w-6 h-6 text-emerald-500" />
            </div>
            <CardTitle>تقرير التوفير المالي والغرامات</CardTitle>
            <CardDescription>ملخص للغرامات المحتملة التي تم تجنبها بفضل التدخل السريع لنظام الرصد الذكي.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleDownload("تقرير_التوفير_المالي")} variant="secondary" className="w-full gap-2 hover:bg-emerald-500/20 hover:text-emerald-500">
              <Download className="w-4 h-4" />
              تحميل التقرير (Excel)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}