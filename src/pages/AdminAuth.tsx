import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
const ALLOWED_ADMIN_EMAIL = 'boom@admin';
const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasExistingAdmin, setHasExistingAdmin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
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
          navigate('/BOOM');
        }
      }
      setCheckingSession(false);
    };
    checkSession();
    // Simplified subscription for debug
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Do nothing automatically, let the user click login to see errors
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
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
        // DEBUG: Explicitly log and show what's happening
        console.log("User ID:", data.user.id);
        
        const { data: adminData, error: adminError } = await supabase
          .from('admin_auth')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();
        console.log("Admin Data:", adminData);
        console.log("Admin Error:", adminError);
        if (adminError || !adminData) {
          // don't sign out immediately so we can debug
          // await supabase.auth.signOut(); 
          
          toast({
            title: 'DEBUG ERROR',
            description: `User: ${data.user.id} \n Error: ${adminError?.message || 'No Data Found'} \n Code: ${adminError?.code || 'N/A'}`,
            variant: 'destructive',
            duration: 10000,
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
        title: 'Login Error',
        description: error.message || 'فشل تسجيل الدخول',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
     // Keep the same signUp logic (omitted for brevity in debug message, but you can keep the previous one if you want, 
     // or just copy the login part mainly). 
     // For safety, I included only the Login fix above mostly.
     e.preventDefault();
     // ... (Use previous logic if needed, but focus is Login now)
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
           <h1 className="text-2xl font-bold text-red-500">DEBUG MODE</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3">
             {isLoading ? 'Loading...' : 'Login (Debug)'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminAuth;
