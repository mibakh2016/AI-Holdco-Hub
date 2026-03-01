import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold tracking-tight text-black">
          Privacy Policy
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">Last updated: March 2026</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="prose prose-sm max-w-none text-black space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="leading-relaxed">We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Account Information:</strong> Name, email address, and other details provided during registration</li>
            <li><strong>Usage Data:</strong> Information about how you interact with the Platform</li>
            <li><strong>Documents:</strong> Files and documents you upload to the Platform</li>
            <li><strong>Financial Data:</strong> Shareholding and portfolio information entered into the Platform</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <p className="leading-relaxed">We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Provide and maintain the Platform's services</li>
            <li>Process and manage shareholder records</li>
            <li>Power AI-driven document analysis and search</li>
            <li>Communicate important updates and notifications</li>
            <li>Improve the Platform's performance and features</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Data Storage and Security</h2>
          <p className="leading-relaxed">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption and access controls.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. AI Processing</h2>
          <p className="leading-relaxed">Documents uploaded to the Platform may be processed by artificial intelligence systems to extract text, generate summaries, and enable search functionality. This processing is performed to provide the Platform's core features and your data is not used to train third-party AI models.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Data Sharing</h2>
          <p className="leading-relaxed">We do not sell your personal information. We may share your data with:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Service providers who assist in operating the Platform</li>
            <li>Legal authorities when required by law</li>
            <li>Other shareholders or administrators within your organization as permitted by your account settings</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Data Retention</h2>
          <p className="leading-relaxed">We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us through the Platform's support channels.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Your Rights</h2>
          <p className="leading-relaxed">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Cookies</h2>
          <p className="leading-relaxed">The Platform uses essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising purposes.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Changes to This Policy</h2>
          <p className="leading-relaxed">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on the Platform with a revised "Last updated" date.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">10. Contact Us</h2>
          <p className="leading-relaxed">If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us through the Platform's support channels.</p>
        </section>
      </motion.div>
    </div>
  );
}
