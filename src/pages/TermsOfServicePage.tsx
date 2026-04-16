import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/signup" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Sign Up
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: February 15, 2026</p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using WrapUp ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
              <p>WrapUp provides AI-powered meeting transcription, summarization, and analytics tools. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information when creating an account.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Acceptable Use</h2>
              <p>You agree not to misuse the Service, including but not limited to: uploading malicious content, attempting unauthorized access, interfering with other users' access, or using the Service for any illegal purpose.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Intellectual Property</h2>
              <p>All content, features, and functionality of the Service are owned by WrapUp and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of content you upload.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Data and Privacy</h2>
              <p>Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of information as described therein.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
              <p>WrapUp shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Termination</h2>
              <p>We may terminate or suspend your account at any time for violations of these terms. Upon termination, your right to use the Service will immediately cease.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Changes to Terms</h2>
              <p>We reserve the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
              <p>For questions about these Terms of Service, please contact us at <span className="text-primary">support@wrapup.ai</span>.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
