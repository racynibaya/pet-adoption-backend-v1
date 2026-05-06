import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import prisma from '@config/prisma';

async function main() {
  const users = await Promise.all(
    Array.from({ length: 100 }, async (_, i) => {
      const password = await bcrypt.hash(`users${i + 1}`, 10);
      const token = crypto.randomBytes(32).toString('hex');
      return {
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        hashedPassword: password,
        verifyToken: token,
        isVerified: true,
        verifyTokenExpiry: new Date(Date.now() + 60 + i + 60 * 1000),
      };
    }),
  );

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true, // won't crash if you run it twice
  });

  console.log('✅ 100 users seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
