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
const SHELTER_COUNT = 30;
const PET_COUNT = 1_000;
const BOOKING_COUNT = 200;
const DONATION_COUNT = 100;

// ─── Data pools ───────────────────────────────────────────────────────────────

// Pre-uploaded Cloudinary images for perf seeding.
// To populate: upload ~15-20 pet photos to Cloudinary, then paste each
// secure_url + public_id pair as an entry below.
// Empty pool fails fast in main() with a clear error.
const CLOUDINARY_POOL: ReadonlyArray<{ url: string; publicId: string }> = [
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888734/pet-adoption/seed/pdrr43blxgij4edl0odk.jpg',
    publicId: 'pet-adoption/seed/pdrr43blxgij4edl0odk',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888735/pet-adoption/seed/scixxaymrt2rcfeqvtwo.jpg',
    publicId: 'pet-adoption/seed/scixxaymrt2rcfeqvtwo',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888734/pet-adoption/seed/wc9hv2h5harqhcxlba8x.jpg',
    publicId: 'pet-adoption/seed/wc9hv2h5harqhcxlba8x',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888734/pet-adoption/seed/umukbbgzr3ftnhg6hmso.jpg',
    publicId: 'pet-adoption/seed/umukbbgzr3ftnhg6hmso',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888736/pet-adoption/seed/ax0giztgyv32qzqzzj86.jpg',
    publicId: 'pet-adoption/seed/ax0giztgyv32qzqzzj86',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888736/pet-adoption/seed/ziuudx87vxotf9ydtbig.jpg',
    publicId: 'pet-adoption/seed/ziuudx87vxotf9ydtbig',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888736/pet-adoption/seed/c4kftez4vnucrjx9ylp9.jpg',
    publicId: 'pet-adoption/seed/c4kftez4vnucrjx9ylp9',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888736/pet-adoption/seed/wo7c3rzbmkzpugrpjydg.jpg',
    publicId: 'pet-adoption/seed/wo7c3rzbmkzpugrpjydg',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888737/pet-adoption/seed/t3qcdtj55rtkyoxpt3yw.jpg',
    publicId: 'pet-adoption/seed/t3qcdtj55rtkyoxpt3yw',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888738/pet-adoption/seed/itfkum7jchtvgyzxsqmo.jpg',
    publicId: 'pet-adoption/seed/itfkum7jchtvgyzxsqmo',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888738/pet-adoption/seed/fhfiervmeew5ngd6bk5g.jpg',
    publicId: 'pet-adoption/seed/fhfiervmeew5ngd6bk5g',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888738/pet-adoption/seed/idacuezluabmepybodns.jpg',
    publicId: 'pet-adoption/seed/idacuezluabmepybodns',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888739/pet-adoption/seed/blie5qico0qrlhysgc34.jpg',
    publicId: 'pet-adoption/seed/blie5qico0qrlhysgc34',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888738/pet-adoption/seed/kyxc1dbvlriigtb375gs.jpg',
    publicId: 'pet-adoption/seed/kyxc1dbvlriigtb375gs',
  },
  {
    url: 'https://res.cloudinary.com/dmkpagj7j/image/upload/v1779888741/pet-adoption/seed/tr4wofwxdq4b3zbxrwru.jpg',
    publicId: 'pet-adoption/seed/tr4wofwxdq4b3zbxrwru',
  },
];

const FIRST_NAMES = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Barbara',
  'David',
  'Elizabeth',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Christopher',
  'Lisa',
  'Daniel',
  'Nancy',
  'Matthew',
  'Betty',
  'Anthony',
  'Margaret',
  'Mark',
  'Sandra',
  'Donald',
  'Ashley',
  'Steven',
  'Dorothy',
  'Paul',
  'Kimberly',
  'Andrew',
  'Emily',
  'Joshua',
  'Donna',
  'Kenneth',
  'Michelle',
  'Kevin',
  'Carol',
  'Brian',
  'Amanda',
  'George',
  'Melissa',
  'Timothy',
  'Deborah',
  'Ronald',
  'Stephanie',
  'Edward',
  'Rebecca',
  'Jason',
  'Sharon',
  'Jeffrey',
  'Laura',
  'Ryan',
  'Cynthia',
];

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
];

const PET_NAMES = [
  'Max',
  'Bella',
  'Charlie',
  'Luna',
  'Cooper',
  'Molly',
  'Buddy',
  'Daisy',
  'Tucker',
  'Sadie',
  'Bear',
  'Maggie',
  'Jack',
  'Sophie',
  'Rocky',
  'Bailey',
  'Duke',
  'Zoe',
  'Winston',
  'Lily',
  'Gus',
  'Chloe',
  'Murphy',
  'Nala',
  'Oliver',
  'Penny',
  'Teddy',
  'Rosie',
  'Leo',
  'Lola',
  'Milo',
  'Ruby',
  'Oscar',
  'Gracie',
  'Jasper',
  'Coco',
  'Zeus',
  'Ellie',
  'Beau',
  'Abby',
  'Finn',
  'Stella',
  'Henry',
  'Willow',
  'Bruno',
  'Pepper',
  'Louie',
  'Lucy',
  'Atlas',
  'Lexi',
  'Baxter',
  'Honey',
  'Chester',
  'Roxy',
  'Diesel',
  'Piper',
  'Rex',
  'Nova',
  'Apollo',
  'Ivy',
  'Ace',
  'Amber',
  'Bandit',
  'Maple',
  'Biscuit',
  'Pearl',
  'Brody',
  'Aurora',
  'Bolt',
  'Autumn',
  'Boomer',
  'Hazel',
  'Buster',
  'Skye',
  'Cody',
  'Violet',
  'Dexter',
  'Cleo',
  'Fiona',
  'Jade',
];

const BREEDS_BY_SPECIES: Record<Species, string[]> = {
  [Species.DOG]: [
    'Golden Retriever',
    'Labrador Retriever',
    'German Shepherd',
    'English Bulldog',
    'Beagle',
    'Poodle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Boxer',
    'Dachshund',
    'Shih Tzu',
    'Siberian Husky',
    'Doberman Pinscher',
    'Australian Shepherd',
    'Border Collie',
    'Cavalier King Charles Spaniel',
    'Cocker Spaniel',
    'Miniature Schnauzer',
    'Maltese',
    'Chihuahua',
  ],
  [Species.CAT]: [
    'Persian',
    'Siamese',
    'Maine Coon',
    'British Shorthair',
    'Ragdoll',
    'Scottish Fold',
    'Bengal',
    'Abyssinian',
    'Sphynx',
    'Russian Blue',
  ],
  [Species.RABBIT]: [
    'Holland Lop',
    'Mini Rex',
    'Lionhead',
    'Dutch',
    'Flemish Giant',
    'English Angora',
  ],
  [Species.BIRD]: [
    'Budgerigar',
    'Cockatiel',
    'African Grey Parrot',
    'Lovebird',
    'Sun Conure',
    'Cockatoo',
  ],
  [Species.OTHER]: [
    'Guinea Pig',
    'Hamster',
    'Ferret',
    'Chinchilla',
    'Hedgehog',
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
  addressLine: string;
  city: string;
  province: string;
  region: string;
  contactEmail: string;
  phoneNumber: string;
}

// 30 shelters spread across the three island groups: 10 Luzon, 10 Visayas,
// 10 Mindanao. Every shelter takes in a mix of species (dogs, cats, rabbits,
// birds, and other small animals) — see the pet loop for how species are
// distributed evenly per shelter.
const SHELTER_DATA: ShelterEntry[] = [
  // ── Luzon (10) ────────────────────────────────────────────────────────────
  {
    name: 'Paws & Hearts Animal Shelter',
    description:
      'A community-driven shelter dedicated to rescuing and rehoming dogs, cats, rabbits, birds, and other small animals across the metro area.',
    addressLine: '12 Bayani Road, Fort Bonifacio, Taguig City, Metro Manila',
    city: 'Taguig City',
    province: 'Metro Manila',
    region: 'National Capital Region',
    contactEmail: 'contact@pawsandhearts.org',
    phoneNumber: '+639171234501',
  },
  {
    name: 'Second Chance Pet Rescue',
    description:
      'We believe every animal deserves a second chance. Our team rehabilitates and rehomes dogs, cats, and small companion animals in need.',
    addressLine: '45 Ayala Avenue, Bel-Air, Makati City, Metro Manila',
    city: 'Makati City',
    province: 'Metro Manila',
    region: 'National Capital Region',
    contactEmail: 'hello@secondchancepetrescue.org',
    phoneNumber: '+639181234502',
  },
  {
    name: 'Furever Home Adoption Center',
    description:
      'Matching loving families with their perfect companions since 2010. We rehome senior and special-needs dogs, cats, and small animals alike.',
    addressLine: '88 Katipunan Avenue, Loyola Heights, Quezon City, Metro Manila',
    city: 'Quezon City',
    province: 'Metro Manila',
    region: 'National Capital Region',
    contactEmail: 'adopt@fureverhome.org',
    phoneNumber: '+639191234503',
  },
  {
    name: 'Happy Tails Humane Society',
    description:
      'A fully accredited humane society ending animal homelessness through adoption, spay/neuter programs, and community education for all species.',
    addressLine: '21 Ortigas Avenue, Kapitolyo, Pasig City, Metro Manila',
    city: 'Pasig City',
    province: 'Metro Manila',
    region: 'National Capital Region',
    contactEmail: 'info@happytailsph.org',
    phoneNumber: '+639201234504',
  },
  {
    name: 'Cordillera Pet Rescue',
    description:
      'Serving the highlands, we rescue dogs, cats, rabbits, and small animals from the mountain communities and find them loving homes.',
    addressLine: '24 Session Road, Brgy. Kabayanihan, Baguio City, Benguet',
    city: 'Baguio City',
    province: 'Benguet',
    region: 'Cordillera Administrative Region',
    contactEmail: 'rescue@cordillerapets.org',
    phoneNumber: '+639211234505',
  },
  {
    name: 'Clark Valley Animal Shelter',
    description:
      'A Central Luzon shelter offering refuge, medical care, and adoption services for abandoned and surrendered animals of every kind.',
    addressLine: '7 Fields Avenue, Balibago, Angeles City, Pampanga',
    city: 'Angeles City',
    province: 'Pampanga',
    region: 'Central Luzon',
    contactEmail: 'info@clarkvalleyshelter.org',
    phoneNumber: '+639221234506',
  },
  {
    name: 'Batangas Bay Pet Haven',
    description:
      'A coastal haven for stray and rescued dogs, cats, birds, and small animals, with a focus on community-based rehoming.',
    addressLine: '33 P. Burgos Street, Poblacion, Batangas City, Batangas',
    city: 'Batangas City',
    province: 'Batangas',
    region: 'CALABARZON',
    contactEmail: 'hello@batangasbayhaven.org',
    phoneNumber: '+639231234507',
  },
  {
    name: 'Bicol Loving Paws Rescue',
    description:
      'We rescue and rehabilitate animals from across the Bicol region — dogs, cats, rabbits, and more — before placing them in forever homes.',
    addressLine: '18 Panganiban Drive, Brgy. Dinaga, Naga City, Camarines Sur',
    city: 'Naga City',
    province: 'Camarines Sur',
    region: 'Bicol Region',
    contactEmail: 'rescue@bicollovingpaws.org',
    phoneNumber: '+639241234508',
  },
  {
    name: 'Pangasinan New Beginnings Shelter',
    description:
      'Every animal in our care gets a fresh start — medical care, socialization, and adoption support for dogs, cats, and small animals.',
    addressLine:
      '63 A.B. Fernandez Avenue, Brgy. Bonuan, Dagupan City, Pangasinan',
    city: 'Dagupan City',
    province: 'Pangasinan',
    region: 'Ilocos Region',
    contactEmail: 'info@pangasinanbeginnings.org',
    phoneNumber: '+639251234509',
  },
  {
    name: 'Quezon Harmony Pet Adoption',
    description:
      'We create harmonious matches between pets and families through careful assessment, welcoming adopters of dogs, cats, birds, and small pets.',
    addressLine: '11 Quezon Avenue, Brgy. 4, Lucena City, Quezon',
    city: 'Lucena City',
    province: 'Quezon',
    region: 'CALABARZON',
    contactEmail: 'adopt@quezonharmonypets.org',
    phoneNumber: '+639261234510',
  },
  // ── Visayas (10) ──────────────────────────────────────────────────────────
  {
    name: 'Cebu Safe Harbor Animal Rescue',
    description:
      'A foster-based rescue network in Cebu that houses dogs, cats, rabbits, and small animals in caring foster homes while they await adoption.',
    addressLine: '77 Osmeña Boulevard, Brgy. Capitol Site, Cebu City, Cebu',
    city: 'Cebu City',
    province: 'Cebu',
    region: 'Central Visayas',
    contactEmail: 'contact@cebusafeharbor.org',
    phoneNumber: '+639271234511',
  },
  {
    name: 'Mandaue Bright Futures Society',
    description:
      'We prioritize the physical and mental health of every rescued animal, offering enrichment and behavioral training before adoption.',
    addressLine: '29 A.S. Fortuna Street, Brgy. Bakilid, Mandaue City, Cebu',
    city: 'Mandaue City',
    province: 'Cebu',
    region: 'Central Visayas',
    contactEmail: 'info@mandauebrightfutures.org',
    phoneNumber: '+639281234512',
  },
  {
    name: 'Lapu-Lapu Gentle Hearts Rescue',
    description:
      'Specializing in the rescue of abused and neglected animals, we provide trauma-informed care for dogs, cats, and small companion animals.',
    addressLine: '5 M.L. Quezon National Highway, Pajo, Lapu-Lapu City, Cebu',
    city: 'Lapu-Lapu City',
    province: 'Cebu',
    region: 'Central Visayas',
    contactEmail: 'rescue@lapulapugentlehearts.org',
    phoneNumber: '+639291234513',
  },
  {
    name: 'Iloilo Forever Friends Shelter',
    description:
      'A community shelter run by passionate volunteers who believe every animal — dog, cat, rabbit, or bird — deserves a lifelong companion.',
    addressLine: '40 General Luna Street, Brgy. Ortiz, Iloilo City, Iloilo',
    city: 'Iloilo City',
    province: 'Iloilo',
    region: 'Western Visayas',
    contactEmail: 'hello@iloiloforeverfriends.org',
    phoneNumber: '+639301234514',
  },
  {
    name: 'Bacolod Golden Gate Pet Adoption',
    description:
      'We connect rescued animals with responsible adopters through screening, home visits, and follow-up, rehoming pets of every species.',
    addressLine:
      '16 Lacson Street, Brgy. Mandalagan, Bacolod City, Negros Occidental',
    city: 'Bacolod City',
    province: 'Negros Occidental',
    region: 'Western Visayas',
    contactEmail: 'adopt@bacolodgoldengate.org',
    phoneNumber: '+639311234515',
  },
  {
    name: 'Tacloban Coastal Paws Rescue',
    description:
      'Serving Eastern Visayas coastal communities, we rescue and rehome dogs, cats, and small animals displaced by storms and hardship.',
    addressLine: '82 Real Street, Brgy. 36, Tacloban City, Leyte',
    city: 'Tacloban City',
    province: 'Leyte',
    region: 'Eastern Visayas',
    contactEmail: 'info@taclobancoastalpaws.org',
    phoneNumber: '+639321234516',
  },
  {
    name: 'Dumaguete Valley Animal Sanctuary',
    description:
      'A peaceful sanctuary for the recovery, rehabilitation, and rehoming of dogs, cats, rabbits, birds, and other small animals.',
    addressLine:
      '15 Rizal Boulevard, Brgy. Tinago, Dumaguete City, Negros Oriental',
    city: 'Dumaguete City',
    province: 'Negros Oriental',
    region: 'Central Visayas',
    contactEmail: 'sanctuary@dumagueteanimals.org',
    phoneNumber: '+639331234517',
  },
  {
    name: 'Bohol Meadowbrook Humane Society',
    description:
      'A trusted humane society serving Bohol with animal sheltering, adoption events, and spay/neuter clinics for pets of all kinds.',
    addressLine: '28 C.P. Garcia Avenue, Brgy. Cogon, Tagbilaran City, Bohol',
    city: 'Tagbilaran City',
    province: 'Bohol',
    region: 'Central Visayas',
    contactEmail: 'contact@boholmeadowbrook.org',
    phoneNumber: '+639341234518',
  },
  {
    name: 'Capiz Riverside Pet Rescue',
    description:
      'Located along the river, we rescue and rehabilitate dogs, cats, and small animals found in the waterways and nearby communities.',
    addressLine: '54 Roxas Avenue, Brgy. Banica, Roxas City, Capiz',
    city: 'Roxas City',
    province: 'Capiz',
    region: 'Western Visayas',
    contactEmail: 'rescue@capizriverside.org',
    phoneNumber: '+639351234519',
  },
  {
    name: 'Ormoc Blue Sky Animal Shelter',
    description:
      'We envision a world where no animal is left behind, providing a bright future for every dog, cat, and small animal in our care.',
    addressLine: '9 Bonifacio Street, Brgy. Cogon, Ormoc City, Leyte',
    city: 'Ormoc City',
    province: 'Leyte',
    region: 'Eastern Visayas',
    contactEmail: 'hello@ormocblueskyshelter.org',
    phoneNumber: '+639361234520',
  },
  // ── Mindanao (10) ─────────────────────────────────────────────────────────
  {
    name: 'Davao Sunshine Animal Sanctuary',
    description:
      'An open sanctuary providing safe refuge and adoption services for stray, abandoned, and surrendered animals of every species.',
    addressLine: '34 J.P. Laurel Avenue, Brgy. Bajada, Davao City, Davao del Sur',
    city: 'Davao City',
    province: 'Davao del Sur',
    region: 'Davao Region',
    contactEmail: 'sanctuary@davaosunshine.org',
    phoneNumber: '+639371234521',
  },
  {
    name: 'CDO Rainbow Bridge Rescue',
    description:
      'Founded by veterinarians, we provide medical care, rehabilitation, and loving homes for rescued dogs, cats, rabbits, and small animals.',
    addressLine:
      '7 Corrales Avenue, Brgy. 14, Cagayan de Oro City, Misamis Oriental',
    city: 'Cagayan de Oro City',
    province: 'Misamis Oriental',
    region: 'Northern Mindanao',
    contactEmail: 'rescue@cdorainbowbridge.org',
    phoneNumber: '+639381234522',
  },
  {
    name: 'Zamboanga Humane Haven',
    description:
      'A no-kill shelter offering adoption, fostering, and welfare advocacy for the local community, caring for animals of all kinds.',
    addressLine:
      '58 Veterans Avenue, Brgy. Tetuan, Zamboanga City, Zamboanga del Sur',
    city: 'Zamboanga City',
    province: 'Zamboanga del Sur',
    region: 'Zamboanga Peninsula',
    contactEmail: 'hello@zamboangahaven.org',
    phoneNumber: '+639391234523',
  },
  {
    name: 'GenSan Loving Paws Rescue',
    description:
      'We rescue and rehabilitate dogs, cats, and small companion animals from the streets of General Santos before rehoming them.',
    addressLine:
      '19 Pioneer Avenue, Brgy. Dadiangas, General Santos City, South Cotabato',
    city: 'General Santos City',
    province: 'South Cotabato',
    region: 'SOCCSKSARGEN',
    contactEmail: 'rescue@gensanlovingpaws.org',
    phoneNumber: '+639401234524',
  },
  {
    name: 'Butuan New Beginnings Shelter',
    description:
      'Every animal in our care gets a fresh start — medical care, socialization, and adoption support for dogs, cats, birds, and small pets.',
    addressLine:
      '63 J.C. Aquino Avenue, Brgy. Libertad, Butuan City, Agusan del Norte',
    city: 'Butuan City',
    province: 'Agusan del Norte',
    region: 'Caraga',
    contactEmail: 'info@butuanbeginnings.org',
    phoneNumber: '+639411234525',
  },
  {
    name: 'Iligan Harmony Pet Adoption',
    description:
      'We create harmonious matches between pets and families, welcoming adopters of dogs, cats, rabbits, birds, and other small animals.',
    addressLine: '11 Quezon Avenue, Brgy. Pala-o, Iligan City, Lanao del Norte',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    region: 'Northern Mindanao',
    contactEmail: 'adopt@iliganharmonypets.org',
    phoneNumber: '+639421234526',
  },
  {
    name: 'Cotabato Safe Harbor Rescue',
    description:
      'A foster-based rescue network housing dogs, cats, and small animals in caring foster homes across the region while they await adoption.',
    addressLine:
      '77 Sinsuat Avenue, Brgy. Rosary Heights, Cotabato City, Maguindanao',
    city: 'Cotabato City',
    province: 'Maguindanao',
    region: 'Bangsamoro',
    contactEmail: 'contact@cotabatosafeharbor.org',
    phoneNumber: '+639431234527',
  },
  {
    name: 'Surigao Bright Futures Society',
    description:
      'We prioritize the health of every rescued animal, offering enrichment and behavioral training for dogs, cats, and small pets before adoption.',
    addressLine:
      '29 Borromeo Street, Brgy. Washington, Surigao City, Surigao del Norte',
    city: 'Surigao City',
    province: 'Surigao del Norte',
    region: 'Caraga',
    contactEmail: 'info@surigaobrightfutures.org',
    phoneNumber: '+639441234528',
  },
  {
    name: 'Pagadian Gentle Hearts Rescue',
    description:
      'Specializing in the rescue of abused and neglected animals, we provide patient rehabilitation for dogs, cats, rabbits, and small animals.',
    addressLine: '5 Rizal Avenue, Brgy. Santiago, Pagadian City, Zamboanga del Sur',
    city: 'Pagadian City',
    province: 'Zamboanga del Sur',
    region: 'Zamboanga Peninsula',
    contactEmail: 'rescue@pagadiangentlehearts.org',
    phoneNumber: '+639451234529',
  },
  {
    name: 'Koronadal Forever Friends Shelter',
    description:
      'A community shelter run by volunteers who believe every animal — dog, cat, rabbit, or bird — deserves a lifelong, loving home.',
    addressLine:
      '40 General Santos Drive, Brgy. Zone III, Koronadal City, South Cotabato',
    city: 'Koronadal City',
    province: 'South Cotabato',
    region: 'SOCCSKSARGEN',
    contactEmail: 'hello@koronadalforeverfriends.org',
    phoneNumber: '+639461234530',
  },
];

const DONATION_AMOUNTS_CENTS = [
  500, 1000, 1500, 2000, 2500, 3000, 5000, 7500, 10000, 15000, 20000, 750, 1250,
  4000, 6000, 8000, 12000, 18000, 2500, 3500,
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
const ALL_SIZES: Size[] = [
  Size.SMALL,
  Size.MEDIUM,
  Size.LARGE,
  Size.EXTRA_LARGE,
];
const ALL_GENDERS: Gender[] = [Gender.MALE, Gender.FEMALE];
const ALL_HOME_TYPES: HomeType[] = [
  HomeType.HOUSE,
  HomeType.APARTMENT,
  HomeType.CONDO,
];

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

  if (CLOUDINARY_POOL.length === 0) {
    throw new Error(
      'CLOUDINARY_POOL is empty. Upload pet images to Cloudinary and paste their {url, publicId} into prisma/seed-perf.ts.',
    );
  }

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
      firstName: 'Racyn',
      lastName: 'Ibaya',
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
      addressLine: SHELTER_DATA[i].addressLine,
      city: SHELTER_DATA[i].city,
      province: SHELTER_DATA[i].province,
      region: SHELTER_DATA[i].region,
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
      // Shelter is i % SHELTER_COUNT (the remainder); deriving species from the
      // quotient instead keeps the two indices independent, so every shelter
      // ends up with a mix of all species rather than a single one.
      const species =
        ALL_SPECIES[Math.floor(i / SHELTER_COUNT) % ALL_SPECIES.length];
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
      return Array.from({ length: count }, (_, j) => {
        const poolEntry = CLOUDINARY_POOL[(i + j) % CLOUDINARY_POOL.length];
        return {
          petId: pet.id,
          imageUrl: poolEntry.url,
          publicId: poolEntry.publicId,
          isPrimary: j === 0,
        };
      });
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
          status !== DonationStatus.PENDING
            ? `pi_seed_${String(i + 1).padStart(6, '0')}`
            : null,
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
