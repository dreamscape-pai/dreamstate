import Image from 'next/image';

const factions = [
  {
    name: 'Déjà Vu',
    colorClass: 'faction-bg-deja-vu',
    borderColor: 'border-faction-deja-vu',
    description: 'Experience the familiar strangeness of moments already lived.',
    image: '/images/factions/deja vu.png',
  },
  {
    name: 'Lucid',
    colorClass: 'faction-bg-lucid',
    borderColor: 'border-faction-lucid',
    description: 'Masters of conscious dreaming, walking between sleep and wakefulness.',
    image: '/images/factions/lucid.png',
  },
  {
    name: 'Hypnotic',
    colorClass: 'faction-bg-hypnotic',
    borderColor: 'border-faction-hypnotic',
    description: 'Surrender to the trance and flow with the rhythm of the unconscious.',
    image: '/images/factions/hypnotic.png',
  },
  {
    name: 'Drift',
    colorClass: 'faction-bg-drift',
    borderColor: 'border-faction-drift',
    description: 'Float between worlds in the liminal spaces of existence.',
    image: '/images/factions/drift.png',
  },
];

export default function FactionGrid() {
  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 opacity-40">
        <Image
          src="/images/clouds.png"
          alt="Dreamy clouds background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dreamstate-midnight/60 via-dreamstate-midnight/70 to-dreamstate-midnight" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Discover Your Faction
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Every ticket holder is assigned to one of four factions. Each faction represents
          a different aspect of the dream experience. Your faction will be revealed after purchase.
        </p>

        <div className="mb-16 max-w-[900px] mx-auto bg-dreamstate-slate/30 backdrop-blur-md p-8 rounded-lg border border-dreamstate-lavender/40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {factions.map((faction) => (
              <div
                key={faction.name}
                className="flex flex-col items-center text-center"
              >
                <div className="w-32 h-32 mb-4 relative rounded-2xl overflow-hidden border-2 border-dreamstate-purple/30">
                  <Image
                    src={faction.image}
                    alt={faction.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">{faction.name}</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {faction.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Information */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-title font-bold mb-6 text-dreamstate-ice">
            Ticket Information
          </h2>

          <div className="space-y-6 text-left bg-dreamstate-slate/30 p-8 rounded-lg border border-dreamstate-purple/30 font-body backdrop-blur-sm">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-dreamstate-lavender font-subheading uppercase tracking-wide">
                What&apos;s Included
              </h3>
              <ul className="space-y-2 text-dreamstate-ice">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Full access to all performance areas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Faction-specific experiences and activities</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Welcome gift and faction merchandise</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Access to food and beverage areas</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-dreamstate-slate/50">
              <h3 className="text-xl font-semibold mb-3 text-dreamstate-lavender font-subheading uppercase tracking-wide">
                Important Details
              </h3>
              <ul className="space-y-2 text-dreamstate-ice">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Event date, time, and location details</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Age restrictions and requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Refund and transfer policy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
