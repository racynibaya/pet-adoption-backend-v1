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

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Dorothy', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna',
  'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores',
];

const PET_NAMES = [
  'Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Molly', 'Buddy', 'Daisy',
  'Tucker', 'Sadie', 'Bear', 'Maggie', 'Jack', 'Sophie', 'Rocky', 'Bailey',
  'Duke', 'Zoe', 'Winston', 'Lily', 'Gus', 'Chloe', 'Murphy', 'Nala',
  'Oliver', 'Penny', 'Teddy', 'Rosie', 'Leo', 'Lola', 'Milo', 'Ruby',
  'Oscar', 'Gracie', 'Jasper', 'Coco', 'Zeus', 'Ellie', 'Beau', 'Abby',
  'Finn', 'Stella', 'Henry', 'Willow', 'Bruno', 'Pepper', 'Louie', 'Lucy',
  'Atlas', 'Lexi', 'Baxter', 'Honey', 'Chester', 'Roxy', 'Diesel', 'Piper',
  'Rex', 'Nova', 'Apollo', 'Ivy', 'Ace', 'Amber', 'Bandit', 'Maple',
  'Biscuit', 'Pearl', 'Brody', 'Aurora', 'Bolt', 'Autumn', 'Boomer', 'Hazel',
  'Buster', 'Skye', 'Cody', 'Violet', 'Dexter', 'Cleo', 'Fiona', 'Jade',
];

const BREEDS_BY_SPECIES: Record<Species, string[]> = {
  [Species.DOG]: [
    'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'English Bulldog',
    'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund',
    'Shih Tzu', 'Siberian Husky', 'Doberman Pinscher', 'Australian Shepherd',
    'Border Collie', 'Cavalier King Charles Spaniel', 'Cocker Spaniel',
    'Miniature Schnauzer', 'Maltese', 'Chihuahua',
  ],
  [Species.CAT]: [
    'Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll',
    'Scottish Fold', 'Bengal', 'Abyssinian', 'Sphynx', 'Russian Blue',
  ],
  [Species.RABBIT]: [
    'Holland Lop', 'Mini Rex', 'Lionhead', 'Dutch', 'Flemish Giant', 'English Angora',
  ],
  [Species.BIRD]: [
    'Budgerigar', 'Cockatiel', 'African Grey Parrot', 'Lovebird', 'Sun Conure', 'Cockatoo',
  ],
  [Species.OTHER]: [
    'Guinea Pig', 'Hamster', 'Ferret', 'Chinchilla', 'Hedgehog',
  ],
};

const PET_DESCRIPTIONS = [
  'A gentle and affectionate companion who loves cuddles and quiet evenings at home.',
  'Energetic and playful, this one thrives with an active family and lots of outdoor time.',
  'A calm and well-mannered pet who gets along with everyone, including children.',
  'Curious and clever, always exploring and ready to learn new tricks.',
  'Sweet-natured and loyal, this pet bonds deeply with its owner.',
  'A little shy at first, but blossoms into a loving companion once comfortable.',
  'Loves attention and will follow you from room to room just to be near you.',
  'Great with other animals and enjoys having a furry companion to play with.',
  'A resilient rescue who has overcome a tough start and is ready for a forever home.',
  'Independent yet affectionate — the perfect balance for a busy household.',
  'Highly sociable and loves meeting new people. Perfect for a lively home.',
  'Gentle with children and patient by nature. A wonderful family pet.',
];

const ADOPTION_REASONS = [
  'I want to give a rescued animal a loving and permanent home.',
  'My family has been ready for a pet for a long time and this feels like the right time.',
  'I recently lost my companion animal and feel ready to open my heart again.',
  'I live alone and would love a loyal companion to share my days with.',
];

const ADOPTION_MESSAGES = [
  'I have experience caring for pets and can provide a safe, nurturing home.',
  'We have a large backyard and plenty of space for this pet to run and play.',
  'I work from home and can give this pet the full-time attention it deserves.',
  'Our family has always had animals and we know how to care for them properly.',
  'I have been volunteering at a rescue shelter and am ready to adopt.',
  'I have researched this breed thoroughly and am fully prepared for the responsibility.',
];

interface ShelterEntry {
  name: string;
  description: string;
  address: string;
  contactEmail: string;
  phoneNumber: string;
}

const SHELTER_DATA: ShelterEntry[] = [
  {
    name: 'Paws & Hearts Animal Shelter',
    description: 'A community-driven shelter dedicated to rescuing and rehoming dogs, cats, and small animals across the metro area.',
    address: '12 Bayani Road, Fort Bonifacio, Taguig City, Metro Manila',
    contactEmail: 'contact@pawsandhearts.org',
    phoneNumber: '+639171234501',
  },
  {
    name: 'Second Chance Pet Rescue',
    description: 'We believe every animal deserves a second chance. Our team works tirelessly to rehabilitate and rehome animals in need.',
    address: '45 Ayala Avenue, Bel-Air, Makati City, Metro Manila',
    contactEmail: 'hello@secondchancepetrescue.org',
    phoneNumber: '+639181234502',
  },
  {
    name: 'Furever Home Adoption Center',
    description: 'Matching loving families with their perfect furry companions since 2010. We specialize in senior and special-needs animals.',
    address: '88 Katipunan Avenue, Loyola Heights, Quezon City, Metro Manila',
    contactEmail: 'adopt@fureverhome.org',
    phoneNumber: '+639191234503',
  },
  {
    name: 'Happy Tails Humane Society',
    description: 'A fully accredited humane society committed to ending animal homelessness through adoption, spay/neuter programs, and community education.',
    address: '21 Ortigas Avenue, Kapitolyo, Pasig City, Metro Manila',
    contactEmail: 'info@happytailsph.org',
    phoneNumber: '+639201234504',
  },
  {
    name: 'Rainbow Bridge Rescue',
    description: 'Founded by a group of veterinarians, we provide medical care, rehabilitation, and loving homes for rescued animals.',
    address: '7 Shaw Boulevard, Wack-Wack, Mandaluyong City, Metro Manila',
    contactEmail: 'rescue@rainbowbridgeph.org',
    phoneNumber: '+639211234505',
  },
  {
    name: 'Sunshine Animal Sanctuary',
    description: 'An open sanctuary providing safe refuge and adoption services for stray, abandoned, and surrendered animals.',
    address: '34 Sumulong Highway, Sto. Niño, Marikina City, Metro Manila',
    contactEmail: 'sanctuary@sunshineanimals.org',
    phoneNumber: '+639221234506',
  },
  {
    name: 'The Humane Haven',
    description: 'A no-kill shelter offering adoption, fostering, and animal welfare advocacy for the local community.',
    address: '58 Quirino Avenue, Malibay, Pasay City, Metro Manila',
    contactEmail: 'hello@thehumanehaven.org',
    phoneNumber: '+639231234507',
  },
  {
    name: 'Loving Paws Rescue',
    description: 'We rescue and rehabilitate dogs and cats from the streets, giving them the care they need before placing them in forever homes.',
    address: '19 Dr. A. Santos Avenue, BF Homes, Parañaque City, Metro Manila',
    contactEmail: 'rescue@lovingpawsph.org',
    phoneNumber: '+639241234508',
  },
  {
    name: 'New Beginnings Animal Shelter',
    description: 'Every animal in our care gets a fresh start. We provide medical care, socialization, and adoption support for all our residents.',
    address: '63 Alabang-Zapote Road, Pamplona, Las Piñas City, Metro Manila',
    contactEmail: 'info@newbeginningsanimals.org',
    phoneNumber: '+639251234509',
  },
  {
    name: 'Harmony Pet Adoption Center',
    description: 'We focus on creating harmonious matches between pets and families through careful assessment and ongoing adoption support.',
    address: '11 Alabang Hills Drive, Ayala Alabang, Muntinlupa City, Metro Manila',
    contactEmail: 'adopt@harmonypets.org',
    phoneNumber: '+639261234510',
  },
  {
    name: 'Safe Harbor Animal Rescue',
    description: 'A foster-based rescue network that houses animals in caring foster homes while they await adoption.',
    address: '77 A. Mabini Street, Monumento, Caloocan City, Metro Manila',
    contactEmail: 'contact@safeharborrescue.org',
    phoneNumber: '+639271234511',
  },
  {
    name: 'Bright Futures Humane Society',
    description: 'Our shelter prioritizes mental and physical health for every animal, offering enrichment programs and behavioral training before adoption.',
    address: '29 McArthur Highway, Malinta, Valenzuela City, Metro Manila',
    contactEmail: 'info@brightfuturesph.org',
    phoneNumber: '+639281234512',
  },
  {
    name: 'Gentle Hearts Pet Rescue',
    description: 'Specializing in the rescue of abused and neglected animals, we provide trauma-informed care and patient rehabilitation.',
    address: '5 Gov. Pascual Avenue, Tinajeros, Malabon City, Metro Manila',
    contactEmail: 'rescue@gentleheartsph.org',
    phoneNumber: '+639291234513',
  },
  {
    name: 'Forever Friends Animal Shelter',
    description: 'A community shelter run by passionate volunteers who believe that every animal is deserving of a lifelong companion.',
    address: '40 M. Naval Street, Sipac-Almacen, Navotas City, Metro Manila',
    contactEmail: 'hello@foreverfriendsph.org',
    phoneNumber: '+639301234514',
  },
  {
    name: 'Golden Gate Pet Adoption',
    description: 'We connect rescued animals with responsible adopters through thorough screening, home visits, and post-adoption follow-up.',
    address: '16 N. Domingo Street, Addition Hills, San Juan City, Metro Manila',
    contactEmail: 'adopt@goldengatepets.org',
    phoneNumber: '+639311234515',
  },
  {
    name: 'Coastal Paws Rescue',
    description: 'Serving the coastal communities, we rescue animals from informal settlements and provide adoption services to families in the area.',
    address: '82 Aguinaldo Highway, Palico, Imus City, Cavite',
    contactEmail: 'info@coastalpawsrescue.org',
    phoneNumber: '+639321234516',
  },
  {
    name: 'Valley View Animal Sanctuary',
    description: 'Nestled in the hills, our sanctuary provides a peaceful environment for animal recovery, rehabilitation, and rehoming.',
    address: '15 Sumulong Memorial Circle, Brgy. Dela Paz, Antipolo City, Rizal',
    contactEmail: 'sanctuary@valleyviewanimals.org',
    phoneNumber: '+639331234517',
  },
  {
    name: 'Meadowbrook Humane Society',
    description: 'A trusted humane society serving the Laguna region with animal sheltering, adoption events, and spay/neuter clinics.',
    address: '28 National Road, Brgy. Halang, Calamba City, Laguna',
    contactEmail: 'contact@meadowbrookhs.org',
    phoneNumber: '+639341234518',
  },
  {
    name: 'Riverside Pet Rescue Center',
    description: 'Located along the river, we rescue and rehabilitate animals found in the waterway and surrounding communities.',
    address: '54 Tirona Highway, Habay, Bacoor City, Cavite',
    contactEmail: 'rescue@riversidepetrescue.org',
    phoneNumber: '+639351234519',
  },
  {
    name: 'Blue Sky Animal Shelter',
    description: 'We envision a world where no animal is left behind. Our shelter provides a bright future for every animal that comes through our doors.',
    address: '9 Pacita Complex, San Pedro City, Laguna',
    contactEmail: 'hello@blueskyshelter.org',
    phoneNumber: '+639361234520',
  },
];

const DONATION_AMOUNTS_CENTS = [
  500, 1000, 1500, 2000, 2500, 3000, 5000, 7500,
  10000, 15000, 20000, 750, 1250, 4000, 6000, 8000,
  12000, 18000, 2500, 3500,
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

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function futureDateFor(i: number, daysAhead = 60): Date {
  const d = new Date();
  d.setDate(d.getDate() + (i % daysAhead) + 1);
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

function adoptionFieldsFor(i: number): AdoptionFields {
  const homeType = pick(ALL_HOME_TYPES, i);
  const hasYard = homeType === HomeType.HOUSE && i % 4 !== 0;
  const ownsHome = i % 5 !== 0;
  return {
    homeType,
    hasYard,
    yardFenced: hasYard ? i % 3 !== 0 : null,
    ownsHome,
    landlordAllowPets: ownsHome ? null : i % 5 !== 0,
    householdSize: (i % 5) + 1,
    hasChildren: i % 2 === 0,
    hasPreviousPetExperience: i % 3 !== 0,
    yearsOfExperience: i % 11,
    hoursAwayPerDay: (i % 9) + 2,
    hasOtherPetsNow: i % 3 === 0,
    reasonForAdopting: pick(ADOPTION_REASONS, i),
    hasBackupCarePlan: i % 4 !== 0,
    awareOfMonthlyCosts: i % 10 !== 0,
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
  const hashedPassword = await bcrypt.hash('SeedPass123!', 10);

  // ── 2. Admin ──────────────────────────────────────────────────────────────
  console.log('\n👤 Creating admin…');
  await prisma.user.create({
    data: {
      email: 'admin@petadopt.ph',
      firstName: 'Alexandra',
      lastName: 'Cruz',
      hashedPassword,
      isVerified: true,
      role: Role.ADMIN,
    },
  });

  // ── 3. Staff users (one per shelter) ─────────────────────────────────────
  console.log(`\n👥 Creating ${SHELTER_COUNT} staff users…`);
  console.time('staff');
  const staffUsers = await prisma.user.createManyAndReturn({
    data: Array.from({ length: SHELTER_COUNT }, (_, i) => {
      const firstName = pick(FIRST_NAMES, i);
      const lastName = pick(LAST_NAMES, i);
      const shelterDomain = SHELTER_DATA[i].contactEmail.split('@')[1];
      return {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${shelterDomain}`,
        firstName,
        lastName,
        hashedPassword,
        isVerified: true,
        role: Role.STAFF,
      };
    }),
  });
  console.timeEnd('staff');

  // ── 4. Shelters ───────────────────────────────────────────────────────────
  console.log(`\n🏠 Creating ${SHELTER_COUNT} shelters…`);
  console.time('shelters');
  const shelters = await prisma.shelter.createManyAndReturn({
    data: staffUsers.map((staff, i) => ({
      name: SHELTER_DATA[i].name,
      description: SHELTER_DATA[i].description,
      address: SHELTER_DATA[i].address,
      contactEmail: SHELTER_DATA[i].contactEmail,
      phoneNumber: SHELTER_DATA[i].phoneNumber,
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
    data: Array.from({ length: USER_COUNT }, (_, i) => {
      const firstName = pick(FIRST_NAMES, i);
      const lastName = pick(LAST_NAMES, i + 7); // offset so names differ from staff pool
      return {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@gmail.com`,
        firstName,
        lastName,
        hashedPassword,
        isVerified: true,
        role: Role.USER,
      };
    }),
  });
  console.timeEnd('users');
  console.log(`   → ${regularUsers.length} users created`);

  // ── 7. Pets ───────────────────────────────────────────────────────────────
  console.log(`\n🐾 Creating ${PET_COUNT} pets…`);
  console.time('pets');
  const pets = await prisma.pet.createManyAndReturn({
    data: Array.from({ length: PET_COUNT }, (_, i) => {
      const species = ALL_SPECIES[i % ALL_SPECIES.length];
      const breedPool = BREEDS_BY_SPECIES[species];
      return {
        name: pick(PET_NAMES, i),
        species,
        breed: pick(breedPool, Math.floor(i / ALL_SPECIES.length)),
        ageMonths: ((i * 7) % 118) + 3,
        gender: ALL_GENDERS[i % 2],
        size: ALL_SIZES[i % ALL_SIZES.length],
        description: pick(PET_DESCRIPTIONS, i),
        status: PET_STATUS_POOL[i % PET_STATUS_POOL.length],
        shelterId: shelters[i % SHELTER_COUNT].id,
      };
    }),
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
        publicId: `shelter/pet_${pet.id}/image_${j + 1}`,
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
  let arIndex = 0;

  for (let petIdx = 0; petIdx < pets.length; petIdx++) {
    const pet = pets[petIdx];
    if (pet.status === PetStatus.ADOPTED) {
      adoptionRequestData.push({
        petId: pet.id,
        userId: regularUsers[arIndex % regularUsers.length].id,
        status: AdoptionRequestStatus.APPROVED,
        message: pick(ADOPTION_MESSAGES, arIndex),
        ...adoptionFieldsFor(arIndex),
      });
      arIndex++;
    } else if (petIdx % 3 === 0) {
      adoptionRequestData.push({
        petId: pet.id,
        userId: regularUsers[arIndex % regularUsers.length].id,
        status:
          pet.status === PetStatus.PENDING
            ? arIndex % 2 === 0
              ? AdoptionRequestStatus.PENDING
              : AdoptionRequestStatus.REVIEWING
            : AdoptionRequestStatus.PENDING,
        message: pick(ADOPTION_MESSAGES, arIndex),
        ...adoptionFieldsFor(arIndex),
      });
      arIndex++;
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
    data: Array.from({ length: BOOKING_COUNT }, (_, i) => {
      const startDate = futureDateFor(i, 60);
      const endDate = new Date(startDate.getTime() + 3_600_000); // +1 hour
      return {
        petId: bookablePets[i % bookablePets.length].id,
        userId: regularUsers[i % regularUsers.length].id,
        status: pick(BOOKING_STATUS_POOL, i),
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
      const status = pick(DONATION_STATUS_POOL, i);
      return {
        amountCents: pick(DONATION_AMOUNTS_CENTS, i),
        currency: 'usd',
        status,
        userId: i % 10 < 7 ? regularUsers[i % regularUsers.length].id : null,
        shelterId: shelters[i % shelters.length].id,
        stripePaymentIntentId:
          status !== DonationStatus.PENDING ? `pi_seed_${String(i + 1).padStart(6, '0')}` : null,
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
