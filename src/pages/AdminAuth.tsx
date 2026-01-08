import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    // Check if already logged in and matches admin_auth
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: adminData } = await supabase
            .from('admin_auth')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (adminData) {
            navigate('/BOOM'); // Access granted
          }
        }
      } catch (error) {
        console.error('Session check error', error);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Authenticate user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        // 2. Verify admin permission
        const { data: adminData, error: adminError } = await supabase
          .from('admin_auth')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();
        if (adminError || !adminData) {
          await supabase.auth.signOut();
          toast({
            title: 'خطأ في الصلاحيات',
            description: 'هذا الحساب ليس لديه صلاحيات المسؤول.',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'تم تسجيل الدخول',
          description: 'مرحباً بك في لوحة التحكم',
        });
        navigate('/BOOM');
      }
    } catch (error: any) {
      toast({
        title: 'فشل تسجيل الدخول',
        description: error.message || 'تأكد من البريد الإلكتروني وكلمة المرور',
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
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-simple p-8 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-primary">BOOMPAY</h1>
          <p className="text-muted-foreground">لوحة تحكم المسؤول</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full pr-10"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة المرور</label>
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
          <button 
            type="submit" 
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
           <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
             <Lock className="w-3 h-3" />
             منطقة آمنة ومحمية
           </p>
        </div>
      </div>
    </div>
  );
};
export default AdminAuth;
