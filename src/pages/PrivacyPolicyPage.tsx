import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/signup" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Sign Up
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: February 15, 2026</p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
              <p>We collect information you provide directly, such as your name, email address, and meeting recordings. We also collect usage data including device information, IP addresses, and interaction patterns within the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
              <p>We use your information to provide and improve the Service, generate transcriptions and summaries, personalize your experience, communicate with you, and ensure security of the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. AI Processing</h2>
              <p>Your meeting audio and transcripts are processed by AI models to generate summaries, action items, and analytics. This processing is done securely and your data is not used to train our AI models without your explicit consent.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Storage and Security</h2>
              <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest. Your data is stored on secure servers and access is restricted to authorized personnel only.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with trusted service providers who assist in operating the Service, subject to confidentiality agreements. We may also disclose information when required by law.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Data Retention</h2>
              <p>We retain your data for as long as your account is active or as needed to provide the Service. You may request deletion of your data at any time by contacting our support team.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data. You may also object to processing, request data portability, and withdraw consent where applicable under GDPR and similar regulations.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Cookies</h2>
              <p>We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage. You can control cookie settings through your browser preferences.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Children's Privacy</h2>
              <p>The Service is not intended for users under the age of 16. We do not knowingly collect personal information from children.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
              <p>For questions about this Privacy Policy, please contact us at <span className="text-primary">privacy@wrapup.ai</span>.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
