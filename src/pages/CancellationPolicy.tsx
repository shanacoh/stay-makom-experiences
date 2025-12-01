import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Cancellation & Refund Policy | STAYMAKOM"
        description="Understand STAYMAKOM's cancellation and refund policies. Each hotel defines its own terms for cancellations, refunds, and modifications."
      />
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <article className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Cancellation & Refund Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

          <p className="lead">
            Each hotel defines its own cancellation and refund policy.
          </p>

          <p>When booking through Staymakom:</p>
          <ul>
            <li>you accept the hotel's cancellation rules,</li>
            <li>cancellation windows and fees apply based on the hotel's terms,</li>
            <li>refunds are processed exclusively by the hotel.</li>
          </ul>

          <h2>What Staymakom is Not Responsible For</h2>
          <p>Staymakom is not responsible for:</p>
          <ul>
            <li>penalties</li>
            <li>no-show fees</li>
            <li>disputes related to refunds</li>
            <li>schedule changes or hotel cancellations</li>
          </ul>

          <p>
            <strong>Staymakom only facilitates the transmission of booking information.</strong>
          </p>

          <h2>Questions?</h2>
          <p>
            For any questions regarding cancellations or refunds, please contact the hotel directly or reach out to us at{" "}
            <a href="mailto:hello@staymakom.com" className="text-primary hover:underline">hello@staymakom.com</a>.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;
