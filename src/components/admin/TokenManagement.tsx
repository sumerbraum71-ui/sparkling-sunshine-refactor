import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Key, Loader2, Copy } from "lucide-react";

interface Token {
  id: string;
  token: string;
  balance: number;
  created_at: string;
}

const TokenManagement = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [tokenValue, setTokenValue] = useState("");
  const [balance, setBalance] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setTokens(data);
    setLoading(false);
  };

  const generateToken = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i < 15) result += "-";
    }
    setTokenValue(result);
  };

  const handleSave = async () => {
    if (!tokenValue.trim()) {
      toast.error("يرجى إدخال التوكن");
      return;
    }

    const numBalance = parseFloat(balance) || 0;

    if (editingToken) {
      const { error } = await supabase
        .from("tokens")
        .update({ token: tokenValue.trim(), balance: numBalance })
        .eq("id", editingToken.id);

      if (error) {
        if (error.code === "23505") {
          toast.error("هذا التوكن موجود مسبقاً");
        } else {
          toast.error("حدث خطأ أثناء التحديث");
        }
      } else {
        toast.success("تم تحديث التوكن بنجاح");
        setDialogOpen(false);
        fetchTokens();
      }
    } else {
      const { error } = await supabase.from("tokens").insert({
        token: tokenValue.trim(),
        balance: numBalance,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("هذا التوكن موجود مسبقاً");
        } else {
          toast.error("حدث خطأ أثناء الإضافة");
        }
      } else {
        toast.success("تم إضافة التوكن بنجاح");
        setDialogOpen(false);
        fetchTokens();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التوكن؟")) return;

    const { error } = await supabase.from("tokens").delete().eq("id", id);

    if (error) {
      toast.error("حدث خطأ أثناء الحذف");
    } else {
      toast.success("تم حذف التوكن بنجاح");
      fetchTokens();
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("تم نسخ التوكن");
  };

  const openEdit = (token: Token) => {
    setEditingToken(token);
    setTokenValue(token.token);
    setBalance(token.balance.toString());
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingToken(null);
    setTokenValue("");
    setBalance("0");
    generateToken();
    setDialogOpen(true);
  };

  const filteredTokens = tokens.filter(
    (t) =>
      t.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.balance.toString().includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Key className="h-5 w-5" />
          إدارة التوكنات
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingToken ? "تعديل التوكن" : "إضافة توكن جديد"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>التوكن *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tokenValue}
                      onChange={(e) => setTokenValue(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      dir="ltr"
                    />
                    <Button variant="outline" onClick={generateToken}>
                      توليد
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الرصيد</Label>
                  <Input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    dir="ltr"
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  حفظ
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التوكن</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-mono" dir="ltr">
                    <div className="flex items-center gap-2">
                      {token.token}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToken(token.token)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-primary font-bold">
                    {token.balance.toFixed(2)} ر.س
                  </TableCell>
                  <TableCell>
                    {new Date(token.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(token)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(token.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTokens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    لا توجد توكنات
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

export default TokenManagement;
