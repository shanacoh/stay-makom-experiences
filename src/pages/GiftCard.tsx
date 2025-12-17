import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, addYears } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import giftCardHero from "@/assets/gift-card-hero.jpg";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

type Currency = "ILS" | "USD";

const currencySymbols: Record<Currency, string> = {
  ILS: "₪",
  USD: "$"
};

const predefinedAmounts: Record<Currency, number[]> = {
  ILS: [250, 500, 1000],
  USD: [50, 100, 250]
};

function generateGiftCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MK-${part1}-${part2}`;
}

export default function GiftCard() {
  const { navigateLocalized, getLocalizedPath } = useLocalizedNavigation();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isRTL = lang === 'he';
  
  // Form state
  const [currency, setCurrency] = useState<Currency>("ILS");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [deliveryType, setDeliveryType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount <= 0) {
      toast.error(lang === 'he' ? "אנא בחרו או הזינו סכום תקין" : "Please select or enter a valid amount");
      return;
    }
    
    if (!recipientEmail || !senderName || !senderEmail) {
      toast.error(lang === 'he' ? "אנא מלאו את כל השדות הנדרשים" : "Please fill in all required fields");
      return;
    }

    if (deliveryType === "scheduled" && !scheduledDate) {
      toast.error(lang === 'he' ? "אנא בחרו תאריך משלוח" : "Please select a delivery date");
      return;
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error(lang === 'he' ? "אנא הזינו אימייל נמען תקין" : "Please enter a valid recipient email");
      return;
    }
    if (!emailRegex.test(senderEmail)) {
      toast.error(lang === 'he' ? "אנא הזינו אימייל שולח תקין" : "Please enter a valid sender email");
      return;
    }

    setIsSubmitting(true);

    // Generate unique gift code
    const code = generateGiftCode();
    const now = new Date();
    const validUntil = addYears(now, 1);

    try {
      const { error } = await supabase.from("gift_cards").insert({
        code,
        type: "amount",
        amount,
        currency,
        sender_name: senderName,
        sender_email: senderEmail,
        recipient_name: recipientName || null,
        recipient_email: recipientEmail,
        message: message || null,
        delivery_type: deliveryType,
        delivery_date: deliveryType === "scheduled" && scheduledDate 
          ? scheduledDate.toISOString()
          : now.toISOString(),
        status: deliveryType === "now" ? "sent" : "scheduled",
        language: lang,
        sent_at: deliveryType === "now" ? now.toISOString() : null,
        expires_at: validUntil.toISOString(),
      });

      if (error) throw error;

      // Send gift card email if delivery is now
      if (deliveryType === "now") {
        const { error: emailError } = await supabase.functions.invoke("send-gift-card", {
          body: {
            code,
            amount,
            currency,
            sender_name: senderName,
            recipient_name: recipientName || "Friend",
            recipient_email: recipientEmail,
            message: message || null,
            valid_until: validUntil.toISOString(),
            language: lang
          }
        });
        
        if (emailError) {
          console.error("Email error:", emailError);
        }
      }

      // Navigate to confirmation page
      navigate(getLocalizedPath(`/gift-card/confirmation?code=${code}&type=amount`));
      toast.success(lang === 'he' ? "כרטיס המתנה נוצר בהצלחה!" : "Gift card created successfully!");
    } catch (error) {
      console.error("Error creating gift card:", error);
      toast.error(lang === 'he' ? "יצירת כרטיס המתנה נכשלה. אנא נסו שוב." : "Failed to create gift card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const symbol = currencySymbols[currency];
  const amounts = predefinedAmounts[currency];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] overflow-hidden">
        <img 
          src={giftCardHero}
          alt={t(lang, 'giftCardHeroTitle')}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {t(lang, 'giftCardHeroTitle')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 font-light">
              {t(lang, 'giftCardHeroSubtitle')}
            </p>
            
            <div className="flex justify-center pt-4">
              <Button 
                size="default"
                onClick={() => {
                  const element = document.getElementById("gift-by-amount");
                  element?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="bg-white text-foreground hover:bg-white/90 font-medium"
              >
                {t(lang, 'giftCardHeroCTA')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Gift by Amount Section */}
        <section id="gift-by-amount" className="scroll-mt-20">
          <div className="max-w-lg mx-auto">
            {/* Centered Intro */}
            <div className="text-center space-y-3 mb-8">
              <h2 className="font-sans text-2xl md:text-3xl font-bold">{t(lang, 'giftCardFormTitle')}</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t(lang, 'giftCardFormSubtitle')}
              </p>
            </div>

            {/* Centered Form Card */}
            <Card className="shadow-medium">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t(lang, 'giftCardSelectAmount')}</CardTitle>
                <CardDescription className="text-sm">{t(lang, 'giftCardSelectAmountDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Currency Selector */}
                <div className="space-y-1.5">
                  <Label className="text-sm">{t(lang, 'giftCardCurrency')}</Label>
                  <Select value={currency} onValueChange={(val) => {
                    setCurrency(val as Currency);
                    setSelectedAmount(null);
                    setCustomAmount("");
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ILS">ILS (₪)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Predefined Amounts */}
                <div className="grid grid-cols-3 gap-2">
                  {amounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                      className="h-auto py-3 flex flex-col"
                    >
                      <span className="text-xl font-bold">{symbol}{amount}</span>
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="custom-amount" className="text-sm">{t(lang, 'giftCardCustomAmount')}</Label>
                  <div className="relative">
                    <span className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground", isRTL ? "right-3" : "left-3")}>
                      {symbol}
                    </span>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder={t(lang, 'giftCardEnterAmount')}
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className={isRTL ? "pr-8" : "pl-8"}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm">{t(lang, 'giftCardMessage')}</Label>
                  <Textarea
                    id="message"
                    placeholder={t(lang, 'giftCardMessagePlaceholder')}
                    maxLength={200}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">{message.length}/200</p>
                </div>

                {/* Recipient Info */}
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="recipient-name" className="text-sm">{t(lang, 'giftCardRecipientName')}</Label>
                    <Input
                      id="recipient-name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={t(lang, 'giftCardRecipientNamePlaceholder')}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="recipient-email" className="text-sm">{t(lang, 'giftCardRecipientEmail')} *</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sender Info */}
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sender-name" className="text-sm">{t(lang, 'giftCardYourName')} *</Label>
                    <Input
                      id="sender-name"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sender-email" className="text-sm">{t(lang, 'giftCardYourEmail')} *</Label>
                    <Input
                      id="sender-email"
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="space-y-3">
                  <Label className="text-sm">{t(lang, 'giftCardDelivery')}</Label>
                  <RadioGroup 
                    value={deliveryType} 
                    onValueChange={(val) => setDeliveryType(val as "now" | "scheduled")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="now" id="delivery-now" />
                      <Label htmlFor="delivery-now" className="font-normal cursor-pointer">{t(lang, 'giftCardSendNow')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scheduled" id="delivery-scheduled" />
                      <Label htmlFor="delivery-scheduled" className="font-normal cursor-pointer">{t(lang, 'giftCardScheduleLater')}</Label>
                    </div>
                  </RadioGroup>

                  {deliveryType === "scheduled" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, "PPP") : t(lang, 'giftCardPickDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {/* Single CTA Button */}
                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? t(lang, 'giftCardProcessing')
                    : deliveryType === "now" 
                      ? t(lang, 'giftCardSendNowBtn')
                      : t(lang, 'giftCardScheduleBtn')
                  }
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-2xl mx-auto">
          <h2 className="font-sans text-xl font-bold text-center mb-6">{t(lang, 'giftCardFaqTitle')}</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-sm">
                {t(lang, 'giftCardFaq1Q')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {t(lang, 'giftCardFaq1A')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-sm">
                {t(lang, 'giftCardFaq2Q')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {t(lang, 'giftCardFaq2A')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-sm">
                {t(lang, 'giftCardFaq3Q')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {t(lang, 'giftCardFaq3A')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>

      <Footer />
    </div>
  );
}
