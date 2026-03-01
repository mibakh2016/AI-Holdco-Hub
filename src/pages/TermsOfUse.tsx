import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfUse() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold tracking-tight text-black">
          Terms of Use
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">Last updated: March 2026</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="prose prose-sm max-w-none text-black space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">By accessing and using the AI Holdco Hub platform ("Platform"), you agree to be bound by these Terms of Use. If you do not agree to these terms, you must not use the Platform.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p className="leading-relaxed">AI Holdco Hub provides a digital platform for managing shareholder information, portfolio entities, documents, and related financial data. The Platform includes AI-powered features for document analysis and information retrieval.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. User Accounts</h2>
          <p className="leading-relaxed">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
          <p className="leading-relaxed">You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use the Platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Platform</li>
            <li>Interfere with or disrupt the Platform's infrastructure</li>
            <li>Upload malicious content or code</li>
            <li>Share your account credentials with third parties</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Intellectual Property</h2>
          <p className="leading-relaxed">All content, features, and functionality of the Platform are owned by AI Holdco Hub and are protected by applicable intellectual property laws. You may not copy, modify, or distribute any part of the Platform without prior written consent.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Disclaimer of Warranties</h2>
          <p className="leading-relaxed">The Platform is provided "as is" without warranties of any kind. AI Holdco Hub does not warrant that the Platform will be uninterrupted, error-free, or that any information provided is accurate or complete. The data and documents produced by the Platform may not be suitable for your specific situation and you should seek professional legal and financial advice.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Limitation of Liability</h2>
          <p className="leading-relaxed">To the maximum extent permitted by law, AI Holdco Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Platform. You disclaim and indemnify AI Holdco Hub for any loss sustained as a result of using the Platform.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. AI-Generated Content</h2>
          <p className="leading-relaxed">The Platform uses artificial intelligence to process documents and generate insights. AI-generated content is provided for informational purposes only and should not be relied upon as professional, legal, or financial advice. Users should independently verify all AI-generated outputs.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Modifications</h2>
          <p className="leading-relaxed">We reserve the right to modify these Terms of Use at any time. Continued use of the Platform after modifications constitutes acceptance of the updated terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">10. Contact</h2>
          <p className="leading-relaxed">For questions about these Terms of Use, please contact us through the Platform's support channels.</p>
        </section>
      </motion.div>
    </div>
  );
}
