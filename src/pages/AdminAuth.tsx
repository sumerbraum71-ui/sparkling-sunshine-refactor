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
