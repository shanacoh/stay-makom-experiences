import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Instagram } from "lucide-react";
import contactHero from "@/assets/contact-hero-new.jpg";
import { supabase } from "@/integrations/supabase/client";
const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.enum(["general", "experience", "corporate", "partnership", "other"]),
  message: z.string().trim().min(1, "Message is required").max(1000)
});
type FormData = z.infer<typeof formSchema>;
const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "general",
      message: ""
    }
  });
  const {
    data: settings
  } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("global_settings").select("*").eq("key", "site_config").maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from("leads").insert({
        source: "contact",
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      });
      if (error) throw error;
      setShowSuccess(true);
      form.reset();
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const subjectLabels = {
    general: "General question",
    experience: "Experience inquiry",
    corporate: "Corporate request",
    partnership: "Hotel partnership",
    other: "Other"
  };
  return <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={contactHero} alt="Contact us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 text-center text-white px-6 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-slate-50">STAYMAKOM  
Reimagining the way we travel</h1>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Contact Text */}
        <section className="text-center mb-10">
          <p className="text-base text-muted-foreground leading-relaxed">Questions, ideas, partnership requests? 
Send us a message and we'll be happy to help ! <br />
            Send us a message — we'll be happy to help.
          </p>
        </section>

        {/* Contact Form */}
        <section className="max-w-lg mx-auto mb-12">
          {showSuccess ? <div className="bg-[#FAF8F5] rounded-lg p-8 text-center">
              <div className="mb-4 text-[#D72638]">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl mb-3">Thank you!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                We'll get back to you shortly.
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowSuccess(false)}>
                Send Another Message
              </Button>
            </div> : <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem>
                      <FormLabel className="text-sm">Your Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                      <FormLabel className="text-sm">Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="subject" render={({
              field
            }) => <FormItem>
                      <FormLabel className="text-sm">Subject *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(subjectLabels).map(([value, label]) => <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="message" render={({
              field
            }) => <FormItem>
                      <FormLabel className="text-sm">Message *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us how we can help..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#D72638] hover:bg-[#D72638]/90">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>}
        </section>

        {/* Direct Contact Info */}
        <section className="text-center border-t pt-8">
          <h3 className="font-serif text-xl mb-4">Get in touch directly</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground text-sm">
            {settings?.contact_email && <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-[#D72638] transition-colors">
                <Mail className="w-4 h-4" />
                {settings.contact_email}
              </a>}
            {settings?.instagram_handle && <a href={`https://instagram.com/${settings.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#D72638] transition-colors">
                <Instagram className="w-4 h-4" />
                {settings.instagram_handle.startsWith('@') ? settings.instagram_handle : `@${settings.instagram_handle}`}
              </a>}
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default Contact;