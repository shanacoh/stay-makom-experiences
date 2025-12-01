import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Privacy Policy | STAYMAKOM"
        description="Learn how STAYMAKOM protects your privacy. Read about data collection, usage, storage, and your rights under Israeli privacy regulations."
      />
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <article className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

          <p className="lead">
            Staymakom Ltd ("we", "our", "the platform") is committed to protecting your privacy under Israeli privacy regulations and best international standards.
          </p>

          <h2>1. Data We Collect</h2>
          <p>We may collect the following categories of data:</p>
          
          <h3>Account Data</h3>
          <ul>
            <li>Email address</li>
            <li>Name</li>
            <li>Phone number (if provided)</li>
            <li>Language preferences</li>
          </ul>

          <h3>Booking Data</h3>
          <ul>
            <li>Requested experiences</li>
            <li>Dates, party size</li>
            <li>Communication with hotels</li>
          </ul>

          <h3>Usage Data</h3>
          <ul>
            <li>Device and browser information</li>
            <li>IP address</li>
            <li>Pages visited</li>
            <li>Cookies and analytics data</li>
          </ul>

          <h2>2. Why We Use Your Data</h2>
          <p>We process your data to:</p>
          <ul>
            <li>operate the platform</li>
            <li>manage bookings</li>
            <li>forward your booking details to hotels</li>
            <li>provide customer support</li>
            <li>prevent fraud or attacks</li>
            <li>improve user experience</li>
            <li>measure traffic performance (analytics)</li>
          </ul>
          <p><strong>We never sell your data.</strong></p>

          <h2>3. Sharing of Data</h2>
          <p>Your data may be shared with:</p>
          <ul>
            <li>Hotels (only when you submit a booking request)</li>
            <li>Stripe (for secure payment processing)</li>
            <li>Analytics tools (Google Analytics, Meta Pixel)</li>
            <li>Authorities (only if legally required)</li>
          </ul>

          <h2>4. Cookies</h2>
          <p>We use cookies to:</p>
          <ul>
            <li>enable login</li>
            <li>maintain session state</li>
            <li>measure performance</li>
            <li>analyse traffic</li>
            <li>improve suggestions and content</li>
          </ul>
          <p>You can disable non-essential cookies at any time.</p>

          <h2>5. Data Storage & International Transfers</h2>
          <p>Data is stored securely via:</p>
          <ul>
            <li>Supabase (EU/US data centers)</li>
            <li>Stripe (USA/Europe)</li>
          </ul>
          <p>We apply industry-standard safeguards for cross-border transfers.</p>

          <h2>6. Your Rights</h2>
          <p>Under Israeli Privacy Protection Law, you may:</p>
          <ul>
            <li>request access to your data</li>
            <li>request correction or deletion</li>
            <li>withdraw consent for marketing</li>
            <li>request data portability (when applicable)</li>
          </ul>
          <p>
            Contact: <a href="mailto:hello@staymakom.com" className="text-primary hover:underline">hello@staymakom.com</a>
          </p>

          <h2>7. Retention</h2>
          <p>We keep account and booking data as long as your profile is active, or as required by law.</p>

          <h2>8. Updates</h2>
          <p>We may occasionally update this policy.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
