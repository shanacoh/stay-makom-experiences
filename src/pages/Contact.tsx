import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import LaunchHeader from "@/components/LaunchHeader";
import LaunchFooter from "@/components/LaunchFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Instagram } from "lucide-react";
import contactHero from "@/assets/contact-hero-new.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.enum(["general", "experience", "corporate", "partnership", "other"]),
  message: z.string().trim().min(1, "Message is required").max(1000)
});

type FormData = z.infer<typeof formSchema>;

const Contact = () => {
  const { lang } = useLanguage();
  const isRTL = lang === 'he';
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
  
  const { data: settings } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings").select("*").eq("key", "site_config").maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  const subjectLabels = t(lang, 'contactSubjectLabels') as Record<string, string>;

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        source: "contact",
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      });
      if (error) throw error;

      const { error: emailError } = await supabase.functions.invoke("send-contact-request", {
        body: {
          name: data.name,
          email: data.email,
          subject: subjectLabels[data.subject],
          message: data.message,
          language: lang
        }
      });
      
      if (emailError) {
        console.error("Email error:", emailError);
      }

      setShowSuccess(true);
      form.reset();
      toast.success(lang === 'he' ? "ההודעה נשלחה בהצלחה!" : "Message sent successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error(lang === 'he' ? "משהו השתבש. אנא נסו שוב." : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LaunchHeader forceScrolled={true} />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={contactHero} alt="Contact us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 text-center text-white px-6 max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-base sm:text-lg md:text-xl text-slate-100 mb-2">{t(lang, 'contactHeroTagline')}</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-slate-50">STAYMAKOM</h1>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Contact Text */}
        <section className="text-center mb-10">
          <p className="text-base text-muted-foreground leading-relaxed">
            {t(lang, 'contactIntro1')}
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t(lang, 'contactIntro2')}
          </p>
        </section>

        {/* Contact Form */}
        <section className="max-w-lg mx-auto mb-12">
          {showSuccess ? (
            <div className="bg-[#FAF8F5] rounded-lg p-8 text-center">
              <div className="mb-4 text-[#D72638]">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl mb-3">{t(lang, 'contactThankYou')}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t(lang, 'contactThankYouDesc')}
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowSuccess(false)}>
                {t(lang, 'contactSendAnother')}
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">{t(lang, 'contactYourName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={lang === 'he' ? "ישראל ישראלי" : "John Doe"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">{t(lang, 'contactEmail')} *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">{t(lang, 'contactSubject')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={lang === 'he' ? "בחרו נושא" : "Select a subject"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(subjectLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">{t(lang, 'contactMessage')} *</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t(lang, 'contactMessagePlaceholder')} className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#D72638] hover:bg-[#D72638]/90">
                  {isSubmitting ? t(lang, 'contactSending') : t(lang, 'contactSendMessage')}
                </Button>
              </form>
            </Form>
          )}
        </section>

        {/* Direct Contact Info */}
        <section className="text-center border-t pt-8">
          <h3 className="font-serif text-xl mb-4">{t(lang, 'contactDirectTitle')}</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground text-sm">
            {settings?.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-[#D72638] transition-colors">
                <Mail className="w-4 h-4" />
                {settings.contact_email}
              </a>
            )}
            <a href="https://www.instagram.com/staymakom/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#D72638] transition-colors">
              <Instagram className="w-4 h-4" />
              @staymakom
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
