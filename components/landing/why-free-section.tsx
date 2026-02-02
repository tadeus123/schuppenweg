'use client'

import { Section } from '@/components/ui/section'

const LINKEDIN_URL = 'https://www.linkedin.com/in/tadeusmehl/'

export function WhyFreeSection() {
  return (
    <Section className="bg-background py-20 md:py-28">
      <div className="max-w-2xl text-left text-sm sm:text-base text-foreground-muted leading-relaxed space-y-4">
        <p className="font-semibold text-foreground">Warum wir das for free gebaut haben:</p>
        <p>
          Das hier ist ein pures Marketing-Produkt für uns. To bring people into our universe,{' '}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            LinkedIn
          </a>{' '}
          and more. Wir machen keinen Profit mit dieser Company. Wir hatten das Problem mit starken Schuppen selbst über 3 Jahre.{' '}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Tade
          </a>{' '}
          war davon extrem genervt.
        </p>
        <p>
          Wir mögen es normalerweise, coole Tech-Produkte zu bauen. Deshalb ist das hier einfach eine Sidequest, um ein Problem zu lösen, das andere Menschen nicht lösen wollen. Wir machen die volle Company auf +- 0 Profit. Das hier ist just for you.
        </p>
        <p className="italic">&quot;In love of humanity&quot;, built on Earth.</p>
        <p className="h-[77px]">
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Tade
          </a>
          {' · '}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            LinkedIn
          </a>
        </p>
      </div>
    </Section>
  )
}
