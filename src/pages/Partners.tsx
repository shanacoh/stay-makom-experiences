import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import partnersHero from "@/assets/partners-hero.jpg";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  hotel_name: z.string().trim().min(1, "Hotel name is required").max(200),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(1, "Phone is required").max(50),
  message: z.string().trim().min(1, "Message is required").max(1000)
});

type FormData = z.infer<typeof formSchema>;

const Partners = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      hotel_name: "",
      email: "",
      phone: "",
      message: ""
    }
  });

  const { data: settings } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_settings")
        .select("*")
        .eq("key", "site_config")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const scrollToForm = () => {
    document.getElementById("partner-form")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("leads")
        .insert({
          source: "partners",
          name: data.name,
          email: data.email,
          phone: data.phone,
          property_name: data.hotel_name,
          message: data.message,
          is_b2b: true,
        });

      if (error) throw error;

      setShowSuccess(true);
      form.reset();
      toast.success("Thank you for your interest!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={partnersHero} alt="Boutique hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 font-sans font-bold text-slate-50">
            Let's create extraordinary stays together.
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-6 text-white/90">
            Join a curated network of Israel's most inspiring hotels and experiences.
          </p>
          <Button onClick={() => navigate("/auth")} size="default" className="bg-slate-50 text-slate-950">
            Log in to your hotel account
          </Button>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Why Join Section */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-10">
            Why Join STAYMAKOM
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-lg mb-3">Curated visibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Be featured among the most inspiring stays — where storytelling meets discovery.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg mb-3">Experience-first approach</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Guests discover your hotel through unique rituals, moments and tailored escapes.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg mb-3">No risk, no upfront cost</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We work on commission only. You focus on hosting; we handle the rest.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="mb-16 bg-white rounded-lg p-8">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-6">
            What We Offer
          </h2>
          <p className="text-sm text-center mb-8 max-w-2xl mx-auto text-muted-foreground">
            From storytelling to photography, content curation and experience design, STAYMAKOM elevates your property.
          </p>
          <ul className="space-y-3 max-w-md mx-auto text-sm">
            <li className="flex items-start gap-3">
              <span className="text-[#D72638] mt-0.5">•</span>
              <span>Dedicated hotel page with curated visuals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D72638] mt-0.5">•</span>
              <span>Experience creation support</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D72638] mt-0.5">•</span>
              <span>Add-ons & upsell system</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D72638] mt-0.5">•</span>
              <span>Seamless booking management</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D72638] mt-0.5">•</span>
              <span>Access to the hotel admin dashboard</span>
            </li>
          </ul>
        </section>

        {/* Partner Form Section */}
        <section id="partner-form" className="max-w-lg mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">
            Become a Partner
          </h2>

          {showSuccess ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="mb-4 text-[#D72638]">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl mb-3">Thank you!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                We'll get back to you shortly with next steps.
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowSuccess(false)}>
                Submit Another Request
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-lg p-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hotel_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Hotel Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your hotel name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+972 XX XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Tell us more about your property *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share what makes your hotel unique..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#D72638] hover:bg-[#D72638]/90">
                  {isSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </form>
            </Form>
          )}
        </section>

        {/* Direct Contact Section */}
        {settings?.partners_email && (
          <section className="text-center border-t pt-8 mt-8">
            <h3 className="font-serif text-lg mb-4">Contact us directly</h3>
            <a href={`mailto:${settings.partners_email}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#D72638] transition-colors">
              <Mail className="w-4 h-4" />
              {settings.partners_email}
            </a>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Partners;