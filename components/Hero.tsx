'use client';

import Image from 'next/image';

export default function Hero() {
  const scrollToTickets = () => {
    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-dreamstate-purple/20 to-transparent pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Hero image */}
        <div className="mb-8 relative rounded-lg overflow-hidden border border-dreamstate-purple/30 shadow-2xl mx-auto" style={{ width: '400px', height: '600px', maxWidth: '100%' }}>
          <Image
            src="/images/chess-in-the-clouds.jpeg"
            alt="Chess board floating in dreamy clouds"
            fill
            className="object-cover object-bottom"
            priority
          />
        </div>

        <div className="space-y-6 font-body">
          <p className="text-lg md:text-xl text-dreamstate-ice leading-relaxed max-w-2xl mx-auto">
            Step into a world where reality bends and the impossible becomes tangible.
            Dreamstate invites you to experience an unforgettable fusion of circus artistry
            and subconscious exploration.
          </p>

          <p className="text-base md:text-lg text-dreamstate-periwinkle">
            [Placeholder event description and details will go here]
          </p>

          <button
            onClick={scrollToTickets}
            className="mt-8 px-8 py-4 bg-dreamstate-purple hover:bg-dreamstate-slate text-dreamstate-ice text-lg font-semibold rounded-lg shadow-lg"
          >
            Buy Tickets
          </button>
        </div>
      </div>
    </section>
  );
}
