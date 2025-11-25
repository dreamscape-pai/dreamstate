import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function generateFavicons() {
  const inputPath = join(process.cwd(), 'public/images/factions/hypnotic.png');
  const appDir = join(process.cwd(), 'app');

  console.log('📸 Generating favicons from hypnotic.png...\n');

  try {
    // Read the source image
    const image = sharp(inputPath);

    // Generate favicon.ico (32x32)
    await image
      .resize(32, 32)
      .toFile(join(appDir, 'favicon.ico'));
    console.log('✅ Generated favicon.ico (32x32)');

    // Generate apple-icon.png (180x180)
    await image
      .resize(180, 180)
      .toFile(join(appDir, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png (180x180)');

    // Generate icon.png (192x192 for Android)
    await image
      .resize(192, 192)
      .toFile(join(appDir, 'icon.png'));
    console.log('✅ Generated icon.png (192x192)');

    console.log('\n🎉 All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
