import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Terms & Conditions | STAYMAKOM"
        description="Read STAYMAKOM's Terms & Conditions. Learn about our booking platform, user responsibilities, and policies for discovering unique hospitality experiences in Israel."
      />
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <article className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

          <p className="lead">
            Welcome to STAYMAKOM LTD, a curated discovery and booking platform showcasing unique hospitality experiences across Israel.
          </p>
          <p>By accessing or using the Staymakom platform, you agree to the Terms & Conditions below.</p>

          <h2>1. About Staymakom</h2>
          <p>
            Staymakom Ltd (registered in Israel, address: 6 Sokolov Street, Herzliya) operates a digital platform connecting users with hotels and hospitality partners.
          </p>
          <p>Staymakom:</p>
          <ul>
            <li>does not own, operate, or manage the hotels listed on the platform;</li>
            <li>does not provide accommodation or activities directly;</li>
            <li>acts solely as an intermediary facilitating the discovery and booking of hotel-operated experiences.</li>
          </ul>

          <h2>2. Booking Flow</h2>
          <p>When you request to book an experience through Staymakom:</p>
          <ul>
            <li>Your request is sent to the relevant hotel.</li>
            <li>The hotel reviews the request and may accept or decline it.</li>
            <li>A booking is considered confirmed only when accepted by the hotel.</li>
            <li>Once accepted, the final commercial relationship exists between you and the hotel, not with Staymakom.</li>
          </ul>
          <p>Staymakom is not responsible for:</p>
          <ul>
            <li>the accuracy of hotel information,</li>
            <li>availability,</li>
            <li>service execution,</li>
            <li>cancellations or changes made by the hotel.</li>
          </ul>

          <h2>3. Prices</h2>
          <p>All prices are determined and provided directly by the hotels.</p>
          <p>
            Staymakom does not add hidden fees. Taxes (VAT), service fees, or additional charges are determined solely by the hotel.
          </p>

          <h2>4. Payment (via Stripe)</h2>
          <p>Payments for confirmed bookings are processed securely via Stripe, our licensed payment service provider.</p>
          <ul>
            <li>Staymakom does not store or handle credit card information.</li>
            <li>Stripe processes the payment on behalf of the transaction.</li>
            <li>Payment obligations, refunds, or disputes are handled directly between you and the hotel under the hotel's policy.</li>
          </ul>

          <h2>5. Cancellation & Refunds</h2>
          <p>Cancellation and refund policies are defined by each hotel.</p>
          <p>By booking through Staymakom, you accept:</p>
          <ul>
            <li>the hotel's cancellation terms,</li>
            <li>applicable refund rules,</li>
            <li>possible fees (cancellation, no-show, modification).</li>
          </ul>
          <p>Staymakom is not responsible for disputes regarding refunds or penalties.</p>

          <h2>6. User Account</h2>
          <p>You are responsible for:</p>
          <ul>
            <li>maintaining the confidentiality of your login credentials,</li>
            <li>ensuring your information is accurate,</li>
            <li>not impersonating another person.</li>
          </ul>
          <p>Staymakom may suspend accounts in case of abuse or fraudulent behaviour.</p>

          <h2>7. Responsibility & Liability</h2>
          <p>Staymakom cannot be held liable for:</p>
          <ul>
            <li>hotel performance or service quality,</li>
            <li>delays, accidents, damages, or issues during a stay,</li>
            <li>inaccurate or outdated hotel content,</li>
            <li>temporary unavailability of the platform.</li>
          </ul>
          <p>Your contractual relationship is with the hotel, not with Staymakom.</p>

          <h2>8. Data & Privacy</h2>
          <p>
            Your personal data is processed in accordance with our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and Israeli data-protection laws (Privacy Protection Authority).
          </p>

          <h2>9. Platform Misuse</h2>
          <p>We reserve the right to remove access to the platform in cases of:</p>
          <ul>
            <li>fraud,</li>
            <li>abusive use,</li>
            <li>repeated no-shows,</li>
            <li>activities that harm hotels or the Staymakom brand.</li>
          </ul>

          <h2>10. Governing Law</h2>
          <p>
            These Terms & Conditions are governed by the laws of Israel. Any dispute shall be submitted to the competent courts of Tel Aviv.
          </p>

          <h2>11. Contact</h2>
          <p>
            For any questions: <a href="mailto:hello@staymakom.com" className="text-primary hover:underline">hello@staymakom.com</a>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
