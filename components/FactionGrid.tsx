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
    <section id="factions" className="relative py-16 px-4 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-50">
          <Image
            src="/images/clouds.png"
            alt="Dreamy clouds background"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(28,30,32,1) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 100%)'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-title font-bold text-center mb-4 text-dreamstate-ice">
          Discover Your Faction
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Every ticket holder is assigned to one of four factions. Each faction represents
          a different aspect of the dream experience. Your faction will be revealed after purchase.
        </p>

        <div className="mb-16 max-w-[900px] mx-auto bg-dreamstate-slate/30 backdrop-blur-md p-8 rounded-lg border border-dreamstate-lavender/40">
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-8">
            {factions.map((faction) => (
              <div
                key={faction.name}
                className="flex flex-col items-center text-center"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 mb-4 relative rounded-2xl overflow-hidden border-2 border-dreamstate-purple/30 transition-transform duration-300 hover:scale-110">
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

        {/* Event Description */}
        <div className="max-w-3xl mx-auto mt-16 mb-16 bg-dreamstate-slate/30 backdrop-blur-md p-8 rounded-lg border border-dreamstate-lavender/40">
          <div className="text-base md:text-lg text-dreamstate-ice leading-relaxed font-body space-y-4">
            <p>
              Your faction becomes your identity within the Dreamstate, shaping how you move through the story, challenges, and surprises. Expect immersive, live circus theatre all around you: characters who blur the line between performer and dream-guide, cryptic encounters, and playful trials designed to unlock your intuition, creativity, and curiosity.
            </p>

            <p>
              Join faction-led interactive games throughout the night to earn points, discover hidden clues, and compete for prizes! Nothing is quite what it seems—but everything is connected.
            </p>

            <p>
              And as the narrative reaches its peak, we shift into celebration. Step into Dreamscape&apos;s massive amphitheatre into the glow of the Fire Jam, where flame, music, and motion converge in an electric gathering of flow artists. Then drift deeper into the dream with our late-night Dome Party, featuring immersive projections, hypnotic soundscapes, and DJs guiding you into the liminal hours.
            </p>

            <p className="italic text-dreamstate-periwinkle">
              Enter with an open mind, leave with a story that feels like it followed you from sleep.
            </p>
          </div>
        </div>

        {/* Ticket Information */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-title font-bold mb-6 text-dreamstate-ice">
            Ticket Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left bg-dreamstate-slate/30 p-8 rounded-lg border border-dreamstate-purple/30 font-body backdrop-blur-sm">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-dreamstate-lavender font-subheading uppercase tracking-wide">
                What&apos;s Included
              </h3>
              <ul className="space-y-2 text-dreamstate-ice">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Faction-specific experiences and activities</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Access to the fire jam</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Unlimited paraffin during fire jam hours</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Entry to the late-night dome afterparty</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Interactive games with prizes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Character encounters and storyline moments</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Community flow and prop play spaces</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-dreamstate-lavender font-subheading uppercase tracking-wide">
                Important Details
              </h3>
              <ul className="space-y-2 text-dreamstate-ice">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Event Date: Saturday, December 27, 2025</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Event Location: Dreamscape Pai, <a href="https://instagram.com/dreamscape.pai" target="_blank" rel="noopener noreferrer" className="text-dreamstate-lavender hover:underline">@dreamscape.pai</a></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>No outside food or drinks allowed except for water. Free water refills onsite - please bring a reusable bottle. Food available for purchase from vendors and Dreams</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Ages 18 and up only</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>No pets allowed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
