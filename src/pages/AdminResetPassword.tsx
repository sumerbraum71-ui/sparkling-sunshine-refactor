import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Save } from "lucide-react";

const AdminResetPassword = () => {
  const [checking, setChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // When arriving from the recovery email link, the session is established from the URL.
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setChecking(false);

      if (!session) {
        toast({
          title: "الرابط غير صالح",
          description: "افتح رابط إعادة التعيين من الإيميل مرة أخرى.",
          variant: "destructive",
        });
      }
    };

    run();
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "كلمة المرور ضعيفة",
        description: "اكتب كلمة مرور من 6 أحرف على الأقل.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "غير متطابق",
        description: "تأكد أن كلمتي المرور متطابقتان.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.",
      });

      navigate("/BOOM/auth", { replace: true });
    } catch (error: any) {
      toast({
        title: "فشل التحديث",
        description: error.message || "حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-simple p-8 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-primary">تعيين كلمة مرور جديدة</h1>
          <p className="text-muted-foreground">اكتب كلمة المرور الجديدة ثم احفظ</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full pr-10"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">تأكيد كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field w-full pr-10"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ كلمة المرور
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminResetPassword;
