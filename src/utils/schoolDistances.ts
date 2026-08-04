export interface SchoolDistance {
  id: string;
  name: string;
  shortName?: string;
  type: 'University' | 'College' | 'High School' | 'Elementary';
  lat: number;
  lng: number;
  distanceKm: number; // calculated distance in km
  walkingMinutes: number; // estimated walking time
  tricycleMinutes: number; // estimated tricycle time
}

export const DEFAULT_GUMACA_SCHOOLS = [
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
    id: "gnhs-high",
    name: "Gumaca National High School (GNHS) 🏫",
    shortName: "Gumaca NHS",
    type: "High School" as const,
    lat: 13.920500,
    lng: 122.094000,
    desc: "Gumaca National High School, Mabini/Poblacion"
  },
  {
    id: "plaza-rizal-elem",
    name: "Plaza Rizal Elementary School 🏫",
    shortName: "Plaza Rizal Elem",
    type: "Elementary" as const,
    lat: 13.921200,
    lng: 122.099200,
    desc: "Plaza Rizal Elementary School, Town Proper"
  },
  {
    id: "gumaca-west-central",
    name: "Gumaca West Central School 🏫",
    shortName: "Gumaca West Central",
    type: "Elementary" as const,
    lat: 13.918500,
    lng: 122.098500,
    desc: "Gumaca West Central Elementary School, M.H. Del Pilar St."
  },
  {
    id: "gumaca-east-central",
    name: "Gumaca East Central School 🏫",
    shortName: "Gumaca East Central",
    type: "Elementary" as const,
    lat: 13.917800,
    lng: 122.099500,
    desc: "Gumaca East Central Elementary School, Capisonda St."
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
    id: "holy-child",
    name: "Holy Child Jesus College / Academy 🏫",
    shortName: "Holy Child Jesus",
    type: "College" as const,
    lat: 13.921889,
    lng: 122.099639,
    desc: "Holy Child Jesus College, Town Proper"
  },
  {
    id: "piat-college",
    name: "Philippine Institute of Arts and Technology (PIAT) 🎨🎓",
    shortName: "PIAT College",
    type: "College" as const,
    lat: 13.921300,
    lng: 122.098200,
    desc: "Philippine Institute of Arts and Technology, Gumaca"
  }
];

const LOCAL_STORAGE_KEY_SCHOOL_COORDS = "casafinder_custom_school_coords_v1";

/**
 * Retrieves custom saved school coordinates from localStorage.
 */
export function getCustomSchoolCoords(): Record<string, { lat: number; lng: number }> {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SCHOOL_COORDS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Saves or updates custom coordinates for a specific school.
 */
export function saveCustomSchoolCoord(id: string, lat: number, lng: number) {
  try {
    const current = getCustomSchoolCoords();
    current[id] = { lat, lng };
    localStorage.setItem(LOCAL_STORAGE_KEY_SCHOOL_COORDS, JSON.stringify(current));
    // Trigger window event so reactive map updates immediately
    window.dispatchEvent(new CustomEvent("casafinder_school_coords_updated"));
  } catch (e) {
    console.error("Failed to save custom school coord", e);
  }
}

/**
 * Resets custom school coordinates back to default.
 */
export function resetCustomSchoolCoords() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY_SCHOOL_COORDS);
    window.dispatchEvent(new CustomEvent("casafinder_school_coords_updated"));
  } catch (e) {
    console.error("Failed to reset custom school coords", e);
  }
}

/**
 * Get active list of Gumaca schools with custom or default coordinates.
 */
export function getGumacaSchools() {
  const custom = getCustomSchoolCoords();
  return DEFAULT_GUMACA_SCHOOLS.map((school) => {
    if (custom[school.id]) {
      return {
        ...school,
        lat: custom[school.id].lat,
        lng: custom[school.id].lng
      };
    }
    return school;
  });
}

// Backward compatibility export
export const GUMACA_SCHOOLS = getGumacaSchools();

/**
 * Safely parses any property's coordinates object or falls back to neighborhood default.
 */
export function parsePropertyLatLng(coords: any, neighborhood?: string, propertyId?: string): [number, number] {
  if (propertyId === "slsu-elite-dorm") return [13.9252, 122.0975];
  if (propertyId === "dagat-bay-coliving") return [13.9258, 122.0965];
  if (propertyId === "la-villa-estudiante") return [13.912125, 122.104057];
  if (propertyId === "green-eco-apts") return [13.9188, 122.0945];

  if (coords) {
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

    // If percentage coordinates (0-100) are passed
    if (x > 0 && x <= 100 && y > 0 && y <= 100) {
      const baseLat = 13.9220;
      const baseLng = 122.0995;
      const latOffset = ((y - 50) / 100) * 0.012;
      const lngOffset = ((x - 50) / 100) * 0.012;
      return [baseLat - latOffset, baseLng + lngOffset];
    }
  }

  // Fallback by neighborhood if coordinates are unavailable or zero
  const n = (neighborhood || "").toLowerCase();
  if (n.includes("villa nava")) return [13.912125, 122.104057];
  if (n.includes("tabing dagat")) return [13.923258, 122.101460];
  if (n.includes("peñafrancia") || n.includes("penafrancia")) return [13.924800, 122.095500];
  if (n.includes("pipisik")) return [13.925200, 122.097500];
  if (n.includes("san diego")) return [13.920200, 122.103800];
  if (n.includes("bagong buhay")) return [13.919000, 122.098000];
  if (n.includes("mabini")) return [13.922000, 122.098500];
  if (n.includes("maunlad")) return [13.921000, 122.096500];
  if (n.includes("butaguin")) return [13.926000, 122.102000];
  if (n.includes("salvacion")) return [13.905000, 122.107000];
  if (n.includes("buensuceso")) return [13.928000, 122.095000];
  if (n.includes("progreso")) return [13.918000, 122.101000];
  if (n.includes("rosario")) return [13.924000, 122.099000];

  // Default Gumaca Poblacion center
  return [13.923258, 122.101460];
}

/**
 * Calculates road distances and estimated travel times from property lat/lng to all major schools in Gumaca.
 */
export function getSchoolDistancesForProperty(
  latOrCoords?: number | { x?: number; y?: number; lat?: number; lng?: number } | null,
  lngOrNeighborhood?: number | string,
  neighborhoodFallback?: string
): SchoolDistance[] {
  let lat = 13.923258;
  let lng = 122.101460;

  if (typeof latOrCoords === "object" && latOrCoords !== null) {
    const neighborhood = typeof lngOrNeighborhood === "string" ? lngOrNeighborhood : neighborhoodFallback || "";
    [lat, lng] = parsePropertyLatLng(latOrCoords, neighborhood);
  } else if (typeof latOrCoords === "number") {
    const rawLat = latOrCoords;
    const rawLng = typeof lngOrNeighborhood === "number" ? lngOrNeighborhood : 0;
    const neighborhood = neighborhoodFallback || (typeof lngOrNeighborhood === "string" ? lngOrNeighborhood : "");
    [lat, lng] = parsePropertyLatLng({ x: rawLat, y: rawLng }, neighborhood);
  } else {
    [lat, lng] = parsePropertyLatLng(null, neighborhoodFallback);
  }

  const R = 6371; // Earth's radius in kilometers

  return getGumacaSchools().map((school) => {
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
      shortName: school.shortName,
      type: school.type,
      lat: school.lat,
      lng: school.lng,
      distanceKm: roadKm,
      walkingMinutes: walkingMins,
      tricycleMinutes: tricycleMins,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}
