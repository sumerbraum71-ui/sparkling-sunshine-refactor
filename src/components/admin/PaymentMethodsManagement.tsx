import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CreditCard, Loader2 } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  account_info: string;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const PaymentMethodsManagement = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [accountInfo, setAccountInfo] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .order("sort_order");

    if (data) setMethods(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !accountInfo.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const methodData = {
      name: name.trim(),
      account_info: accountInfo.trim(),
      instructions: instructions.trim() || null,
      is_active: isActive,
    };

    if (editingMethod) {
      const { error } = await supabase
        .from("payment_methods")
        .update(methodData)
        .eq("id", editingMethod.id);

      if (error) {
        toast.error("حدث خطأ أثناء التحديث");
      } else {
        toast.success("تم تحديث طريقة الدفع بنجاح");
      }
    } else {
      const { error } = await supabase.from("payment_methods").insert(methodData);

      if (error) {
        toast.error("حدث خطأ أثناء الإضافة");
      } else {
        toast.success("تم إضافة طريقة الدفع بنجاح");
      }
    }

    resetForm();
    setDialogOpen(false);
    fetchMethods();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف طريقة الدفع هذه؟")) return;

    const { error } = await supabase.from("payment_methods").delete().eq("id", id);

    if (error) {
      toast.error("حدث خطأ أثناء الحذف");
    } else {
      toast.success("تم حذف طريقة الدفع بنجاح");
      fetchMethods();
    }
  };

  const resetForm = () => {
    setName("");
    setAccountInfo("");
    setInstructions("");
    setIsActive(true);
    setEditingMethod(null);
  };

  const openEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setName(method.name);
    setAccountInfo(method.account_info);
    setInstructions(method.instructions || "");
    setIsActive(method.is_active);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          إدارة طرق الدفع
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة طريقة دفع
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMethod ? "تعديل طريقة الدفع" : "إضافة طريقة دفع جديدة"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم طريقة الدفع *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: تحويل بنكي - الراجحي"
                />
              </div>

              <div className="space-y-2">
                <Label>معلومات الحساب *</Label>
                <Textarea
                  value={accountInfo}
                  onChange={(e) => setAccountInfo(e.target.value)}
                  placeholder="رقم الآيبان أو رقم الحساب..."
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>تعليمات إضافية</Label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="تعليمات للعميل..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>نشط</Label>
              </div>

              <Button onClick={handleSave} className="w-full">
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>معلومات الحساب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell className="font-mono text-sm max-w-xs truncate" dir="ltr">
                    {method.account_info}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        method.is_active
                          ? "bg-primary/20 text-primary"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {method.is_active ? "نشط" : "غير نشط"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(method)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {methods.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    لا توجد طرق دفع
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export { PaymentMethodsManagement };
export default PaymentMethodsManagement;
