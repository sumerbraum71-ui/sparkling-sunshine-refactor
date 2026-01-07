import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface Order {
  id: string;
  products?: { name: string } | null;
}

interface Message {
  id: string;
  order_id: string;
  sender_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface OrderChatProps {
  order: Order;
  onClose: () => void;
  isAdmin: boolean;
}

const OrderChat = ({ order, onClose, isAdmin }: OrderChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`order-messages-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${order.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Mark messages as read
    if (messages.length > 0) {
      const unreadMessages = messages.filter(
        (m) => !m.is_read && m.sender_type !== (isAdmin ? "admin" : "user")
      );
      if (unreadMessages.length > 0) {
        supabase
          .from("order_messages")
          .update({ is_read: true })
          .in(
            "id",
            unreadMessages.map((m) => m.id)
          )
          .then();
      }
    }
  }, [messages, isAdmin]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("order_messages")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);

    const { error } = await supabase.from("order_messages").insert({
      order_id: order.id,
      sender_type: isAdmin ? "admin" : "user",
      message: newMessage.trim(),
    });

    if (error) {
      toast.error("حدث خطأ أثناء إرسال الرسالة");
    } else {
      setNewMessage("");
    }

    setSending(false);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            محادثة الطلب - {order.products?.name || "طلب"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                لا توجد رسائل بعد. ابدأ المحادثة الآن.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    (isAdmin && message.sender_type === "admin") ||
                    (!isAdmin && message.sender_type === "user")
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      (isAdmin && message.sender_type === "admin") ||
                      (!isAdmin && message.sender_type === "user")
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString("ar-SA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك..."
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderChat;
