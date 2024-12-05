import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link 
        to="/"
        className="inline-flex items-center space-x-2 text-text-secondary hover:text-text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <h1 className="text-3xl font-bold text-cream mb-8">Privacy Policy</h1>

      <div className="space-y-8 text-cream-light">
        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">1. Information We Collect</h2>
          <p className="leading-relaxed">
            We collect public TikTok data including video information, engagement metrics, and user statistics. We do not collect personal information from our users unless explicitly provided.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">2. How We Use Information</h2>
          <p className="leading-relaxed mb-4">
            The collected data is used to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide trend analysis and insights</li>
            <li>Improve our services</li>
            <li>Generate content recommendations</li>
            <li>Analyze platform usage patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">3. Data Storage</h2>
          <p className="leading-relaxed">
            All data is stored securely using industry-standard encryption and security measures. We use Supabase for our database infrastructure, which maintains high security standards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">4. Data Sharing</h2>
          <p className="leading-relaxed">
            We do not sell or share personal information with third parties. Aggregated, anonymized data may be shared for analytical purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">5. Cookies and Tracking</h2>
          <p className="leading-relaxed">
            We use essential cookies to maintain basic functionality. No third-party tracking cookies are used on our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">6. User Rights</h2>
          <p className="leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Request data deletion</li>
            <li>Opt-out of data collection</li>
            <li>Request data corrections</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">7. Changes to Privacy Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy periodically. Users will be notified of significant changes through the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream mb-4">8. Contact Information</h2>
          <p className="leading-relaxed">
            For privacy-related inquiries, please contact us at privacy@outnow.mov.
          </p>
        </section>
      </div>
    </div>
  );
}