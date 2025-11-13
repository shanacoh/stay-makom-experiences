import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Gift, Heart, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function GiftCard() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<"amount" | "experience" | null>(null);
  
  // Gift by Amount state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [amountMessage, setAmountMessage] = useState("");
  const [amountRecipientEmail, setAmountRecipientEmail] = useState("");
  const [amountSenderName, setAmountSenderName] = useState("");
  const [amountSenderEmail, setAmountSenderEmail] = useState("");
  const [amountDeliveryDate, setAmountDeliveryDate] = useState<Date>();
  const [amountDeliveryType, setAmountDeliveryType] = useState<"now" | "scheduled">("now");
  
  // Gift by Experience state
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>("");
  const [experienceMessage, setExperienceMessage] = useState("");
  const [experienceRecipientEmail, setExperienceRecipientEmail] = useState("");
  const [experienceSenderName, setExperienceSenderName] = useState("");
  const [experienceSenderEmail, setExperienceSenderEmail] = useState("");

  // Fetch published experiences
  const { data: experiences, isLoading } = useQuery({
    queryKey: ["experiences-for-gifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("id, title, subtitle, hero_image, base_price, currency, slug")
        .eq("status", "published")
        .order("title");
      
      if (error) throw error;
      return data;
    },
  });

  const selectedExperience = experiences?.find(exp => exp.id === selectedExperienceId);

  const scrollToSection = (section: "amount" | "experience") => {
    setSelectedOption(section);
    const element = document.getElementById(section === "amount" ? "gift-by-amount" : "gift-by-experience");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAmountSubmit = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount <= 0) {
      toast.error("Please select or enter a valid amount");
      return;
    }
    
    if (!amountRecipientEmail || !amountSenderName || !amountSenderEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Generate unique gift code
    const code = `STAY-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    try {
      const { error } = await supabase.from("gift_cards").insert({
        code,
        type: "amount",
        amount,
        currency: "ILS",
        sender_name: amountSenderName,
        sender_email: amountSenderEmail,
        recipient_email: amountRecipientEmail,
        message: amountMessage || null,
        delivery_date: amountDeliveryType === "scheduled" && amountDeliveryDate 
          ? amountDeliveryDate.toISOString()
          : new Date().toISOString(),
      });

      if (error) throw error;

      // Navigate to confirmation page
      navigate(`/gift-card/confirmation?code=${code}&type=amount`);
      toast.success("Gift card created successfully!");
    } catch (error) {
      console.error("Error creating gift card:", error);
      toast.error("Failed to create gift card. Please try again.");
    }
  };

  const handleExperienceSubmit = async () => {
    if (!selectedExperienceId) {
      toast.error("Please select an experience");
      return;
    }
    
    if (!experienceRecipientEmail || !experienceSenderName || !experienceSenderEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Generate unique gift code
    const code = `STAY-EXP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    try {
      const { error } = await supabase.from("gift_cards").insert({
        code,
        type: "experience",
        experience_id: selectedExperienceId,
        currency: selectedExperience?.currency || "ILS",
        sender_name: experienceSenderName,
        sender_email: experienceSenderEmail,
        recipient_email: experienceRecipientEmail,
        message: experienceMessage || null,
      });

      if (error) throw error;

      // Navigate to confirmation page
      navigate(`/gift-card/confirmation?code=${code}&type=experience`);
      toast.success("Gift card created successfully!");
    } catch (error) {
      console.error("Error creating gift card:", error);
      toast.error("Failed to create gift card. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
          alt="Gift a Staymakom moment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl space-y-6">
            <h1 className="font-sans text-5xl md:text-7xl font-bold text-white tracking-tight">
              Give a Staymakom moment.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light">
              Curated stays, crafted stories, meaningful gifts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg"
                onClick={() => scrollToSection("amount")}
                className="bg-white text-foreground hover:bg-white/90 font-medium"
              >
                Gift by Amount
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("experience")}
                className="border-white text-white hover:bg-white hover:text-foreground"
              >
                Gift an Experience
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-20 space-y-32">
        {/* Gift by Amount Section */}
        <section id="gift-by-amount" className="scroll-mt-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Gift className="h-4 w-4" />
                <span className="text-sm font-medium">Gift by Amount</span>
              </div>
              <h2 className="font-sans text-4xl font-bold">Gift a stay, your way.</h2>
              <p className="text-lg text-muted-foreground">
                Choose an amount, and let them explore Israel's most inspiring hotels and experiences.
              </p>
            </div>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Select Amount</CardTitle>
                <CardDescription>Freedom to choose. A journey waiting to begin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[250, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                      className="h-auto py-4 flex flex-col"
                    >
                      <span className="text-2xl font-bold">₪{amount}</span>
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Custom Amount</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount-message">Add a message (optional)</Label>
                  <Textarea
                    id="amount-message"
                    placeholder="Write a personal message..."
                    maxLength={200}
                    value={amountMessage}
                    onChange={(e) => setAmountMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">{amountMessage.length}/200</p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount-recipient-email">Recipient Email *</Label>
                    <Input
                      id="amount-recipient-email"
                      type="email"
                      required
                      value={amountRecipientEmail}
                      onChange={(e) => setAmountRecipientEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount-sender-name">Your Name *</Label>
                    <Input
                      id="amount-sender-name"
                      required
                      value={amountSenderName}
                      onChange={(e) => setAmountSenderName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount-sender-email">Your Email *</Label>
                    <Input
                      id="amount-sender-email"
                      type="email"
                      required
                      value={amountSenderEmail}
                      onChange={(e) => setAmountSenderEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Delivery</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={amountDeliveryType === "now" ? "default" : "outline"}
                      onClick={() => setAmountDeliveryType("now")}
                      className="flex-1"
                    >
                      Send Now
                    </Button>
                    <Button
                      type="button"
                      variant={amountDeliveryType === "scheduled" ? "default" : "outline"}
                      onClick={() => setAmountDeliveryType("scheduled")}
                      className="flex-1"
                    >
                      Schedule
                    </Button>
                  </div>

                  {amountDeliveryType === "scheduled" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !amountDeliveryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {amountDeliveryDate ? format(amountDeliveryDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={amountDeliveryDate}
                          onSelect={setAmountDeliveryDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleAmountSubmit}
                >
                  Send Gift Card
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gift by Experience Section */}
        <section id="gift-by-experience" className="scroll-mt-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Select Experience</CardTitle>
                <CardDescription>Because some memories are worth planning.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="experience-select">Choose an Experience</Label>
                  <Select value={selectedExperienceId} onValueChange={setSelectedExperienceId}>
                    <SelectTrigger id="experience-select">
                      <SelectValue placeholder="Select an experience..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : experiences?.length === 0 ? (
                        <SelectItem value="none" disabled>No experiences available</SelectItem>
                      ) : (
                        experiences?.map((exp) => (
                          <SelectItem key={exp.id} value={exp.id}>
                            {exp.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedExperience && (
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={selectedExperience.hero_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945"}
                      alt={selectedExperience.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-lg">{selectedExperience.title}</h3>
                      {selectedExperience.subtitle && (
                        <p className="text-sm text-muted-foreground">{selectedExperience.subtitle}</p>
                      )}
                      <p className="text-lg font-bold text-primary">
                        {selectedExperience.currency === "USD" ? "$" : "₪"}
                        {selectedExperience.base_price}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="experience-message">Add a message (optional)</Label>
                  <Textarea
                    id="experience-message"
                    placeholder="Write a personal message..."
                    maxLength={200}
                    value={experienceMessage}
                    onChange={(e) => setExperienceMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">{experienceMessage.length}/200</p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience-recipient-email">Recipient Email *</Label>
                    <Input
                      id="experience-recipient-email"
                      type="email"
                      required
                      value={experienceRecipientEmail}
                      onChange={(e) => setExperienceRecipientEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience-sender-name">Your Name *</Label>
                    <Input
                      id="experience-sender-name"
                      required
                      value={experienceSenderName}
                      onChange={(e) => setExperienceSenderName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience-sender-email">Your Email *</Label>
                    <Input
                      id="experience-sender-email"
                      type="email"
                      required
                      value={experienceSenderEmail}
                      onChange={(e) => setExperienceSenderEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleExperienceSubmit}
                  disabled={!selectedExperienceId}
                >
                  Gift this Experience
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">Gift by Experience</span>
              </div>
              <h2 className="font-sans text-4xl font-bold">Gift a curated experience.</h2>
              <p className="text-lg text-muted-foreground">
                Choose one of our handpicked experiences and share it with someone special.
              </p>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Carefully Curated</p>
                    <p className="text-sm text-muted-foreground">Each experience is handpicked for quality and authenticity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Flexible Booking</p>
                    <p className="text-sm text-muted-foreground">Recipients can schedule their stay when it suits them</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Memorable Moments</p>
                    <p className="text-sm text-muted-foreground">Give the gift of unforgettable experiences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="font-sans text-3xl font-bold text-center mb-8">Common Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                How long is my gift card valid?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                All Staymakom gift cards are valid for 12 months from the purchase date. 
                This gives recipients plenty of time to choose the perfect moment for their stay.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Can the recipient change the experience?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! Recipients can redeem their gift card for any available Staymakom experience 
                of equal or lesser value. If they choose something more expensive, they can pay the difference.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Is the gift card refundable?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Gift cards are non-refundable, but they can be transferred to someone else. 
                Simply contact us with the gift card code and the new recipient's email address.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>

      <Footer />
    </div>
  );
}
