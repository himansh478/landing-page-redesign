'use client';

import { Scale, AlertCircle, ShieldCheck, Mail, Lock } from 'lucide-react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { DocSection, docBodyClass } from '@/components/editorial/DocSection';
import { btnCoralOnInk } from '@/components/editorial/styles';

export default function TermsConditionsPage() {
  return (
    <PageShell>
      <PageIntro
        label="Service Governance"
        note="Last Updated: May 14, 2026"
        title={['Terms &', 'Conditions.']}
      />

      <div className="mt-14 sm:mt-20 max-w-4xl">
        <DocSection icon={<ShieldCheck />} title="1. Acceptance of Terms">
          <p className={docBodyClass}>
            By accessing and using <span className="text-ink font-semibold">Cwaya</span>, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </DocSection>

        <DocSection icon={<Lock />} title="2. User Conduct">
          <p className={`${docBodyClass} mb-8`}>
            You are responsible for your own communications and are responsible for the consequences of their posting. You agree to use the site only for lawful purposes. You are prohibited from:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t border-ink/15">
            {[
              'Posting any copyrighted material unless you own it.',
              'Using the site for any fraudulent or illegal activity.',
              'Attempting to interfere with the network security.',
              'Using any automated system to access the site.',
            ].map((text) => (
              <li key={text} className="flex items-start gap-3 py-4 border-b border-ink/15 text-ink/75">
                <span aria-hidden="true" className="w-1.5 h-1.5 mt-[0.55em] bg-coral rotate-45 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection icon={<AlertCircle />} title="3. Disclaimer">
          <div className="bg-paper border-l-4 border-coral rounded-r-[4px] p-6 sm:p-8">
            <p className={docBodyClass}>
              The materials on Cwaya&apos;s website are provided on an <span className="text-ink font-semibold">&apos;as is&apos;</span> basis. Cwaya makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>
        </DocSection>

        <DocSection icon={<Scale />} title="4. Governing Law">
          <p className={docBodyClass}>
            These terms and conditions are governed by and construed in accordance with the laws of <span className="text-ink font-semibold">India</span> and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </DocSection>
      </div>

      <CtaBand title={['Questions?']} className="mt-16 sm:mt-24">
        <a href="mailto:Sudhanshugour89@gmail.com" className={`${btnCoralOnInk} w-full sm:w-auto`}>
          <Mail className="w-4 h-4" aria-hidden="true" />
          Contact Support
        </a>
      </CtaBand>
    </PageShell>
  );
}
