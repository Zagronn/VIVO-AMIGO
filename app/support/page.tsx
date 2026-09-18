import { SubBrandPage } from '@/components/SubBrandPage';
import { SupportChatWidget } from '@/components/SupportChatWidget';

export const metadata = {
  title: 'VIVO SUPPORT — Help, powered by AI',
};

export default function SupportPage() {
  return (
    <div>
      <SubBrandPage
        brand="SUPPORT"
        tagline="An AI team that helps clients fix what they need, day or night."
        description="VIVO SUPPORT puts an AI assistant in front of every customer, seller, and visitor — answering questions about orders, payments, shipping, and selling the moment they come up, and pointing to a real person on /contact whenever it can't help."
        features={[
          {
            title: 'Always on',
            description: 'No queue, no waiting for business hours — ask a question and get an answer right away.',
          },
          {
            title: 'Knows the ecosystem',
            description: 'Trained on how VIVO AMIGO, VIVO PAY, VIVO SHIP, and VIVO BUSINESS fit together, so answers stay specific instead of generic.',
          },
          {
            title: 'Knows its limits',
            description: 'When something is genuinely site-specific or account-specific, it says so plainly and hands off to the /contact page instead of guessing.',
          },
        ]}
        ctaLabel="Contact the team"
        ctaHref="/contact"
      />

      <div className="mx-auto max-w-lg px-4 pb-16">
        <SupportChatWidget />
      </div>
    </div>
  );
}
