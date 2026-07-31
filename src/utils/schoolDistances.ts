export interface SchoolDistance {
  id: string;
  name: string;
  type: 'University' | 'College' | 'High School' | 'Elementary';
  lat: number;
  lng: number;
  distanceKm: number; // calculated distance in km
  walkingMinutes: number; // estimated walking time
  tricycleMinutes: number; // estimated tricycle time
}

export const GUMACA_SCHOOLS = [
  {
    id: "slsu-main",
    name: "SLSU Tabing Dagat Main Campus 🎓",
    shortName: "SLSU Tabing Dagat",
    type: "University" as const,
    lat: 13.923258,
    lng: 122.101460,
    desc: "Southern Luzon State University - Main/Tabing Dagat Campus"
  },
  {
    id: "slsu-villa-nava",
    name: "SLSU Villa Nava Campus 🎓",
    shortName: "SLSU Villa Nava",
    type: "University" as const,
    lat: 13.912125,
    lng: 122.104057,
    desc: "Southern Luzon State University - Villa Nava Campus"
  },
  {
    id: "eqc-college",
    name: "Eastern Quezon College (EQC) 🏛️",
    shortName: "EQC College",
    type: "College" as const,
    lat: 13.923315,
    lng: 122.097557,
    desc: "Eastern Quezon College, Gumaca"
  },
  {
    id: "gnhs-high",
    name: "Gumaca National High School (GNHS) 🏫",
    shortName: "Gumaca NHS",
    type: "High School" as const,
    lat: 13.920500,
    lng: 122.094000,
    desc: "Gumaca National High School, Mabini/Poblacion"
  },
  {
    id: "central-elementary",
    name: "Gumaca West & East Central Elementary 🏫",
    shortName: "Gumaca Central Elementary",
    type: "Elementary" as const,
    lat: 13.918000,
    lng: 122.099000,
    desc: "Gumaca West & East Central Elementary Schools"
  },
  {
    id: "holy-child",
    name: "Holy Child Academy / Sacred Heart 🏫",
    shortName: "Holy Child Academy",
    type: "High School" as const,
    lat: 13.921500,
    lng: 122.099500,
    desc: "Holy Child Academy, Town Proper"
  },
  {
    id: "qwa-high",
    name: "Quezon West Academy 🏫",
    shortName: "Quezon West Academy",
    type: "High School" as const,
    lat: 13.921000,
    lng: 122.097000,
    desc: "Quezon West Academy, Gumaca"
  }
];

/**
 * Calculates road distances and estimated travel times from property lat/lng to all major schools in Gumaca.
 */
export function getSchoolDistancesForProperty(lat: number, lng: number): SchoolDistance[] {
  const R = 6371; // Earth's radius in kilometers

  return GUMACA_SCHOOLS.map((school) => {
    const dLat = (school.lat - lat) * (Math.PI / 180);
    const dLon = (school.lng - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(school.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;

    // Apply standard road winding multiplier (~1.22x) for actual street distances
    const roadKm = Math.max(0.05, Math.round(straightKm * 1.22 * 100) / 100);

    // Walking time @ approx 4.5 km/h
    const walkingMins = Math.max(1, Math.round((roadKm / 4.5) * 60));

    // Tricycle time @ approx 18 km/h
    const tricycleMins = Math.max(1, Math.round((roadKm / 18) * 60));

    return {
      id: school.id,
      name: school.name,
      type: school.type,
      lat: school.lat,
      lng: school.lng,
      distanceKm: roadKm,
      walkingMinutes: walkingMins,
      tricycleMinutes: tricycleMins,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Safely parses any property's coordinates object or falls back to neighborhood default.
 */
export function parsePropertyLatLng(coords: any, neighborhood?: string): [number, number] {
  if (!coords) return [13.923258, 122.101460];

  const x = Number(coords.x ?? coords.lat ?? 0);
  const y = Number(coords.y ?? coords.lng ?? 0);

  // If x is Lat (~10-20) and y is Lng (~100-140)
  if (x >= 10 && x <= 20 && y >= 100 && y <= 140) {
    return [x, y];
  }

  // If x is Lng (~100-140) and y is Lat (~10-20)
  if (x >= 100 && x <= 140 && y >= 10 && y <= 20) {
    return [y, x];
  }

  // Fallback by neighborhood if coordinates are percentage or zero
  const n = (neighborhood || "").toLowerCase();
  if (n.includes("villa nava")) return [13.912125, 122.104057];
  if (n.includes("tabing dagat")) return [13.923258, 122.101460];
  if (n.includes("peñafrancia") || n.includes("penafrancia")) return [13.924800, 122.095500];
  if (n.includes("pipisik")) return [13.925200, 122.097500];
  if (n.includes("san diego")) return [13.920200, 122.103800];
  if (n.includes("bagong buhay")) return [13.919000, 122.098000];
  if (n.includes("mabini")) return [13.922000, 122.098500];
  if (n.includes("maunlad")) return [13.921000, 122.096500];
  if (n.includes("buensuceso")) return [13.928000, 122.095000];
  if (n.includes("progreso")) return [13.918000, 122.101000];
  if (n.includes("rosario")) return [13.924000, 122.099000];

  // Default Gumaca Poblacion center
  return [13.923258, 122.101460];
}
