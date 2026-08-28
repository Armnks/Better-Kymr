import { useEffect } from "react";
import { Link } from "react-router-dom";
import Cursor from "@/components/Cursor";

export default function Privacy() {
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
            PRIVACY POLICY
          </h1>
          <p className="font-mono text-[10px] tracking-[0.3em] text-white/40 mb-16 uppercase">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-12 font-sans text-sm md:text-base leading-relaxed text-white/80">
            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                1. INTRODUCTION
              </h2>
              <p className="mb-4">
                KymrStudio ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website or engage our services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                2. DATA WE COLLECT
              </h2>
              <p className="mb-4">
                We may collect the following types of personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Identity Data:</strong> First name, last name, title, and company name.</li>
                <li><strong>Contact Data:</strong> Email address, telephone numbers, and billing addresses.</li>
                <li><strong>Technical Data:</strong> IP addresses, browser types, operating systems, and platform details collected automatically via cookies or analytics tools.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our website.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                3. HOW WE USE YOUR DATA
              </h2>
              <p className="mb-4">
                We process your personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>To provide, manage, and deliver our creative services.</li>
                <li>To process payments and manage billing.</li>
                <li>To communicate with you regarding project updates, inquiries, or support.</li>
                <li>To improve our website functionality and user experience using analytics.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                4. DATA SHARING AND DISCLOSURE
              </h2>
              <p className="mb-4">
                We do not sell, trade, or rent your personal data to third parties. We may share your information with trusted third-party service providers (e.g., payment processors, hosting services, project management tools) solely for the purpose of operating our business and delivering our services to you. These third parties are contractually obligated to keep your data secure and confidential.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                5. DATA RETENTION
              </h2>
              <p className="mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                6. YOUR LEGAL RIGHTS
              </h2>
              <p className="mb-4">
                Depending on your location and applicable data protection laws, you may have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Request access to your personal data.</li>
                <li>Request correction of inaccurate or incomplete data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to the processing of your data.</li>
                <li>Request the restriction of processing your data.</li>
              </ul>
              <p className="mb-4">
                To exercise any of these rights, please contact us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-bone mb-4">
                7. CONTACT
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at: <a href="mailto:media@kymrstudio.com" className="text-ember hover:underline">media@kymrstudio.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
