import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// بيانات الأدمن الرئيسي الثابتة
const SUPER_ADMIN = {
  username: 'boom',
  password: '100900'
};

const AdminAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // التحقق من الأدمن الرئيسي أولاً
      if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_username', username);
        localStorage.setItem('admin_is_super', 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        
        toast({
          title: 'نجاح',
          description: 'تم تسجيل الدخول كأدمن رئيسي',
        });
        navigate('/admin');
        return;
      }

      // التحقق من المستخدمين المسجلين في قاعدة البيانات
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (adminUser) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_username', username);
        localStorage.setItem('admin_is_super', 'false');
        localStorage.setItem('admin_user_id', adminUser.id);
        localStorage.setItem('admin_permissions', JSON.stringify({
          can_manage_orders: adminUser.can_manage_orders,
          can_manage_products: adminUser.can_manage_products,
          can_manage_tokens: adminUser.can_manage_tokens,
          can_manage_refunds: adminUser.can_manage_refunds,
          can_manage_stock: adminUser.can_manage_stock,
          can_manage_coupons: adminUser.can_manage_coupons,
          can_manage_recharges: adminUser.can_manage_recharges,
          can_manage_payment_methods: adminUser.can_manage_payment_methods,
          can_manage_users: adminUser.can_manage_users,
        }));
        localStorage.setItem('admin_login_time', Date.now().toString());
        
        toast({
          title: 'نجاح',
          description: 'تم تسجيل الدخول بنجاح',
        });
        navigate('/admin');
        return;
      }

      // لم يتم العثور على المستخدم
      toast({
        title: 'خطأ',
        description: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        variant: 'destructive',
      });
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-simple p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">BOOM</span>
            <span className="text-foreground">PAY</span>
          </h1>
          <p className="text-muted-foreground mt-2">لوحة تحكم المسؤول</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field w-full"
              placeholder="اسم المستخدم"
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
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
