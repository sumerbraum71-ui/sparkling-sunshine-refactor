import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Save, X, User, Shield, Eye, EyeOff } from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  password: string;
  is_active: boolean;
  can_manage_orders: boolean;
  can_manage_products: boolean;
  can_manage_tokens: boolean;
  can_manage_refunds: boolean;
  can_manage_stock: boolean;
  can_manage_coupons: boolean;
  can_manage_recharges: boolean;
  can_manage_payment_methods: boolean;
  can_manage_users: boolean;
  created_at: string;
}

const PERMISSIONS = [
  { key: 'can_manage_orders', label: 'إدارة الطلبات' },
  { key: 'can_manage_products', label: 'إدارة المنتجات' },
  { key: 'can_manage_tokens', label: 'إدارة التوكنات' },
  { key: 'can_manage_refunds', label: 'إدارة الاستردادات' },
  { key: 'can_manage_stock', label: 'إدارة المخزون' },
  { key: 'can_manage_coupons', label: 'إدارة الكوبونات' },
  { key: 'can_manage_recharges', label: 'إدارة الشحن' },
  { key: 'can_manage_payment_methods', label: 'طرق الدفع' },
  { key: 'can_manage_users', label: 'إدارة المستخدمين' },
];

export const AdminUsersManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    is_active: true,
    can_manage_orders: false,
    can_manage_products: false,
    can_manage_tokens: false,
    can_manage_refunds: false,
    can_manage_stock: false,
    can_manage_coupons: false,
    can_manage_recharges: false,
    can_manage_payment_methods: false,
    can_manage_users: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'خطأ', description: 'فشل تحميل المستخدمين', variant: 'destructive' });
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setForm({
      username: '',
      password: '',
      is_active: true,
      can_manage_orders: false,
      can_manage_products: false,
      can_manage_tokens: false,
      can_manage_refunds: false,
      can_manage_stock: false,
      can_manage_coupons: false,
      can_manage_recharges: false,
      can_manage_payment_methods: false,
      can_manage_users: false,
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: user.password,
      is_active: user.is_active,
      can_manage_orders: user.can_manage_orders,
      can_manage_products: user.can_manage_products,
      can_manage_tokens: user.can_manage_tokens,
      can_manage_refunds: user.can_manage_refunds,
      can_manage_stock: user.can_manage_stock,
      can_manage_coupons: user.can_manage_coupons,
      can_manage_recharges: user.can_manage_recharges,
      can_manage_payment_methods: user.can_manage_payment_methods,
      can_manage_users: user.can_manage_users,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    if (editingUser) {
      // تعديل مستخدم
      const { error } = await supabase
        .from('admin_users')
        .update({
          username: form.username,
          password: form.password,
          is_active: form.is_active,
          can_manage_orders: form.can_manage_orders,
          can_manage_products: form.can_manage_products,
          can_manage_tokens: form.can_manage_tokens,
          can_manage_refunds: form.can_manage_refunds,
          can_manage_stock: form.can_manage_stock,
          can_manage_coupons: form.can_manage_coupons,
          can_manage_recharges: form.can_manage_recharges,
          can_manage_payment_methods: form.can_manage_payment_methods,
          can_manage_users: form.can_manage_users,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingUser.id);

      if (error) {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'نجاح', description: 'تم تحديث المستخدم بنجاح' });
        setShowModal(false);
        resetForm();
        fetchUsers();
      }
    } else {
      // إضافة مستخدم جديد
      const { error } = await supabase
        .from('admin_users')
        .insert({
          username: form.username,
          password: form.password,
          is_active: form.is_active,
          can_manage_orders: form.can_manage_orders,
          can_manage_products: form.can_manage_products,
          can_manage_tokens: form.can_manage_tokens,
          can_manage_refunds: form.can_manage_refunds,
          can_manage_stock: form.can_manage_stock,
          can_manage_coupons: form.can_manage_coupons,
          can_manage_recharges: form.can_manage_recharges,
          can_manage_payment_methods: form.can_manage_payment_methods,
          can_manage_users: form.can_manage_users,
        });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'خطأ', description: 'اسم المستخدم موجود مسبقاً', variant: 'destructive' });
        } else {
          toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
        }
      } else {
        toast({ title: 'نجاح', description: 'تم إضافة المستخدم بنجاح' });
        setShowModal(false);
        resetForm();
        fetchUsers();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    const { error } = await supabase.from('admin_users').delete().eq('id', id);

    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'نجاح', description: 'تم حذف المستخدم' });
      fetchUsers();
    }
  };

  const toggleActive = async (user: AdminUser) => {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_active: !user.is_active })
      .eq('id', user.id);

    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      fetchUsers();
    }
  };

  const toggleAllPermissions = (value: boolean) => {
    setForm({
      ...form,
      can_manage_orders: value,
      can_manage_products: value,
      can_manage_tokens: value,
      can_manage_refunds: value,
      can_manage_stock: value,
      can_manage_coupons: value,
      can_manage_recharges: value,
      can_manage_payment_methods: value,
      can_manage_users: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5" />
          إدارة المستخدمين
        </h2>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          إضافة مستخدم
        </button>
      </div>

      {/* Super Admin Note */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-5 h-5" />
          <span className="font-medium">الأدمن الرئيسي (boom) له كل الصلاحيات ولا يظهر هنا</span>
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>لا يوجد مستخدمين مسجلين</p>
          <p className="text-sm">اضغط على "إضافة مستخدم" لإنشاء مستخدم جديد</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`bg-card rounded-xl border p-4 ${
                user.is_active ? 'border-border' : 'border-destructive/30 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-bold text-lg">{user.username}</span>
                    {!user.is_active && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        معطل
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PERMISSIONS.filter(p => (user as any)[p.key]).map((p) => (
                      <span
                        key={p.key}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                      >
                        {p.label}
                      </span>
                    ))}
                    {PERMISSIONS.every(p => !(user as any)[p.key]) && (
                      <span className="text-xs text-muted-foreground">لا صلاحيات</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(user)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      user.is_active
                        ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        : 'bg-success/10 text-success hover:bg-success/20'
                    }`}
                  >
                    {user.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2">اسم المستخدم *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="input-field w-full"
                  placeholder="اسم المستخدم"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">كلمة المرور *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field w-full pr-10"
                    placeholder="كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  مستخدم نشط
                </label>
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">الصلاحيات</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(false)}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      إلغاء الكل
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map((p) => (
                    <label
                      key={p.key}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(form as any)[p.key]}
                        onChange={(e) => setForm({ ...form, [p.key]: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManagement;
