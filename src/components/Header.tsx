import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogOut, HelpCircle, RefreshCw, CreditCard } from "lucide-react";
import RechargeRequest from "@/components/RechargeRequest";

interface Token {
  id: string;
  token: string;
  balance: number;
}

interface HeaderProps {
  currentToken: Token | null;
  onLogout: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

const Header = ({ currentToken, onLogout, onBalanceUpdate }: HeaderProps) => {
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            BOOMPAY
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/faq">
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4 ml-2" />
                الأسئلة الشائعة
              </Button>
            </Link>
            <Link to="/refund">
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4 ml-2" />
                طلب استرداد
              </Button>
            </Link>
            {currentToken && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setRechargeOpen(true)}
                >
                  <CreditCard className="h-4 w-4 ml-2" />
                  شحن الرصيد
                </Button>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4 ml-2" />
                  خروج
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-primary">القائمة</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 ml-2" />
                    الأسئلة الشائعة
                  </Button>
                </Link>
                <Link to="/refund" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 ml-2" />
                    طلب استرداد
                  </Button>
                </Link>
                {currentToken && (
                  <>
                    <Button
                      variant="default"
                      className="w-full justify-start"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setRechargeOpen(true);
                      }}
                    >
                      <CreditCard className="h-4 w-4 ml-2" />
                      شحن الرصيد
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل الخروج
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Recharge Dialog */}
      {currentToken && (
        <RechargeRequest
          open={rechargeOpen}
          onOpenChange={setRechargeOpen}
          tokenId={currentToken.id}
          onSuccess={(amount) => onBalanceUpdate(currentToken.balance)}
        />
      )}
    </header>
  );
};

export default Header;
