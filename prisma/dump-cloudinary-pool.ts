import prisma from '@config/prisma';

const POOL_SIZE = 15;

async function main() {
  const rows = await prisma.petImage.findMany({
    select: { imageUrl: true, publicId: true },
    take: POOL_SIZE,
    orderBy: { id: 'asc' },
  });

  if (rows.length === 0) {
    console.error(
      '❌ No PetImage rows found. Run `npx prisma db seed` first to upload images to Cloudinary.',
    );
    process.exit(1);
  }

  console.log(
    `\n// Paste this into CLOUDINARY_POOL in prisma/seed-perf.ts (${rows.length} entries):\n`,
  );
  console.log('const CLOUDINARY_POOL: ReadonlyArray<{ url: string; publicId: string }> = [');
  for (const row of rows) {
    console.log(`  { url: '${row.imageUrl}', publicId: '${row.publicId}' },`);
  }
  console.log('];\n');
}

main()
  .catch((e) => {
    console.error('❌ Dump failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
