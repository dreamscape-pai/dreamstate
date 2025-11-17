import Image from 'next/image';

export default function Header() {
  return (
    <header className="relative py-16 px-4 text-center border-b border-dreamstate-purple/30 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 opacity-60">
        <Image
          src="/images/chess-in-the-clouds.jpeg"
          alt="Dreamstate background"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dreamstate-midnight/20 via-dreamstate-midnight/30 to-dreamstate-midnight" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-6xl md:text-8xl font-title font-bold tracking-tight mb-4 text-dreamstate-ice">
          Dreamstate
        </h1>
        <p className="text-2xl md:text-3xl font-subheading text-dreamstate-lavender uppercase tracking-wide">
          Where circus meets the subconscious
        </p>
      </div>
    </header>
  );
}
