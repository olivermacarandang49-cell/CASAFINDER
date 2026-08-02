import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { motion } from "motion/react";
import { GUMACA_SCHOOLS, getSchoolDistancesForProperty } from "../utils/schoolDistances";
import { AiMatch } from "../types";
import { Property } from "../data/properties";
import { Map, MapPin, Navigation, Layers, Compass, ExternalLink, School, Info, Search, Maximize2, Minimize2, Pencil, Trash2, Copy, Check, RotateCcw, Save, Ruler, Shapes, Footprints, GripHorizontal } from "lucide-react";

interface NeighborhoodMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onOpenDetails?: (property: Property) => void;
  aiMatches?: AiMatch[];
  selectedSchoolId?: string;
}

// Convert percentage coordinates or fallback to real Gumaca Lat/Lng
const getLatLngForProperty = (p: Property): [number, number] => {
  if (!p || !p.coordinates) return [13.9220, 122.0995];

  const x = Number((p.coordinates as any).x ?? (p.coordinates as any).lat ?? 0);
  const y = Number((p.coordinates as any).y ?? (p.coordinates as any).lng ?? 0);

  // If x is Lat (~10-20) and y is Lng (~100-140)
  if (x >= 10 && x <= 20 && y >= 100 && y <= 140) {
    return [x, y];
  }

  // If x is Lng (~100-140) and y is Lat (~10-20)
  if (x >= 100 && x <= 140 && y >= 10 && y <= 20) {
    return [y, x];
  }

  // Fallback for known demo IDs
  if (p.id === "slsu-elite-dorm") return [13.9252, 122.0975];
  if (p.id === "dagat-bay-coliving") return [13.9258, 122.0965];
  if (p.id === "la-villa-estudiante") return [13.912125, 122.104057];
  if (p.id === "green-eco-apts") return [13.9188, 122.0945];

  // Neighborhood fallback if coordinates are percentages or invalid
  const n = (p.neighborhood || p.address || "").toLowerCase();
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

  // Derive from percentage coordinates around Gumaca Poblacion center (13.9220, 122.0995)
  const baseLat = 13.9220;
  const baseLng = 122.0995;
  const latOffset = ((y - 50) / 100) * 0.012;
  const lngOffset = ((x - 50) / 100) * 0.012;
  return [baseLat - latOffset, baseLng + lngOffset];
};

// Key Landmarks in Gumaca, Quezon - Major Institutions, Barangays & Campus Hubs
const GUMACA_LANDMARKS = [
  // 13 Gumaca Barangays
  { name: "📍 Brgy. Tabing Dagat", lat: 13.923258, lng: 122.101460, type: "Barangay", desc: "Barangay Tabing Dagat, Gumaca" },
  { name: "📍 Brgy. Villa Nava", lat: 13.912125, lng: 122.104057, type: "Barangay", desc: "Barangay Villa Nava, Gumaca" },
  { name: "📍 Brgy. Peñafrancia", lat: 13.924800, lng: 122.095500, type: "Barangay", desc: "Barangay Peñafrancia, Gumaca" },
  { name: "📍 Brgy. Pipisik", lat: 13.925200, lng: 122.097500, type: "Barangay", desc: "Barangay Pipisik, Gumaca" },
  { name: "📍 Brgy. San Diego", lat: 13.920200, lng: 122.103800, type: "Barangay", desc: "Barangay San Diego, Gumaca" },
  { name: "📍 Brgy. Bagong Buhay", lat: 13.919000, lng: 122.098000, type: "Barangay", desc: "Barangay Bagong Buhay, Gumaca" },
  { name: "📍 Brgy. Mabini", lat: 13.922000, lng: 122.098500, type: "Barangay", desc: "Barangay Mabini, Gumaca" },
  { name: "📍 Brgy. Maunlad", lat: 13.921000, lng: 122.096500, type: "Barangay", desc: "Barangay Maunlad, Gumaca" },
  { name: "📍 Brgy. Buensuceso", lat: 13.928000, lng: 122.095000, type: "Barangay", desc: "Barangay Buensuceso, Gumaca" },
  { name: "📍 Brgy. Progreso Purok 1", lat: 13.918000, lng: 122.101000, type: "Barangay", desc: "Barangay Progreso Purok 1, Gumaca" },
  { name: "📍 Brgy. Rosario", lat: 13.924000, lng: 122.099000, type: "Barangay", desc: "Barangay Rosario, Gumaca" },

  // Key Landmarks
  { name: "SLSU Villa Nava Campus 🎓🌳", lat: 13.912125, lng: 122.104057, type: "University", desc: "Campus - Brgy. Villa Nava" },
  { name: "SLSU Tabing Dagat 🎓🌊", lat: 13.923258, lng: 122.101460, type: "University", desc: "Campus - Brgy. Tabing Dagat" },
  { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, type: "College", desc: "College, Gumaca" },
  { name: "Gumaca National High School (GNHS) 🏫", lat: 13.920500, lng: 122.094000, type: "High School", desc: "Gumaca NHS, Mabini/Poblacion" },
  { name: "Gumaca West & East Central Schools 🏫", lat: 13.918000, lng: 122.099000, type: "School", desc: "M.H. Del Pilar St. / Capisonda St." },
  { name: "Holy Child Academy / Sacred Heart 🏫", lat: 13.921500, lng: 122.099500, type: "High School", desc: "Holy Child Academy, Town Proper" },
  { name: "Quezon West Academy 🏫", lat: 13.921000, lng: 122.097000, type: "High School", desc: "Quezon West Academy, Gumaca" },
  { name: "San Diego de Alcala Cathedral ⛪", lat: 13.921587, lng: 122.099428, type: "Church", desc: "Historic Parish Church, Town Proper" },
  { name: "Kutang San Diego 🏰", lat: 13.9238, lng: 122.0975, type: "Heritage", desc: "Historical Fort, Brgy. Tabing Dagat" },
  { name: "BIR District Office Gumaca 🏢", lat: 13.9188, lng: 122.0945, type: "Government", desc: "M.H. Del Pilar St." },
  { name: "Gumaca Grand Terminal 🚌", lat: 13.9200, lng: 122.0965, type: "Transit", desc: "Bus & Tricycle Terminal Hub" },
  { name: "Jollibee Gumaca 🍔🐝", lat: 13.920523, lng: 122.099064, type: "Restaurant", desc: "Fast Food Restaurant, Maharlika Highway / Poblacion" },
  { name: "McDonald's Gumaca 🍟🍔", lat: 13.920751, lng: 122.100299, type: "Restaurant", desc: "Fast Food Restaurant, Maharlika Highway / Poblacion" },
  { name: "Chowking Gumaca 🥢🥟", lat: 13.920489, lng: 122.098769, type: "Restaurant", desc: "Fast Food Restaurant, Maharlika Highway / Poblacion" },
  { name: "Novo Department Store 🛍️🏢", lat: 13.920196, lng: 122.097666, type: "Shopping", desc: "Department Store & Shopping, Maharlika Highway / Town Center" },
  { name: "Heritage Site 🏛️", lat: 13.923430, lng: 122.100694, type: "Heritage", desc: "Gumaca Heritage / Historical Landmark, Tabing Dagat" },
  { name: "Gumaca Public Market 🛒🐟", lat: 13.920509, lng: 122.101597, type: "Market", desc: "Public Market & Commercial Hub, Poblacion" },
  { name: "Puregold Gumaca 🟡🛒", lat: 13.921103, lng: 122.105650, type: "Shopping", desc: "Puregold Supermarket, Maharlika Highway / San Diego" },
  { name: "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", lat: 13.919680, lng: 122.100656, type: "Transit", desc: "Jeepney Terminal for Macalelon, Unisan & Lopez" },
  { name: "Jeep Terminal (Lopez) 🚐", lat: 13.922163, lng: 122.100909, type: "Transit", desc: "Jeepney Terminal bound for Lopez" },
  { name: "Piat Gumaca 📍", lat: 13.918025, lng: 122.100401, type: "Landmark", desc: "Piat Area, Mabini / Poblacion, Gumaca" },
  { name: "Holy Child Jesus Christ ⛪", lat: 13.921889, lng: 122.099639, type: "Heritage", desc: "Holy Child Jesus Christ Church / Chapel, Town Proper, Gumaca" },
  { name: "578 Emporium 🛍️🏬", lat: 13.921341, lng: 122.103364, type: "Shopping", desc: "Emporium & Shopping Center, Maharlika Highway, Gumaca" },
];

// Helper to estimate street name / barangay based on exact Google Maps coordinates in Gumaca
const getStreetInfoForCoordinates = (lat: number, lng: number) => {
  let street = "AH26 / Pan-Philippine (Maharlika) Highway";
  let barangay = "Poblacion, Gumaca";

  if (lat > 13.9240 && lng < 122.1000) {
    street = "Quayside Blvd / Coastal Road (Near Kutang San Diego)";
    barangay = "Barangay Tabing Dagat (Coastal Quayside Area)";
  } else if (lat > 13.9220 && lng > 122.1000 && lat < 13.9250) {
    street = "Nava Blvd / P. Burgos Street";
    barangay = "Barangay San Diego (Coastal View)";
  } else if (lat < 13.9200 && lng < 122.0960) {
    street = "M.H. Del Pilar Street (Near BIR District Office)";
    barangay = "Barangay Pipisik / West Area";
  } else if (lat < 13.9200 && lng > 122.1020) {
    street = "AH26 Maharlika Hwy East / Villa Nava Road";
    barangay = "Barangay Villa Nava / San Diego";
  } else if (lng < 122.0975) {
    street = "M.H. Del Pilar Street / Terminal Alley";
    barangay = "Barangay Pipisik";
  } else if (lat < 13.9210 && lng > 122.0980 && lng < 122.1010) {
    street = "Capisonda Street / T. Tañada Street";
    barangay = "Barangay Mabini (Town Proper)";
  } else if (lng >= 122.0975 && lng <= 122.1000) {
    street = "J.P. Rizal Street / D. Arcaya Street";
    barangay = "Barangay Mabini (Town Center)";
  }

  // Calculate distance to SLSU Tabing Dagat (13.9252, 122.0975)
  const dLatTD = (lat - 13.9252) * 111000;
  const dLngTD = (lng - 122.0975) * 111000 * Math.cos(13.9252 * Math.PI / 180);
  const distTabingDagat = Math.round(Math.sqrt(dLatTD * dLatTD + dLngTD * dLngTD));
  const walkTabingDagat = Math.max(1, Math.round(distTabingDagat / 75));

  // Calculate distance to SLSU Villa Nava (13.912125, 122.104057)
  const dLatVN = (lat - 13.912125) * 111000;
  const dLngVN = (lng - 122.104057) * 111000 * Math.cos(13.912125 * Math.PI / 180);
  const distVillaNava = Math.round(Math.sqrt(dLatVN * dLatVN + dLngVN * dLngVN));
  const walkVillaNava = Math.max(1, Math.round(distVillaNava / 75));

  return {
    street,
    barangay,
    distTabingDagat,
    walkTabingDagat,
    distVillaNava,
    walkVillaNava,
    lat: lat.toFixed(4),
    lng: lng.toFixed(4)
  };
};

export default function NeighborhoodMap({
  properties,
  selectedProperty,
  onSelectProperty,
  onOpenDetails,
  aiMatches,
  selectedSchoolId
}: NeighborhoodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [clickedStreet, setClickedStreet] = useState<{
    street: string;
    barangay: string;
    distTabingDagat: number;
    walkTabingDagat: number;
    distVillaNava: number;
    walkVillaNava: number;
    lat: string;
    lng: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapMode, setMapMode] = useState<"streets" | "satellite">("satellite");
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [showCoordAdjustModal, setShowCoordAdjustModal] = useState(false);
  const [targetPropertyToAdjust, setTargetPropertyToAdjust] = useState<Property | null>(null);
  const [inputLat, setInputLat] = useState("");
  const [inputLng, setInputLng] = useState("");
  const [inputGoogleLink, setInputGoogleLink] = useState("");
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState("");

  const [showGrid, setShowGrid] = useState(false);

  // Interactive Boundary & Polygon Drawing States
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawingPanelMinimized, setIsDrawingPanelMinimized] = useState(false);
  const [drawShapeType, setDrawShapeType] = useState<"polygon" | "polyline" | "points">("polygon");
  const [drawColor, setDrawColor] = useState<string>("#2563eb"); // Vivid Blue
  const [mousePos, setMousePos] = useState<{ lat: number; lng: number } | null>(null);
  const [drawnPoints, setDrawnPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [drawnBarangayBoundaries, setDrawnBarangayBoundaries] = useState<{
    id: string;
    barangayName: string;
    color: string;
    points: [number, number][];
  }[]>(() => {
    try {
      const saved = localStorage.getItem("barangay_drawn_boundaries");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved boundaries from localStorage:", e);
    }
    return [];
  });

  // Automatically persist saved barangay boundaries to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("barangay_drawn_boundaries", JSON.stringify(drawnBarangayBoundaries));
    } catch (e) {
      console.error("Failed to write saved boundaries to localStorage:", e);
    }
  }, [drawnBarangayBoundaries]);
  const [selectedBarangayToSave, setSelectedBarangayToSave] = useState("Barangay Tabing Dagat");
  const [selectedBarangayBoundaryFilter, setSelectedBarangayBoundaryFilter] = useState<string>("");
  const [copySuccessMsg, setCopySuccessMsg] = useState("");
  const [showBoundariesOnMap, setShowBoundariesOnMap] = useState(true);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const [userExactGps, setUserExactGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const userGpsCircleRef = useRef<L.Circle | null>(null);

  const [villaNavaCoords, setVillaNavaCoords] = useState<[number, number]>([13.912125, 122.104057]);
  const [tabingDagatCoords, setTabingDagatCoords] = useState<[number, number]>([13.9252, 122.0975]);
  const [activeArrowLocation, setActiveArrowLocation] = useState<{
    lat: number;
    lng: number;
    title: string;
    desc?: string;
  } | null>(null);

  const [activeSchoolRouteFilter, setActiveSchoolRouteFilter] = useState<string>("all");

  useEffect(() => {
    if (selectedSchoolId) {
      setActiveSchoolRouteFilter(selectedSchoolId);
    }
  }, [selectedSchoolId, selectedProperty]);

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const isDrawingModeRef = useRef(isDrawingMode);
  const pinnedMarkerRef = useRef<L.Marker | null>(null);
  const campusMarkerRef = useRef<L.Marker | null>(null);
  const lastAddedTimeRef = useRef<number>(0);

  const [pixelPoints, setPixelPoints] = useState<{ x: number; y: number; lat: number; lng: number }[]>([]);
  const [mousePixel, setMousePixel] = useState<{ x: number; y: number } | null>(null);
  const [savedPixelBoundaries, setSavedPixelBoundaries] = useState<{
    id: string;
    barangayName: string;
    color: string;
    points: { x: number; y: number; lat: number; lng: number }[];
    center: { x: number; y: number };
  }[]>([]);

  const addPointIfNew = (lat: number, lng: number) => {
    const now = Date.now();
    if (now - lastAddedTimeRef.current < 250) return;
    lastAddedTimeRef.current = now;

    setDrawnPoints(prev => [...prev, { lat, lng }]);
  };

  const handleUndoPoint = () => {
    setDrawnPoints(prev => prev.slice(0, -1));
  };

  const handleClearPoints = () => {
    setDrawnPoints([]);
  };

  // Synchronize React DOM SVG & Badge Overlay with Leaflet Map Coordinates
  useEffect(() => {
    const updatePixels = () => {
      const map = leafletMapRef.current;
      if (!map) return;

      const pxs = drawnPoints.map(p => {
        const containerPt = map.latLngToContainerPoint([p.lat, p.lng]);
        return { x: containerPt.x, y: containerPt.y, lat: p.lat, lng: p.lng };
      });
      setPixelPoints(pxs);

      if (showBoundariesOnMap && drawnBarangayBoundaries.length > 0) {
        const filteredBoundaries = (selectedBarangayBoundaryFilter && selectedBarangayBoundaryFilter !== "ALL_BARANGAYS")
          ? drawnBarangayBoundaries.filter(b => b.barangayName === selectedBarangayBoundaryFilter)
          : drawnBarangayBoundaries;

        const savedPxs = filteredBoundaries.map(b => {
          const pts = b.points.map(p => {
            const containerPt = map.latLngToContainerPoint([p[0], p[1]]);
            return { x: containerPt.x, y: containerPt.y, lat: p[0], lng: p[1] };
          });
          const cLat = b.points.reduce((acc, p) => acc + p[0], 0) / b.points.length;
          const cLng = b.points.reduce((acc, p) => acc + p[1], 0) / b.points.length;
          const centerPt = map.latLngToContainerPoint([cLat, cLng]);
          return {
            id: b.id,
            barangayName: b.barangayName,
            color: b.color || "#6366f1",
            points: pts,
            center: { x: centerPt.x, y: centerPt.y }
          };
        });
        setSavedPixelBoundaries(savedPxs);
      } else {
        setSavedPixelBoundaries([]);
      }

      if (mousePos) {
        const mPt = map.latLngToContainerPoint([mousePos.lat, mousePos.lng]);
        setMousePixel({ x: mPt.x, y: mPt.y });
      } else {
        setMousePixel(null);
      }
    };

    const map = leafletMapRef.current;
    if (map) {
      map.on("move zoom viewreset resize mousemove", updatePixels);
      updatePixels();
    }

    return () => {
      if (map) {
        map.off("move zoom viewreset resize mousemove", updatePixels);
      }
    };
  }, [drawnPoints, mousePos, drawnBarangayBoundaries, showBoundariesOnMap, selectedBarangayBoundaryFilter]);

  useEffect(() => {
    isDrawingModeRef.current = isDrawingMode;

    // Set cursor on map container for visual drawing feedback
    const map = leafletMapRef.current;
    if (map) {
      const container = map.getContainer();
      if (container) {
        container.style.cursor = isDrawingMode ? "crosshair" : "";
      }
    }
  }, [isDrawingMode]);

  // Helper to parse Google Maps link or coordinates
  const handleParseGoogleLink = (link: string) => {
    // Try matching @lat,lng or ?q=lat,lng or ll=lat,lng or query=lat,lng
    const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                  link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                  link.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                  link.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      setInputLat(match[1]);
      setInputLng(match[2]);
      setAdjustSuccessMsg("✅ GPS Coordinates extracted from Google Maps link!");
    } else {
      setAdjustSuccessMsg("❌ Could not parse coordinates automatically. Please copy the lat, lng manually.");
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 200);
  };

  // Searchable locations database in Gumaca
  const GUMACA_SEARCH_LOCATIONS: Array<{
    name: string;
    lat: number;
    lng: number;
    detail: string;
    propertyObj?: Property;
  }> = [
    { name: "SLSU Villa Nava Campus 🎓🌳", lat: 13.912125, lng: 122.104057, detail: "Brgy. Villa Nava Campus" },
    { name: "SLSU Tabing Dagat Campus 🎓🌊", lat: 13.923258, lng: 122.101460, detail: "Brgy. Tabing Dagat Campus" },
    { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, detail: "College, Gumaca" },
    { name: "Gumaca National High School (GNHS) 🏫", lat: 13.920500, lng: 122.094000, detail: "High School, Mabini/Poblacion" },
    { name: "Gumaca West & East Central Elementary 🏫", lat: 13.918000, lng: 122.099000, detail: "Elementary School, M.H. Del Pilar St." },
    { name: "Holy Child Academy 🏫", lat: 13.921500, lng: 122.099500, detail: "High School / Academy, Town Proper" },
    { name: "Quezon West Academy 🏫", lat: 13.921000, lng: 122.097000, detail: "High School / Academy, Gumaca" },
    // All 13 Gumaca Barangays with precise GPS Coordinates
    { name: "📍 Barangay Tabing Dagat", lat: 13.923258, lng: 122.101460, detail: "Coastal Quayside, Nava Blvd & SLSU Campus Area" },
    { name: "📍 Barangay Villa Nava", lat: 13.912125, lng: 122.104057, detail: "Maharlika Hwy East & SLSU Villa Nava Campus" },
    { name: "📍 Barangay Peñafrancia", lat: 13.924800, lng: 122.095500, detail: "Quayside / Coastal West Area" },
    { name: "📍 Barangay Pipisik", lat: 13.925200, lng: 122.097500, detail: "Poblacion Pipisik, EQC & Bus Terminal" },
    { name: "📍 Barangay San Diego", lat: 13.920200, lng: 122.103800, detail: "Puregold & San Diego Road Area" },
    { name: "📍 Barangay Bagong Buhay", lat: 13.919000, lng: 122.098000, detail: "Poblacion Central / West Central" },
    { name: "📍 Barangay Mabini", lat: 13.922000, lng: 122.098500, detail: "Town Proper & Cathedral Area" },
    { name: "📍 Barangay Maunlad", lat: 13.921000, lng: 122.096500, detail: "Grand Terminal & Poblacion West" },
    { name: "📍 Barangay Buensuceso", lat: 13.928000, lng: 122.095000, detail: "Northwest Coastal Area" },
    { name: "📍 Barangay Progreso Purok 1", lat: 13.918000, lng: 122.101000, detail: "Piat & Central South Area" },
    { name: "📍 Barangay Rosario", lat: 13.924000, lng: 122.099000, detail: "Municipal Hall & North Town Center" },
    { name: "Maharlika Highway (Gumaca Section)", lat: 13.9220, lng: 122.1000, detail: "Main Provincial Arterial Highway" },
    { name: "Quayside Boulevard", lat: 13.9255, lng: 122.0968, detail: "Lamon Bay Coastal Road" },
    { name: "Gumaca Municipal Hall & Plaza", lat: 13.9231, lng: 122.0982, detail: "Poblacion Center" },
    { name: "Jollibee Gumaca 🍔🐝", lat: 13.920523, lng: 122.099064, detail: "Fast Food Restaurant, Maharlika Highway" },
    { name: "McDonald's Gumaca 🍟🍔", lat: 13.920751, lng: 122.100299, detail: "Fast Food Restaurant, Maharlika Highway" },
    { name: "Chowking Gumaca 🥢🥟", lat: 13.920489, lng: 122.098769, detail: "Fast Food Restaurant, Maharlika Highway" },
    { name: "Novo Department Store 🛍️🏢", lat: 13.920196, lng: 122.097666, detail: "Department Store & Shopping, Maharlika Highway" },
    { name: "Heritage Site 🏛️", lat: 13.923430, lng: 122.100694, detail: "Gumaca Heritage Site, Tabing Dagat" },
    { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, detail: "College, Gumaca" },
    { name: "San Diego de Alcala Cathedral ⛪", lat: 13.921587, lng: 122.099428, detail: "Historic Parish Church, Town Proper" },
    { name: "Gumaca Public Market 🛒🐟", lat: 13.920509, lng: 122.101597, detail: "Public Market & Commercial Hub, Poblacion" },
    { name: "Puregold Gumaca 🟡🛒", lat: 13.921103, lng: 122.105650, detail: "Supermarket & Mall, Maharlika Highway" },
    { name: "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", lat: 13.919680, lng: 122.100656, detail: "Jeep Terminal (Macalelon, Unisan, Lopez)" },
    { name: "Jeep Terminal (Lopez) 🚐", lat: 13.922163, lng: 122.100909, detail: "Jeep Terminal bound for Lopez" },
    { name: "Piat Gumaca 📍", lat: 13.918025, lng: 122.100401, detail: "Piat Area, Mabini / Poblacion" },
    { name: "Holy Child Jesus Christ ⛪", lat: 13.921889, lng: 122.099639, detail: "Church / Chapel, Town Proper" },
    { name: "578 Emporium 🛍️🏬", lat: 13.921341, lng: 122.103364, detail: "Shopping Center & Emporium, Maharlika Highway" },
    ...properties.map(p => {
      const [lat, lng] = getLatLngForProperty(p);
      return {
        name: `🏠 ${p.title}`,
        lat,
        lng,
        detail: `Dorm / Boarding House - ₱${p.price.toLocaleString()}/mo in ${p.neighborhood}`,
        propertyObj: p
      };
    })
  ];

  const searchResults = searchQuery.trim()
    ? GUMACA_SEARCH_LOCATIONS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent duplicate map initialization
    if (leafletMapRef.current) {
      leafletMapRef.current.invalidateSize();
      return;
    }

    // Create Map centered at Gumaca, Quezon with direct mouse wheel zoom enabled
    const map = L.map(mapContainerRef.current, {
      center: [13.9220, 122.0995],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      tap: false,
      bounceAtZoom: false
    });

    leafletMapRef.current = map;

    const container = map.getContainer();
    if (container) {
      container.style.touchAction = "none";
    }

    // Create high-contrast Top Overlay Pane for Drawing Layer
    if (!map.getPane("drawingPane")) {
      map.createPane("drawingPane");
      const dPane = map.getPane("drawingPane");
      if (dPane) {
        dPane.style.zIndex = "1200"; // Highest z-index above all tile layers, markers, popups
        dPane.style.pointerEvents = "none";
      }
    }

    // Google Maps Tile Layers
    const googleStreetUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const googleSatUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"; // Google Hybrid (Satellite + Labels)

    const initialTileUrl = mapMode === "satellite" ? googleSatUrl : googleStreetUrl;
    const initialAttr = mapMode === "satellite" ? "Google Maps Satellite | Gumaca, Quezon" : "Google Maps | Gumaca, Quezon";

    const layer = L.tileLayer(initialTileUrl, {
      maxZoom: 20,
      attribution: initialAttr
    }).addTo(map);

    tileLayerRef.current = layer;

    // Click on map to inspect street or add drawing point
    map.on("click", (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (isDrawingModeRef.current) {
        addPointIfNew(lat, lng);
      } else {
        const info = getStreetInfoForCoordinates(lat, lng);
        setClickedStreet(info);
      }
    });

    // Pointer-based fallback click handler (handles touchpad micro-drifts that suppress Leaflet's map click event)
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = 0;

    const handlePointerDown = (e: PointerEvent) => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerStartTime = Date.now();
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      const elapsed = Date.now() - pointerStartTime;

      if (dist < 12 && elapsed < 600) {
        const target = e.target as HTMLElement;
        if (target && target.closest(".leaflet-control, button, input, select, .leaflet-popup, .z-30, .z-40")) {
          return;
        }

        const latlng = map.mouseEventToLatLng(e);
        if (latlng && latlng.lat && latlng.lng) {
          if (isDrawingModeRef.current) {
            addPointIfNew(latlng.lat, latlng.lng);
          } else {
            const info = getStreetInfoForCoordinates(latlng.lat, latlng.lng);
            setClickedStreet(info);
          }
        }
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerup", handlePointerUp);

    // Mousemove for real-time live preview line from last point to cursor
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      if (isDrawingModeRef.current) {
        setMousePos({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    map.on("mouseout", () => {
      setMousePos(null);
    });

    // Clean up on unmount
    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Automatic Size Invalidation Effect for Mobile Tabs and Resizes
  useEffect(() => {
    const handleInvalidate = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };

    handleInvalidate();

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleInvalidate();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const t1 = setTimeout(handleInvalidate, 100);
    const t2 = setTimeout(handleInvalidate, 350);
    const t3 = setTimeout(handleInvalidate, 700);

    window.addEventListener("resize", handleInvalidate);
    window.addEventListener("orientationchange", handleInvalidate);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", handleInvalidate);
      window.removeEventListener("orientationchange", handleInvalidate);
    };
  }, [isFullscreen]);

  // Update tile layer on mapMode change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const googleStreetUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const googleSatUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

    const targetUrl = mapMode === "satellite" ? googleSatUrl : googleStreetUrl;
    const targetAttr = mapMode === "satellite" ? "Google Maps Satellite | Gumaca, Quezon" : "Google Maps | Gumaca, Quezon";

    const newLayer = L.tileLayer(targetUrl, {
      maxZoom: 20,
      attribution: targetAttr
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapMode]);

  // Coordinate Grid Overlay Effect
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (!gridLayerRef.current) {
      gridLayerRef.current = L.layerGroup().addTo(map);
    } else {
      gridLayerRef.current.clearLayers();
    }

    if (showGrid) {
      const latStart = 13.880;
      const latEnd = 13.960;
      const lngStart = 122.050;
      const lngEnd = 122.200;
      const step = 0.005; // ~550m grid lines

      for (let lat = latStart; lat <= latEnd; lat += step) {
        const line = L.polyline([[lat, lngStart], [lat, lngEnd]], {
          color: "#f59e0b",
          weight: 1,
          dashArray: "4, 4",
          opacity: 0.6,
          interactive: false
        });
        gridLayerRef.current.addLayer(line);

        const labelIcon = L.divIcon({
          className: "grid-label-lat",
          html: `<div class="bg-amber-500/90 text-stone-950 font-mono text-[9px] px-1 font-black rounded shadow-xs select-none opacity-90">${lat.toFixed(3)}°N</div>`,
          iconSize: [50, 14],
          iconAnchor: [0, 7]
        });
        gridLayerRef.current.addLayer(L.marker([lat, lngStart + 0.001], { icon: labelIcon, interactive: false }));
      }

      for (let lng = lngStart; lng <= lngEnd; lng += step) {
        const line = L.polyline([[latStart, lng], [latEnd, lng]], {
          color: "#f59e0b",
          weight: 1,
          dashArray: "4, 4",
          opacity: 0.6,
          interactive: false
        });
        gridLayerRef.current.addLayer(line);

        const labelIcon = L.divIcon({
          className: "grid-label-lng",
          html: `<div class="bg-amber-500/90 text-stone-950 font-mono text-[9px] px-1 font-black rounded shadow-xs select-none opacity-90">${lng.toFixed(3)}°E</div>`,
          iconSize: [55, 14],
          iconAnchor: [27, 0]
        });
        gridLayerRef.current.addLayer(L.marker([latStart + 0.001, lng], { icon: labelIcon, interactive: false }));
      }
    }
  }, [showGrid]);

  // Distance calculation helpers (Haversine formula)
  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateTotalPerimeter = (pts: { lat: number; lng: number }[], shape: "polygon" | "polyline" | "points") => {
    if (pts.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      dist += getDistanceInMeters(pts[i].lat, pts[i].lng, pts[i + 1].lat, pts[i + 1].lng);
    }
    if (shape === "polygon" && pts.length >= 3) {
      dist += getDistanceInMeters(pts[pts.length - 1].lat, pts[pts.length - 1].lng, pts[0].lat, pts[0].lng);
    }
    return dist;
  };

  const handleCopyCoordinates = (format: "json" | "csv" | "google") => {
    if (drawnPoints.length === 0) return;
    let text = "";
    if (format === "json") {
      text = JSON.stringify(drawnPoints.map(p => [Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))]), null, 2);
    } else if (format === "csv") {
      text = drawnPoints.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("\n");
    } else if (format === "google") {
      const waypoints = drawnPoints.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("/");
      text = `https://www.google.com/maps/dir/${waypoints}`;
    }

    navigator.clipboard.writeText(text);
    setCopySuccessMsg(`📋 Na-kopyang matagumpay ang ${drawnPoints.length} coordinates!`);
    setTimeout(() => setCopySuccessMsg(""), 3500);
  };

  const handleSaveBoundary = () => {
    if (drawnPoints.length < 2) {
      setCopySuccessMsg("⚠️ Maglagay ng kahit 2 o higit pang tuldok sa mapa para sa boundary!");
      setTimeout(() => setCopySuccessMsg(""), 3500);
      return;
    }

    const newBoundary = {
      id: `bound-${Date.now()}`,
      barangayName: selectedBarangayToSave,
      color: drawColor,
      points: drawnPoints.map(p => [p.lat, p.lng] as [number, number])
    };

    setDrawnBarangayBoundaries(prev => {
      const filtered = prev.filter(b => b.barangayName !== selectedBarangayToSave);
      const nextState = [...filtered, newBoundary];
      try {
        localStorage.setItem("barangay_drawn_boundaries", JSON.stringify(nextState));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
      return nextState;
    });

    setShowBoundariesOnMap(true);

    const lats = newBoundary.points.map(p => p[0]);
    const lngs = newBoundary.points.map(p => p[1]);
    const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const cLng = lngs.reduce((a, b) => a + b, 0) / lats.length;

    triggerArrowHighlight(cLat, cLng, `📍 Boundary: ${selectedBarangayToSave}`, `Opisyal na Na-save na Boundary (${newBoundary.points.length} tuldok)`, 16);

    if (leafletMapRef.current && newBoundary.points.length > 0) {
      const bounds = L.latLngBounds(newBoundary.points);
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }

    setDrawnPoints([]);
    setCopySuccessMsg(`🎉 Na-save at na-overlay na sa mapa ang opisyal na boundary ng ${selectedBarangayToSave}! (${newBoundary.points.length} tuldok)`);
    setTimeout(() => setCopySuccessMsg(""), 3500);
  };

  const handleDeleteBoundary = (id: string) => {
    setDrawnBarangayBoundaries(prev => {
      const nextState = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem("barangay_drawn_boundaries", JSON.stringify(nextState));
      } catch (e) {
        console.error("Error updating localStorage after delete:", e);
      }
      return nextState;
    });
    setCopySuccessMsg("🗑️ Na-burang matagumpay ang boundary!");
    setTimeout(() => setCopySuccessMsg(""), 3000);
  };

  const handleDeleteAllSavedBoundaries = () => {
    setDrawnBarangayBoundaries([]);
    setCopySuccessMsg("🗑️ Na-burang lahat ang mga na-save na boundary!");
    setTimeout(() => setCopySuccessMsg(""), 3000);
  };

  // Drawing Layer Render Effect
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (!drawingLayerRef.current) {
      drawingLayerRef.current = L.layerGroup().addTo(map);
    } else {
      drawingLayerRef.current.clearLayers();
    }

    const layerGroup = drawingLayerRef.current;

    // 1. Render Saved Barangay Boundaries if toggled on
    if (showBoundariesOnMap) {
      drawnBarangayBoundaries.forEach((boundary) => {
        if (boundary.points.length >= 3) {
          // White high-contrast outline stroke
          const bgPoly = L.polygon(boundary.points, {
            color: "#ffffff",
            weight: 6,
            opacity: 0.9,
            fill: false,
            interactive: false
          });
          const poly = L.polygon(boundary.points, {
            color: boundary.color || "#6366f1",
            weight: 4,
            fillColor: boundary.color || "#6366f1",
            fillOpacity: 0.3,
            dashArray: "5, 5",
            interactive: false
          });

          const lats = boundary.points.map(p => p[0]);
          const lngs = boundary.points.map(p => p[1]);
          const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
          const cLng = lngs.reduce((a, b) => a + b, 0) / lats.length;

          const labelIcon = L.divIcon({
            className: "saved-boundary-badge !bg-transparent !border-none",
            html: `<div class="bg-indigo-950 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-2xl border-2 border-indigo-300 whitespace-nowrap pointer-events-none flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>🏛️ ${boundary.barangayName} (${boundary.points.length} Tuldok)</span>
            </div>`,
            iconSize: [160, 26],
            iconAnchor: [80, 13]
          });

          poly.bindPopup(`<b>${boundary.barangayName}</b><br/>Total Vertices: ${boundary.points.length}`);
          layerGroup.addLayer(bgPoly);
          layerGroup.addLayer(poly);
          layerGroup.addLayer(L.marker([cLat, cLng], { icon: labelIcon, interactive: false }));

          // Render Leaflet vertex dot markers (tuldok) on each vertex point
          boundary.points.forEach((pt) => {
            const dot = L.circleMarker(pt, {
              radius: 9,
              color: "#ffffff",
              weight: 3,
              fillColor: boundary.color || "#6366f1",
              fillOpacity: 1,
              interactive: false
            });
            layerGroup.addLayer(dot);
          });
        }
      });
    }

    // 2. Render Active Drawing Points & Polyline/Polygon
    if (drawnPoints.length > 0) {
      const coords: [number, number][] = drawnPoints.map(p => [p.lat, p.lng]);

      // Always draw connected polyline connecting all points with high contrast outline
      if (coords.length >= 2) {
        // High contrast white background outline line
        const bgLine = L.polyline(coords, {
          color: "#ffffff",
          weight: 8,
          opacity: 0.95,
          interactive: false
        });
        // Main colored line
        const mainLine = L.polyline(coords, {
          color: drawColor,
          weight: 5,
          opacity: 1,
          interactive: false
        });
        layerGroup.addLayer(bgLine);
        layerGroup.addLayer(mainLine);
      }

      // Fill polygon area if polygon mode and 3+ points
      if (drawShapeType === "polygon" && coords.length >= 3) {
        const poly = L.polygon(coords, {
          color: drawColor,
          weight: 5,
          fillColor: drawColor,
          fillOpacity: 0.35,
          interactive: false
        });
        layerGroup.addLayer(poly);
      }

      // Live Rubberband Preview Line from last point to cursor
      if (isDrawingMode && mousePos) {
        const lastPt = coords[coords.length - 1];
        const previewCoords: [number, number][] = [lastPt, [mousePos.lat, mousePos.lng]];

        const previewBg = L.polyline(previewCoords, {
          color: "#ffffff",
          weight: 6,
          dashArray: "6, 6",
          opacity: 0.9,
          interactive: false
        });
        const previewLine = L.polyline(previewCoords, {
          color: drawColor,
          weight: 3.5,
          dashArray: "6, 6",
          opacity: 1,
          interactive: false
        });
        layerGroup.addLayer(previewBg);
        layerGroup.addLayer(previewLine);

        // Preview polygon closing line back to point #1
        if (drawShapeType === "polygon" && coords.length >= 2) {
          const closingCoords: [number, number][] = [[mousePos.lat, mousePos.lng], coords[0]];
          const closingLine = L.polyline(closingCoords, {
            color: drawColor,
            weight: 2,
            dashArray: "4, 4",
            opacity: 0.6,
            interactive: false
          });
          layerGroup.addLayer(closingLine);
        }

        // Live cursor target indicator label
        const targetIcon = L.divIcon({
          className: "mouse-target-pin !bg-transparent !border-none",
          html: `
            <div class="pointer-events-none flex items-center gap-1.5 bg-indigo-950/90 text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-full shadow-2xl border border-emerald-400 backdrop-blur-xs whitespace-nowrap animate-pulse">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Click para sa Tuldok #${coords.length + 1}</span>
            </div>
          `,
          iconSize: [160, 24],
          iconAnchor: [80, 28]
        });
        layerGroup.addLayer(L.marker([mousePos.lat, mousePos.lng], { icon: targetIcon, interactive: false }));
      }

      // Vertex Markers with sequence number 1, 2, 3...
      drawnPoints.forEach((pt, index) => {
        const isFirst = index === 0;
        const isLast = index === drawnPoints.length - 1;

        // Guaranteed SVG CircleMarker rendering
        const dot = L.circleMarker([pt.lat, pt.lng], {
          radius: 12,
          color: "#ffffff",
          weight: 4,
          fillColor: isFirst ? "#059669" : isLast ? "#e11d48" : "#2563eb",
          fillOpacity: 1,
          interactive: false
        });
        layerGroup.addLayer(dot);

        // Super High-Contrast Glowing Target Overlay Badge
        const vertexIcon = L.divIcon({
          className: "vertex-marker !bg-transparent !border-none",
          html: `
            <div class="pointer-events-none relative flex flex-col items-center justify-center">
              <!-- Outer glowing pulse aura ring -->
              <span class="absolute w-11 h-11 rounded-full animate-ping opacity-75 ${
                isFirst ? "bg-emerald-400" : isLast ? "bg-rose-400" : "bg-blue-400"
              }"></span>
              
              <!-- Numbered Core Pin Badge -->
              <div class="relative flex items-center justify-center w-8 h-8 rounded-full font-black text-[13px] text-white shadow-[0_0_20px_rgba(0,0,0,0.6)] border-2 border-white ${
                isFirst
                  ? "bg-emerald-600 ring-4 ring-emerald-300"
                  : isLast
                  ? "bg-rose-600 ring-4 ring-rose-300"
                  : "bg-blue-600 ring-4 ring-blue-300"
              }">
                ${index + 1}
              </div>

              <!-- Top/Bottom Label Pill -->
              ${
                isFirst
                  ? `<div class="absolute -top-6 bg-emerald-900 text-emerald-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow border border-emerald-400 whitespace-nowrap">▶ SIMULA (#1)</div>`
                  : isLast && drawnPoints.length > 1
                  ? `<div class="absolute -bottom-6 bg-rose-900 text-rose-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow border border-rose-400 whitespace-nowrap">📌 TULDOK #${index + 1}</div>`
                  : ""
              }
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([pt.lat, pt.lng], { icon: vertexIcon, interactive: false });
        layerGroup.addLayer(marker);
      });
    }
  }, [drawnPoints, drawShapeType, drawColor, drawnBarangayBoundaries, showBoundariesOnMap, isDrawingMode, mousePos]);


  // Update Markers whenever properties, selectedProperty, or campus coordinates change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Quick Jump Arrow Pointer (Rendered whenever triggered by Quick Jump or Search)
    if (activeArrowLocation) {
      const campusIcon = L.divIcon({
        className: "custom-campus-pin",
        html: `
          <div class="cursor-pointer group flex flex-col items-center z-50 drop-shadow-xl transition-transform hover:scale-110 active:scale-95">
            <!-- Floating title label above arrow -->
            <div class="mb-1 whitespace-nowrap bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xl border-2 border-white tracking-wide flex items-center gap-1 animate-pulse">
              <span>${activeArrowLocation.title}</span>
            </div>
            <div class="relative flex items-center justify-center">
              <!-- Pulsing outer ring -->
              <div class="absolute -inset-3 bg-rose-500/50 rounded-full animate-ping"></div>
              <!-- Arrow circle badge -->
              <div class="relative bg-rose-600 text-white p-2.5 rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 animate-bounce stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </div>
            </div>
            <!-- Pointer tip pointing to exact coordinate -->
            <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-rose-600 -mt-1"></div>
          </div>
        `,
        iconSize: [160, 75],
        iconAnchor: [80, 75]
      });

      const campusMarker = L.marker([activeArrowLocation.lat, activeArrowLocation.lng], { icon: campusIcon }).addTo(map);
      campusMarkerRef.current = campusMarker;
      markersRef.current.push(campusMarker);
    }

    // Add Landmark Markers only if showLandmarks is explicitly toggled on
    if (showLandmarks) {
      GUMACA_LANDMARKS.forEach(lm => {
        const landmarkIcon = L.divIcon({
          className: "custom-landmark-pin",
          html: `
            <div class="bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-white shadow-md flex items-center gap-1 whitespace-nowrap">
              <span>${lm.name}</span>
            </div>
          `,
          iconSize: [120, 28],
          iconAnchor: [60, 14]
        });

        const marker = L.marker([lm.lat, lm.lng], { icon: landmarkIcon }).addTo(map);
        marker.bindPopup(`
          <div class="p-1 font-sans">
            <strong class="text-xs text-emerald-800">${lm.name}</strong>
            <p class="text-[11px] text-gray-600 m-0">${lm.desc}</p>
          </div>
        `);
        markersRef.current.push(marker);
      });
    }

    // Add Property Markers
    properties.forEach(property => {
      const [lat, lng] = getLatLngForProperty(property);
      const isSelected = selectedProperty?.id === property.id;
      const matchScore = aiMatches?.find(m => m.id === property.id)?.score;

      const priceTag = `₱${(property.price / 1000).toFixed(1)}k`;

      const markerIcon = L.divIcon({
        className: "custom-property-pin",
        html: `
          <div class="cursor-pointer transition-transform transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="${isSelected ? 'bg-amber-500 text-stone-900 border-2 border-stone-900 ring-4 ring-amber-500/30' : 'bg-stone-900 text-white border-2 border-white'} font-bold text-[11px] px-2 py-1 rounded-xl shadow-lg flex items-center gap-1 whitespace-nowrap">
              <span>${priceTag}</span>
              ${matchScore ? `<span class="bg-amber-400 text-stone-900 text-[9px] px-1 rounded-md">${matchScore}%</span>` : ''}
            </div>
            <div class="w-2 h-2 ${isSelected ? 'bg-amber-500' : 'bg-stone-900'} rotate-45 mx-auto -mt-1 shadow-xs"></div>
          </div>
        `,
        iconSize: [70, 32],
        iconAnchor: [35, 32]
      });

      const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);

      // Custom popup HTML matching user's requested map popup layout
      const popupDiv = document.createElement("div");
      popupDiv.className = "font-sans p-0.5";
      popupDiv.innerHTML = `
        <div class="flex gap-3 items-center">
          <img
            src="${property.image}"
            alt="${property.title}"
            class="w-16 h-16 object-cover rounded-2xl border border-stone-100 shrink-0 shadow-2xs"
          />
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-stone-900 text-sm leading-snug truncate m-0">
              ${property.title}
            </h4>
            <p class="text-xs text-stone-500 m-0 mt-0.5 truncate font-normal">
              ${property.neighborhood || property.address || 'Barangay Tabing Dagat'}, ${property.city || 'Gumaca'}
            </p>
            <div class="mt-1.5 inline-block bg-stone-100 text-stone-900 font-bold text-xs px-2.5 py-0.5 rounded-md border border-stone-200/60">
              ₱${property.price.toLocaleString()} / month
            </div>
          </div>
        </div>
        <button
          id="leaflet-popup-btn-${property.id}"
          class="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-2xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
        >
          Tingnan ang detalye
        </button>
      `;

      marker.bindPopup(popupDiv, {
        className: "custom-leaflet-property-popup",
        maxWidth: 320
      });

      marker.on("popupopen", () => {
        onSelectProperty(property);
        setTimeout(() => {
          const btn = document.getElementById(`leaflet-popup-btn-${property.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              if (onOpenDetails) {
                onOpenDetails(property);
              }
            };
          }
        }, 50);
      });

      marker.on("click", () => {
        onSelectProperty(property);
      });

      markersRef.current.push(marker);
    });

    // Manage Route Layer for connecting lines from Selected Property to Schools
    if (!routeLayerRef.current) {
      routeLayerRef.current = L.layerGroup().addTo(map);
    } else {
      routeLayerRef.current.clearLayers();
    }

    if (selectedProperty) {
      const [sLat, sLng] = getLatLngForProperty(selectedProperty);
      const schoolDistances = getSchoolDistancesForProperty(sLat, sLng);

      const targetSchools = activeSchoolRouteFilter === "all"
        ? schoolDistances
        : schoolDistances.filter(s => s.id === activeSchoolRouteFilter);

      const routeColorMap: Record<string, string> = {
        "slsu-main": "#4f46e5",
        "slsu-villa-nava": "#059669",
        "eqc-college": "#d97706",
        "gnhs-high": "#e11d48",
        "central-elementary": "#0284c7",
        "holy-child": "#7c3aed",
        "qwa-high": "#ea580c"
      };

      targetSchools.forEach((schoolItem) => {
        const lineStrokeColor = routeColorMap[schoolItem.id] || "#3b82f6";

        // Outer glow line
        const shadowPolyline = L.polyline([[sLat, sLng], [schoolItem.lat, schoolItem.lng]], {
          color: "#0f172a",
          weight: activeSchoolRouteFilter === "all" ? 5 : 7,
          opacity: 0.25,
          interactive: false
        });
        routeLayerRef.current?.addLayer(shadowPolyline);

        // Dashed animated route line
        const routePolyline = L.polyline([[sLat, sLng], [schoolItem.lat, schoolItem.lng]], {
          color: lineStrokeColor,
          weight: activeSchoolRouteFilter === "all" ? 3.5 : 5,
          dashArray: activeSchoolRouteFilter === "all" ? "6, 8" : "10, 8",
          opacity: 0.95,
          interactive: false
        });
        routeLayerRef.current?.addLayer(routePolyline);

        // Midpoint badge callout
        const midLat = (sLat + schoolItem.lat) / 2;
        const midLng = (sLng + schoolItem.lng) / 2;
        const midBadgeIcon = L.divIcon({
          className: "custom-route-mid-badge !bg-transparent !border-none",
          html: `
            <div class="pointer-events-none flex items-center justify-center">
              <div class="bg-stone-900/90 text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-2xl border border-stone-600 flex items-center gap-1.5 whitespace-nowrap">
                <span style="color: ${lineStrokeColor}">📏 ${schoolItem.distanceKm.toFixed(2)} km</span>
                <span class="text-stone-300 font-normal">(${schoolItem.walkingMinutes}m lakad)</span>
              </div>
            </div>
          `,
          iconSize: [150, 26],
          iconAnchor: [75, 13]
        });
        const midBadgeMarker = L.marker([midLat, midLng], { icon: midBadgeIcon, interactive: false });
        routeLayerRef.current?.addLayer(midBadgeMarker);

        // Destination School Pin
        const destIcon = L.divIcon({
          className: "custom-school-dest-pin !bg-transparent !border-none",
          html: `
            <div class="cursor-pointer group flex flex-col items-center">
              <div class="bg-stone-900 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-2xl border-2 border-white flex items-center gap-1 whitespace-nowrap group-hover:scale-110 transition-transform">
                <span>🎓 ${schoolItem.name}</span>
                <span class="bg-amber-400 text-stone-950 font-mono font-black text-[9px] px-1 rounded">${schoolItem.distanceKm.toFixed(2)}km</span>
              </div>
              <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg animate-ping mt-0.5" style="background-color: ${lineStrokeColor}"></div>
            </div>
          `,
          iconSize: [180, 42],
          iconAnchor: [90, 21]
        });
        const destMarker = L.marker([schoolItem.lat, schoolItem.lng], { icon: destIcon });
        destMarker.on("click", () => {
          setActiveSchoolRouteFilter(schoolItem.id);
        });
        routeLayerRef.current?.addLayer(destMarker);
      });

      // Fit bounds if single school selected
      if (activeSchoolRouteFilter !== "all" && targetSchools.length > 0) {
        const target = targetSchools[0];
        const bounds = L.latLngBounds([[sLat, sLng], [target.lat, target.lng]]);
        map.fitBounds(bounds, { padding: [70, 70], animate: true, duration: 1 });
      } else {
        map.flyTo([sLat, sLng], 15, { animate: true, duration: 1 });
      }
    }
  }, [properties, selectedProperty, aiMatches, onSelectProperty, showLandmarks, villaNavaCoords, tabingDagatCoords, activeArrowLocation, activeSchoolRouteFilter]);

  // Quick pan functions
  const panToArea = (lat: number, lng: number, zoom: number = 16) => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
    }
  };

  const triggerArrowHighlight = (lat: number, lng: number, title: string, desc?: string, zoom: number = 17) => {
    setActiveArrowLocation({ lat, lng, title, desc });
    panToArea(lat, lng, zoom);
  };

  const triggerSLSUHighlight = (zoom: number = 17) => {
    triggerArrowHighlight(
      villaNavaCoords[0],
      villaNavaCoords[1],
      "🏫 SLSU Villa Nava Campus",
      "Southern Luzon State University - Villa Nava Campus, Gumaca, Quezon.",
      zoom
    );
  };

  const getMatchScore = (propertyId: string) => {
    return aiMatches?.find(m => m.id === propertyId)?.score;
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Hindi supported ng iyong browser ang Geolocation.");
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        const acc = position.coords.accuracy || 25;

        setUserExactGps({ lat: uLat, lng: uLng, accuracy: acc });
        setIsLocatingUser(false);

        if (leafletMapRef.current) {
          const map = leafletMapRef.current;

          const userIcon = L.divIcon({
            className: "user-gps-exact-pin",
            html: `
              <div class="relative flex flex-col items-center">
                <div class="absolute -top-1 w-10 h-10 bg-sky-500/30 rounded-full animate-ping"></div>
                <div class="bg-sky-500 text-white p-2 rounded-full shadow-lg ring-4 ring-sky-300 border-2 border-white flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <div class="bg-sky-950 text-sky-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md mt-1 border border-sky-400/40 whitespace-nowrap z-10">
                  📍 Exact Location Mo
                </div>
              </div>
            `,
            iconSize: [110, 50],
            iconAnchor: [55, 20],
          });

          if (userGpsMarkerRef.current) {
            userGpsMarkerRef.current.setLatLng([uLat, uLng]);
          } else {
            userGpsMarkerRef.current = L.marker([uLat, uLng], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
          }

          if (userGpsCircleRef.current) {
            userGpsCircleRef.current.setLatLng([uLat, uLng]);
            userGpsCircleRef.current.setRadius(Math.max(acc, 15));
          } else {
            userGpsCircleRef.current = L.circle([uLat, uLng], {
              radius: Math.max(acc, 15),
              color: "#0284c7",
              fillColor: "#38bdf8",
              fillOpacity: 0.25,
              weight: 2,
            }).addTo(map);
          }

          map.flyTo([uLat, uLng], 17, { animate: true, duration: 1.2 });
        }
      },
      () => {
        setIsLocatingUser(false);
        alert("Hindi makuha ang iyong lokasyon. Siguraduhing pinayagan ang Location Permission sa iyong browser.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  return (
    <div
      id="neighborhood-map-container"
      className={`flex flex-col bg-white overflow-hidden shadow-xs transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none p-0 border-0"
          : "h-full rounded-2xl border border-stone-200"
      }`}
    >
      {/* Standard Map Header (Shown always on laptop; on mobile hidden during fullscreen) */}
      <div className={`bg-stone-50 border-b border-stone-200 px-3 py-2 sm:px-4 sm:py-3 flex-col xs:flex-row xs:items-center justify-between gap-2 shrink-0 ${
        isFullscreen ? "hidden sm:flex" : "flex"
      }`}>
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-stone-700 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5 truncate">
              Gumaca, Quezon Interactive Street Map 🗺️
            </h3>
            <p className="text-[10px] text-stone-500 font-light hidden sm:block">
              Mag-search ng kalye, barangay, o campus, o pindutin ang mapa para makita ang detalye!
            </p>
          </div>
        </div>

        {/* Header Right Controls: Layer Switcher, Boundary Drawer Toggle & Fullscreen */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs">
          {/* Interactive Barangay Boundary Drawer Button */}
          <button
            onClick={() => {
              setIsDrawingMode(prev => !prev);
              if (!showBoundariesOnMap) {
                setShowBoundariesOnMap(true);
              }
            }}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
              isDrawingMode
                ? "bg-amber-500 text-stone-950 ring-2 ring-amber-300 animate-pulse"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            title="I-edit o iguhit ang boundary ng bawat barangay sa Gumaca"
          >
            <Shapes className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>{isDrawingMode ? "✏️ Drawing..." : "✏️ Boundary"}</span>
          </button>

          {/* Toggle Saved Barangay Boundaries Overlay */}
          <button
            onClick={() => {
              if (!showBoundariesOnMap) {
                if (!selectedBarangayBoundaryFilter && drawnBarangayBoundaries.length > 0) {
                  setSelectedBarangayBoundaryFilter(drawnBarangayBoundaries[0].barangayName);
                }
                setShowBoundariesOnMap(true);
              } else {
                setShowBoundariesOnMap(false);
              }
            }}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
              showBoundariesOnMap
                ? "bg-purple-100 text-purple-900 border border-purple-300"
                : "bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200"
            }`}
            title="Ipakita o Itago ang Boundary ng Napiling Barangay"
          >
            <span>{showBoundariesOnMap ? "🗺️ Overlay ON" : "🗺️ Overlay OFF"}</span>
          </button>

          <div className="flex items-center gap-0.5 bg-stone-200/80 p-0.5 rounded-xl text-[10px] sm:text-[11px] font-medium">
            <button
              onClick={() => setMapMode("streets")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all cursor-pointer ${
                mapMode === "streets"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
              title="Live Google Maps Standard Roadmap"
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setMapMode("satellite")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all cursor-pointer ${
                mapMode === "satellite"
                  ? "bg-emerald-700 text-white shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
              title="Live Google Maps Satellite View"
            >
              🛰️ Sat
            </button>
          </div>

          {/* GPS Locate User Button */}
          <button
            onClick={handleLocateUser}
            disabled={isLocatingUser}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-60 whitespace-nowrap"
            title="Point out ang iyong eksaktong kasalukuyang lokasyon gamit ang GPS"
          >
            <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-white/20" />
            <span>{isLocatingUser ? "GPS..." : "GPS 📍"}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isFullscreen
                ? "bg-amber-500 text-stone-950 font-black hover:bg-amber-400 ring-2 ring-amber-300"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit ✕</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Full</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Map Location Search Bar (On mobile hidden during fullscreen to maximize map view) */}
      {mapMode !== "google_embed" && (
        <div className={`relative bg-white border-b border-stone-200 px-3 py-2 z-40 ${
          isFullscreen ? "hidden sm:block" : "block"
        }`}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Mag-search ng kalye, barangay, o dorm sa Gumaca..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-9 pr-8 py-1.5 bg-stone-100 hover:bg-stone-100/80 focus:bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20 font-sans transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-3 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-stone-100 font-sans">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    triggerArrowHighlight(item.lat, item.lng, item.name, item.detail, 17);
                    setSearchQuery(item.name);
                    setShowSearchResults(false);

                    // Set inspect popup details
                    const info = getStreetInfoForCoordinates(item.lat, item.lng);
                    setClickedStreet(info);

                    if (item.propertyObj) {
                      onSelectProperty(item.propertyObj);
                    }
                  }}
                  className="p-2.5 hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-stone-900">{item.name}</div>
                    <div className="text-[10px] text-stone-500">{item.detail}</div>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                    Jump 📍
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Jump Buttons for Laptop View when Fullscreen */}
      {mapMode !== "google_embed" && isFullscreen && (
        <div className="hidden sm:flex bg-stone-100/70 border-b border-stone-200 px-3 py-2 items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
          <span className="text-stone-400 font-mono shrink-0 mr-1 flex items-center gap-1">
            <Compass className="h-3 w-3 text-stone-400" />
            Quick Jump:
          </span>

          {/* Dynamic Jump to Barangay with Saved Boundary */}
          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-lg shrink-0">
            <span className="font-bold text-indigo-900 text-[10px] flex items-center gap-1">
              <Shapes className="h-3 w-3 text-indigo-600" />
              📍 Barangay:
            </span>
            <select
              value={selectedBarangayBoundaryFilter}
              onChange={(e) => {
                const bName = e.target.value;
                setSelectedBarangayBoundaryFilter(bName);
                if (!bName) {
                  setShowBoundariesOnMap(false);
                  return;
                }
                setShowBoundariesOnMap(true);

                if (bName === "ALL_BARANGAYS") {
                  triggerArrowHighlight(13.9220, 122.0995, "📍 Lahat ng Gumaca Barangays", "Ipinapakita ang lahat ng saved barangay boundaries sa Gumaca", 15);
                  if (leafletMapRef.current) {
                    leafletMapRef.current.flyTo([13.9220, 122.0995], 15);
                  }
                  return;
                }

                const boundary = drawnBarangayBoundaries.find(b => b.barangayName === bName);
                if (boundary && boundary.points.length > 0) {
                  const lats = boundary.points.map(p => p[0]);
                  const lngs = boundary.points.map(p => p[1]);
                  const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
                  const cLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

                  triggerArrowHighlight(cLat, cLng, `📍 Boundary: ${boundary.barangayName}`, `Kumpletong Na-guhit na Boundary (${boundary.points.length} tuldok)`, 16);
                  const info = getStreetInfoForCoordinates(cLat, cLng);
                  setClickedStreet(info);

                  if (leafletMapRef.current) {
                    const bounds = L.latLngBounds(boundary.points);
                    leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
                  }
                }
              }}
              className="bg-white text-indigo-950 text-[10px] font-bold py-0.5 px-1.5 rounded border border-indigo-200 focus:outline-none cursor-pointer"
            >
              <option value="">-- Piliin ({drawnBarangayBoundaries.length}) --</option>
              <option value="ALL_BARANGAYS">✨ Lahat ng Barangay ({drawnBarangayBoundaries.length})</option>
              {drawnBarangayBoundaries.map((b) => (
                <option key={b.id} value={b.barangayName}>
                  {b.barangayName} ({b.points.length} tuldok)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => triggerSLSUHighlight(17)}
            className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            <School className="h-3 w-3 text-teal-600" />
            SLSU Villa Nava 🎓
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920523, 122.099064, "Jollibee Gumaca 🍔🐝", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
            className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🍔 Jollibee
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920751, 122.100299, "McDonald's Gumaca 🍟🍔", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🍟 McDonald's
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920489, 122.098769, "Chowking Gumaca 🥢🥟", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🥢 Chowking
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920196, 122.097666, "Novo Department Store 🛍️🏢", "Department Store & Shopping, Maharlika Highway, Gumaca", 17)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🛍️ Novo Dept Store
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.923258, 122.101460, "SLSU Tabing Dagat Campus 🎓🌊", "Southern Luzon State University - Tabing Dagat Campus, Gumaca", 17)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🎓 SLSU Tabing Dagat
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.923430, 122.100694, "Heritage Site 🏛️", "Gumaca Heritage / Historical Landmark, Tabing Dagat", 17)}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏛️ Heritage
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.923315, 122.097557, "Eastern Quezon College (EQC) 🏛️", "College & Educational Institution, Gumaca", 17)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏫 EQC
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920500, 122.094000, "Gumaca National High School (GNHS) 🏫", "Gumaca NHS, Mabini/Poblacion, Gumaca", 17)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏫 Gumaca NHS
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920509, 122.101597, "Gumaca Public Market 🛒🐟", "Public Market & Commercial Hub, Poblacion", 17)}
            className="bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🛒 Public Market
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.921103, 122.105650, "Puregold Gumaca 🟡🛒", "Puregold Supermarket, Maharlika Highway / San Diego", 17)}
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🟡 Puregold
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.919680, 122.100656, "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", "Jeepney Terminal for Macalelon, Unisan & Lopez", 17)}
            className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🚐 Jeep Terminal
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.9220, 122.0995, "Whole Gumaca Overview 🔍", "Gumaca Municipality Overview", 14)}
            className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ml-auto"
          >
            🔍 Whole Gumaca
          </button>
        </div>
      )}

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 bg-[#f9f8f4] min-h-[380px] h-full w-full overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-10" />

        {/* FLOATING OVERLAY STRICTLY FOR MOBILE VIEW WHEN IN FULLSCREEN */}
        {isFullscreen && (
          <>
            <div className="sm:hidden absolute top-2.5 left-2.5 right-2.5 z-40 flex flex-col gap-2 pointer-events-none">
              {/* Top Bar: Sleek Frosted Glass Header */}
              <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-stone-700/80 shadow-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shrink-0">
                    <Map className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-xs tracking-wide text-white truncate">Gumaca Map 🗺️</span>
                    <span className="text-[9px] text-emerald-300/90 font-medium truncate">Interactive Local Guide</span>
                  </div>
                </div>

                {/* Layer Quick Switcher for Mobile Fullscreen */}
                <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl border border-stone-700/80 shrink-0">
                  <button
                    onClick={() => setMapMode("osm")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      mapMode === "osm" ? "bg-emerald-500 text-stone-950 shadow-xs" : "text-stone-300 hover:text-white"
                    }`}
                  >
                    Street
                  </button>
                  <button
                    onClick={() => setMapMode("satellite")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      mapMode === "satellite" ? "bg-emerald-500 text-stone-950 shadow-xs" : "text-stone-300 hover:text-white"
                    }`}
                  >
                    Sat 🛰️
                  </button>
                </div>
              </div>

              {/* Mobile Quick Jump Bar Overlay */}
              {mapMode !== "google_embed" && (
                <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xl px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar rounded-2xl">
                  <span className="text-stone-500 font-extrabold shrink-0 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    <Compass className="h-3.5 w-3.5 text-indigo-600 animate-spin-slow" />
                    Jump:
                  </span>

                  {/* Barangay Filter Dropdown */}
                  <div className="flex items-center gap-1 bg-indigo-50/90 border border-indigo-200/80 px-2 py-0.5 rounded-xl shrink-0 shadow-2xs">
                    <span className="font-bold text-indigo-900 text-[10px]">📍 Brgy:</span>
                    <select
                      value={selectedBarangayBoundaryFilter}
                      onChange={(e) => {
                        const bName = e.target.value;
                        setSelectedBarangayBoundaryFilter(bName);
                        if (!bName) {
                          setShowBoundariesOnMap(false);
                          return;
                        }
                        setShowBoundariesOnMap(true);

                        if (bName === "ALL_BARANGAYS") {
                          triggerArrowHighlight(13.9220, 122.0995, "📍 Lahat ng Gumaca Barangays", "Ipinapakita ang lahat ng saved barangay boundaries sa Gumaca", 15);
                          if (leafletMapRef.current) {
                            leafletMapRef.current.flyTo([13.9220, 122.0995], 15);
                          }
                          return;
                        }

                        const boundary = drawnBarangayBoundaries.find(b => b.barangayName === bName);
                        if (boundary && boundary.points.length > 0) {
                          const lats = boundary.points.map(p => p[0]);
                          const lngs = boundary.points.map(p => p[1]);
                          const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
                          const cLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

                          triggerArrowHighlight(cLat, cLng, `📍 Boundary: ${boundary.barangayName}`, `Kumpletong Na-guhit na Boundary (${boundary.points.length} tuldok)`, 16);
                          const info = getStreetInfoForCoordinates(cLat, cLng);
                          setClickedStreet(info);

                          if (leafletMapRef.current) {
                            const bounds = L.latLngBounds(boundary.points);
                            leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
                          }
                        }
                      }}
                      className="bg-white text-indigo-950 text-[10px] font-bold py-0.5 px-1 rounded-lg border border-indigo-200 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Brgy --</option>
                      <option value="ALL_BARANGAYS">✨ Lahat</option>
                      {drawnBarangayBoundaries.map((b) => (
                        <option key={b.id} value={b.barangayName}>
                          {b.barangayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => triggerSLSUHighlight(17)}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <School className="h-3 w-3 text-teal-600" />
                    SLSU 🎓
                  </button>

                  <button
                    onClick={() => triggerArrowHighlight(13.920523, 122.099064, "Jollibee Gumaca 🍔🐝", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
                    className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🍔 Jollibee
                  </button>

                  <button
                    onClick={() => triggerArrowHighlight(13.920751, 122.100299, "McDonald's Gumaca 🍟🍔", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🍟 McDonald's
                  </button>

                  <button
                    onClick={() => triggerArrowHighlight(13.920489, 122.098769, "Chowking Gumaca 🥢🥟", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🥢 Chowking
                  </button>

                  <button
                    onClick={() => triggerArrowHighlight(13.920196, 122.097666, "Novo Department Store 🛍️🏢", "Department Store & Shopping, Maharlika Highway, Gumaca", 17)}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🛍️ Novo
                  </button>

                  <button
                    onClick={() => triggerArrowHighlight(13.923258, 122.101460, "SLSU Tabing Dagat Campus 🎓🌊", "Southern Luzon State University - Tabing Dagat Campus, Gumaca", 17)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🎓 Tabing Dagat
                  </button>

                  <button
                    onClick={() => triggerArrowHighlight(13.920509, 122.101597, "Gumaca Public Market 🛒🐟", "Public Market & Commercial Hub, Poblacion", 17)}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🛒 Market
                  </button>

                  <button
                    onClick={() => triggerArrowHighlight(13.921103, 122.105650, "Puregold Gumaca 🟡🛒", "Puregold Supermarket, Maharlika Highway / San Diego", 17)}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🟡 Puregold
                  </button>

                  <button
                    onClick={() => triggerArrowHighlight(13.919680, 122.100656, "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", "Jeepney Terminal for Macalelon, Unisan & Lopez", 17)}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 px-2.5 py-1 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    🚐 Jeep Terminal
                  </button>
                </div>
              )}
            </div>

            {/* FLOATING BOTTOM LEFT GPS BUTTON FOR MOBILE FULLSCREEN VIEW */}
            <div className="sm:hidden absolute bottom-5 left-3.5 z-40 pointer-events-auto">
              <button
                onClick={handleLocateUser}
                disabled={isLocatingUser}
                className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black rounded-full text-xs shadow-2xl cursor-pointer flex items-center gap-1.5 active:scale-95 border border-indigo-400/40 ring-2 ring-indigo-500/20 transition-all"
                title="Eksaktong Lokasyon sa GPS"
              >
                <Navigation className="h-4 w-4 fill-white/30 animate-pulse" />
                <span>{isLocatingUser ? "Naghahanap..." : "GPS 📍"}</span>
              </button>
            </div>

            {/* FLOATING BOTTOM RIGHT EXIT BUTTON FOR MOBILE FULLSCREEN VIEW */}
            <div className="sm:hidden absolute bottom-5 right-3.5 z-40 pointer-events-auto">
              <button
                onClick={toggleFullscreen}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 font-extrabold px-4.5 py-2.5 rounded-full text-xs flex items-center gap-1.5 shadow-2xl ring-4 ring-amber-300/80 cursor-pointer border border-amber-200/60 transition-all"
                title="Umalis sa Fullscreen Map"
              >
                <Minimize2 className="h-4 w-4 shrink-0" />
                <span>Exit Fullscreen ✕</span>
              </button>
            </div>
          </>
        )}



        {/* ABSOLUTE GUARANTEED REACT DOM SVG & BADGE OVERLAY FOR SAVED BOUNDARIES */}
        {showBoundariesOnMap && savedPixelBoundaries.length > 0 && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-18">
              {savedPixelBoundaries.map((b) => (
                <g key={`saved-svg-${b.id}`}>
                  {b.points.length >= 3 && (
                    <polygon
                      points={b.points.map(p => `${p.x},${p.y}`).join(" ")}
                      fill={b.color}
                      fillOpacity="0.25"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeDasharray="6,6"
                    />
                  )}
                  {b.points.length >= 2 && (
                    <polyline
                      points={[...b.points, b.points[0]].map(p => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke={b.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* DOM HTML Badges & Dots for Saved Barangay Boundaries */}
            <div className="absolute inset-0 pointer-events-none z-22 overflow-hidden">
              {savedPixelBoundaries.map((b) => (
                <React.Fragment key={`saved-dom-${b.id}`}>
                  {/* Vertex Dots for every saved point */}
                  {b.points.map((pt, pIdx) => (
                    <div
                      key={`saved-pt-${b.id}-${pIdx}`}
                      style={{ left: `${pt.x}px`, top: `${pt.y}px`, transform: "translate(-50%, -50%)" }}
                      className="absolute pointer-events-none flex flex-col items-center justify-center"
                    >
                      <span className="w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-md ring-2 ring-indigo-300" />
                      <span className="text-[9px] font-black text-white bg-indigo-950/90 px-1 py-0.2 rounded border border-indigo-300 shadow mt-0.5 whitespace-nowrap">
                        #{pIdx + 1}
                      </span>
                    </div>
                  ))}

                  {/* Barangay Name Center Badge */}
                  <div
                    style={{ left: `${b.center.x}px`, top: `${b.center.y}px`, transform: "translate(-50%, -50%)" }}
                    className="absolute pointer-events-none bg-indigo-950/95 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-2xl border-2 border-indigo-300 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>🏛️ {b.barangayName} ({b.points.length} Tuldok)</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {/* ABSOLUTE GUARANTEED REACT DOM SVG & BADGE OVERLAY FOR DRAWN POINTS & LINES */}
        {(drawnPoints.length > 0 || (isDrawingMode && mousePixel)) && (
          <>
            {/* SVG Lines & Polygon Canvas Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              {/* Polygon fill if >= 3 points */}
              {drawShapeType === "polygon" && pixelPoints.length >= 3 && (
                <polygon
                  points={pixelPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill={drawColor}
                  fillOpacity="0.3"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}

              {/* White High-Contrast Outline Polyline */}
              {pixelPoints.length >= 2 && (
                <polyline
                  points={pixelPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
              )}

              {/* Main Vivid Colored Polyline */}
              {pixelPoints.length >= 2 && (
                <polyline
                  points={pixelPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={drawColor}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Live Rubberband Line to Cursor */}
              {isDrawingMode && mousePixel && pixelPoints.length > 0 && (
                <>
                  <line
                    x1={pixelPoints[pixelPoints.length - 1].x}
                    y1={pixelPoints[pixelPoints.length - 1].y}
                    x2={mousePixel.x}
                    y2={mousePixel.y}
                    stroke="#ffffff"
                    strokeWidth="6"
                    strokeDasharray="6,6"
                  />
                  <line
                    x1={pixelPoints[pixelPoints.length - 1].x}
                    y1={pixelPoints[pixelPoints.length - 1].y}
                    x2={mousePixel.x}
                    y2={mousePixel.y}
                    stroke={drawColor}
                    strokeWidth="3.5"
                    strokeDasharray="6,6"
                  />
                  {drawShapeType === "polygon" && pixelPoints.length >= 2 && (
                    <line
                      x1={mousePixel.x}
                      y1={mousePixel.y}
                      x2={pixelPoints[0].x}
                      y2={pixelPoints[0].y}
                      stroke={drawColor}
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />
                  )}
                </>
              )}
            </svg>

            {/* DOM HTML Badges for Every Single Point */}
            <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
              {pixelPoints.map((pt, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === pixelPoints.length - 1;
                return (
                  <div
                    key={`overlay-pin-${idx}-${pt.lat.toFixed(6)}-${pt.lng.toFixed(6)}`}
                    style={{ left: `${pt.x}px`, top: `${pt.y}px`, transform: "translate(-50%, -50%)" }}
                    className="absolute pointer-events-none flex flex-col items-center justify-center"
                  >
                    {/* Glowing outer aura ring */}
                    <span
                      className={`absolute w-12 h-12 rounded-full animate-ping opacity-80 ${
                        isFirst ? "bg-emerald-400" : isLast ? "bg-rose-500" : "bg-blue-500"
                      }`}
                    />

                    {/* Main Solid High-Contrast Number Circle Badge */}
                    <div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full font-black text-[13px] text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] border-2 border-white ${
                        isFirst
                          ? "bg-emerald-600 ring-4 ring-emerald-300"
                          : isLast
                          ? "bg-rose-600 ring-4 ring-rose-300"
                          : "bg-blue-600 ring-4 ring-blue-300"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Tag Label */}
                    <div className="absolute -top-6 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-2xl border ${
                        isFirst
                          ? "bg-emerald-950 border-emerald-400 text-emerald-200"
                          : isLast
                          ? "bg-rose-950 border-rose-400 text-rose-200"
                          : "bg-blue-950 border-blue-400 text-blue-200"
                      }`}>
                        {isFirst ? "▶ SIMULA (#1)" : isLast ? `📌 TULDOK #${idx + 1}` : `#${idx + 1}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Street Inspector Card (When user clicks anywhere on the Leaflet map) */}
        {clickedStreet && (
          <div className="fixed sm:absolute bottom-3 sm:bottom-auto sm:top-3 left-2 right-2 sm:left-3 sm:right-auto z-30 bg-stone-900/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl border border-stone-700 shadow-2xl max-w-sm font-sans animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Search className="h-3.5 w-3.5" />
                <span>Street Inspector 📍</span>
              </div>
              <button
                onClick={() => setClickedStreet(null)}
                className="text-stone-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-md hover:bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-1.5 space-y-1 text-xs">
              <p className="font-bold text-white text-sm leading-snug">
                {clickedStreet.street}
              </p>
              <p className="text-stone-300 text-xs">
                {clickedStreet.barangay}
              </p>

              <div className="pt-2 mt-2 border-t border-stone-800 space-y-1.5 text-[11px] font-mono">
                <div className="bg-stone-800/80 p-2 rounded-xl border border-stone-700/60 flex items-center justify-between">
                  <span className="text-stone-400 text-[10px]">Villa Nava Area:</span>
                  <span className="font-bold text-teal-400 text-xs">
                    ~{clickedStreet.distVillaNava}m ({clickedStreet.walkVillaNava} mins walk 🚶)
                  </span>
                </div>
                <div className="pt-1 flex items-center justify-end text-[10px] text-stone-300 font-sans">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${clickedStreet.lat},${clickedStreet.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    Open Google Maps ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Barangay Boundary Drawer & Editor Floating Panel */}
        {isDrawingMode && (
          <div className="fixed sm:absolute bottom-2 sm:bottom-auto sm:top-3 left-2 right-2 sm:left-auto sm:right-3 z-30 bg-stone-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl border border-stone-700 shadow-2xl max-w-sm w-auto font-sans animate-fade-in max-h-[70vh] sm:max-h-[85vh] overflow-y-auto divide-y divide-stone-800 space-y-3">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-1 gap-2">
              <div className="min-w-0">
                <h4 className="font-display text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5 truncate">
                  <Shapes className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>✏️ Boundary Drawer ({drawnPoints.length} pts)</span>
                </h4>
                {!isDrawingPanelMinimized && (
                  <p className="text-[10px] text-stone-300 mt-0.5 hidden xs:block">
                    Pindutin ang mapa para maglagay ng tuldok ng boundary!
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawingPanelMinimized(prev => !prev)}
                  className="text-stone-300 hover:text-white text-[10px] font-bold px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
                >
                  {isDrawingPanelMinimized ? "Expand ▲" : "Minimize ▼"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawingMode(false)}
                  className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {!isDrawingPanelMinimized && (
              <>
                {/* Shape & Color Settings */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-semibold">Uri ng Boundary:</span>
                    <div className="flex items-center gap-1 bg-stone-800 p-0.5 rounded-xl text-[10px]">
                      <button
                        onClick={() => setDrawShapeType("polygon")}
                        className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          drawShapeType === "polygon" ? "bg-amber-500 text-stone-950" : "text-stone-300"
                        }`}
                      >
                        🔷 Polygon
                      </button>
                      <button
                        onClick={() => setDrawShapeType("polyline")}
                        className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          drawShapeType === "polyline" ? "bg-amber-500 text-stone-950" : "text-stone-300"
                        }`}
                      >
                        〰️ Polyline
                      </button>
                      <button
                        onClick={() => setDrawShapeType("points")}
                        className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          drawShapeType === "points" ? "bg-amber-500 text-stone-950" : "text-stone-300"
                        }`}
                      >
                        📍 Points
                      </button>
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-semibold">Kulay ng Boundary:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { color: "#2563eb", label: "Blue" },
                        { color: "#059669", label: "Emerald" },
                        { color: "#d97706", label: "Amber" },
                        { color: "#7c3aed", label: "Violet" },
                        { color: "#e11d48", label: "Rose" },
                        { color: "#0284c7", label: "Cyan" }
                      ].map((c) => (
                        <button
                          key={c.color}
                          onClick={() => setDrawColor(c.color)}
                          style={{ backgroundColor: c.color }}
                          className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                            drawColor === c.color ? "ring-2 ring-white scale-125" : "opacity-80 hover:opacity-100"
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Active Points List & Coordinate Inputs */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-200 flex items-center gap-1">
                      📍 Active Points ({drawnPoints.length})
                    </span>
                    <div className="flex items-center gap-1 text-[10px]">
                      {drawnPoints.length > 0 && (
                        <>
                          <button
                            onClick={handleUndoPoint}
                            className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-semibold cursor-pointer"
                          >
                            ↩️ Undo
                          </button>
                          <button
                            onClick={handleClearPoints}
                            className="px-2 py-0.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded font-semibold cursor-pointer"
                          >
                            🗑️ Clear
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {drawnPoints.length === 0 ? (
                    <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-800 text-center text-stone-400 text-[11px]">
                      👆 I-click ang anumang bahagi ng mapa para maglagay ng tuldok ng boundary!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[10px] font-mono divide-y divide-stone-800">
                      {drawnPoints.map((p, idx) => (
                        <div key={idx} className="pt-1 flex items-center justify-between gap-1">
                          <span className="text-amber-400 font-bold shrink-0">#{idx + 1}</span>
                          <input
                            type="number"
                            step="0.000001"
                            value={p.lat}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                const newP = [...drawnPoints];
                                newP[idx] = { ...newP[idx], lat: val };
                                setDrawnPoints(newP);
                              }
                            }}
                            className="w-20 bg-stone-800 border border-stone-700 rounded px-1 py-0.5 text-stone-200 focus:outline-none focus:border-amber-500"
                          />
                          <input
                            type="number"
                            step="0.000001"
                            value={p.lng}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                const newP = [...drawnPoints];
                                newP[idx] = { ...newP[idx], lng: val };
                                setDrawnPoints(newP);
                              }
                            }}
                            className="w-20 bg-stone-800 border border-stone-700 rounded px-1 py-0.5 text-stone-200 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={() => {
                              const newP = drawnPoints.filter((_, i) => i !== idx);
                              setDrawnPoints(newP);
                            }}
                            className="text-stone-500 hover:text-rose-400 font-bold px-1"
                            title="Burahin ang tuldok na ito"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Boundary Section */}
                <div className="pt-3 space-y-2">
                  <label className="block text-xs font-semibold text-stone-300">
                    Piliin o Isulat ang Barangay:
                  </label>
                  <select
                    value={selectedBarangayToSave}
                    onChange={(e) => setSelectedBarangayToSave(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold rounded-xl p-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Barangay Tabing Dagat">Barangay Tabing Dagat</option>
                    <option value="Barangay Villa Nava">Barangay Villa Nava</option>
                    <option value="Barangay Peñafrancia">Barangay Peñafrancia</option>
                    <option value="Barangay Pipisik">Barangay Pipisik</option>
                    <option value="Barangay San Diego">Barangay San Diego</option>
                    <option value="Barangay Mabini">Barangay Mabini</option>
                    <option value="Barangay Rizal">Barangay Rizal</option>
                    <option value="Barangay Rosario">Barangay Rosario</option>
                    <option value="Barangay Luna">Barangay Luna</option>
                    <option value="Barangay Burgos">Barangay Burgos</option>
                    <option value="Barangay Castillo">Barangay Castillo</option>
                    <option value="Barangay Gayagayaan">Barangay Gayagayaan</option>
                    <option value="Barangay Hagakhakin">Barangay Hagakhakin</option>
                  </select>

                  <button
                    onClick={handleSaveBoundary}
                    disabled={drawnPoints.length < 2}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed active:scale-95"
                  >
                    <Save className="h-4 w-4" />
                    <span>💾 I-save ang Boundary sa {selectedBarangayToSave}</span>
                  </button>
                </div>

                {/* Saved Barangay Boundaries List & Manual Editor Actions */}
                <div className="pt-3 space-y-2">
                  {showConfirmDeleteAll ? (
                    <div className="bg-rose-950/90 border border-rose-700/80 p-2.5 rounded-xl text-xs space-y-2 text-rose-100 animate-fade-in">
                      <p className="font-bold text-[11px] leading-tight">
                        ⚠️ Sigurado ka bang gusto mong burahin ang LAHAT ng {drawnBarangayBoundaries.length} na-save na barangay boundary?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDrawnBarangayBoundaries([]);
                            localStorage.removeItem("barangay_drawn_boundaries");
                            setSelectedBarangayBoundaryFilter("");
                            setShowConfirmDeleteAll(false);
                            setCopySuccessMsg("🗑️ Matagumpay na nabura ang LAHAT ng na-save na barangay boundary!");
                            setTimeout(() => setCopySuccessMsg(""), 3500);
                          }}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-1.5 px-2 rounded-lg text-[10px] cursor-pointer transition-colors text-center"
                        >
                          Oo, Burahin Lahat
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirmDeleteAll(false)}
                          className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-1.5 px-2 rounded-lg text-[10px] cursor-pointer transition-colors"
                        >
                          Kanselahin
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                      <span>📋 Saved Boundaries ({drawnBarangayBoundaries.length})</span>
                      {drawnBarangayBoundaries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowConfirmDeleteAll(true)}
                          className="text-[10px] bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          🗑️ Burahin Lahat
                        </button>
                      )}
                    </div>
                  )}

                  {drawnBarangayBoundaries.length === 0 ? (
                    <div className="text-[10px] text-stone-400 italic bg-stone-800/40 p-2.5 rounded-xl text-center">
                      Wala pang nai-save na barangay boundary. Iguhit ang iyong unang boundary sa mapa!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {drawnBarangayBoundaries.map((b) => (
                        <div
                          key={b.id}
                          className="bg-stone-800/90 p-2.5 rounded-xl border border-stone-700/80 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                                style={{ backgroundColor: b.color }}
                              />
                              <span>{b.barangayName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-stone-400">
                              {b.points.length} points
                            </span>
                          </div>

                          {/* Editing Actions for this Saved Boundary */}
                          <div className="flex items-center gap-1 pt-1 border-t border-stone-700/50 text-[10px]">
                            <button
                              onClick={() => {
                                // Load existing boundary points into the drawing canvas for editing!
                                setDrawnPoints(b.points.map(p => ({ lat: p[0], lng: p[1] })));
                                setSelectedBarangayToSave(b.barangayName);
                                setDrawColor(b.color);
                                setIsDrawingMode(true);
                              }}
                              className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-center cursor-pointer transition-colors"
                              title="Kargahin ang mga tuldok para i-edit o dagdagan"
                            >
                              ✏️ I-edit ang Points
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBarangayBoundaryFilter(b.barangayName);
                                setShowBoundariesOnMap(true);
                                if (leafletMapRef.current && b.points.length > 0) {
                                  const bounds = L.latLngBounds(b.points);
                                  leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
                                }
                              }}
                              className="py-1 px-2 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg cursor-pointer"
                              title="Tumingin sa mapa"
                            >
                              👁️ View
                            </button>

                            <button
                              onClick={() => handleDeleteBoundary(b.id)}
                              className="py-1 px-2 bg-rose-950/80 hover:bg-rose-800 text-rose-300 font-semibold rounded-lg cursor-pointer"
                              title="Burahin ang boundary"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Hover / Selection Preview Card (Draggable over the map) */}
        {(hoveredProperty || selectedProperty) && mapMode !== "google_embed" && (
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            className="fixed sm:absolute bottom-2 sm:bottom-4 left-2 right-2 sm:left-4 sm:right-auto z-30 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-none sm:max-w-[320px] w-auto font-sans cursor-grab active:cursor-grabbing select-none"
          >
            {(() => {
              const displayProp = hoveredProperty || selectedProperty!;
              const score = getMatchScore(displayProp.id);
              const [lat, lng] = getLatLngForProperty(displayProp);
              const schoolDistances = getSchoolDistancesForProperty(lat, lng);
              const nearestSchool = schoolDistances[0];

              return (
                <div>
                  {/* Drag Handle & Close */}
                  <div className="flex items-center justify-between text-stone-400 mb-2 border-b border-stone-100 pb-1.5 cursor-grab active:cursor-grabbing">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 flex items-center gap-1">
                      <GripHorizontal className="h-3.5 w-3.5 text-stone-400" />
                      <span>I-drag para ilipat ✋</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProperty(null as any);
                      }}
                      className="text-stone-400 hover:text-stone-600 text-xs font-bold px-1 py-0.5 rounded-md hover:bg-stone-100 transition-colors"
                      title="Isara"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex gap-3 items-center">
                    <img
                      src={displayProp.image}
                      alt={displayProp.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-2xl border border-stone-100 shrink-0 shadow-2xs pointer-events-none"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-snug truncate">
                        {displayProp.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5 truncate font-normal">
                        {displayProp.neighborhood || displayProp.address || "Barangay Tabing Dagat"}, {displayProp.city || "Gumaca"}
                      </p>
                      <div className="mt-1.5 inline-block bg-stone-100 text-stone-900 font-bold text-xs px-2.5 py-0.5 rounded-md border border-stone-200/60">
                        ₱{displayProp.price.toLocaleString()} / month
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenDetails) {
                        onOpenDetails(displayProp);
                      }
                    }}
                    className="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-2xl py-2.5 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                  >
                    <span>Tingnan ang detalye</span>
                  </button>

                  {nearestSchool && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                      <span className="truncate">🎓 {nearestSchool.name.split(" ")[0]} ({nearestSchool.distanceKm.toFixed(2)} km)</span>
                      <span className="font-bold text-indigo-600 font-mono shrink-0">{nearestSchool.walkingMinutes}m lakad</span>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                    <button
                      onClick={() => {
                        setTargetPropertyToAdjust(displayProp);
                        setInputLat(lat.toString());
                        setInputLng(lng.toString());
                        setInputGoogleLink("");
                        setAdjustSuccessMsg("");
                        setShowCoordAdjustModal(true);
                      }}
                      className="text-stone-600 hover:text-stone-900 font-bold bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-[9.5px]"
                    >
                      📍 Adjust Coordinates
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 text-[9.5px]"
                    >
                      Google Maps ↗
                    </a>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>

      {/* MODAL: Adjust Exact Property Coordinates Modal */}
      {showCoordAdjustModal && targetPropertyToAdjust && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4 animate-scale-up font-sans">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  📍 Adjust Exact Location Coordinates
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {targetPropertyToAdjust.title}
                </p>
              </div>
              <button
                onClick={() => setShowCoordAdjustModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Paste Google Maps Link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://maps.google.com/?q=13.9218,122.0988..."
                    value={inputGoogleLink}
                    onChange={(e) => setInputGoogleLink(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  />
                  <button
                    onClick={() => handleParseGoogleLink(inputGoogleLink)}
                    className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold cursor-pointer shrink-0"
                  >
                    Extract GPS
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Latitude (e.g. 13.9252):
                  </label>
                  <input
                    type="text"
                    value={inputLat}
                    onChange={(e) => setInputLat(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Longitude (e.g. 122.0975):
                  </label>
                  <input
                    type="text"
                    value={inputLng}
                    onChange={(e) => setInputLng(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  />
                </div>
              </div>

              {adjustSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold">
                  {adjustSuccessMsg}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowCoordAdjustModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const latNum = parseFloat(inputLat);
                  const lngNum = parseFloat(inputLng);
                  if (!isNaN(latNum) && !isNaN(lngNum)) {
                    targetPropertyToAdjust.coordinates = { x: latNum, y: lngNum };
                    setAdjustSuccessMsg("✅ Location updated successfully!");
                    setTimeout(() => {
                      setShowCoordAdjustModal(false);
                    }, 800);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Exact Coordinates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
