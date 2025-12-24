import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FactionGrid from '@/components/FactionGrid';
import TicketPurchase from '@/components/TicketPurchase';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FactionGrid />
      <TicketPurchase />

      <footer className="py-8 px-4 text-center border-t border-dreamstate-purple/30 mt-16">
        <a
          href="https://dream.sc"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-dreamstate-periwinkle hover:text-dreamstate-lavender transition-colors font-body"
        >
          <Image
            src="/images/ds-logo.svg"
            alt="Dreamscape"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold">DREAMSCAPE</span>
        </a>
      </footer>
    </main>
  );
}
