import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link 
        to="/"
        className="inline-flex items-center space-x-2 text-text-secondary hover:text-text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <h1 className="text-3xl font-bold text-cream mb-8">Terms of Service</h1>

      <div className="space-y-8 text-cream-light">
        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing and using outnow.mov ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">2. Description of Service</h2>
          <p className="leading-relaxed">
            outnow.mov is a platform that provides TikTok music trend analysis and content insights. The Service aggregates and analyzes public TikTok data to provide trend insights and content recommendations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">3. User Obligations</h2>
          <p className="leading-relaxed">
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the Service complies with applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">4. Intellectual Property</h2>
          <p className="leading-relaxed">
            All content, features, and functionality of the Service are owned by outnow.mov and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">5. Data Usage</h2>
          <p className="leading-relaxed">
            We collect and analyze public TikTok data in accordance with TikTok's terms of service and our Privacy Policy. By using the Service, you acknowledge and agree to our data collection practices.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">6. Limitation of Liability</h2>
          <p className="leading-relaxed">
            The Service is provided "as is" without any warranties. We are not liable for any damages arising from your use of the Service or any content accessed through the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">7. Changes to Terms</h2>
          <p className="leading-relaxed">
            We reserve the right to modify these Terms at any time. Continued use of the Service after any changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">8. Contact</h2>
          <p className="leading-relaxed">
            If you have any questions about these Terms, please contact us at support@outnow.mov.
          </p>
        </section>
      </div>
    </div>
  );
}