import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Instagram } from "lucide-react";
import contactHero from "@/assets/contact-hero.jpg";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.enum(["general", "experience", "corporate", "partnership", "other"]),
  message: z.string().trim().min(1, "Message is required").max(1000),
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
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // For now, just show success without sending email
      // TODO: Add email sending functionality when API key is available
      console.log("Contact form data:", data);
      
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
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src={contactHero}
            alt="Contact us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="font-serif text-5xl md:text-6xl">
            We're here for you.
          </h1>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* Contact Text */}
        <section className="text-center mb-16">
          <p className="text-xl text-muted-foreground leading-relaxed">
            Questions, ideas, partnership requests?<br />
            Send us a message — we'll be happy to help.
          </p>
        </section>

        {/* Contact Form */}
        <section className="max-w-2xl mx-auto mb-20">
          {showSuccess ? (
            <div className="bg-[#FAF8F5] rounded-lg p-12 text-center">
              <div className="mb-6 text-[#D72638]">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-3xl mb-4">Thank you!</h3>
              <p className="text-lg text-muted-foreground mb-8">
                We'll get back to you shortly.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowSuccess(false)}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
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
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us how we can help..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D72638] hover:bg-[#D72638]/90"
                  size="lg"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          )}
        </section>

        {/* Direct Contact Info */}
        <section className="text-center border-t pt-12">
          <h3 className="font-serif text-2xl mb-6">Get in touch directly</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-muted-foreground">
            <a
              href="mailto:hello@staymakom.com"
              className="flex items-center gap-2 hover:text-[#D72638] transition-colors"
            >
              <Mail className="w-5 h-5" />
              hello@staymakom.com
            </a>
            <a
              href="https://instagram.com/staymakom"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#D72638] transition-colors"
            >
              <Instagram className="w-5 h-5" />
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
