import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) {
        throw new Error('تعذر تسجيل الدخول، حاول مرة أخرى');
      }

      // بعد تسجيل الدخول مباشرةً، اذهب للوحة الأدمن
      // (التحقق من الصلاحيات يتم داخل صفحة /admin)
      toast({
        title: 'نجاح',
        description: 'تم تسجيل الدخول بنجاح',
      });
      navigate('/admin');
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-auth`,
        },
      });

      if (error) throw error;

      toast({
        title: 'نجاح',
        description: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول',
      });
      setIsSignUp(false);
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-simple p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">BOOM</span>
            <span className="text-foreground">PAY</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? 'إنشاء حساب جديد' : 'لوحة تحكم المسؤول'}
          </p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading 
              ? (isSignUp ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...') 
              : (isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline text-sm"
          >
            {isSignUp ? 'لديك حساب؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;