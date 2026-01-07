import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import FAQ from "./pages/FAQ";
import Refund from "./pages/Refund";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* مسار الأدمن الجديد BOOM */}
          <Route path="/BOOM" element={<Admin />} />
          <Route path="/BOOM/auth" element={<AdminAuth />} />
          <Route path="/BOOM/login" element={<AdminAuth />} />
          <Route path="/admin" element={<NotFound />} /> {/* قفل المسار القديم */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
