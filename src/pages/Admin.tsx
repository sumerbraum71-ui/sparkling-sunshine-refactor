import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Package, 
  Key, 
  ShoppingCart, 
  RefreshCw, 
  Tag, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut,
  Bell
} from "lucide-react";
import ProductManagement from "@/components/admin/ProductManagement";
import TokenManagement from "@/components/admin/TokenManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import RechargeManagement from "@/components/admin/RechargeManagement";
import RefundManagement from "@/components/admin/RefundManagement";
import CouponManagement from "@/components/admin/CouponManagement";
import PaymentMethodsManagement from "@/components/admin/PaymentMethodsManagement";
import UserManagement from "@/components/admin/UserManagement";
import useOrderNotification from "@/hooks/useOrderNotification";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { newOrdersCount, clearNotifications } = useOrderNotification();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/admin/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles || roles.length === 0 || !roles.some(r => r.role === "admin")) {
      toast.error("ليس لديك صلاحية الوصول");
      navigate("/admin/auth");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-cairo">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">لوحة التحكم</h1>
            <div className="flex items-center gap-4">
              {newOrdersCount > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-primary animate-bounce" />
                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {newOrdersCount}
                  </span>
                </div>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6" onValueChange={(value) => {
          if (value === "orders") {
            clearNotifications();
          }
        }}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 h-auto p-2">
            <TabsTrigger value="products" className="flex flex-col gap-1 py-2">
              <Package className="h-4 w-4" />
              <span className="text-xs">المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex flex-col gap-1 py-2">
              <Key className="h-4 w-4" />
              <span className="text-xs">التوكنات</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex flex-col gap-1 py-2 relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs">الطلبات</span>
              {newOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {newOrdersCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="recharge" className="flex flex-col gap-1 py-2">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs">الشحن</span>
            </TabsTrigger>
            <TabsTrigger value="refunds" className="flex flex-col gap-1 py-2">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs">الاسترداد</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex flex-col gap-1 py-2">
              <Tag className="h-4 w-4" />
              <span className="text-xs">الكوبونات</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex flex-col gap-1 py-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">الدفع</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col gap-1 py-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">المستخدمين</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
          <TabsContent value="tokens">
            <TokenManagement />
          </TabsContent>
          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
          <TabsContent value="recharge">
            <RechargeManagement />
          </TabsContent>
          <TabsContent value="refunds">
            <RefundManagement />
          </TabsContent>
          <TabsContent value="coupons">
            <CouponManagement />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentMethodsManagement />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
