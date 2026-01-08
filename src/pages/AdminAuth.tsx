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
          navigate('/BOOM');
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
          navigate('/BOOM');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, isAccessGranted]);
  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessError(false);
