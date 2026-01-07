import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
}

interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_active: boolean;
}

interface StockItem {
  id: string;
  product_option_id: string;
  content: string;
  is_sold: boolean;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [newStockContent, setNewStockContent] = useState("");
  
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Option form states
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState("");
  const [optionActive, setOptionActive] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("sort_order");

    const { data: optionsData } = await supabase
      .from("product_options")
      .select("*")
      .order("sort_order");

    if (productsData) setProducts(productsData);
    if (optionsData) setProductOptions(optionsData);
    setLoading(false);
  };

  const fetchStockItems = async (optionId: string) => {
    const { data } = await supabase
      .from("stock_items")
      .select("*")
      .eq("product_option_id", optionId)
      .order("created_at", { ascending: false });

    if (data) setStockItems(data);
  };

  const handleSaveProduct = async () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم المنتج");
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      category: category.trim() || null,
      is_active: isActive,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error("حدث خطأ أثناء التحديث");
      } else {
        toast.success("تم تحديث المنتج بنجاح");
      }
    } else {
      const { error } = await supabase.from("products").insert(productData);

      if (error) {
        toast.error("حدث خطأ أثناء الإضافة");
      } else {
        toast.success("تم إضافة المنتج بنجاح");
      }
    }

    resetForm();
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast.error("حدث خطأ أثناء الحذف");
    } else {
      toast.success("تم حذف المنتج بنجاح");
      fetchProducts();
    }
  };

  const handleSaveOption = async () => {
    if (!optionName.trim() || !optionPrice) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    const optionData = {
      product_id: selectedProductId,
      name: optionName.trim(),
      price: parseFloat(optionPrice),
      is_active: optionActive,
    };

    if (editingOption) {
      const { error } = await supabase
        .from("product_options")
        .update(optionData)
        .eq("id", editingOption.id);

      if (error) {
        toast.error("حدث خطأ أثناء التحديث");
      } else {
        toast.success("تم تحديث الخيار بنجاح");
      }
    } else {
      const { error } = await supabase.from("product_options").insert(optionData);

      if (error) {
        toast.error("حدث خطأ أثناء الإضافة");
      } else {
        toast.success("تم إضافة الخيار بنجاح");
      }
    }

    resetOptionForm();
    setOptionDialogOpen(false);
    fetchProducts();
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخيار؟")) return;

    const { error } = await supabase.from("product_options").delete().eq("id", id);

    if (error) {
      toast.error("حدث خطأ أثناء الحذف");
    } else {
      toast.success("تم حذف الخيار بنجاح");
      fetchProducts();
    }
  };

  const handleAddStock = async () => {
    if (!newStockContent.trim()) {
      toast.error("يرجى إدخال محتوى المخزون");
      return;
    }

    const items = newStockContent.split("\n").filter((line) => line.trim());
    const stockData = items.map((content) => ({
      product_option_id: selectedOptionId,
      content: content.trim(),
    }));

    const { error } = await supabase.from("stock_items").insert(stockData);

    if (error) {
      toast.error("حدث خطأ أثناء الإضافة");
    } else {
      toast.success(`تم إضافة ${items.length} عنصر للمخزون`);
      setNewStockContent("");
      fetchStockItems(selectedOptionId);
    }
  };

  const handleDeleteStockItem = async (id: string) => {
    const { error } = await supabase.from("stock_items").delete().eq("id", id);

    if (error) {
      toast.error("حدث خطأ أثناء الحذف");
    } else {
      toast.success("تم حذف العنصر");
      fetchStockItems(selectedOptionId);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setCategory("");
    setIsActive(true);
    setEditingProduct(null);
  };

  const resetOptionForm = () => {
    setOptionName("");
    setOptionPrice("");
    setOptionActive(true);
    setEditingOption(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setImageUrl(product.image_url || "");
    setCategory(product.category || "");
    setIsActive(product.is_active);
    setDialogOpen(true);
  };

  const openEditOption = (option: ProductOption) => {
    setEditingOption(option);
    setSelectedProductId(option.product_id);
    setOptionName(option.name);
    setOptionPrice(option.price.toString());
    setOptionActive(option.is_active);
    setOptionDialogOpen(true);
  };

  const openAddOption = (productId: string) => {
    resetOptionForm();
    setSelectedProductId(productId);
    setOptionDialogOpen(true);
  };

  const openStockDialog = (optionId: string) => {
    setSelectedOptionId(optionId);
    fetchStockItems(optionId);
    setStockDialogOpen(true);
  };

  const getProductOptions = (productId: string) => {
    return productOptions.filter((opt) => opt.product_id === productId);
  };

  const getStockCount = (optionId: string) => {
    return stockItems.filter((item) => item.product_option_id === optionId && !item.is_sold).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" />
          إدارة المنتجات
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم المنتج *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسم المنتج"
                />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف المنتج"
                />
              </div>
              <div className="space-y-2">
                <Label>رابط الصورة</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="التصنيف"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>نشط</Label>
              </div>
              <Button onClick={handleSaveProduct} className="w-full">
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    {product.category && (
                      <span className="text-sm text-muted-foreground">
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditProduct(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {product.description}
                </p>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">الخيارات:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAddOption(product.id)}
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة خيار
                  </Button>
                </div>
                {getProductOptions(product.id).map((option) => (
                  <div
                    key={option.id}
                    className="flex justify-between items-center p-2 bg-secondary/50 rounded"
                  >
                    <div>
                      <span className="font-medium">{option.name}</span>
                      <span className="text-primary mr-2">{option.price} ر.س</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStockDialog(option.id)}
                      >
                        المخزون
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditOption(option)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOption(option.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Option Dialog */}
      <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOption ? "تعديل الخيار" : "إضافة خيار جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اسم الخيار *</Label>
              <Input
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                placeholder="مثال: باقة شهرية"
              />
            </div>
            <div className="space-y-2">
              <Label>السعر *</Label>
              <Input
                type="number"
                value={optionPrice}
                onChange={(e) => setOptionPrice(e.target.value)}
                placeholder="0.00"
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={optionActive} onCheckedChange={setOptionActive} />
              <Label>نشط</Label>
            </div>
            <Button onClick={handleSaveOption} className="w-full">
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إدارة المخزون</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>إضافة للمخزون (سطر لكل عنصر)</Label>
              <Textarea
                value={newStockContent}
                onChange={(e) => setNewStockContent(e.target.value)}
                placeholder="ضع كل عنصر في سطر منفصل..."
                rows={4}
                dir="ltr"
              />
              <Button onClick={handleAddStock} className="w-full">
                إضافة للمخزون
              </Button>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">
                المخزون الحالي ({stockItems.filter((i) => !i.is_sold).length} متوفر)
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {stockItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-2 rounded text-sm ${
                      item.is_sold ? "bg-destructive/20" : "bg-secondary/50"
                    }`}
                  >
                    <span className="font-mono truncate flex-1" dir="ltr">
                      {item.content}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.is_sold && (
                        <span className="text-xs text-destructive">مباع</span>
                      )}
                      {!item.is_sold && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStockItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
