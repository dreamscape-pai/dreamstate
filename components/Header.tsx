import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="relative py-16 px-4 text-center border-b border-dreamstate-purple/30 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-60">
          <Image
            src="/images/chess-in-the-clouds.jpeg"
            alt="Dreamstate background"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(54,59,61,0.2), rgba(54,59,61,0.3) 50%, rgba(23,25,26,1))'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Link href="/">
          <h1 className="text-6xl md:text-8xl font-title font-bold tracking-tight mb-4 text-dreamstate-ice cursor-pointer hover:text-dreamstate-lavender transition-colors">
            Dreamstate
          </h1>
        </Link>
        <p className="text-2xl md:text-3xl font-subheading text-dreamstate-lavender uppercase tracking-wide">
          Where circus meets the subconscious
        </p>
      </div>
    </header>
  );
}
