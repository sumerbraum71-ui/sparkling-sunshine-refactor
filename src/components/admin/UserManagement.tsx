import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Loader2, Shield, Trash2 } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "user";
}

const UserManagement = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "moderator" | "user">("user");

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("*")
      .order("role");

    if (data) setUserRoles(data as UserRole[]);
    setLoading(false);
  };

  const handleAddRole = async () => {
    if (!newUserId.trim()) {
      toast.error("يرجى إدخال معرف المستخدم");
      return;
    }

    const { error } = await supabase.from("user_roles").insert({
      user_id: newUserId.trim(),
      role: newRole,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("هذا المستخدم لديه هذا الدور مسبقاً");
      } else if (error.code === "23503") {
        toast.error("معرف المستخدم غير موجود");
      } else {
        toast.error("حدث خطأ أثناء الإضافة");
      }
    } else {
      toast.success("تم إضافة الدور بنجاح");
      setNewUserId("");
      setDialogOpen(false);
      fetchUserRoles();
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدور؟")) return;

    const { error } = await supabase.from("user_roles").delete().eq("id", id);

    if (error) {
      toast.error("حدث خطأ أثناء الحذف");
    } else {
      toast.success("تم حذف الدور بنجاح");
      fetchUserRoles();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary">مسؤول</Badge>;
      case "moderator":
        return <Badge variant="secondary">مشرف</Badge>;
      case "user":
        return <Badge variant="outline">مستخدم</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
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
          <Users className="h-5 w-5" />
          إدارة المستخدمين والصلاحيات
        </h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Shield className="h-4 w-4 ml-2" />
          إضافة دور
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>معرف المستخدم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles.map((userRole) => (
                <TableRow key={userRole.id}>
                  <TableCell className="font-mono text-sm" dir="ltr">
                    {userRole.user_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{getRoleBadge(userRole.role)}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRole(userRole.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {userRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    لا توجد أدوار مسجلة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة دور جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>معرف المستخدم (User ID)</Label>
              <Input
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                يمكنك الحصول على معرف المستخدم من لوحة تحكم Supabase
              </p>
            </div>

            <div className="space-y-2">
              <Label>الدور</Label>
              <Select value={newRole} onValueChange={(v: "admin" | "moderator" | "user") => setNewRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مسؤول (Admin)</SelectItem>
                  <SelectItem value="moderator">مشرف (Moderator)</SelectItem>
                  <SelectItem value="user">مستخدم (User)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddRole} className="w-full">
              إضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
