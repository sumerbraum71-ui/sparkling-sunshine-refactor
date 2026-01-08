import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Security Gate State
  const [isAccessGranted, setIsAccessGranted] = useState(() => {
    return localStorage.getItem('boom_admin_access') === 'granted';
  });
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessError, setAccessError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    if (!isAccessGranted) {
      setCheckingSession(false);
      return;
    }
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/BOOM'); // توجيه مباشر للوحة التحكم
      }
      setCheckingSession(false);
    };
    
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/BOOM');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, isAccessGranted]);
  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا التعديل: قبول الكود مباشرة
    if (accessCodeInput === 'BOOM2026') {
      localStorage.setItem('boom_admin_access', 'granted');
      setIsAccessGranted(true);
      toast({
        title: "تم التحقق",
        description: "أهلاً بك يا بطل",
      });
      setCheckingSession(true);
    } else {
      setAccessError(true);
      toast({
        title: "خطأ",
        description: "كود الأمان غير صحيح",
        variant: "destructive",
      });
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      toast({
        title: "نجاح",
        description: "تم تسجيل الدخول",
      });
      navigate('/BOOM');
      
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
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
        <div className="card-simple p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold">التحقق الأمني</h1>
          </div>
          <form onSubmit={handleAccessSubmit} className="space-y-4">
            <input
              type="password"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              className={`input-field w-full text-center text-lg ${accessError ? 'border-red-500' : ''}`}
              placeholder="أدخل كود الأمان"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full py-2">دخول</button>
          </form>
        </div>
      </div>
    );
  }
  // Login UI
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-simple p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">BOOMPAY Admin</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-2">
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminAuth;
