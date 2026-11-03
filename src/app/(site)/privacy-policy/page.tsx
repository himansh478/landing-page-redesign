'use client';

import { Shield, Lock, Eye, Server, Mail, ExternalLink, Zap } from 'lucide-react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { DocSection, docBodyClass } from '@/components/editorial/DocSection';
import { btnCoralOnInk } from '@/components/editorial/styles';

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <PageIntro
        label="Official Policy"
        note="Last updated: May 14, 2026"
        title={['Privacy', 'Protocol.']}
      />

      <div className="mt-14 sm:mt-20 max-w-4xl">
        <DocSection icon={<Zap />} title="1. Introduction">
          <p className={docBodyClass}>
            At <span className="text-ink font-semibold">Cwaya</span>, we are committed to protecting the privacy of our visitors. This Privacy Policy outlines the types of personal information we collect and how we use, disclose, and safeguard that information.
          </p>
        </DocSection>

        <DocSection icon={<Lock />} title="2. Information Collection">
          <p className={`${docBodyClass} mb-8`}>
            We collect information to provide better services to all our users. The information we collect includes:
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t border-ink/15">
            {[
              { title: 'Personal Data', text: 'Name, email address, and contact details provided voluntarily by you.' },
              { title: 'Usage Data', text: 'Browser type, IP address, pages visited, and time spent on our site.' },
              { title: 'Cookies', text: 'Small data files used to enhance your browsing experience.' },
              { title: 'Log Files', text: 'Standard data collected by hosting companies for analytics.' },
            ].map((item) => (
              <div key={item.title} className="py-5 border-b border-ink/15">
                <dt className="slate text-editorial mb-2">{item.title}</dt>
                <dd className="text-ink/70 leading-relaxed">{item.text}</dd>
              </div>
            ))}
          </dl>
        </DocSection>

        <DocSection icon={<Eye />} title="3. Google AdSense & Cookies">
          <div className="bg-paper border border-ink/15 rounded-[4px] p-6 sm:p-8">
            <p className="slate text-editorial flex items-center gap-2 mb-5">
              <span aria-hidden="true" className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" />
              Advertising Disclosure
            </p>
            <p className={`${docBodyClass} mb-6`}>
              We use Google AdSense to serve ads. Google uses cookies to serve ads based on a user&apos;s prior visits to our website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.
            </p>
            <p className={`${docBodyClass} mb-8`}>
              Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-ink font-semibold underline decoration-coral decoration-2 underline-offset-4 hover:text-editorial">Google Ad Settings</a>.
            </p>
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="pencil-link slate text-editorial inline-flex items-center gap-2"
            >
              Learn how Google uses data <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </DocSection>

        <DocSection icon={<Shield />} title="4. Children's Privacy">
          <p className={docBodyClass}>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Cwaya does not knowingly collect any Personal Identifiable Information from children under the age of 13.
          </p>
        </DocSection>

        <DocSection icon={<Server />} title="5. Data Security">
          <p className={docBodyClass}>
            We use reasonable administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>
        </DocSection>
      </div>

      <CtaBand
        title={['Questions?']}
        body="If you have any questions about this Privacy Policy, please contact us."
        className="mt-16 sm:mt-24"
      >
        <a href="mailto:Sudhanshugour89@gmail.com" className={`${btnCoralOnInk} w-full sm:w-auto !h-auto min-h-14 py-3 [overflow-wrap:anywhere]`}>
          <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          Sudhanshugour89@gmail.com
        </a>
      </CtaBand>
    </PageShell>
  );
}
