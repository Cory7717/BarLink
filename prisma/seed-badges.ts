import { prisma } from '../src/lib/prisma';
import { BADGE_DEFINITIONS } from '../src/lib/badges';

async function main() {
  console.log('Starting badge seeding...');

  for (const badgeDef of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { key: badgeDef.key },
      update: {
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        tier: badgeDef.tier,
        category: badgeDef.category,
        requirement: badgeDef.requirement,
        color: badgeDef.color,
        isActive: true,
      },
      create: {
        key: badgeDef.key,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        tier: badgeDef.tier,
        category: badgeDef.category,
        requirement: badgeDef.requirement,
        color: badgeDef.color,
        isActive: true,
      },
    });
    console.log(`✓ Seeded badge: ${badgeDef.name}`);
  }

  console.log(`\nSuccessfully seeded ${BADGE_DEFINITIONS.length} badges!`);
}

main()
  .catch((e) => {
    console.error('Error seeding badges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
