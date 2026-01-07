import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
const ALLOWED_ADMIN_EMAIL = 'boom@admin';
// تم نقل كود الأمان للسيرفر (RPC) لزيادة الحماية
const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasExistingAdmin, setHasExistingAdmin] = useState(true);
  // Security Gate State
  const [isAccessGranted, setIsAccessGranted] = useState(() => {
    return localStorage.getItem('boom_admin_access') === 'granted';
  });
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessError, setAccessError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    // If no access granted yet, don't check session (stay on gate)
    if (!isAccessGranted) {
      setCheckingSession(false);
      return;
    }
    const checkSession = async () => {
      const { count } = await supabase
        .from('admin_auth')
        .select('*', { count: 'exact', head: true });
      setHasExistingAdmin((count || 0) > 0);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: adminData } = await supabase
          .from('admin_auth')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (adminData) {
          navigate('/bayomy');
        }
      }
      setCheckingSession(false);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: adminData } = await supabase
          .from('admin_auth')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (adminData) {
          navigate('/bayomy');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, isAccessGranted]);
  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessError(false);
    try {
      // Call the secure server function
      const { data, error } = await supabase.rpc('verify_admin_access' as any, {
        access_code: accessCodeInput,
      });
      if (error) throw error;
      if (data === true) {
        localStorage.setItem('boom_admin_access', 'granted');
        setIsAccessGranted(true);
        toast({
          title: 'تم التحقق بنجاح',
          description: 'مرحباً بك في لوحة التحكم',
        });
        setCheckingSession(true);
      } else {
        setAccessError(true);
        toast({
          title: 'خطأ',
          description: 'كود الأمان غير صحيح',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Access verification error:', err);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء التحقق',
        variant: 'destructive',
      });
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_auth')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();
        if (adminError || !adminData) {
          await supabase.auth.signOut();
          toast({
            title: 'خطأ',
            description: 'هذا الحساب ليس لديه صلاحيات أدمن',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'نجاح',
          description: 'تم تسجيل الدخول بنجاح',
        });
        navigate('/BOOM');
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل تسجيل الدخول',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (email.trim().toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
        toast({
          title: 'غير مسموح',
          description: 'إنشاء حساب الأدمن مسموح للبريد الخاص بالمسؤول فقط',
          variant: 'destructive',
        });
        return;
      }
      const redirectUrl = `${window.location.origin}/BOOM`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      if (error) throw error;
      if (data.user) {
        const { error: insertError } = await supabase
          .from('admin_auth')
          .insert({
            user_id: data.user.id,
            is_super_admin: true,
            can_manage_orders: true,
            can_manage_products: true,
            can_manage_tokens: true,
            can_manage_refunds: true,
            can_manage_stock: true,
            can_manage_coupons: true,
            can_manage_recharges: true,
            can_manage_payment_methods: true,
            can_manage_users: true,
          });
        if (insertError) {
          console.error('Error creating admin:', insertError);
          toast({
            title: 'تحذير',
            description: 'تم إنشاء الحساب لكن فشل إضافة صلاحيات الأدمن',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'نجاح',
          description: 'تم إنشاء حساب الأدمن بنجاح! يمكنك الآن تسجيل الدخول',
        });
        setIsSignUp(false);
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل إنشاء الحساب',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  // Security Gate UI
  if (!isAccessGranted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-simple p-8 w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">التحقق الأمني</h1>
            <p className="text-muted-foreground">
              الرجاء إدخال كود الأمان للمتابعة
            </p>
          </div>
          <form onSubmit={handleAccessSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                className={`input-field w-full text-center text-lg tracking-widest ${accessError ? 'border-destructive' : ''}`}
                placeholder="أدخل الكود هنا"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full py-3 hover:scale-105 transition-transform"
            >
              تحقق ومتابعة
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-muted-foreground">
            هذا الإجراء مطلوب فقط للمتصفحات الجديدة
          </div>
        </div>
      </div>
    );
  }
  // Normal Login UI
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-simple p-8 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">BOOM</span>
            <span className="text-foreground">PAY</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? 'إنشاء حساب أدمن جديد' : 'لوحة تحكم المسؤول'}
          </p>
        </div>
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full pr-10"
                placeholder="admin@example.com"
                required
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full pr-10"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isLoading ? 'جاري المعالجة...' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </button>
        </form>
        {!hasExistingAdmin && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'لديك حساب؟ تسجيل الدخول' : 'إنشاء حساب أدمن جديد'}
            </button>
          </div>
        )}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            🔒 هذه الصفحة محمية بنظام Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
};
export default AdminAuth;
