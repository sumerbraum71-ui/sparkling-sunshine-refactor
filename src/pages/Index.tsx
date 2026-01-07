import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";
import OrderChat from "@/components/OrderChat";
import { Loader2, ShoppingCart, Package, History, MessageCircle } from "lucide-react";

interface Token {
  id: string;
  token: string;
  balance: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
}

interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_active: boolean;
}

interface Order {
  id: string;
  token_id: string;
  product_id: string;
  product_option_id: string;
  quantity: number;
  total_price: number;
  status: string;
  stock_content: string | null;
  created_at: string;
  products?: Product;
  product_options?: ProductOption;
}

const Index = () => {
  const [tokenInput, setTokenInput] = useState("");
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stockCounts, setStockCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProducts();
    const savedToken = localStorage.getItem("userToken");
    if (savedToken) {
      verifyToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (currentToken) {
      fetchOrders();
    }
  }, [currentToken]);

  const fetchProducts = async () => {
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (productsData) {
      setProducts(productsData);
    }

    const { data: optionsData } = await supabase
      .from("product_options")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (optionsData) {
      setProductOptions(optionsData);
      // Fetch stock counts for each option
      const counts: Record<string, number> = {};
      for (const option of optionsData) {
        const { count } = await supabase
          .from("stock_items")
          .select("*", { count: "exact", head: true })
          .eq("product_option_id", option.id)
          .eq("is_sold", false);
        counts[option.id] = count || 0;
      }
      setStockCounts(counts);
    }
  };

  const verifyToken = async (token: string) => {
    setVerifying(true);
    const { data, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) {
      toast.error("التوكن غير صحيح");
      localStorage.removeItem("userToken");
      setCurrentToken(null);
    } else {
      setCurrentToken(data);
      localStorage.setItem("userToken", token);
      toast.success("تم التحقق من التوكن بنجاح");
    }
    setVerifying(false);
  };

  const fetchOrders = async () => {
    if (!currentToken) return;

    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        products (*),
        product_options (*)
      `)
      .eq("token_id", currentToken.id)
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      verifyToken(tokenInput.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setCurrentToken(null);
    setOrders([]);
    setTokenInput("");
    toast.success("تم تسجيل الخروج");
  };

  const handlePurchase = async (option: ProductOption) => {
    if (!currentToken) {
      toast.error("يرجى إدخال التوكن أولاً");
      return;
    }

    if (currentToken.balance < option.price) {
      toast.error("رصيدك غير كافي");
      return;
    }

    if ((stockCounts[option.id] || 0) < 1) {
      toast.error("المنتج غير متوفر حالياً");
      return;
    }

    setLoading(true);

    // Get available stock item
    const { data: stockItem } = await supabase
      .from("stock_items")
      .select("*")
      .eq("product_option_id", option.id)
      .eq("is_sold", false)
      .limit(1)
      .single();

    if (!stockItem) {
      toast.error("المنتج غير متوفر");
      setLoading(false);
      return;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        token_id: currentToken.id,
        product_id: option.product_id,
        product_option_id: option.id,
        quantity: 1,
        total_price: option.price,
        status: "completed",
        stock_content: stockItem.content,
      })
      .select()
      .single();

    if (orderError) {
      toast.error("حدث خطأ أثناء الشراء");
      setLoading(false);
      return;
    }

    // Mark stock as sold
    await supabase
      .from("stock_items")
      .update({ is_sold: true, sold_at: new Date().toISOString() })
      .eq("id", stockItem.id);

    // Update token balance
    const newBalance = currentToken.balance - option.price;
    await supabase
      .from("tokens")
      .update({ balance: newBalance })
      .eq("id", currentToken.id);

    setCurrentToken({ ...currentToken, balance: newBalance });
    setStockCounts({ ...stockCounts, [option.id]: (stockCounts[option.id] || 1) - 1 });
    
    toast.success("تم الشراء بنجاح!");
    fetchOrders();
    setLoading(false);
  };

  const getProductOptions = (productId: string) => {
    return productOptions.filter((opt) => opt.product_id === productId);
  };

  return (
    <div className="min-h-screen bg-background font-cairo">
      <Header 
        currentToken={currentToken} 
        onLogout={handleLogout}
        onBalanceUpdate={(newBalance) => setCurrentToken(prev => prev ? {...prev, balance: newBalance} : null)}
      />

      <main className="container mx-auto px-4 py-8">
        {!currentToken ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">أدخل التوكن الخاص بك</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <Input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="أدخل التوكن هنا..."
                  className="text-center"
                  dir="ltr"
                />
                <Button type="submit" className="w-full" disabled={verifying}>
                  {verifying ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    "تحقق"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-primary/20 to-primary/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-muted-foreground">رصيدك الحالي</p>
                    <p className="text-3xl font-bold text-primary">{currentToken.balance.toFixed(2)} ر.س</p>
                  </div>
                  <ShoppingCart className="h-12 w-12 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-6 w-6" />
                المنتجات المتاحة
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {product.name}
                        {product.category && (
                          <Badge variant="secondary">{product.category}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {product.description && (
                        <p className="text-muted-foreground text-sm">{product.description}</p>
                      )}
                      {getProductOptions(product.id).map((option) => (
                        <div
                          key={option.id}
                          className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{option.name}</p>
                            <p className="text-sm text-muted-foreground">
                              متوفر: {stockCounts[option.id] || 0}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary">{option.price} ر.س</span>
                            <Button
                              size="sm"
                              onClick={() => handlePurchase(option)}
                              disabled={loading || (stockCounts[option.id] || 0) < 1}
                            >
                              شراء
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Orders History */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <History className="h-6 w-6" />
                سجل الطلبات
              </h2>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      لا توجد طلبات سابقة
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{order.products?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.product_options?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleString("ar-SA")}
                            </p>
                          </div>
                          <div className="text-left">
                            <Badge
                              variant={order.status === "completed" ? "default" : "secondary"}
                            >
                              {order.status === "completed" ? "مكتمل" : order.status}
                            </Badge>
                            <p className="font-bold text-primary mt-1">
                              {order.total_price} ر.س
                            </p>
                          </div>
                        </div>
                        {order.stock_content && (
                          <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                            <p className="text-sm font-medium mb-1">محتوى الطلب:</p>
                            <p className="text-sm font-mono bg-background p-2 rounded" dir="ltr">
                              {order.stock_content}
                            </p>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <MessageCircle className="h-4 w-4 ml-2" />
                          المحادثة
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Chat Dialog */}
      {selectedOrder && (
        <OrderChat
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          isAdmin={false}
        />
      )}
    </div>
  );
};

export default Index;
