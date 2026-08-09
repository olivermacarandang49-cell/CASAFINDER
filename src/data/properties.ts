export interface ReviewReply {
  id: string;
  authorName: string;
  authorUsername: string;
  authorRole: 'landlord' | 'student';
  comment: string;
  date: string;
}

export interface Review {
  id: string;
  studentName: string;
  studentUsername: string;
  rating: number; // 1 to 5
  comment?: string;
  date: string;
  replies?: ReviewReply[];
}

export interface LandlordPermits {
  businessPermit?: string;
  barangayClearance?: string;
  dtiRegistration?: string;
  fireSafetyCert?: string;
  sanitaryPermit?: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  type: 'Boarding House' | 'Apartment' | 'Others' | string;
  beds: number;
  baths: number;
  sqft: number; // Stated as square meters in the description
  address: string;
  city: string;
  neighborhood: string; // Barangay
  description: string;
  image: string;
  features: string[];
  tags: string[];
  yearBuilt: number;
  parking: string;
  heating: string; // Representing cooling/ventilation
  coordinates: { x: number; y: number };
  genderPolicy?: 'Girls Only' | 'Boys Only' | 'Both';
  reviews?: Review[];
  landlordUsername?: string;
  landlordName?: string;
  landlordMobile?: string;
  landlordEmail?: string;
  landlordFacebook?: string;
  landlordAvatar?: string;
  landlordBio?: string;
  landlordPermits?: LandlordPermits;
}

export const properties: Property[] = [];
