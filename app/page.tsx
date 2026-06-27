import type { Metadata } from 'next';
import { LandingHero } from '@/components/pm/landing-hero';

export const metadata: Metadata = {
   title: 'PocKit — Pocket Project Management Toolkit',
   description:
      'PocKit is a pocket-sized project management toolkit. Plan projects, track tasks on kanban boards, keep personal to-dos and team conversations together.',
};

export default function Home() {
   return <LandingHero />;
}
