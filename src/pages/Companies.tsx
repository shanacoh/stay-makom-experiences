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
      const { error } = await supabase.functions.invoke("send-corporate-request", {
        body: data,
      });

      if (error) throw error;

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
      <section className="relative h-[70vh] overflow-hidden">
        <img 
          src={corporateHero}
          alt="Team retreat moment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl space-y-6">
            <h1 className="font-sans text-5xl md:text-7xl font-bold text-white tracking-tight">
              Create meaningful moments for your team.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto">
              Corporate escapes, wellbeing retreats, team-building experiences and curated gift cards — crafted to inspire and connect.
            </p>
            
            <div className="pt-8">
              <Button 
                size="lg"
                onClick={() => scrollToForm()}
                className="bg-white text-foreground hover:bg-white/90 font-medium"
              >
                Send a Request
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-20 space-y-32">
        {/* What We Offer Section */}
        <section>
          <h2 className="font-sans text-4xl font-bold text-center mb-16">What We Offer</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Corporate Gift Packages */}
            <Card className="shadow-medium border-0">
              <CardContent className="pt-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-sans text-2xl font-bold">Corporate Gift Packages</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Instead of material gifts, offer your employees the chance to experience Israel in a whole new way:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Romantic escapes for two</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Family adventures to share with loved ones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Adrenaline-packed active breaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Wellness retreats to recharge body and mind</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Team-Building Experiences */}
            <Card className="shadow-medium border-0">
              <CardContent className="pt-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-sans text-2xl font-bold">Team-Building Experiences</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Strengthen bonds and reward your team with unforgettable collective moments.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From a sunrise hike in the desert to a private culinary journey in a vineyard, our tailor-made escapes bring people together.
                </p>
              </CardContent>
            </Card>

            {/* Customized Incentives */}
            <Card className="shadow-medium border-0">
              <CardContent className="pt-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-sans text-2xl font-bold">Customized Incentives</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We curate exclusive packages that align with your company's DNA.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you want to celebrate achievements, reward loyalty, or simply say "thank you", MAKOM creates the perfect experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why MAKOM Section */}
        <section className="bg-secondary/30 rounded-2xl p-12">
          <h2 className="font-sans text-4xl font-bold text-center mb-12">Why MAKOM?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Unique & Authentic</h3>
              <p className="text-sm text-muted-foreground">
                Every escape is designed to showcase the real Israel, beyond clichés.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Flexible & Scalable</h3>
              <p className="text-sm text-muted-foreground">
                From one employee to an entire department, our solutions adapt to your needs.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Seamless</h3>
              <p className="text-sm text-muted-foreground">
                We handle everything — you simply choose the experience, and we deliver it.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section>
          <h2 className="font-sans text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold text-lg">Choose the package</h3>
              <p className="text-sm text-muted-foreground">
                Gift card, themed experience, or tailor-made escape.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold text-lg">Personalize</h3>
              <p className="text-sm text-muted-foreground">
                Add your company branding or a personal note.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold text-lg">Surprise & delight</h3>
              <p className="text-sm text-muted-foreground">
                We deliver the experience directly to your employees.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => scrollToForm("corporate_gift_cards")}
            >
              Request Corporate Gift Cards
            </Button>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="scroll-mt-24">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-sans text-4xl font-bold text-center mb-4">
              Tell us what you're looking for.
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Fill out the form below and we'll get back to you with a tailored proposal.
            </p>

            {showSuccess ? (
              <Card className="shadow-medium border-0 bg-primary/5">
                <CardContent className="pt-12 pb-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Thank you — your request has been sent.</h3>
                  <p className="text-muted-foreground">
                    We will reply shortly with a tailored proposal.
                  </p>
                  <Button onClick={() => setShowSuccess(false)} variant="outline">
                    Send Another Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-medium border-0">
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          {...register("fullName")}
                          placeholder="Your name"
                        />
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          {...register("companyName")}
                          placeholder="Your company"
                        />
                        {errors.companyName && (
                          <p className="text-sm text-destructive">{errors.companyName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Work Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="you@company.com"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                          id="phone"
                          {...register("phone")}
                          placeholder="+972 XX XXX XXXX"
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Type of Request *</Label>
                      <RadioGroup
                        value={requestType}
                        onValueChange={(value) => setValue("requestType", value as any)}
                      >
                        {Object.entries(requestTypeLabels).map(([value, label]) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={value} />
                            <Label htmlFor={value} className="font-normal cursor-pointer">
                              {label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {errors.requestType && (
                        <p className="text-sm text-destructive">{errors.requestType.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="groupSize">Estimated group size (optional)</Label>
                        <Input
                          id="groupSize"
                          {...register("groupSize")}
                          placeholder="e.g. 20-30 people"
                        />
                        {errors.groupSize && (
                          <p className="text-sm text-destructive">{errors.groupSize.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredDates">Preferred date(s) (optional)</Label>
                        <Input
                          id="preferredDates"
                          {...register("preferredDates")}
                          placeholder="e.g. March 2025"
                        />
                        {errors.preferredDates && (
                          <p className="text-sm text-destructive">{errors.preferredDates.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tell us more...</Label>
                      <Textarea
                        id="message"
                        {...register("message")}
                        placeholder="Share any additional details about what you're looking for"
                        className="min-h-[120px]"
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
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
