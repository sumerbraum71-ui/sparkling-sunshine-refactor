import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Loader2, Eye, Check, X } from "lucide-react";

interface RefundRequest {
  id: string;
  token_id: string;
  order_id: string | null;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  tokens?: { token: string };
}

const RefundManagement = () => {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("refund_requests")
      .select(`
        *,
        tokens (token)
      `)
      .order("created_at", { ascending: false });

    if (data) setRequests(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return;
    setProcessing(true);

    const { error } = await supabase
      .from("refund_requests")
      .update({ 
        status, 
        admin_notes: adminNotes || null 
      })
      .eq("id", selectedRequest.id);

    if (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } else {
      toast.success(`تم ${status === "approved" ? "قبول" : "رفض"} طلب الاسترداد`);
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    }
    setProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">قيد المراجعة</Badge>;
      case "approved":
        return <Badge className="bg-primary">مقبول</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(
    (req) => statusFilter === "all" || req.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          إدارة طلبات الاسترداد
        </h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="approved">مقبول</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التوكن</TableHead>
                  <TableHead>السبب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm" dir="ltr">
                      {request.tokens?.token?.slice(0, 9)}...
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.admin_notes || "");
                        }}
                      >
                        <Eye className="h-3 w-3 ml-1" />
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      لا توجد طلبات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل طلب الاسترداد</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">التوكن:</span>
                <p className="font-mono" dir="ltr">{selectedRequest.tokens?.token}</p>
              </div>

              {selectedRequest.order_id && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">رقم الطلب:</span>
                  <p className="font-mono text-sm" dir="ltr">{selectedRequest.order_id}</p>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">سبب الاسترداد:</span>
                <p className="p-3 bg-secondary/50 rounded">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.status === "pending" && (
                <>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">ملاحظات الإدارة:</span>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="ملاحظات اختيارية..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateStatus("approved")}
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 ml-2" />
                          قبول
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus("rejected")}
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 ml-2" />
                          رفض
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.admin_notes && selectedRequest.status !== "pending" && (
                <div className="p-3 bg-secondary/50 rounded">
                  <span className="text-sm text-muted-foreground">ملاحظات الإدارة:</span>
                  <p>{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundManagement;
