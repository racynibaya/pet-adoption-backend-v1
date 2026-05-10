import bcrypt from 'bcrypt';
import prisma from '@config/prisma';

import { Gender, PetStatus, Role, Size, Species } from '../generated/prisma/enums';

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFutureDate(daysAhead = 30): Date {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return d;
}

// ── Static data ───────────────────────────────────────────────────────────────

const DOG_BREEDS = [
  'Labrador Retriever',
  'Golden Retriever',
  'German Shepherd',
  'Bulldog',
  'Beagle',
  'Poodle',
  'Rottweiler',
  'Yorkshire Terrier',
  'Dachshund',
  'Siberian Husky',
  'Shih Tzu',
  'Chihuahua',
  'Boxer',
  'Border Collie',
  'Maltese',
];

const CAT_BREEDS = [
  'Persian',
  'Maine Coon',
  'Siamese',
  'Ragdoll',
  'Bengal',
  'British Shorthair',
  'Sphynx',
  'Scottish Fold',
  'Abyssinian',
  'Burmese',
];

const RABBIT_BREEDS = [
  'Holland Lop',
  'Mini Rex',
  'Netherland Dwarf',
  'Lionhead',
  'Flemish Giant',
];

const DOG_NAMES = [
  'Max', 'Buddy', 'Charlie', 'Jack', 'Cooper',
  'Rocky', 'Bear', 'Duke', 'Tucker', 'Oliver',
  'Leo', 'Zeus', 'Buster', 'Teddy', 'Milo',
];

const CAT_NAMES = [
  'Luna', 'Bella', 'Lucy', 'Kitty', 'Nala',
  'Chloe', 'Lily', 'Zoe', 'Lola', 'Molly',
  'Sophie', 'Cleo', 'Gracie', 'Ellie', 'Rosie',
];

const RABBIT_NAMES = [
  'Thumper', 'Hazel', 'Peanut', 'Snowball', 'Daisy',
  'Clover', 'Biscuit', 'Cocoa', 'Marshmallow', 'Pepper',
];

const PET_STATUSES: PetStatus[] = [
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.PENDING,
  PetStatus.ADOPTED,
];

const SIZES: Size[] = [Size.SMALL, Size.MEDIUM, Size.LARGE, Size.EXTRA_LARGE];
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

const PHOTO_URLS: Record<string, string> = {
  Dog: 'https://placedog.net/400/300',
  Cat: 'https://placekitten.com/400/300',
  Rabbit: 'https://loremflickr.com/400/300/rabbit',
};

// ── User data ─────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert',
  'Jennifer', 'Michael', 'Linda', 'William', 'Barbara',
  'David', 'Susan', 'Richard', 'Jessica', 'Joseph',
  'Sarah', 'Thomas', 'Karen', 'Charles', 'Lisa',
  'Christopher', 'Nancy', 'Daniel', 'Betty', 'Matthew',
  'Margaret', 'Anthony', 'Sandra', 'Mark', 'Ashley',
  'Donald', 'Dorothy', 'Steven', 'Kimberly', 'Paul',
  'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris',
  'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
];

const ADDRESSES = [
  '123 Maple St', '456 Oak Ave', '789 Pine Rd',
  '321 Elm Blvd', '654 Cedar Ln', '987 Birch Dr',
  '135 Willow Way', '246 Spruce Ct', '357 Poplar Pl', '468 Ash St',
];

const SHELTER_NAMES = [
  'Happy Tails Shelter',
  'Paws & Claws Rescue',
  'Furry Friends Haven',
  'Safe Haven Shelter',
  'Second Chance Rescue',
];

// ── Main seed ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const verifyTokenExpiry = randomFutureDate(7);

  // ── 1. Create 100 regular USER accounts ──────────────────────────────────
  console.log('👥 Creating 100 regular users...');
  await prisma.user.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      firstName: randomItem(FIRST_NAMES),
      lastName: randomItem(LAST_NAMES),
      email: `user${i + 1}@petadopt.com`,
      hashedPassword,
      role: Role.USER,
      isVerified: true,
      verifyToken: `verify-user-token-${i + 1}`,
      verifyTokenExpiry,
      address: `${randomItem(ADDRESSES)}, Unit ${i + 1}`,
      phoneNumber: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
    })),
  });

  // ── 2. Create STAFF users (one per shelter) ───────────────────────────────
  console.log('👤 Creating staff users...');
  const staffUsers = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.user.create({
        data: {
          firstName: 'Shelter',
          lastName: `Staff ${i + 1}`,
          email: `staff${i + 1}@petadopt.com`,
          hashedPassword,
          role: Role.STAFF,
          isVerified: true,
          verifyToken: `verify-staff-token-${i + 1}`,
          verifyTokenExpiry,
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
          contactEmail: `contact${i + 1}@${SHELTER_NAMES[i].toLowerCase().replace(/\s+/g, '')}.com`,
          phoneNumber: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
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

  // ── 5. Create 100 Pets with images ───────────────────────────────────────
  console.log('🐾 Creating 100 pets...');

  for (let i = 0; i < 100; i++) {
    let species: Species;
    let breed: string;
    let name: string;
    let descKey: string;

    if (i < 50) {
      species = Species.DOG;
      breed = randomItem(DOG_BREEDS);
      name = randomItem(DOG_NAMES);
      descKey = 'Dog';
    } else if (i < 85) {
      species = Species.CAT;
      breed = randomItem(CAT_BREEDS);
      name = randomItem(CAT_NAMES);
      descKey = 'Cat';
    } else {
      species = Species.RABBIT;
      breed = randomItem(RABBIT_BREEDS);
      name = randomItem(RABBIT_NAMES);
      descKey = 'Rabbit';
    }

    const shelterId = shelters[Math.floor(Math.random() * shelters.length)].id;

    const pet = await prisma.pet.create({
      data: {
        name: `${name} #${i + 1}`,
        species,
        breed,
        ageMonths: Math.floor(Math.random() * 96) + 3,
        gender: randomItem(GENDERS),
        size: randomItem(SIZES),
        status: randomItem(PET_STATUSES),
        description: randomItem(DESCRIPTIONS[descKey]),
        shelterId,
      },
    });

    await prisma.petImage.create({
      data: {
        petId: pet.id,
        imageUrl: PHOTO_URLS[descKey],
        publicId: `seed-pet-${pet.id}`,
        isPrimary: true,
      },
    });
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const [petCount, shelterCount, staffCount, userCount] = await Promise.all([
    prisma.pet.count(),
    prisma.shelter.count(),
    prisma.shelterStaff.count(),
    prisma.user.count({ where: { role: Role.USER } }),
  ]);

  console.log('✅ Seed complete!');
  console.log(`   👥 Users    : ${userCount}`);
  console.log(`   👤 Staff    : ${staffCount}`);
  console.log(`   🏠 Shelters : ${shelterCount}`);
  console.log(`   🐾 Pets     : ${petCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
