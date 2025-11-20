import { db } from '../lib/db';
import { physicalTickets, ticketTypes } from '../lib/db/schema';
import { randomBytes } from 'crypto';

function generateCode(): string {
  // Generate a random 8-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar-looking characters
  let code = '';
  const bytes = randomBytes(8);

  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}

async function generatePhysicalTickets() {
  const ticketTypeIdStr = process.argv[2];
  const quantityStr = process.argv[3];

  if (!ticketTypeIdStr || !quantityStr) {
    console.error('Usage: npm run tickets:generate-physical <ticketTypeId> <quantity>');
    console.error('Example: npm run tickets:generate-physical 1 50');
    process.exit(1);
  }

  const ticketTypeId = parseInt(ticketTypeIdStr);
  const quantity = parseInt(quantityStr);

  if (isNaN(ticketTypeId) || isNaN(quantity) || quantity < 1 || quantity > 1000) {
    console.error('Invalid parameters. Quantity must be between 1 and 1000.');
    process.exit(1);
  }

  try {
    // Verify ticket type exists
    const ticketTypeResult = await db
      .select()
      .from(ticketTypes)
      .where(eq => eq(ticketTypes.id, ticketTypeId))
      .limit(1);

    if (!ticketTypeResult.length) {
      console.error(`Ticket type ${ticketTypeId} not found`);
      process.exit(1);
    }

    const ticketType = ticketTypeResult[0];
    console.log(`Generating ${quantity} physical tickets for: ${ticketType.name}\n`);

    const codes = [];
    const baseUrl = process.env.SITE_BASE_URL || 'https://dreamstate.dream.sc';

    for (let i = 0; i < quantity; i++) {
      const code = generateCode();
      codes.push({
        code,
        ticketTypeId,
      });
    }

    // Insert all codes
    await db.insert(physicalTickets).values(codes);

    console.log('✅ Generated physical ticket codes:\n');
    console.log('CODE'.padEnd(12) + 'QR CODE URL');
    console.log('─'.repeat(80));

    codes.forEach(({ code }) => {
      const url = `${baseUrl}/redeem/${code}`;
      console.log(`${code.padEnd(12)}${url}`);
    });

    console.log('\n📝 Instructions:');
    console.log('1. Print these codes on physical tickets');
    console.log('2. Generate QR codes from the URLs above');
    console.log('3. Each QR code should link to the corresponding /redeem/CODE url');
    console.log('4. Customers scan the QR code and enter their details to activate');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generatePhysicalTickets();
