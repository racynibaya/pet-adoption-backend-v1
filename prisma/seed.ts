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

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFutureDate(daysAhead = 30): Date {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return d;
}

function randomPhPhone(): string {
  const subscriber = String(Math.floor(Math.random() * 1_000_000_000)).padStart(
    9,
    '0',
  );
  return `+639${subscriber}`;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fetchDogImages(
  breedPath: string,
  count: number,
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://dog.ceo/api/breed/${breedPath}/images/random/${count}`,
    );
    if (!res.ok) throw new Error(`dog.ceo ${res.status}`);
    const json = (await res.json()) as { status: string; message: string[] };
    if (json.status !== 'success' || !Array.isArray(json.message)) {
      throw new Error('dog.ceo bad payload');
    }
    return json.message;
  } catch (err) {
    console.warn(`⚠️  dog image fetch failed for "${breedPath}":`, err);
    return [];
  }
}

async function fetchCatImages(
  breedId: string,
  count: number,
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=${count}`,
    );
    if (!res.ok) throw new Error(`thecatapi ${res.status}`);
    const json = (await res.json()) as Array<{ url?: string }>;
    return json.map((x) => x.url).filter((u): u is string => Boolean(u));
  } catch (err) {
    console.warn(`⚠️  cat image fetch failed for "${breedId}":`, err);
    return [];
  }
}

// ── Static data ───────────────────────────────────────────────────────────────

const DOG_BREEDS = [
  { name: 'Labrador Retriever', slug: 'labrador', size: Size.LARGE },
  { name: 'Golden Retriever', slug: 'retriever/golden', size: Size.LARGE },
  { name: 'German Shepherd', slug: 'germanshepherd', size: Size.LARGE },
  { name: 'Bulldog', slug: 'bulldog/english', size: Size.MEDIUM },
  { name: 'Beagle', slug: 'beagle', size: Size.MEDIUM },
  { name: 'Poodle', slug: 'poodle/standard', size: Size.MEDIUM },
  { name: 'Rottweiler', slug: 'rottweiler', size: Size.LARGE },
  { name: 'Yorkshire Terrier', slug: 'terrier/yorkshire', size: Size.SMALL },
  { name: 'Dachshund', slug: 'dachshund', size: Size.SMALL },
  { name: 'Siberian Husky', slug: 'husky', size: Size.LARGE },
  { name: 'Shih Tzu', slug: 'shihtzu', size: Size.SMALL },
  { name: 'Chihuahua', slug: 'chihuahua', size: Size.SMALL },
  { name: 'Boxer', slug: 'boxer', size: Size.LARGE },
  { name: 'Border Collie', slug: 'collie/border', size: Size.MEDIUM },
  { name: 'Maltese', slug: 'maltese', size: Size.SMALL },
] as const;

const CAT_BREEDS = [
  { name: 'Persian', apiId: 'pers', size: Size.MEDIUM },
  { name: 'Maine Coon', apiId: 'mcoo', size: Size.LARGE },
  { name: 'Siamese', apiId: 'siam', size: Size.MEDIUM },
  { name: 'Ragdoll', apiId: 'ragd', size: Size.LARGE },
  { name: 'Bengal', apiId: 'beng', size: Size.MEDIUM },
  { name: 'British Shorthair', apiId: 'bsho', size: Size.MEDIUM },
  { name: 'Sphynx', apiId: 'sphy', size: Size.MEDIUM },
  { name: 'Scottish Fold', apiId: 'sfol', size: Size.MEDIUM },
  { name: 'Abyssinian', apiId: 'abys', size: Size.MEDIUM },
  { name: 'Burmese', apiId: 'bure', size: Size.MEDIUM },
] as const;

const RABBIT_BREEDS = [
  { name: 'Holland Lop', size: Size.SMALL },
  { name: 'Mini Rex', size: Size.SMALL },
  { name: 'Netherland Dwarf', size: Size.SMALL },
  { name: 'Lionhead', size: Size.SMALL },
  { name: 'Flemish Giant', size: Size.LARGE },
] as const;

const DOG_NAMES_MALE = [
  'Max',
  'Buddy',
  'Charlie',
  'Jack',
  'Cooper',
  'Rocky',
  'Bear',
  'Duke',
  'Tucker',
  'Oliver',
  'Leo',
  'Zeus',
  'Buster',
  'Teddy',
  'Milo',
];

const DOG_NAMES_FEMALE = [
  'Bella',
  'Daisy',
  'Lucy',
  'Molly',
  'Sadie',
  'Lola',
  'Sophie',
  'Stella',
  'Ruby',
  'Rosie',
  'Coco',
  'Penny',
  'Maggie',
  'Bailey',
  'Zoey',
];

const CAT_NAMES_MALE = [
  'Oliver',
  'Leo',
  'Milo',
  'Charlie',
  'Simba',
  'Felix',
  'Tigger',
  'Smokey',
  'Oscar',
  'Loki',
  'Jasper',
  'Toby',
  'Salem',
  'Ollie',
  'Finn',
];

const CAT_NAMES_FEMALE = [
  'Luna',
  'Bella',
  'Lucy',
  'Kitty',
  'Nala',
  'Chloe',
  'Lily',
  'Zoe',
  'Lola',
  'Molly',
  'Sophie',
  'Cleo',
  'Gracie',
  'Ellie',
  'Rosie',
];

const RABBIT_NAMES = [
  'Thumper',
  'Hazel',
  'Peanut',
  'Snowball',
  'Daisy',
  'Clover',
  'Biscuit',
  'Cocoa',
  'Marshmallow',
  'Pepper',
];

const PET_STATUSES: PetStatus[] = [
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.PENDING,
  PetStatus.ADOPTED,
];

const GENDERS: Gender[] = [Gender.MALE, Gender.FEMALE];

const DESCRIPTIONS: Record<string, string[]> = {
  Dog: [
    'A friendly and energetic companion who loves long walks and playing fetch.',
    'Very gentle with children, great family dog with a calm temperament.',
    'Loyal and protective, bonds deeply with its owner.',
    'Playful pup who gets along well with other dogs.',
    'House-trained and well-behaved, looking for a forever home.',
  ],
  Cat: [
    'Independent yet affectionate, loves curling up on a warm lap.',
    'Curious explorer who enjoys window-watching and interactive toys.',
    'Calm and quiet, perfect for apartment living.',
    'Sociable cat that greets everyone at the door.',
    'Gentle giant who loves cuddles and slow mornings.',
  ],
  Rabbit: [
    'Soft and quiet, loves to binky around the living room.',
    'Litter-trained and surprisingly social.',
    'Loves leafy greens and gentle handling.',
    'Perfect starter pet, very low maintenance.',
    'Curious and playful, enjoys tunnels and cardboard boxes.',
  ],
};

const PHOTO_URLS: Record<'Dog' | 'Cat' | 'Rabbit', string[]> = {
  Dog: [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=80',
  ],
  Cat: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
    'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&q=80',
    'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80',
    'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&q=80',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80',
  ],
  Rabbit: [
    'https://images.unsplash.com/photo-1535241749838-299277b6305f?w=800&q=80',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80',
    'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=800&q=80',
    'https://images.unsplash.com/photo-1607923432780-7a9c30adcb72?w=800&q=80',
    'https://images.unsplash.com/photo-1583337426008-2fef51aa841e?w=800&q=80',
    'https://images.unsplash.com/photo-1606853046095-25a86b7a4d2c?w=800&q=80',
  ],
};

// ── User data ─────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Maria',
  'Jose',
  'Juan',
  'Andres',
  'Liwayway',
  'Antonio',
  'Carmen',
  'Rosario',
  'Manuel',
  'Elena',
  'Ricardo',
  'Imelda',
  'Eduardo',
  'Corazon',
  'Roberto',
  'Teresita',
  'Fernando',
  'Lourdes',
  'Ramon',
  'Cristina',
  'Miguel',
  'Angelica',
  'Joaquin',
  'Bianca',
  'Diego',
];

const LAST_NAMES = [
  'Santos',
  'Reyes',
  'Cruz',
  'Bautista',
  'Garcia',
  'Mendoza',
  'Torres',
  'Aquino',
  'Tan',
  'Lim',
  'Gonzales',
  'Villanueva',
  'Domingo',
  'Rivera',
  'Castro',
  'Flores',
  'Mercado',
  'Salvador',
  'Navarro',
  'Pascual',
  'De Leon',
  'Del Rosario',
  'Magsaysay',
  'Ramos',
  'Quezon',
];

const STAFF_FIRST_NAMES = [
  'Andrea',
  'Joaquin',
  'Patricia',
  'Marco',
  'Isabela',
  'Rafael',
  'Camille',
];

const STAFF_LAST_NAMES = [
  'Soriano',
  'Padilla',
  'Yulo',
  'Hipolito',
  'Pangilinan',
  'Concepcion',
  'Buenaventura',
];

const ADDRESSES = [
  '123 Aurora Blvd, Brgy. San Antonio, Quezon City',
  '456 Ayala Ave, Brgy. Bel-Air, Makati City',
  '78 Lapu-Lapu St, Brgy. Mabolo, Cebu City',
  '12 Roxas Blvd, Brgy. 76, Pasay City',
  '55 Bonifacio Dr, Brgy. Poblacion, Davao City',
  '34 Burgos St, Brgy. Villa Angela, Bacolod City',
  '210 General Luna St, Iloilo City Proper, Iloilo City',
  '89 Session Rd, Brgy. Hillside, Baguio City',
  '67 Magsaysay Ave, Brgy. Centro, Naga City',
  '101 Rizal Ave, Brgy. Mahogany, Cagayan de Oro',
];

const SHELTER_NAMES = [
  'Paws of Manila Animal Rescue',
  'Cebu Furry Friends Haven',
  'Davao Pet Sanctuary',
  'Bacolod Second Chance Rescue',
  'Iloilo Safe Haven Shelter',
];

// One URL per shelter, in the same order as SHELTER_NAMES.
// Paste 5 vetted Unsplash URLs here.
const SHELTER_IMAGES: string[] = [
  '',
  '',
  '',
  '',
  '',
];

// ── Main seed ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
  const verifyTokenExpiry = randomFutureDate(7);

  // -- 0. Create ADMIN
  console.log('Creating ADMIN user');
  await prisma.user.create({
    data: {
      id: 0,
      firstName: 'Racyn',
      lastName: 'Ibaya',
      email: `admin@petadopt.com`,
      hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      verifyToken: `verify-user-token-${0}`,
      verifyTokenExpiry,
      address: randomItem(ADDRESSES),
      phoneNumber: randomPhPhone(),
    },
  });

  // ── 1. Create 10 regular USER accounts ───────────────────────────────────
  console.log('👥 Creating 10 regular users...');
  await prisma.user.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      firstName: randomItem(FIRST_NAMES),
      lastName: randomItem(LAST_NAMES),
      email: `user${i + 1}@petadopt.com`,
      hashedPassword,
      role: Role.USER,
      isVerified: true,
      verifyToken: `verify-user-token-${i + 1}`,
      verifyTokenExpiry,
      address: randomItem(ADDRESSES),
      phoneNumber: randomPhPhone(),
    })),
  });

  // ── 2. Create STAFF users (one per shelter) ───────────────────────────────
  console.log('👤 Creating staff users...');
  const staffFirstNames = shuffle(STAFF_FIRST_NAMES).slice(0, 5);
  const staffLastNames = shuffle(STAFF_LAST_NAMES).slice(0, 5);
  const staffUsers = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.user.create({
        data: {
          firstName: staffFirstNames[i],
          lastName: staffLastNames[i],
          email: `staff${i + 1}@petadopt.com`,
          hashedPassword,
          role: Role.STAFF,
          isVerified: true,
          verifyToken: `verify-staff-token-${i + 1}`,
          verifyTokenExpiry,
          address: randomItem(ADDRESSES),
          phoneNumber: randomPhPhone(),
        },
      }),
    ),
  );

  // ── 3. Create 5 Shelters ──────────────────────────────────────────────────
  console.log('🏠 Creating shelters...');
  const shelters = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.shelter.create({
        data: {
          name: SHELTER_NAMES[i],
          address: ADDRESSES[i],
          contactEmail: `contact@${slugify(SHELTER_NAMES[i])}.org.ph`,
          phoneNumber: randomPhPhone(),
          imageUrl: SHELTER_IMAGES[i] || null,
          description: `Welcome to ${SHELTER_NAMES[i]}! We are dedicated to rescuing and rehoming pets in need. Our shelter provides a safe haven for dogs, cats, and rabbits, offering them love, care, and a second chance at life.`,
          ownerId: staffUsers[i].id,
        },
      }),
    ),
  );

  // ── 4. Assign each staff user to their shelter ────────────────────────────
  console.log('🔗 Assigning staff to shelters...');
  await Promise.all(
    shelters.map((shelter, i) =>
      prisma.shelterStaff.create({
        data: { userId: staffUsers[i].id, shelterId: shelter.id },
      }),
    ),
  );

  // ── 5. Create 30 Pets with images ────────────────────────────────────────
  console.log('🐾 Creating 30 pets...');

  const createdPets: { id: number; status: PetStatus }[] = [];

  for (let i = 0; i < 30; i++) {
    let species: Species;
    let descKey: 'Dog' | 'Cat' | 'Rabbit';
    let breedName: string;
    let breedSize: Size;
    let imageUrls: string[];

    const gender = randomItem(GENDERS);
    const imageCount = randomInt(2, 4);

    if (i < 15) {
      species = Species.DOG;
      descKey = 'Dog';
      const breed = randomItem(DOG_BREEDS);
      breedName = breed.name;
      breedSize = breed.size;
      imageUrls = await fetchDogImages(breed.slug, imageCount);
    } else if (i < 25) {
      species = Species.CAT;
      descKey = 'Cat';
      const breed = randomItem(CAT_BREEDS);
      breedName = breed.name;
      breedSize = breed.size;
      imageUrls = await fetchCatImages(breed.apiId, imageCount);
    } else {
      species = Species.RABBIT;
      descKey = 'Rabbit';
      const breed = randomItem(RABBIT_BREEDS);
      breedName = breed.name;
      breedSize = breed.size;
      imageUrls = [];
    }

    if (imageUrls.length === 0) {
      const pool = PHOTO_URLS[descKey];
      imageUrls = shuffle(pool).slice(0, Math.min(imageCount, pool.length));
    }

    const namePool =
      species === Species.DOG
        ? gender === Gender.MALE
          ? DOG_NAMES_MALE
          : DOG_NAMES_FEMALE
        : species === Species.CAT
          ? gender === Gender.MALE
            ? CAT_NAMES_MALE
            : CAT_NAMES_FEMALE
          : RABBIT_NAMES;

    const shelterId = shelters[Math.floor(Math.random() * shelters.length)].id;
    const status = randomItem(PET_STATUSES);

    const pet = await prisma.pet.create({
      data: {
        name: randomItem(namePool),
        species,
        breed: breedName,
        ageMonths: Math.floor(Math.random() * 96) + 3,
        gender,
        size: breedSize,
        status,
        description: randomItem(DESCRIPTIONS[descKey]),
        shelterId,
      },
    });

    createdPets.push({ id: pet.id, status });

    await prisma.petImage.createMany({
      data: imageUrls.map((imageUrl, idx) => ({
        petId: pet.id,
        imageUrl,
        publicId: `seed-pet-${pet.id}-${idx}`,
        isPrimary: idx === 0,
      })),
    });
  }

  // ── 6. Create AdoptionRequests tied to pet status ─────────────────────────
  console.log('📨 Creating adoption requests...');

  const regularUsers = await prisma.user.findMany({
    where: { role: Role.USER },
    select: { id: true },
  });
  const regularUserIds = regularUsers.map((u) => u.id);

  const ADOPTION_MESSAGES = [
    'We have a fenced yard and two kids who would love a furry sibling.',
    'Long-time pet owner, looking to give a loving home to a rescue.',
    'I work from home and can give them all the attention they need.',
    'Our previous pet recently passed away — ready to welcome a new family member.',
  ];

  const REJECTION_REASONS = [
    'Application was incomplete.',
    'Pet was adopted by another applicant first.',
    'Living situation did not meet shelter requirements.',
  ];

  const ADOPTION_REASONS = [
    'I want to give a rescued animal a loving home.',
    'My kids have been asking for a pet for years.',
    'I recently lost my pet and am ready for a new one.',
    'Looking for a companion.',
  ];

  function randomAdoptionFields() {
    const homeType = randomItem([HomeType.HOUSE, HomeType.APARTMENT, HomeType.CONDO]);
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

  for (const pet of createdPets) {
    if (pet.status === PetStatus.ADOPTED) {
      const pickedUsers = shuffle(regularUserIds).slice(0, randomInt(1, 3));
      const [approvedUserId, ...rejectedUserIds] = pickedUsers;

      await prisma.adoptionRequest.create({
        data: {
          petId: pet.id,
          userId: approvedUserId,
          status: AdoptionRequestStatus.APPROVED,
          message: randomItem(ADOPTION_MESSAGES),
          ...randomAdoptionFields(),
        },
      });

      if (rejectedUserIds.length > 0) {
        await prisma.adoptionRequest.createMany({
          data: rejectedUserIds.map((userId) => ({
            petId: pet.id,
            userId,
            status: AdoptionRequestStatus.REJECTED,
            message: randomItem(ADOPTION_MESSAGES),
            rejectionReason: randomItem(REJECTION_REASONS),
            ...randomAdoptionFields(),
          })),
        });
      }
    } else if (pet.status === PetStatus.PENDING) {
      await prisma.adoptionRequest.create({
        data: {
          petId: pet.id,
          userId: randomItem(regularUserIds),
          status: randomItem([
            AdoptionRequestStatus.PENDING,
            AdoptionRequestStatus.REVIEWING,
          ]),
          message: randomItem(ADOPTION_MESSAGES),
          ...randomAdoptionFields(),
        },
      });
    } else if (Math.random() < 0.3) {
      await prisma.adoptionRequest.create({
        data: {
          petId: pet.id,
          userId: randomItem(regularUserIds),
          status: AdoptionRequestStatus.PENDING,
          message: randomItem(ADOPTION_MESSAGES),
          ...randomAdoptionFields(),
        },
      });
    }
  }

  // ── 7. Create Bookings (meet-and-greets) ──────────────────────────────────
  console.log('📅 Creating bookings...');

  const bookablePets = createdPets.filter(
    (p) => p.status === PetStatus.AVAILABLE || p.status === PetStatus.PENDING,
  );

  const BOOKING_STATUS_POOL: BookingStatus[] = [
    BookingStatus.APPROVED,
    BookingStatus.APPROVED,
    BookingStatus.APPROVED,
    BookingStatus.PENDING,
    BookingStatus.PENDING,
    BookingStatus.REJECTED,
    BookingStatus.CANCELLED,
  ];

  for (let i = 0; i < 10; i++) {
    const pet = randomItem(bookablePets);
    const startDate = randomFutureDate(30);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    await prisma.booking.create({
      data: {
        petId: pet.id,
        userId: randomItem(regularUserIds),
        status: randomItem(BOOKING_STATUS_POOL),
        startDate,
        endDate,
      },
    });
  }

  // ── 8. Create Donations ───────────────────────────────────────────────────
  console.log('💝 Creating donations...');

  const DONATION_STATUS_POOL: DonationStatus[] = [
    ...Array(7).fill(DonationStatus.COMPLETED),
    ...Array(2).fill(DonationStatus.PENDING),
    DonationStatus.FAILED,
    DonationStatus.REFUNDED,
  ];

  const DONATION_MESSAGES = [
    'Thank you for the work you do!',
    'In memory of my late dog Rocky.',
    'Keep up the amazing rescue work.',
    null,
    null,
  ];

  for (let i = 0; i < 15; i++) {
    const status = randomItem(DONATION_STATUS_POOL);
    const attributed = Math.random() < 0.7;
    const hasStripeIds = status !== DonationStatus.PENDING;

    await prisma.donation.create({
      data: {
        amountCents: randomInt(50_000, 2_000_000),
        currency: 'usd',
        status,
        userId: attributed ? randomItem(regularUserIds) : null,
        shelterId: randomItem(shelters).id,
        stripePaymentIntentId: hasStripeIds ? `pi_seed_${i}` : null,
        stripeSessionId: hasStripeIds ? `cs_seed_${i}` : null,
        message: randomItem(DONATION_MESSAGES),
      },
    });
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const [
    petCount,
    shelterCount,
    staffCount,
    userCount,
    adoptionRequestCount,
    bookingCount,
    donationCount,
  ] = await Promise.all([
    prisma.pet.count(),
    prisma.shelter.count(),
    prisma.shelterStaff.count(),
    prisma.user.count({ where: { role: Role.USER } }),
    prisma.adoptionRequest.count(),
    prisma.booking.count(),
    prisma.donation.count(),
  ]);

  console.log('✅ Seed complete!');
  console.log(`   👥 Users             : ${userCount}`);
  console.log(`   👤 Staff             : ${staffCount}`);
  console.log(`   🏠 Shelters          : ${shelterCount}`);
  console.log(`   🐾 Pets              : ${petCount}`);
  console.log(`   📨 Adoption requests : ${adoptionRequestCount}`);
  console.log(`   📅 Bookings          : ${bookingCount}`);
  console.log(`   💝 Donations         : ${donationCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
