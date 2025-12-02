import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Gift, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import corporateHero from "@/assets/corporate-hero.jpg";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  companyName: z.string().trim().max(100, "Company name must be less than 100 characters").optional(),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
  requestType: z.enum([
    "corporate_gift_cards",
    "team_building",
    "corporate_retreat",
    "employee_reward",
    "customized_incentive",
    "other"
  ]),
  groupSize: z.string().trim().max(50, "Group size must be less than 50 characters").optional(),
  preferredDates: z.string().trim().max(200, "Preferred dates must be less than 200 characters").optional(),
  message: z.string().trim().max(1000, "Message must be less than 1000 characters").optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Companies() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestType: "corporate_gift_cards",
    },
  });

  const requestType = watch("requestType");

  const scrollToForm = (type?: string) => {
    if (type) {
      setValue("requestType", type as any);
    }
    const element = document.getElementById("contact-form");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Save to leads table
      const { error: leadsError } = await supabase
        .from("leads")
        .insert({
          source: "corporate",
          name: data.fullName,
          email: data.email,
          phone: data.phone || null,
          company_name: data.companyName || null,
          request_type: data.requestType,
          group_size: data.groupSize || null,
          preferred_dates: data.preferredDates || null,
          message: data.message || null,
          is_b2b: true,
        });

      if (leadsError) throw leadsError;

      // Also send email notification via edge function
      await supabase.functions.invoke("send-corporate-request", {
        body: data,
      });

      setShowSuccess(true);
      reset();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request. Please try again or contact us directly at hello@staymakom.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestTypeLabels = {
    corporate_gift_cards: "Corporate Gift Cards",
    team_building: "Team-Building Experience",
    corporate_retreat: "Corporate Retreat / Offsite",
    employee_reward: "Employee Reward (individual gifts)",
    customized_incentive: "Customized Incentive",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] overflow-hidden">
        <img 
          src={corporateHero}
          alt="Team retreat moment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl space-y-4">
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Create meaningful moments for your team.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 font-light max-w-2xl mx-auto">
              Corporate escapes, wellbeing retreats, team-building experiences and curated gift cards.
            </p>
            
            <div className="pt-4">
              <Button 
                size="default"
                onClick={() => scrollToForm()}
                className="bg-white text-foreground hover:bg-white/90 font-medium"
              >
                Send a Request
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* What We Offer Section */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-center mb-10">What We Offer</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Corporate Gift Packages */}
            <Card className="shadow-medium border-0">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-sans text-lg font-bold">Corporate Gift Packages</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Offer your employees the chance to experience Israel in a whole new way:
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Romantic escapes for two</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Family adventures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Wellness retreats</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Team-Building Experiences */}
            <Card className="shadow-medium border-0">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-sans text-lg font-bold">Team-Building Experiences</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Strengthen bonds and reward your team with unforgettable collective moments.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  From sunrise hikes to private culinary journeys.
                </p>
              </CardContent>
            </Card>

            {/* Customized Incentives */}
            <Card className="shadow-medium border-0">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-sans text-lg font-bold">Customized Incentives</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We curate exclusive packages that align with your company's DNA.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Celebrate achievements or simply say "thank you".
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why MAKOM Section */}
        <section className="bg-secondary/30 rounded-xl p-8">
          <h2 className="font-sans text-2xl font-bold text-center mb-8">Why MAKOM?</h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Unique & Authentic</h3>
              <p className="text-xs text-muted-foreground">
                Every escape showcases the real Israel, beyond clichés.
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Flexible & Scalable</h3>
              <p className="text-xs text-muted-foreground">
                From one employee to an entire department.
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Seamless</h3>
              <p className="text-xs text-muted-foreground">
                We handle everything — you simply choose.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section>
          <h2 className="font-sans text-2xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold text-sm">Choose the package</h3>
              <p className="text-xs text-muted-foreground">
                Gift card, themed experience, or tailor-made escape.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold text-sm">Personalize</h3>
              <p className="text-xs text-muted-foreground">
                Add your company branding or a personal note.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold text-sm">Surprise & delight</h3>
              <p className="text-xs text-muted-foreground">
                We deliver directly to your employees.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="default"
              onClick={() => scrollToForm("corporate_gift_cards")}
            >
              Request Corporate Gift Cards
            </Button>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="scroll-mt-20">
          <div className="max-w-lg mx-auto">
            <h2 className="font-sans text-2xl font-bold text-center mb-3">
              Tell us what you're looking for.
            </h2>
            <p className="text-center text-sm text-muted-foreground mb-8">
              Fill out the form below and we'll get back to you with a tailored proposal.
            </p>

            {showSuccess ? (
              <Card className="shadow-medium border-0 bg-primary/5">
                <CardContent className="pt-8 pb-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Thank you — your request has been sent.</h3>
                  <p className="text-sm text-muted-foreground">
                    We will reply shortly with a tailored proposal.
                  </p>
                  <Button onClick={() => setShowSuccess(false)} variant="outline" size="sm">
                    Send Another Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-medium border-0">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                        <Input
                          id="fullName"
                          {...register("fullName")}
                          placeholder="Your name"
                        />
                        {errors.fullName && (
                          <p className="text-xs text-destructive">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="companyName" className="text-sm">Company Name</Label>
                        <Input
                          id="companyName"
                          {...register("companyName")}
                          placeholder="Your company"
                        />
                        {errors.companyName && (
                          <p className="text-xs text-destructive">{errors.companyName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm">Work Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="you@company.com"
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-sm">Phone (optional)</Label>
                        <Input
                          id="phone"
                          {...register("phone")}
                          placeholder="+972 XX XXX XXXX"
                        />
                        {errors.phone && (
                          <p className="text-xs text-destructive">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Type of Request *</Label>
                      <RadioGroup
                        value={requestType}
                        onValueChange={(value) => setValue("requestType", value as any)}
                        className="space-y-1"
                      >
                        {Object.entries(requestTypeLabels).map(([value, label]) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={value} />
                            <Label htmlFor={value} className="font-normal cursor-pointer text-sm">
                              {label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {errors.requestType && (
                        <p className="text-xs text-destructive">{errors.requestType.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="groupSize" className="text-sm">Group Size</Label>
                        <Input
                          id="groupSize"
                          {...register("groupSize")}
                          placeholder="e.g. 10-50 people"
                        />
                        {errors.groupSize && (
                          <p className="text-xs text-destructive">{errors.groupSize.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="preferredDates" className="text-sm">Preferred Dates</Label>
                        <Input
                          id="preferredDates"
                          {...register("preferredDates")}
                          placeholder="e.g. Q1 2025"
                        />
                        {errors.preferredDates && (
                          <p className="text-xs text-destructive">{errors.preferredDates.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-sm">Message (optional)</Label>
                      <Textarea
                        id="message"
                        {...register("message")}
                        placeholder="Tell us more about your request..."
                        className="min-h-[80px]"
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}