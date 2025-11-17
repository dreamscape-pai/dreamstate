# Image Assets

## Required Images

### Factions (`/factions`)
Place faction icon SVG or PNG files here:
- `deja-vu.svg` - Déjà Vu faction icon
- `lucid.svg` - Lucid faction icon
- `hypnotic.svg` - Hypnotic faction icon
- `drift.svg` - Drift faction icon

Recommended size: 256x256px or SVG

### Hero
- `hero.jpg` or `hero.png` - Main hero image
- Recommended size: 1920x1080px or larger
- Should be optimized for web (use tools like TinyPNG)

### Open Graph
- `og-image.jpg` - Social sharing image
- Recommended size: 1200x630px

## Image Optimization Tips

1. **Use Next.js Image component** for automatic optimization
2. **Compress images** before adding (use TinyPNG, ImageOptim, etc.)
3. **Use appropriate formats**:
   - PNG for graphics with transparency
   - JPG for photographs
   - SVG for icons and logos
   - WebP for modern browsers (Next.js converts automatically)

## Updating Image Paths

If you change image filenames, update references in:
- `scripts/seed.ts` - Faction icon URLs
- `components/Hero.tsx` - Hero image
- `app/layout.tsx` - Open Graph image
