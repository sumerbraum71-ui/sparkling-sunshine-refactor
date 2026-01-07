import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Search, CheckCircle, AlertCircle, Loader2, Clock, XCircle, CheckCircle2, Copy, CreditCard, Ban } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import OrderChat from '@/components/OrderChat';

interface Product {
  id: string;
  name: string;
  description: string | null;
}

interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  price: number;
  type: string | null;
  description: string | null;
  is_active: boolean;
}

interface Order {
  id: string;
  order_number: string;
  product_id: string | null;
  product_option_id: string | null;
  amount: number;
  total_price: number;
  status: string;
  created_at: string;
  stock_content: string | null;
}

interface RechargeRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  admin_notes: string | null;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'initial' | 'details' | 'result'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenData, setTokenData] = useState<{ id: string; balance: number } | null>(null);
  const [tokenOrders, setTokenOrders] = useState<Order[]>([]);
  const [tokenRecharges, setTokenRecharges] = useState<RechargeRequest[]>([]);
  const [optionStockCounts, setOptionStockCounts] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const { toast } = useToast();

  const product = products.find(p => p.id === selectedProductId);
  const options = productOptions.filter(o => o.product_id === selectedProductId);
  const selectedOption = productOptions.find(o => o.id === selectedOptionId);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data: productsData } = await supabase.from('products').select('*').eq('is_active', true).order('name');
    const { data: optionsData } = await supabase.from('product_options').select('*').eq('is_active', true);

    const { data: stockData } = await supabase
      .from('stock_items')
      .select('product_option_id')
      .eq('is_sold', false);

    const counts: Record<string, number> = {};
    stockData?.forEach(item => {
      if (item.product_option_id) {
        counts[item.product_option_id] = (counts[item.product_option_id] || 0) + 1;
      }
    });

    setProducts(productsData || []);
    setProductOptions((optionsData || []) as ProductOption[]);
    setOptionStockCounts(counts);
  };

  const verifyToken = async (tokenValue: string) => {
    const { data } = await supabase
      .from('tokens')
      .select('id, balance, is_blocked')
      .eq('token', tokenValue)
      .maybeSingle();
    return data;
  };

  const handleBuySubmit = async () => {
    if (!token.trim() || !product || !selectedOption) return;

    setIsLoading(true);
    const data = await verifyToken(token);
    setIsLoading(false);

    if (!data) {
      toast({ title: 'خطأ', description: 'التوكن غير صالح', variant: 'destructive' });
      return;
    }

    if (data.is_blocked) {
      toast({ title: 'خطأ', description: 'هذا التوكن محظور', variant: 'destructive' });
      return;
    }

    setTokenData(data);
    setTokenBalance(Number(data.balance));
    setStep('details');
  };

  const handleOrderSubmit = async () => {
    if (!selectedOption || !tokenData || !product) return;

    const isAutoDelivery = !selectedOption.type || selectedOption.type === 'none';
    const totalPrice = Number(selectedOption.price) * (isAutoDelivery ? quantity : 1);

    if (tokenBalance === null || tokenBalance < totalPrice) {
      setResult('error');
      setStep('result');
      return;
    }

    setIsLoading(true);

    if (isAutoDelivery) {
      const { data: stockItems, error: stockError } = await supabase
        .from('stock_items')
        .select('id, content')
        .eq('product_option_id', selectedOption.id)
        .eq('is_sold', false)
        .limit(quantity);

      if (stockError || !stockItems || stockItems.length < quantity) {
        toast({ title: 'خطأ', description: 'المخزون غير كافي', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const combinedContent = stockItems.map(item => item.content).join('\n');

      const { error: orderError } = await supabase.from('orders').insert({
        token_id: tokenData.id,
        product_id: product.id,
        product_option_id: selectedOption.id,
        amount: totalPrice,
        total_price: totalPrice,
        status: 'completed',
        stock_content: combinedContent
      });

      if (orderError) {
        toast({ title: 'خطأ', description: 'فشل في إرسال الطلب', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const stockIds = stockItems.map(item => item.id);
      await supabase.from('stock_items').update({ is_sold: true, sold_at: new Date().toISOString() }).in('id', stockIds);

      const newBalance = tokenBalance - totalPrice;
      await supabase.from('tokens').update({ balance: newBalance }).eq('id', tokenData.id);

      setTokenBalance(newBalance);
      setResponseMessage(combinedContent);
      setResult('success');
      setIsLoading(false);
      setStep('result');
      return;
    }

    // Manual delivery
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      token_id: tokenData.id,
      product_id: product.id,
      product_option_id: selectedOption.id,
      amount: totalPrice,
      total_price: totalPrice,
      status: 'pending'
    }).select('id').single();

    if (orderError || !orderData) {
      toast({ title: 'خطأ', description: 'فشل في إرسال الطلب', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const newBalance = tokenBalance - totalPrice;
    await supabase.from('tokens').update({ balance: newBalance }).eq('id', tokenData.id);

    setTokenBalance(newBalance);
    setActiveOrderId(orderData.id);
    toast({ title: 'تم', description: 'تم إرسال الطلب بنجاح' });
    setIsLoading(false);
  };

  const handleReset = () => {
    setToken('');
    setSelectedProductId('');
    setSelectedOptionId('');
    setQuantity(1);
    setStep('initial');
    setResult(null);
    setTokenData(null);
    setTokenBalance(null);
    setResponseMessage(null);
    setActiveOrderId(null);
  };

  const handleShowBalance = async () => {
    if (!token.trim()) return;
    setIsLoading(true);
    const data = await verifyToken(token);

    if (data) {
      setTokenData(data);
      setTokenBalance(Number(data.balance));
      setShowBalance(true);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('token_id', data.id)
        .order('created_at', { ascending: false });

      const { data: rechargesData } = await supabase
        .from('recharge_requests')
        .select('*')
        .eq('token_id', data.id)
        .order('created_at', { ascending: false });

      setTokenOrders((ordersData || []) as Order[]);
      setTokenRecharges((rechargesData || []) as RechargeRequest[]);
    } else {
      toast({ title: 'خطأ', description: 'التوكن غير صالح', variant: 'destructive' });
      setShowBalance(false);
    }
    setIsLoading(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return { label: 'مكتمل', icon: CheckCircle2, color: 'text-green-600' };
      case 'rejected':
        return { label: 'مرفوض', icon: XCircle, color: 'text-red-600' };
      case 'in_progress':
        return { label: 'قيد التنفيذ', icon: Loader2, color: 'text-blue-600' };
      case 'cancelled':
        return { label: 'ملغي', icon: Ban, color: 'text-muted-foreground' };
      default:
        return { label: 'قيد الانتظار', icon: Clock, color: 'text-yellow-600' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy Card */}
          <div className="card-simple p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-primary">اشتري من هنا</h2>
            </div>

            {step === 'initial' && (
              <div className="space-y-4">
                <Select value={selectedProductId} onValueChange={(v) => { setSelectedProductId(v); setSelectedOptionId(''); }}>
                  <SelectTrigger><SelectValue placeholder="اختر منتج..." /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                {product && options.length > 0 && (
                  <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
                    <SelectTrigger><SelectValue placeholder="اختر نوع الخدمة..." /></SelectTrigger>
                    <SelectContent>
                      {options.map((opt) => <SelectItem key={opt.id} value={opt.id}>{opt.name} - ${opt.price}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}

                <input type="text" value={token} onChange={(e) => setToken(e.target.value)} className="input-field w-full" placeholder="ادخل التوكن" />

                <button onClick={handleBuySubmit} disabled={!token.trim() || !selectedProductId || !selectedOptionId || isLoading} className="btn-primary w-full py-3 disabled:opacity-50">
                  {isLoading ? 'جاري التحقق...' : 'متابعة'}
                </button>
              </div>
            )}

            {step === 'details' && selectedOption && tokenBalance !== null && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p>الرصيد: <span className="font-bold">${tokenBalance}</span></p>
                  <p>السعر: <span className="font-bold text-primary">${selectedOption.price}</span></p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('initial')} className="flex-1 py-3 border border-border rounded-lg">رجوع</button>
                  <button onClick={handleOrderSubmit} disabled={isLoading || tokenBalance < Number(selectedOption.price)} className="btn-primary flex-1 py-3 disabled:opacity-50">
                    {isLoading ? 'جاري المعالجة...' : 'إرسال الطلب'}
                  </button>
                </div>
              </div>
            )}

            {step === 'result' && (
              <div className="text-center py-4 space-y-4">
                {result === 'success' ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <h3 className="text-lg font-bold text-green-600">تم تفعيل الخدمة بنجاح!</h3>
                    {responseMessage && (
                      <div className="p-4 bg-card border rounded-lg text-right">
                        <div className="flex justify-between mb-2">
                          <button onClick={() => { navigator.clipboard.writeText(responseMessage); toast({ title: 'تم النسخ' }); }} className="p-2 hover:bg-muted rounded"><Copy className="w-4 h-4" /></button>
                          <span className="text-sm font-medium">محتوى الطلب</span>
                        </div>
                        <pre className="text-sm whitespace-pre-wrap">{responseMessage}</pre>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                    <h3 className="text-lg font-bold text-red-600">فشل في إتمام الطلب</h3>
                  </>
                )}
                <button onClick={handleReset} className="btn-primary w-full py-3">طلب جديد</button>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="card-simple p-6">
            {activeOrderId ? (
              <OrderChat orderId={activeOrderId} senderType="customer" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-primary">معلومات الرصيد</h2>
                </div>

                <div className="space-y-4">
                  <input type="text" value={token} onChange={(e) => { setToken(e.target.value); setShowBalance(false); }} className="input-field w-full" placeholder="ادخل التوكن" />
                  <button onClick={handleShowBalance} disabled={!token.trim() || isLoading} className="btn-primary w-full py-3 disabled:opacity-50">
                    {isLoading ? 'جاري التحقق...' : 'عرض الرصيد'}
                  </button>

                  {showBalance && tokenBalance !== null && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                        <div className="flex justify-between">
                          <span>الرصيد:</span>
                          <span className="text-2xl font-bold text-primary">${tokenBalance}</span>
                        </div>
                      </div>

                      {tokenOrders.length > 0 && (
                        <div className="border-t pt-4">
                          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><ShoppingCart className="w-4 h-4" />الطلبات ({tokenOrders.length})</h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {tokenOrders.map((order) => {
                              const statusInfo = getStatusInfo(order.status);
                              const StatusIcon = statusInfo.icon;
                              return (
                                <div key={order.id} className="bg-muted/30 rounded-lg p-3 border">
                                  <div className="flex justify-between">
                                    <span className="font-mono text-xs">#{order.order_number}</span>
                                    <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                                      <StatusIcon className="w-3 h-3" />
                                      <span className="text-xs">{statusInfo.label}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
