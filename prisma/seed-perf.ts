import bcrypt from 'bcrypt';
import prisma from '@config/prisma';
import {
  AdoptionRequestStatus,
  BookingStatus,
  DonationStatus,
  Gender,
  HomeType,
  PetStatus,
  Role,
  Size,
  Species,
} from '../generated/prisma/enums';

// ─── Scale ────────────────────────────────────────────────────────────────────

const USER_COUNT = 1_000;
const SHELTER_COUNT = 20;
const PET_COUNT = 1_000;
const BOOKING_COUNT = 200;
const DONATION_COUNT = 100;

// ─── Data pools ───────────────────────────────────────────────────────────────

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
  'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=400',
];

const ADOPTION_REASONS = [
  'I want to give a rescued animal a loving home.',
  'My kids have been asking for a pet for years.',
  'I recently lost my pet and am ready for a new one.',
  'Looking for a companion.',
];

const PET_STATUS_POOL: PetStatus[] = [
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.PENDING,
  PetStatus.ADOPTED,
];

const BOOKING_STATUS_POOL: BookingStatus[] = [
  BookingStatus.APPROVED,
  BookingStatus.APPROVED,
  BookingStatus.PENDING,
  BookingStatus.REJECTED,
  BookingStatus.CANCELLED,
];

const DONATION_STATUS_POOL: DonationStatus[] = [
  DonationStatus.COMPLETED,
  DonationStatus.COMPLETED,
  DonationStatus.COMPLETED,
  DonationStatus.PENDING,
  DonationStatus.FAILED,
];

const ALL_SPECIES: Species[] = [
  Species.DOG,
  Species.CAT,
  Species.RABBIT,
  Species.BIRD,
  Species.OTHER,
];
const ALL_SIZES: Size[] = [Size.SMALL, Size.MEDIUM, Size.LARGE, Size.EXTRA_LARGE];
const ALL_GENDERS: Gender[] = [Gender.MALE, Gender.FEMALE];
const ALL_HOME_TYPES: HomeType[] = [HomeType.HOUSE, HomeType.APARTMENT, HomeType.CONDO];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFutureDate(daysAhead = 60): Date {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return d;
}

type AdoptionFields = {
  homeType: HomeType;
  hasYard: boolean;
  yardFenced: boolean | null;
  ownsHome: boolean;
  landlordAllowPets: boolean | null;
  householdSize: number;
  hasChildren: boolean;
  hasPreviousPetExperience: boolean;
  yearsOfExperience: number;
  hoursAwayPerDay: number;
  hasOtherPetsNow: boolean;
  reasonForAdopting: string;
  hasBackupCarePlan: boolean;
  awareOfMonthlyCosts: boolean;
};

function randomAdoptionFields(): AdoptionFields {
  const homeType = randomItem(ALL_HOME_TYPES);
  const hasYard = homeType === HomeType.HOUSE && Math.random() > 0.3;
  const ownsHome = Math.random() > 0.4;
  return {
    homeType,
    hasYard,
    yardFenced: hasYard ? Math.random() > 0.3 : null,
    ownsHome,
    landlordAllowPets: ownsHome ? null : Math.random() > 0.2,
    householdSize: randomInt(1, 5),
    hasChildren: Math.random() > 0.5,
    hasPreviousPetExperience: Math.random() > 0.4,
    yearsOfExperience: randomInt(0, 10),
    hoursAwayPerDay: randomInt(2, 10),
    hasOtherPetsNow: Math.random() > 0.5,
    reasonForAdopting: randomItem(ADOPTION_REASONS),
    hasBackupCarePlan: Math.random() > 0.3,
    awareOfMonthlyCosts: Math.random() > 0.1,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Performance seed starting…');
  console.time('total');

  // ── 0. Clear all existing data ────────────────────────────────────────────
  console.log('\n🗑️  Clearing existing data…');
  console.time('clear');
  await prisma.donation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.adoptionRequest.deleteMany();
  await prisma.petImage.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.shelterStaff.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.user.deleteMany();
  console.timeEnd('clear');

  // ── 1. Hash password once, reuse for every seed user ─────────────────────
  console.log('\n🔐 Hashing shared password (once)…');
  const hashedPassword = await bcrypt.hash('PerfTest123!', 10);

  // ── 2. Admin ──────────────────────────────────────────────────────────────
  console.log('\n👤 Creating admin…');
  await prisma.user.create({
    data: {
      email: 'perf_admin@test.com',
      firstName: 'PerfAdmin',
      lastName: 'Test',
      hashedPassword,
      isVerified: true,
      role: Role.ADMIN,
    },
  });

  // ── 3. Staff users (one per shelter) ─────────────────────────────────────
  console.log(`\n👥 Creating ${SHELTER_COUNT} staff users…`);
  console.time('staff');
  const staffUsers = await prisma.user.createManyAndReturn({
    data: Array.from({ length: SHELTER_COUNT }, (_, i) => ({
      email: `perf_staff_${i + 1}@shelter.com`,
      firstName: `PerfStaff${i + 1}`,
      lastName: 'Test',
      hashedPassword,
      isVerified: true,
      role: Role.STAFF,
    })),
  });
  console.timeEnd('staff');

  // ── 4. Shelters ───────────────────────────────────────────────────────────
  console.log(`\n🏠 Creating ${SHELTER_COUNT} shelters…`);
  console.time('shelters');
  const shelters = await prisma.shelter.createManyAndReturn({
    data: staffUsers.map((staff, i) => ({
      name: `Perf Shelter ${i + 1}`,
      description: `Performance test shelter number ${i + 1}.`,
      address: `${i + 1} Performance Blvd, Test City`,
      contactEmail: `contact_shelter_${i + 1}@test.com`,
      phoneNumber: `+6391${String(i).padStart(8, '0')}`,
      ownerId: staff.id,
    })),
  });
  console.timeEnd('shelters');

  // ── 5. ShelterStaff assignments ───────────────────────────────────────────
  console.log('\n🔗 Assigning staff to shelters…');
  await prisma.shelterStaff.createMany({
    data: staffUsers.map((staff, i) => ({
      userId: staff.id,
      shelterId: shelters[i].id,
    })),
  });

  // ── 6. Regular users ──────────────────────────────────────────────────────
  console.log(`\n👤 Creating ${USER_COUNT} regular users…`);
  console.time('users');
  const regularUsers = await prisma.user.createManyAndReturn({
    data: Array.from({ length: USER_COUNT }, (_, i) => ({
      email: `perf_user_${i + 1}@test.com`,
      firstName: `PerfUser${i + 1}`,
      lastName: 'Test',
      hashedPassword,
      isVerified: true,
      role: Role.USER,
    })),
  });
  console.timeEnd('users');
  console.log(`   → ${regularUsers.length} users created`);

  // ── 7. Pets ───────────────────────────────────────────────────────────────
  console.log(`\n🐾 Creating ${PET_COUNT} pets…`);
  console.time('pets');
  const pets = await prisma.pet.createManyAndReturn({
    data: Array.from({ length: PET_COUNT }, (_, i) => ({
      name: `PerfPet${i + 1}`,
      species: ALL_SPECIES[i % ALL_SPECIES.length],
      breed: `Breed ${(i % 20) + 1}`,
      ageMonths: randomInt(3, 120),
      gender: ALL_GENDERS[i % 2],
      size: ALL_SIZES[i % ALL_SIZES.length],
      description: `Performance test pet number ${i + 1}.`,
      status: PET_STATUS_POOL[i % PET_STATUS_POOL.length],
      shelterId: shelters[i % SHELTER_COUNT].id,
    })),
  });
  console.timeEnd('pets');
  console.log(`   → ${pets.length} pets created`);

  // ── 8. Pet images (1–3 per pet, no external APIs) ────────────────────────
  console.log('\n🖼️  Creating pet images…');
  console.time('images');
  await prisma.petImage.createMany({
    data: pets.flatMap((pet, i) => {
      const count = (i % 3) + 1; // cycles 1, 2, 3 images per pet
      return Array.from({ length: count }, (_, j) => ({
        petId: pet.id,
        imageUrl: FALLBACK_IMAGES[(i + j) % FALLBACK_IMAGES.length],
        publicId: `perf_pet_${pet.id}_img_${j + 1}`,
        isPrimary: j === 0,
      }));
    }),
  });
  console.timeEnd('images');

  // ── 9. Adoption requests ──────────────────────────────────────────────────
  console.log('\n📋 Building adoption requests…');
  console.time('adoptionRequests');

  type ARInput = AdoptionFields & {
    petId: number;
    userId: number;
    status: AdoptionRequestStatus;
    message: string;
  };

  const adoptionRequestData: ARInput[] = [];

  for (const pet of pets) {
    if (pet.status === PetStatus.ADOPTED) {
      adoptionRequestData.push({
        petId: pet.id,
        userId: randomItem(regularUsers).id,
        status: AdoptionRequestStatus.APPROVED,
        message: 'I would love to adopt this pet.',
        ...randomAdoptionFields(),
      });
    } else if (Math.random() < 0.35) {
      adoptionRequestData.push({
        petId: pet.id,
        userId: randomItem(regularUsers).id,
        status:
          pet.status === PetStatus.PENDING
            ? randomItem([AdoptionRequestStatus.PENDING, AdoptionRequestStatus.REVIEWING])
            : AdoptionRequestStatus.PENDING,
        message: 'I would love to adopt this pet.',
        ...randomAdoptionFields(),
      });
    }
  }

  await prisma.adoptionRequest.createMany({ data: adoptionRequestData });
  console.timeEnd('adoptionRequests');
  console.log(`   → ${adoptionRequestData.length} adoption requests created`);

  // ── 10. Bookings ──────────────────────────────────────────────────────────
  console.log(`\n📅 Creating ${BOOKING_COUNT} bookings…`);
  console.time('bookings');
  const bookablePets = pets.filter((p) => p.status !== PetStatus.ADOPTED);
  await prisma.booking.createMany({
    data: Array.from({ length: BOOKING_COUNT }, () => {
      const startDate = randomFutureDate(60);
      const endDate = new Date(startDate.getTime() + 3_600_000); // +1 hour
      return {
        petId: randomItem(bookablePets).id,
        userId: randomItem(regularUsers).id,
        status: randomItem(BOOKING_STATUS_POOL),
        startDate,
        endDate,
      };
    }),
  });
  console.timeEnd('bookings');

  // ── 11. Donations ─────────────────────────────────────────────────────────
  console.log(`\n💰 Creating ${DONATION_COUNT} donations…`);
  console.time('donations');
  await prisma.donation.createMany({
    data: Array.from({ length: DONATION_COUNT }, (_, i) => {
      const status = randomItem(DONATION_STATUS_POOL);
      return {
        amountCents: randomInt(500, 20_000),
        currency: 'usd',
        status,
        userId: Math.random() < 0.7 ? randomItem(regularUsers).id : null,
        shelterId: randomItem(shelters).id,
        stripePaymentIntentId:
          status !== DonationStatus.PENDING ? `pi_perf_test_${i + 1}` : null,
      };
    }),
  });
  console.timeEnd('donations');

  console.log('\n✅ Performance seed complete!');
  console.timeEnd('total');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
