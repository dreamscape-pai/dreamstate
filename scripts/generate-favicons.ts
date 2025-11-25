import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function generateCircularIcon(inputPath: string, size: number): Promise<Buffer> {
  // Create a circular mask
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`
  );

  // Resize and apply circular mask
  return await sharp(inputPath)
    .resize(size, size, { fit: 'cover' })
    .composite([
      {
        input: mask,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();
}

async function generateFavicons() {
  const inputPath = join(process.cwd(), 'public/images/factions/hypnotic.png');
  const appDir = join(process.cwd(), 'app');

  console.log('📸 Generating circular favicons from hypnotic.png...\n');

  try {
    // Generate favicon.ico (32x32 circular)
    const favicon = await generateCircularIcon(inputPath, 32);
    await sharp(favicon).toFile(join(appDir, 'favicon.ico'));
    console.log('✅ Generated circular favicon.ico (32x32)');

    // Generate apple-icon.png (180x180 circular)
    const appleIcon = await generateCircularIcon(inputPath, 180);
    await sharp(appleIcon).toFile(join(appDir, 'apple-icon.png'));
    console.log('✅ Generated circular apple-icon.png (180x180)');

    // Generate icon.png (192x192 for Android circular)
    const androidIcon = await generateCircularIcon(inputPath, 192);
    await sharp(androidIcon).toFile(join(appDir, 'icon.png'));
    console.log('✅ Generated circular icon.png (192x192)');

    console.log('\n🎉 All circular favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
