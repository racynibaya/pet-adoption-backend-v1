// Single source of truth for Philippine location constants used by shelter
// address filtering. `region` is the only location field with a finite, stable
// set of values, so it is enforced as an enum. Island group is intentionally
// NOT stored on a shelter — it is a pure function of `region`, derived here.

export const REGIONS = [
  'National Capital Region',
  'Cordillera Administrative Region',
  'Ilocos Region',
  'Cagayan Valley',
  'Central Luzon',
  'CALABARZON',
  'MIMAROPA',
  'Bicol Region',
  'Western Visayas',
  'Central Visayas',
  'Eastern Visayas',
  'Zamboanga Peninsula',
  'Northern Mindanao',
  'Davao Region',
  'SOCCSKSARGEN',
  'Caraga',
  'Bangsamoro',
] as const;

export type Region = (typeof REGIONS)[number];

export const ISLAND_GROUPS = ['LUZON', 'VISAYAS', 'MINDANAO'] as const;

export type IslandGroup = (typeof ISLAND_GROUPS)[number];

export const REGION_TO_ISLAND: Record<Region, IslandGroup> = {
  'National Capital Region': 'LUZON',
  'Cordillera Administrative Region': 'LUZON',
  'Ilocos Region': 'LUZON',
  'Cagayan Valley': 'LUZON',
  'Central Luzon': 'LUZON',
  CALABARZON: 'LUZON',
  MIMAROPA: 'LUZON',
  'Bicol Region': 'LUZON',
  'Western Visayas': 'VISAYAS',
  'Central Visayas': 'VISAYAS',
  'Eastern Visayas': 'VISAYAS',
  'Zamboanga Peninsula': 'MINDANAO',
  'Northern Mindanao': 'MINDANAO',
  'Davao Region': 'MINDANAO',
  SOCCSKSARGEN: 'MINDANAO',
  Caraga: 'MINDANAO',
  Bangsamoro: 'MINDANAO',
};

// Returns every region belonging to an island group — used to build a
// `region: { in: [...] }` filter when the client filters by island group.
export function regionsForIsland(island: IslandGroup): Region[] {
  return REGIONS.filter((region) => REGION_TO_ISLAND[region] === island);
}
