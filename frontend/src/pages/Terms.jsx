import { useEffect } from "react";
import { Link } from "react-router-dom";
import Cursor from "@/components/Cursor";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Cursor />
      <div className="relative min-h-screen bg-void text-bone px-6 py-24 md:px-12 md:py-32 selection:bg-ember selection:text-void">
        <Link
          to="/"
          className="fixed top-8 left-6 md:left-12 font-mono text-[10px] tracking-[0.3em] text-white/50 hover:text-white transition-colors duration-300 z-50"
          data-hover
          data-cursor="BACK"
        >
          ← RETURN TO HOME
        </Link>
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-4">
            TERMS AND CONDITIONS
          </h1>
          <p className="font-mono text-[10px] tracking-[0.3em] text-white/40 mb-16 uppercase">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-12 font-sans text-sm md:text-base leading-relaxed text-white/80">
            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                1. ACCEPTANCE OF TERMS
              </h2>
              <p className="mb-4">
                By engaging KymrStudio ("Agency," "we," "us," or "our") for any creative, design, production, or consultation services ("Services"), you ("Client," "you," or "your") agree to be bound by these legally binding Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not engage our Services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                2. SERVICES AND SCOPE
              </h2>
              <p className="mb-4">
                The specific scope of work, deliverables, timelines, and compensation will be outlined in a separate Statement of Work (SOW), proposal, or invoice. Any changes to the scope of work (Scope Creep) must be agreed upon in writing and may incur additional fees. We reserve the right to decline requests that fall outside the agreed-upon scope.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                3. COMPENSATION AND PAYMENT
              </h2>
              <p className="mb-4">
                <strong>3.1 Invoicing:</strong> All invoices are due upon receipt unless otherwise specified in writing. A non-refundable deposit (typically 50%) is required to commence work.
              </p>
              <p className="mb-4">
                <strong>3.2 Late Payments:</strong> Payments not received within 14 days of the invoice date will incur a late fee of 5% per month on the outstanding balance. We reserve the right to halt all work and withhold final deliverables until full payment is received.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                4. INTELLECTUAL PROPERTY AND RIGHTS
              </h2>
              <p className="mb-4">
                <strong>4.1 Ownership:</strong> Upon receipt of full and final payment, the Agency grants the Client an exclusive, perpetual, worldwide license to use the final deliverables for their intended purpose.
              </p>
              <p className="mb-4">
                <strong>4.2 Agency Rights:</strong> The Agency retains all rights to underlying working files, unused concepts, raw footage, and proprietary methodologies. The Agency reserves the right to use the final deliverables for portfolio, marketing, and award-submission purposes unless a strict Non-Disclosure Agreement (NDA) is executed prior to commencement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                5. CLIENT RESPONSIBILITIES
              </h2>
              <p className="mb-4">
                The Client agrees to provide timely feedback, assets, and approvals necessary for the Agency to perform the Services. Delays caused by the Client may result in extended timelines and potential project reactivation fees.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                6. WARRANTIES AND LIABILITY
              </h2>
              <p className="mb-4">
                <strong>6.1 No Warranties:</strong> The Services are provided "as is" without warranty of any kind, either express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose. We do not guarantee specific performance metrics, sales, or conversions resulting from our deliverables.
              </p>
              <p className="mb-4">
                <strong>6.2 Limitation of Liability:</strong> In no event shall the Agency be liable for any indirect, incidental, consequential, or punitive damages. The maximum liability of the Agency under any circumstance shall not exceed the total amount paid by the Client for the specific project in dispute.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                7. TERMINATION
              </h2>
              <p className="mb-4">
                Either party may terminate the engagement with 14 days written notice. In the event of cancellation by the Client, the Agency retains the non-refundable deposit and shall be compensated for all work performed up to the date of termination.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                8. GOVERNING LAW
              </h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which KymrStudio operates. Any disputes arising out of these Terms shall be resolved exclusively in the competent courts of that jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                9. CONTACT
              </h2>
              <p className="mb-4">
                For legal inquiries, please contact us at: <a href="mailto:media@kymrstudio.com" className="text-ember hover:underline">media@kymrstudio.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
