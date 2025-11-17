import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FactionGrid from '@/components/FactionGrid';
import TicketPurchase from '@/components/TicketPurchase';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FactionGrid />
      <TicketPurchase />

      <footer className="py-8 px-4 text-center border-t border-dreamstate-purple/30 mt-16">
        <p className="text-dreamstate-periwinkle text-sm font-body">
          &copy; {new Date().getFullYear()} Dreamstate. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
