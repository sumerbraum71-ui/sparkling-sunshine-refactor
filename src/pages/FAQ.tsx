import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "ما هو التوكن؟",
      answer: "التوكن هو رمز فريد خاص بك يمكنك استخدامه للوصول إلى حسابك وشراء المنتجات. احتفظ بالتوكن في مكان آمن ولا تشاركه مع أحد.",
    },
    {
      question: "كيف أحصل على توكن؟",
      answer: "يمكنك الحصول على توكن من خلال التواصل مع الدعم أو الشراء من الموزعين المعتمدين.",
    },
    {
      question: "كيف أشحن رصيدي؟",
      answer: "اضغط على زر 'شحن الرصيد' في القائمة العلوية، ثم اختر طريقة الدفع المناسبة وأدخل المبلغ المطلوب مع رفع إثبات الدفع. سيتم مراجعة طلبك وإضافة الرصيد خلال دقائق.",
    },
    {
      question: "كم يستغرق شحن الرصيد؟",
      answer: "عادة ما يتم شحن الرصيد خلال 5-30 دقيقة من رفع إثبات الدفع، وقد يستغرق وقتاً أطول في بعض الحالات.",
    },
    {
      question: "كيف أشتري منتج؟",
      answer: "بعد تسجيل الدخول بالتوكن، اختر المنتج المطلوب من قائمة المنتجات واضغط على زر 'شراء'. سيتم خصم المبلغ من رصيدك وستحصل على المنتج فوراً.",
    },
    {
      question: "ماذا لو واجهت مشكلة في المنتج؟",
      answer: "يمكنك التواصل معنا من خلال صفحة المحادثة الخاصة بالطلب، أو تقديم طلب استرداد من صفحة 'طلب استرداد'.",
    },
    {
      question: "هل يمكنني استرداد أموالي؟",
      answer: "نعم، يمكنك طلب استرداد من خلال صفحة 'طلب استرداد'. سيتم مراجعة طلبك والرد عليك في أقرب وقت.",
    },
    {
      question: "كيف أتواصل مع الدعم؟",
      answer: "يمكنك التواصل معنا من خلال المحادثة في صفحة الطلب، أو من خلال وسائل التواصل المتاحة في الموقع.",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-cairo">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              الأسئلة الشائعة
            </h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card rounded-lg border border-border px-4"
            >
              <AccordionTrigger className="text-right hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
};

export default FAQ;
