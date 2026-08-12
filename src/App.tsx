import React, { useState, useMemo, useEffect } from "react";
import { Property } from "./data/properties";
import { studentDemoProperties } from "./data/studentDemos";
import PropertyCard from "./components/PropertyCard";
import PropertyModal from "./components/PropertyModal";
import LandlordProfileModal from "./components/LandlordProfileModal";
import AboutModal from "./components/AboutModal";
import NeighborhoodMap from "./components/NeighborhoodMap";
import { PostingLocationMap, getNeighborhoodDefaultLatLng } from "./components/PostingLocationMap";
import { getTranslation, Language } from "./utils/translations";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Filter,
  Home,
  MapPin,
  X,
  Plus,
  Camera,
  Trash2,
  Check,
  Loader2,
  LogOut,
  User,
  UserCog,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Building,
  Users,
  Mail,
  Phone,
  Upload,
  Settings,
  Bell,
  Save,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Info,
  Award,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  KeyRound,
  ArrowLeft,
  HelpCircle,
  Sun,
  Moon,
  Globe,
  Languages,
  Smartphone,
  Laptop,
  Fingerprint,
  AlertTriangle,
  Activity,
  Facebook,
  PhoneCall
} from "lucide-react";

// Pre-defined room image presets to make listings look beautiful instantly
const IMAGE_PRESETS = [
  {
    url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    label: "Cozy Bedspace"
  },
  {
    url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    label: "Student Dormitory Room"
  },
  {
    url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    label: "Shared Room / Study Space"
  },
  {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    label: "Modern Studio Apartment"
  }
];

// Pre-defined student-friendly amenities/features
const AMENITY_PRESETS = [
  "Wi-Fi / Internet",
  "Aircon",
  "Electric Fan",
  "Study Desk & Chair",
  "Cooking Allowed / Kitchen",
  "Private Bathroom",
  "Shared Bathroom",
  "Bed & Mattress Included",
  "Cabinet / Wardrobe",
  "Submetered Electricity",
  "Free / Submetered Water",
  "Laundry / Washing Area",
  "CCTV Security & Gated",
  "No Curfew (24/7 Access)",
  "Drinking Water Station",
  "Refrigerator Access",
  "Motorcycle Parking"
];

// Complete Gumaca Barangays List
const GUMACA_BARANGAYS = [
  "Barangay Tabing Dagat",
  "Barangay Villa Nava",
  "Barangay Peñafrancia",
  "Barangay Pipisik",
  "Barangay San Diego",
  "Barangay Rizal",
  "Barangay Bagong Buhay",
  "Barangay Mabini",
  "Barangay Maunlad",
  "Barangay Buensuceso",
  "Barangay Progreso Purok 1",
  "Barangay Rosario"
];

export default function App() {
  // Loading and Authentication States
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot" | "adminLogin">("login");
  const DEFAULT_DEMO_USERS = [
    { name: "Juan Dela Cruz", username: "juan.student", role: "student" as const, password: "123", email: "juan.delacruz@gmail.com", mobile: "09171234567", facebook: "https://facebook.com/juan.delacruz", school: "SLSU Gumaca Campus", bio: "Tenant & College Student looking for room near SLSU Campus", address: "Brgy. Mabini, Gumaca, Quezon", emergencyContact: "Maria Dela Cruz (09181112222)", avatar: "🎓", permitNo: "", permitFile: "", permitStatus: "" },
    { name: "Aling Nena", username: "nena.landlord", role: "landlord" as const, password: "123", email: "alingnena.housing@gmail.com", mobile: "09987654321", facebook: "https://facebook.com/alingnena.housing", school: "Nena's Student & Worker Residences", bio: "Owner of Nena's Student & Worker Residences in Brgy. Tabing Dagat, Gumaca. Providing clean and safe lodgings for tenants since 2018.", address: "Brgy. Tabing Dagat, Gumaca, Quezon", emergencyContact: "Barangay Office (042-311-1234)", avatar: "🏠", permitNo: "2026-0881", permitFile: "Mayors_Permit_2026.pdf", permitStatus: "Verified" },
    { name: "Gumaca LGU Housing Admin", username: "admin.gumaca", role: "admin" as const, password: "admin", email: "admin.housing@gumaca.gov.ph", mobile: "09190008888", facebook: "https://facebook.com/gumaca.lgu", school: "Municipal Housing Regulatory Office", bio: "Authorized Municipal Housing Regulatory Officer for Gumaca, Quezon. Overseeing safety compliance, mayor's permits, and student dorm welfare.", address: "Municipal Hall, Brgy. San Diego, Gumaca, Quezon", emergencyContact: "Mayor's Office (042-311-9999)", avatar: "🛡️", permitNo: "SYS-ADMIN-01", permitFile: "LGU_System_Auth.pdf", permitStatus: "System Admin" },
    { name: "Campus Housing Officer", username: "admin.campus", role: "admin" as const, password: "admin", email: "housing.officer@slsu.edu.ph", mobile: "09190007777", facebook: "https://facebook.com/slsu.gumaca.housing", school: "SLSU & EQC Student Affairs Office", bio: "Official Student Housing Coordinator for SLSU & Eastern Quezon College. Verifying accreditation and safety for student lodgings.", address: "SLSU Campus, Brgy. Mabini, Gumaca, Quezon", emergencyContact: "Campus Security (042-311-8888)", avatar: "👑", permitNo: "SYS-ADMIN-02", permitFile: "SLSU_Officer_Auth.pdf", permitStatus: "System Admin" }
  ];

  const [registeredUsers, setRegisteredUsers] = useState<{ name: string; username: string; role: "student" | "landlord" | "admin"; password?: string; email?: string; mobile?: string; school?: string; bio?: string; address?: string; emergencyContact?: string; avatar?: string; facebook?: string; permitNo?: string; permitFile?: string; permitStatus?: string }[]>(() => {
    const saved = localStorage.getItem("casafinder_registered_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAdmin1 = parsed.some((u: any) => u.username === "admin.gumaca");
          const hasAdmin2 = parsed.some((u: any) => u.username === "admin.campus");
          if (hasAdmin1 && hasAdmin2) return parsed;
          return [
            ...parsed.filter((u: any) => u.username !== "admin.gumaca" && u.username !== "admin.campus"),
            DEFAULT_DEMO_USERS[2],
            DEFAULT_DEMO_USERS[3]
          ];
        }
      } catch (e) {
        console.error("Failed to parse saved users:", e);
      }
    }
    localStorage.setItem("casafinder_registered_users", JSON.stringify(DEFAULT_DEMO_USERS));
    return DEFAULT_DEMO_USERS;
  });

  const [userSession, setUserSession] = useState<{ role: "student" | "landlord" | "admin"; name: string; username: string } | null>(() => {
    const saved = localStorage.getItem("casafinder_user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.username === "juan.student" || parsed?.username === "nena.landlord" || parsed?.username === "admin.gumaca" || parsed?.username === "admin.campus" || parsed?.role === "admin") {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem("casafinder_user_session");
    return null;
  });

  // Login Form States
  const [loginRole, setLoginRole] = useState<"student" | "landlord" | "admin">("student");
  const [loginName, setLoginName] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [loginError, setLoginError] = useState("");

  // Forgot Password States
  const [forgotQuery, setForgotQuery] = useState("");
  const [forgotFoundUser, setForgotFoundUser] = useState<{ name: string; username: string; role: "student" | "landlord"; password?: string; email?: string; mobile?: string; facebook?: string; school?: string; bio?: string } | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");

  // Welcome / Onboarding Modal States
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [onboardingName, setOnboardingName] = useState("");
  const [onboardingMobile, setOnboardingMobile] = useState("");
  const [onboardingAddress, setOnboardingAddress] = useState("");
  const [onboardingEmergencyContact, setOnboardingEmergencyContact] = useState("");
  const [onboardingAvatar, setOnboardingAvatar] = useState("");
  const [onboardingSchool, setOnboardingSchool] = useState("");
  const [onboardingBio, setOnboardingBio] = useState("");
  const [onboardingFacebook, setOnboardingFacebook] = useState("");

  // Profile & Settings Modal & Dropdown Menu State
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "settings" | "notifications" | "about">("profile");
  const [profileEditName, setProfileEditName] = useState("");
  const [profileEditEmail, setProfileEditEmail] = useState("");
  const [profileEditMobile, setProfileEditMobile] = useState("");
  const [profileEditAddress, setProfileEditAddress] = useState("");
  const [profileEditEmergencyContact, setProfileEditEmergencyContact] = useState("");
  const [profileEditAvatar, setProfileEditAvatar] = useState("");
  const [profileEditFacebook, setProfileEditFacebook] = useState("");
  const [profileEditSchool, setProfileEditSchool] = useState("");
  const [profileEditBio, setProfileEditBio] = useState("");
  const [profileEditPermitNo, setProfileEditPermitNo] = useState("");
  const [profileEditPermitFile, setProfileEditPermitFile] = useState("");
  const [profileEditPermitStatus, setProfileEditPermitStatus] = useState("Verified");
  const [profileEditPassword, setProfileEditPassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [showProfileCurrentPassword, setShowProfileCurrentPassword] = useState(false);
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => {
    return localStorage.getItem("casafinder_2fa") === "true";
  });
  const [securityPin, setSecurityPin] = useState(() => {
    return localStorage.getItem("casafinder_pin") || "1234";
  });
  const [showSecurityPin, setShowSecurityPin] = useState(false);
  const [activeSessions, setActiveSessions] = useState(() => {
    const saved = localStorage.getItem("casafinder_active_sessions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Dynamically detect user's current real device/browser
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    let browser = "Web Browser";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    let os = "Desktop";
    if (/Android/i.test(ua)) os = "Android Mobile";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iPhone / iOS";
    else if (/Windows/i.test(ua)) os = "Windows PC";
    else if (/Macintosh|Mac OS X/i.test(ua)) os = "Mac Desktop";
    else if (/Linux/i.test(ua)) os = "Linux PC";

    const realDevice = `${browser} / ${os}`;

    return [
      { id: 1, device: realDevice, location: "Gumaca, Quezon (Current)", ip: "Current Connection", time: "Active Now", current: true }
    ];
  });
  const [securityMsg, setSecurityMsg] = useState("");
  const [securityErrorMsg, setSecurityErrorMsg] = useState("");
  const [prefEmailNotifications, setPrefEmailNotifications] = useState(() => {
    const saved = localStorage.getItem("casafinder_pref_email");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [prefSmsAlerts, setPrefSmsAlerts] = useState(() => {
    const saved = localStorage.getItem("casafinder_pref_sms");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [prefAutoShowMap, setPrefAutoShowMap] = useState(() => {
    const saved = localStorage.getItem("casafinder_pref_map");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [prefLanguage, setPrefLanguage] = useState<"tagalog" | "english">(() => {
    return (localStorage.getItem("casafinder_pref_language") as "tagalog" | "english") || "english";
  });
  const [prefTheme, setPrefTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("casafinder_pref_theme") as "light" | "dark") || "light";
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [mobileMapTab, setMobileMapTab] = useState<"map" | "list">("map");

  // Admin & Landlord Approval States
  const [adminTabFilter, setAdminTabFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [showLandlordPendingOnly, setShowLandlordPendingOnly] = useState(false);

  useEffect(() => {
    if (prefTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("casafinder_pref_theme", prefTheme);
  }, [prefTheme]);

  useEffect(() => {
    localStorage.setItem("casafinder_pref_language", prefLanguage);
  }, [prefLanguage]);

  useEffect(() => {
    localStorage.setItem("casafinder_pref_email", JSON.stringify(prefEmailNotifications));
  }, [prefEmailNotifications]);

  useEffect(() => {
    localStorage.setItem("casafinder_pref_sms", JSON.stringify(prefSmsAlerts));
  }, [prefSmsAlerts]);

  useEffect(() => {
    localStorage.setItem("casafinder_pref_map", JSON.stringify(prefAutoShowMap));
  }, [prefAutoShowMap]);

  // Translation helper based on preferred language
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(prefLanguage, key);

  // Application State - Load saved user properties or default to empty
  const [propertiesList, setPropertiesList] = useState<Property[]>(() => {
    const saved = localStorage.getItem("gumaca_student_properties_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved properties:", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("gumaca_student_properties_v2", JSON.stringify(propertiesList));
  }, [propertiesList]);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailModalProperty, setDetailModalProperty] = useState<Property | null>(null);
  const [showMapPage, setShowMapPage] = useState(false);

  // Homeowner Add Property Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newType, setNewType] = useState<"Boarding House" | "Apartment" | "Others">("Boarding House");
  const [newBeds, setNewBeds] = useState(1);
  const [newBaths, setNewBaths] = useState(1);
  const [newSqft, setNewSqft] = useState(15);
  const [newAddress, setNewAddress] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("Barangay Tabing Dagat");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [newSelectedAmenities, setNewSelectedAmenities] = useState<string[]>([]);
  const [newParking, setNewParking] = useState("No Parking");
  const [newCooling, setNewCooling] = useState("Electric Fan");
  const [newGenderPolicy, setNewGenderPolicy] = useState<"Both" | "Girls Only" | "Boys Only">("Both");
  const [newCustomLat, setNewCustomLat] = useState<number | null>(null);
  const [newCustomLng, setNewCustomLng] = useState<number | null>(null);
  const [isPinCustomized, setIsPinCustomized] = useState(false);

  // Landlord Profile Modal State
  const [landlordProfileProperty, setLandlordProfileProperty] = useState<Property | null>(null);

  // Selected School Filter for Map Route Line
  const [selectedSchoolIdForMap, setSelectedSchoolIdForMap] = useState<string>("none");

  const handleViewOnMap = (prop: Property, schoolId?: string) => {
    setSelectedProperty(prop);
    setSelectedSchoolIdForMap(schoolId || "none");
    setShowMapPage(true);
    setMobileMapTab("map");
  };

  // Search Option Inputs State (User's selections before clicking Search)
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [boardingHouseSearchQuery, setBoardingHouseSearchQuery] = useState("");
  const [barangaySearchQuery, setBarangaySearchQuery] = useState("");
  const [barangayInput, setBarangayInput] = useState("All");
  const [typeInput, setTypeInput] = useState("All");
  const [priceInput, setPriceInput] = useState("All");
  const [amenityGenderInput, setAmenityGenderInput] = useState<"All" | "Both" | "Girls Only" | "Boys Only">("All");

  // Active filter states (only applied when clicking the Search button)
  const [activeBarangay, setActiveBarangay] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [activePriceRange, setActivePriceRange] = useState("All");
  const [activeAmenityGender, setActiveAmenityGender] = useState<"All" | "Both" | "Girls Only" | "Boys Only">("All");

  // Simulate startup loading screen with dynamic progress
  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setLoadingProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      } else {
        setLoadingProgress(currentProgress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Persist user session
  useEffect(() => {
    if (userSession) {
      localStorage.setItem("casafinder_user_session", JSON.stringify(userSession));
    } else {
      localStorage.removeItem("casafinder_user_session");
    }
  }, [userSession]);

  // Persist registered users
  useEffect(() => {
    localStorage.setItem("casafinder_registered_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Persist properties to local storage
  useEffect(() => {
    localStorage.setItem("gumaca_student_properties", JSON.stringify(propertiesList));
  }, [propertiesList]);

  // Prevent background scrolling when any modal (Welcome slides onboarding, Auth, Profile, About, Add Listing, Property details) is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      !userSession ||
      showOnboardingModal ||
      showProfileModal ||
      showAboutModal ||
      showAddModal ||
      detailModalProperty ||
      landlordProfileProperty
    );

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [userSession, showOnboardingModal, showProfileModal, showAboutModal, showAddModal, detailModalProperty, landlordProfileProperty]);

  // Landlord tool: Seed beautiful student-friendly Gumaca listings
  const handleSeedListings = () => {
    import("./data/studentDemos").then((mod) => {
      setPropertiesList(mod.studentDemoProperties);
    });
  };

  // Landlord tool: Clear all listings to start completely fresh
  const handleClearAllListings = () => {
    setPropertiesList([]);
    setSelectedProperty(null);
  };

  // Handle Login and Signup submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const usernameVal = loginUsername.trim().toLowerCase();
    const contactVal = signupEmail.trim();
    const displayName = usernameVal ? usernameVal.charAt(0).toUpperCase() + usernameVal.slice(1) : "User";
    
    if (authMode === "signup") {
      if (!usernameVal || !contactVal || !loginPassword.trim()) {
        setLoginError(
          prefLanguage === "tagalog"
            ? "Paki-kumpleto ang iyong Email/Mobile Number, Username, at Password!"
            : "Please fill in your Email or Mobile Number, Username, and Password!"
        );
        return;
      }
      
      // Check if username already exists
      const existingUsername = registeredUsers.find(
        u => u.username.trim().toLowerCase() === usernameVal
      );
      if (existingUsername) {
        setLoginError(
          prefLanguage === "tagalog"
            ? "Gamit na ang Username na ito! Paki-pili ng iba."
            : "This username is already taken! Please choose another one."
        );
        return;
      }

      // Check if email or mobile already registered
      const existingContact = registeredUsers.find(u => {
        const uEmail = (u.email || "").trim().toLowerCase();
        const uMobile = (u.mobile || "").trim();
        return (uEmail && uEmail === contactVal.toLowerCase()) || (uMobile && uMobile === contactVal);
      });

      if (existingContact) {
        setLoginError(
          prefLanguage === "tagalog"
            ? "Nakarehistro na ang Email o Mobile Number na ito! Paki-log in na lamang."
            : "This Email or Mobile Number is already registered! Please log in instead."
        );
        return;
      }

      const isEmail = contactVal.includes("@");

      // Create new user
      const newUser = {
        name: displayName,
        username: usernameVal,
        role: loginRole,
        password: loginPassword,
        email: isEmail ? contactVal.toLowerCase() : "",
        mobile: !isEmail ? contactVal : "",
        school: "",
        bio: "",
        permitNo: "",
        permitFile: "",
        permitStatus: ""
      };

      setRegisteredUsers(prev => [...prev, newUser]);
      
      // Auto login
      setUserSession({
        role: loginRole,
        name: displayName,
        username: usernameVal
      });

      // Show onboarding welcome modal
      setOnboardingSlide(0);
      setOnboardingName(displayName);
      setOnboardingSchool("");
      setOnboardingBio("");
      setOnboardingFacebook("");
      setShowOnboardingModal(true);

      // Reset
      setLoginName("");
      setLoginUsername("");
      setLoginPassword("");
      setSignupEmail("");
      setSignupMobile("");
      setLoginError("");
    } else {
      // Login mode - accept Username OR Email OR Mobile Number
      const input = loginUsername.trim().toLowerCase();
      if (!input || !loginPassword.trim()) {
        setLoginError(
          prefLanguage === "tagalog"
            ? "Paki-lagay ang iyong Username/Email at Password!"
            : "Please enter your Username, Email, or Mobile Number, and Password!"
        );
        return;
      }

      const user = registeredUsers.find(u => {
        const uName = u.username.trim().toLowerCase();
        const uEmail = (u.email || "").trim().toLowerCase();
        const uMobile = (u.mobile || "").trim();
        return uName === input || (uEmail && uEmail === input) || (uMobile && uMobile === input);
      });
      
      if (!user) {
        setLoginError(
          prefLanguage === "tagalog"
            ? "Wala pang account na nakarehistro sa Username/Email na ito. Paki-Sign Up muna!"
            : "This account is not registered yet. Please Sign Up first!"
        );
        return;
      }

      if (authMode === "adminLogin" || loginRole === "admin") {
        if (user.role !== "admin") {
          setLoginError(
            prefLanguage === "tagalog"
              ? "Ang account na ito ay hindi rehistradong Admin! Paki-gamit ang pampublikong login."
              : "This account is not a registered System Admin! Please use public login."
          );
          return;
        }
      } else {
        if (user.role !== loginRole) {
          setLoginError(
            prefLanguage === "tagalog"
              ? `Ang account na ito ay nakarehistro bilang ${user.role === "student" ? "Tenant / Umuupa" : user.role === "landlord" ? "Landlord" : "Admin"}. Paki-pili ang tamang role sa itaas.`
              : `This account is registered as a ${user.role === "student" ? "Tenant" : user.role === "landlord" ? "Landlord" : "Admin"}. Please select the correct role above.`
          );
          return;
        }
      }

      if (user.password && user.password !== loginPassword) {
        setLoginError(
          prefLanguage === "tagalog"
            ? "Maling password! Paki-subukan muli."
            : "Incorrect password! Please try again."
        );
        return;
      }

      // Successful login
      const session = {
        role: user.role,
        name: user.name,
        username: user.username
      };
      setUserSession(session);
      localStorage.setItem("casafinder_user_session", JSON.stringify(session));

      const isDemo = ["juan.student", "nena.landlord", "admin.gumaca", "admin.campus"].includes(user.username);
      const alreadyOnboarded = localStorage.getItem(`casafinder_onboarded_${user.username}`);

      if (isDemo || alreadyOnboarded) {
        setShowOnboardingModal(false);
      } else {
        // Show onboarding welcome modal for first time users
        setOnboardingSlide(0);
        setOnboardingName(user.name || "");
        setOnboardingMobile(user.mobile || "");
        setOnboardingAddress(user.address || "");
        setOnboardingEmergencyContact(user.emergencyContact || "");
        setOnboardingAvatar(user.avatar || (user.role === "student" ? "🎓" : user.role === "landlord" ? "🏠" : "🛡️"));
        setOnboardingSchool(user.school || "");
        setOnboardingBio(user.bio || "");
        setOnboardingFacebook((user as any).facebook || "");
        setShowOnboardingModal(true);
      }

      // Reset
      setLoginName("");
      setLoginUsername("");
      setLoginPassword("");
      setSignupEmail("");
      setSignupMobile("");
      setLoginError("");
    }
  };

  // Onboarding Save Handler
  const handleSaveOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession) return;

    const newName = onboardingName.trim() || userSession.name;

    const updatedUsers = registeredUsers.map(u => {
      if (u.username === userSession.username) {
        return {
          ...u,
          name: newName,
          mobile: onboardingMobile.trim() || u.mobile,
          address: onboardingAddress.trim() || u.address,
          emergencyContact: onboardingEmergencyContact.trim() || u.emergencyContact,
          avatar: onboardingAvatar.trim() || u.avatar,
          school: onboardingSchool.trim() || u.school,
          bio: onboardingBio.trim() || u.bio,
          facebook: onboardingFacebook.trim() || (u as any).facebook || "",
        };
      }
      return u;
    });

    setRegisteredUsers(updatedUsers);
    localStorage.setItem("casafinder_registered_users", JSON.stringify(updatedUsers));
    setUserSession(prev => prev ? { ...prev, name: newName } : null);
    setShowOnboardingModal(false);
  };

  // Forgot Password: Search Account handler
  const handleSearchForgotAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const query = forgotQuery.trim().toLowerCase();
    if (!query) {
      setLoginError("Please enter your Username, Email, or Mobile Number.");
      return;
    }

    const found = registeredUsers.find(
      u => u.username.toLowerCase() === query ||
           (u.email && u.email.toLowerCase() === query) ||
           (u.mobile && u.mobile.trim() === query)
    );

    if (!found) {
      setLoginError("No account found for these details. Please check spelling or Sign Up.");
      setForgotFoundUser(null);
    } else {
      setLoginError("");
      setForgotFoundUser(found);
    }
  };

  // Forgot Password: Reset Password handler
  const handleResetForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotFoundUser) return;

    if (!forgotNewPassword.trim()) {
      setLoginError("Please enter your new password.");
      return;
    }

    if (forgotNewPassword.trim().length < 3) {
      setLoginError("Password must be at least 3 characters long.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setLoginError("Passwords do not match. Please try again.");
      return;
    }

    const updatedUsers = registeredUsers.map(u => {
      if (u.username === forgotFoundUser.username) {
        return {
          ...u,
          password: forgotNewPassword.trim()
        };
      }
      return u;
    });

    setRegisteredUsers(updatedUsers);
    localStorage.setItem("casafinder_registered_users", JSON.stringify(updatedUsers));

    setForgotSuccessMsg("Successfully reset your password! You can now log in with your new password.");
    setLoginError("");
  };

  // Handle direct Quick Demo logins
  const handleQuickLogin = (role: "student" | "landlord" | "admin") => {
    const demoUser = registeredUsers.find(u => u.role === role) || (
      role === "student" ? DEFAULT_DEMO_USERS[0] : role === "landlord" ? DEFAULT_DEMO_USERS[1] : DEFAULT_DEMO_USERS[2]
    );
    const session = {
      role: role,
      name: demoUser.name,
      username: demoUser.username
    };
    setUserSession(session);
    localStorage.setItem("casafinder_user_session", JSON.stringify(session));
    localStorage.setItem(`casafinder_onboarded_${demoUser.username}`, "true");
    
    // Close welcome onboarding wizard for quick demo logins
    setShowOnboardingModal(false);
    setOnboardingSlide(0);
  };

  // Handle Sign Out
  const handleSignOut = () => {
    setUserSession(null);
    setSelectedProperty(null);
  };

  // Handle Profile Modal open and populate user info
  const handleOpenProfile = () => {
    if (!userSession) return;
    const current = registeredUsers.find(u => u.username === userSession.username) || {
      name: userSession.name,
      username: userSession.username,
      role: userSession.role,
      email: "",
      mobile: "",
      address: "",
      emergencyContact: "",
      avatar: "",
      password: "",
      school: "",
      bio: ""
    };
    setProfileEditName(current.name || userSession.name);
    setProfileEditEmail(current.email || "");
    setProfileEditMobile(current.mobile || "");
    setProfileEditAddress(current.address || "");
    setProfileEditEmergencyContact(current.emergencyContact || "");
    setProfileEditAvatar(current.avatar || (current.role === "student" ? "🎓" : "🏠"));
    setProfileEditFacebook(current.facebook || "");
    setProfileEditSchool(current.school || "");
    setProfileEditBio(current.bio || "");
    setProfileEditPermitNo(current.permitNo || "");
    setProfileEditPermitFile(current.permitFile || "");
    setProfileEditPermitStatus(current.permitStatus || "");
    setProfileEditPassword("");
    setProfileCurrentPassword("");
    setProfileConfirmPassword("");
    setSecurityMsg("");
    setSecurityErrorMsg("");
    setProfileSuccessMsg("");
    setProfileTab("profile");
    setShowProfileModal(true);
  };

  const handleOpenProfileTab = (tab: "profile" | "settings" | "notifications" | "about" = "profile") => {
    handleOpenProfile();
    setProfileTab(tab);
  };

  // Handle Profile update save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession) return;

    setSecurityErrorMsg("");
    setSecurityMsg("");

    // Validation for Security & Password tab
    if (profileTab === "settings" && profileEditPassword.trim()) {
      if (profileConfirmPassword && profileEditPassword !== profileConfirmPassword) {
        setSecurityErrorMsg(
          prefLanguage === "tagalog"
            ? "Hindi nagmamatch ang Bagong Password at Confirm Password!"
            : "New Password and Confirm Password do not match!"
        );
        return;
      }
    }

    // Save Security Preferences
    localStorage.setItem("casafinder_2fa", JSON.stringify(is2FAEnabled));
    localStorage.setItem("casafinder_pin", securityPin);

    const updatedUsers = registeredUsers.map(u => {
      if (u.username === userSession.username) {
        return {
          ...u,
          name: profileEditName.trim() || u.name,
          email: profileEditEmail.trim(),
          mobile: profileEditMobile.trim(),
          address: profileEditAddress.trim(),
          emergencyContact: profileEditEmergencyContact.trim(),
          avatar: profileEditAvatar.trim(),
          facebook: profileEditFacebook.trim(),
          school: profileEditSchool.trim(),
          bio: profileEditBio.trim(),
          permitNo: profileEditPermitNo.trim(),
          permitFile: profileEditPermitFile.trim(),
          permitStatus: profileEditPermitStatus,
          password: profileEditPassword.trim() || u.password,
        };
      }
      return u;
    });

    setRegisteredUsers(updatedUsers);
    localStorage.setItem("casafinder_registered_users", JSON.stringify(updatedUsers));

    const updatedSession = {
      ...userSession,
      name: profileEditName.trim() || userSession.name
    };
    setUserSession(updatedSession);
    localStorage.setItem("casafinder_user_session", JSON.stringify(updatedSession));

    if (profileTab === "settings") {
      setSecurityMsg(
        prefLanguage === "tagalog"
          ? "Matagumpay na na-update ang iyong Security, Password, at PIN!"
          : "Your Security, Password, and PIN settings have been saved successfully!"
      );
    } else {
      setProfileSuccessMsg(
        prefLanguage === "tagalog"
          ? "Matagumpay na na-update ang iyong Profile!"
          : "Your profile details have been saved successfully!"
      );
    }

    // Sync landlord properties with new profile details
    if (userSession.role === "landlord") {
      setPropertiesList((prev) =>
        prev.map((p) => {
          if (
            (p.landlordUsername && p.landlordUsername.toLowerCase() === userSession.username.toLowerCase()) ||
            (p.landlordName && p.landlordName.toLowerCase() === userSession.name.toLowerCase())
          ) {
            return {
              ...p,
              landlordName: profileEditName.trim() || p.landlordName,
              landlordMobile: profileEditMobile.trim() || p.landlordMobile,
              landlordEmail: profileEditEmail.trim() || p.landlordEmail,
              landlordBio: profileEditBio.trim() || p.landlordBio,
              landlordPermits: {
                ...p.landlordPermits,
                businessPermit: profileEditPermitNo.trim() ? `BP-GMC-${profileEditPermitNo.trim()}` : p.landlordPermits?.businessPermit
              }
            };
          }
          return p;
        })
      );
    }

    setProfileSuccessMsg(
      prefLanguage === "english"
        ? "Successfully saved your Profile and Settings! ✨"
        : "Na-save nang matagumpay ang iyong Profile at Settings! ✨"
    );
    setTimeout(() => {
      setProfileSuccessMsg("");
    }, 4000);
  };

  // Trigger filters on Search Button click
  const handleSearch = () => {
    if (barangaySearchQuery) {
      setActiveBarangay(barangaySearchQuery);
    } else {
      setActiveBarangay(barangayInput);
    }
    setActiveType(typeInput);
    setActivePriceRange(priceInput);
    setActiveAmenityGender(amenityGenderInput);
  };

  // Reset all search and filter options
  const handleResetFilters = () => {
    setBoardingHouseSearchQuery("");
    setBarangaySearchQuery("");
    setBarangayInput("All");
    setTypeInput("All");
    setPriceInput("All");
    setAmenityGenderInput("All");
    setActiveBarangay("All");
    setActiveType("All");
    setActivePriceRange("All");
    setActiveAmenityGender("All");
  };

  // Handle toggle of amenities in creation form
  const toggleAmenity = (amenity: string) => {
    setNewSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Handle image file upload (Landlord uploads real photos from device gallery/camera)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        alert("Image size exceeds 12MB. Please choose a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewImageUrl(reader.result);
          setUploadedFileName(file.name);
          setIsCustomUpload(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open landlord listing modal initialized with default Gumaca location
  const handleOpenAddModal = () => {
    setNewTitle("");
    setNewPrice("");
    setNewAddress("");
    setNewNeighborhood("Barangay Tabing Dagat");
    setNewDescription("");
    setNewImageUrl("");
    setUploadedFileName("");
    setIsCustomUpload(false);
    setNewSelectedAmenities([]);
    setIsPinCustomized(false);
    setNewCustomLat(null);
    setNewCustomLng(null);
    setShowAddModal(true);
  };

  // Submitting a new custom landlord property listing
  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice || !newAddress.trim()) {
      alert("Please fill in the Title, Price, and Address for your Boarding House or Apartment!");
      return;
    }

    const finalImage = newImageUrl || IMAGE_PRESETS[0].url;

    // Parse coordinates if landlord selected pin or used GPS on Map
    let finalLat = 13.9232;
    let finalLng = 122.1014;

    if (newCustomLat !== null && newCustomLng !== null) {
      finalLat = newCustomLat;
      finalLng = newCustomLng;
    } else {
      const defaultCoords = getNeighborhoodDefaultLatLng(newNeighborhood);
      finalLat = defaultCoords[0];
      finalLng = defaultCoords[1];
    }

    const currentLandlordObj = registeredUsers.find((u) => u.username === userSession?.username);
    const landlordName = userSession?.name || "Aling Nena";
    const landlordUsername = userSession?.username || "nena.landlord";
    const landlordMobile = currentLandlordObj?.mobile || "09987654321";
    const landlordEmail = currentLandlordObj?.email || `${landlordUsername}@casafinder.ph`;
    const landlordBio = currentLandlordObj?.bio || (prefLanguage === "tagalog"
      ? "Rehistradong Operator at May-ari ng Boarding House sa Gumaca, Quezon."
      : "Registered Boarding House & Accommodation Owner in Gumaca, Quezon.");
    const landlordPermitNo = currentLandlordObj?.permitNo;

    const newProperty: Property = {
      id: "prop-" + Date.now(),
      title: newTitle,
      price: Number(newPrice),
      type: newType,
      beds: Number(newBeds),
      baths: Number(newBaths),
      sqft: Number(newSqft),
      address: newAddress,
      city: "Gumaca",
      neighborhood: newNeighborhood,
      description: newDescription || `${newType} in ${newNeighborhood} near student facilities.`,
      image: finalImage,
      features: newSelectedAmenities.length > 0 ? newSelectedAmenities : ["Bedspace Provided"],
      tags: newSelectedAmenities.slice(0, 3).length > 0 ? newSelectedAmenities.slice(0, 3) : [newType, "Student-friendly"],
      yearBuilt: new Date().getFullYear(),
      parking: newParking,
      heating: newCooling,
      coordinates: {
        x: Number(finalLat.toFixed(5)),
        y: Number(finalLng.toFixed(5))
      },
      genderPolicy: newGenderPolicy,
      landlordUsername: landlordUsername,
      landlordName: landlordName,
      landlordMobile: landlordMobile,
      landlordEmail: landlordEmail,
      landlordAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      landlordBio: landlordBio,
      approvalStatus: userSession?.role === "admin" ? "approved" : "pending",
      landlordPermits: landlordPermitNo ? {
        businessPermit: landlordPermitNo.startsWith("BP-") ? landlordPermitNo : `BP-GMC-${landlordPermitNo}`
      } : undefined
    };

    setPropertiesList(prev => [newProperty, ...prev]);

    // Reset Form Fields
    setNewTitle("");
    setNewPrice("");
    setNewType("Boarding House");
    setNewBeds(1);
    setNewBaths(1);
    setNewSqft(15);
    setNewAddress("");
    setNewNeighborhood("Barangay Tabing Dagat");
    setNewDescription("");
    setNewImageUrl("");
    setUploadedFileName("");
    setIsCustomUpload(false);
    setNewSelectedAmenities([]);
    setNewParking("No Parking");
    setNewCooling("Electric Fan");
    setNewGenderPolicy("Both");
    setNewCustomLat(null);
    setNewCustomLng(null);
    setIsPinCustomized(false);

    setShowAddModal(false);

    if (userSession?.role !== "admin") {
      alert(
        prefLanguage === "tagalog"
          ? "⏳ Matagumpay na naipasa ang iyong post!\n\nNakatambay ito sa ADMIN APPROVAL at HINDI MUNA LALABAS SA WEBSITE hangga't hindi ito inaaprubahan ng Admin."
          : "⏳ Your listing has been submitted!\n\nIt is pending ADMIN APPROVAL and will NOT appear on the public website until an Admin approves it."
      );
    }
  };

  // Delete a specific landlord-created property listing
  const handleDeleteProperty = (id: string) => {
    setPropertiesList(prev => prev.filter(p => p.id !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }
    if (detailModalProperty?.id === id) {
      setDetailModalProperty(null);
    }
    if (landlordProfileProperty?.id === id) {
      setLandlordProfileProperty(null);
    }
  };

  // Admin action: Approve listing
  const handleApproveProperty = (id: string) => {
    setPropertiesList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, approvalStatus: "approved" as const };
      }
      return p;
    }));
    alert(prefLanguage === "tagalog" ? "✅ Na-approve na ang listing! Lalabas na ito sa pampublikong website." : "✅ Listing Approved! It will now appear on the public website.");
  };

  // Admin action: Reject listing
  const handleRejectProperty = (id: string) => {
    setPropertiesList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, approvalStatus: "rejected" as const };
      }
      return p;
    }));
    alert(prefLanguage === "tagalog" ? "❌ Na-reject ang listing." : "❌ Listing Rejected.");
  };

  // Student rating & review handler
  const handleAddReview = (propertyId: string, rating: number, comment: string) => {
    const newReview = {
      id: "rev-" + Date.now(),
      studentName: userSession?.name || "Student User",
      studentUsername: userSession?.username || "student",
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
    };

    setPropertiesList(prev => prev.map(p => {
      if (p.id === propertyId) {
        const updatedReviews = [newReview, ...(p.reviews || [])];
        const updatedProp = { ...p, reviews: updatedReviews };
        if (selectedProperty?.id === propertyId) {
          setSelectedProperty(updatedProp);
        }
        return updatedProp;
      }
      return p;
    }));
  };

  // Review reply handler (Landlord or Student reply)
  const handleAddReply = (propertyId: string, reviewId: string, comment: string) => {
    if (!comment.trim()) return;

    const newReply = {
      id: "reply-" + Date.now(),
      authorName: userSession?.name || (userSession?.role === "landlord" ? "Landlord / Owner" : "Student User"),
      authorUsername: userSession?.username || "user",
      authorRole: (userSession?.role || "landlord") as "landlord" | "student",
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
    };

    setPropertiesList(prev => prev.map(p => {
      if (p.id === propertyId) {
        const updatedReviews = (p.reviews || []).map(r => {
          if (r.id === reviewId) {
            return {
              ...r,
              replies: [...(r.replies || []), newReply]
            };
          }
          return r;
        });
        const updatedProp = { ...p, reviews: updatedReviews };
        if (selectedProperty?.id === propertyId) {
          setSelectedProperty(updatedProp);
        }
        return updatedProp;
      }
      return p;
    }));
  };

  // Filter & Sort properties based on search options
  const processedProperties = useMemo(() => {
    let result = [...propertiesList];

    // STRICT ADMIN vs PUBLIC APPROVAL FILTER:
    // If Admin is logged in, filter by adminTabFilter ("pending", "approved", "rejected", "all")
    // If Landlord is logged in AND toggled showLandlordPendingOnly, show landlord's pending posts
    // For everyone else (Tenants, Guests, & Landlords browsing feed): ONLY APPROVED POSTS ARE SHOWN!
    if (userSession?.role === "admin") {
      if (adminTabFilter === "pending") {
        result = result.filter(p => p.approvalStatus === "pending");
      } else if (adminTabFilter === "approved") {
        result = result.filter(p => p.approvalStatus === "approved" || !p.approvalStatus);
      } else if (adminTabFilter === "rejected") {
        result = result.filter(p => p.approvalStatus === "rejected");
      }
    } else if (userSession?.role === "landlord" && showLandlordPendingOnly) {
      result = result.filter(p => p.landlordUsername === userSession.username && p.approvalStatus === "pending");
    } else {
      result = result.filter(p => p.approvalStatus === "approved" || !p.approvalStatus);
    }

    // Filter by Boarding House name, title, address, description, or features typing query
    if (boardingHouseSearchQuery.trim()) {
      const q = boardingHouseSearchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.features.some(f => f.toLowerCase().includes(q))
      );
    }

    // Filter by Barangay (typed query or selected activeBarangay)
    if (barangaySearchQuery.trim() && barangaySearchQuery.trim().toLowerCase() !== "all") {
      const bq = barangaySearchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        p.neighborhood.toLowerCase().includes(bq)
      );
    } else if (activeBarangay !== "All") {
      result = result.filter((p) => p.neighborhood === activeBarangay);
    }

    // Filter by Property Type
    if (activeType !== "All") {
      result = result.filter((p) => p.type === activeType);
    }

    // Filter by Price Range Brackets (Option C)
    if (activePriceRange === "under1500") {
      result = result.filter((p) => p.price < 1500);
    } else if (activePriceRange === "1500-3000") {
      result = result.filter((p) => p.price >= 1500 && p.price <= 3000);
    } else if (activePriceRange === "3000-5000") {
      result = result.filter((p) => p.price >= 3000 && p.price <= 5000);
    } else if (activePriceRange === "5000-10000") {
      result = result.filter((p) => p.price >= 5000 && p.price <= 10000);
    } else if (activePriceRange === "above10000") {
      result = result.filter((p) => p.price > 10000);
    }

    // Filter by Amenities / Gender Preference (Girls Only, Boys Only, Both)
    if (activeAmenityGender === "Girls Only") {
      result = result.filter((p) => {
        if (p.genderPolicy) {
          return p.genderPolicy === "Girls Only";
        }

        const lowerTitle = p.title.toLowerCase();
        const lowerDesc = p.description.toLowerCase();
        const lowerFeatures = p.features.map(f => f.toLowerCase());
        const lowerTags = p.tags.map(t => t.toLowerCase());

        if (lowerFeatures.some(f => f.includes("male only") || f.includes("boys only") || f.includes("panlalaki"))) return false;
        if (lowerTags.some(t => t.includes("boys only") || t.includes("male only"))) return false;

        return (
          lowerFeatures.some(f => f.includes("female") || f.includes("girl") || f.includes("pambabae")) ||
          lowerTags.some(t => t.includes("female") || t.includes("girl")) ||
          lowerTitle.includes("female") || lowerTitle.includes("girl") ||
          lowerDesc.includes("female") || lowerDesc.includes("girls")
        );
      });
    } else if (activeAmenityGender === "Boys Only") {
      result = result.filter((p) => {
        if (p.genderPolicy) {
          return p.genderPolicy === "Boys Only";
        }

        const lowerTitle = p.title.toLowerCase();
        const lowerDesc = p.description.toLowerCase();
        const lowerFeatures = p.features.map(f => f.toLowerCase());
        const lowerTags = p.tags.map(t => t.toLowerCase());

        if (lowerFeatures.some(f => f.includes("female only") || f.includes("girls only") || f.includes("pambabae"))) return false;
        if (lowerTags.some(t => t.includes("girls only") || t.includes("female only"))) return false;

        return (
          lowerFeatures.some(f => f.includes("male") || f.includes("boy") || f.includes("panlalaki")) ||
          lowerTags.some(t => t.includes("male") || t.includes("boy")) ||
          lowerTitle.includes("male") || lowerTitle.includes("boy") ||
          lowerDesc.includes("male") || lowerDesc.includes("boys")
        );
      });
    } else if (activeAmenityGender === "Both") {
      result = result.filter((p) => {
        if (p.genderPolicy) {
          return p.genderPolicy === "Both";
        }

        const lowerTitle = p.title.toLowerCase();
        const lowerDesc = p.description.toLowerCase();
        const lowerFeatures = p.features.map(f => f.toLowerCase());
        const lowerTags = p.tags.map(t => t.toLowerCase());

        return (
          lowerFeatures.some(f => f.includes("both") || f.includes("co-ed") || f.includes("male & female") || f.includes("pareho")) ||
          lowerTags.some(t => t.includes("both") || t.includes("co-ed")) ||
          lowerTitle.includes("both") || lowerTitle.includes("co-ed") ||
          lowerDesc.includes("both") || lowerDesc.includes("co-ed")
        );
      });
    }

    // Sort descending by price
    result.sort((a, b) => b.price - a.price);

    return result;
  }, [propertiesList, boardingHouseSearchQuery, barangaySearchQuery, activeBarangay, activeType, activePriceRange, activeAmenityGender, userSession, adminTabFilter, showLandlordPendingOnly]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6 text-stone-900 antialiased relative overflow-hidden">
        {/* Soft Ambient Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-xs w-full text-center space-y-7 z-10"
        >
          {/* CasaFinder Logo & Spinning Rings */}
          <div className="relative flex justify-center">
            <div className="relative h-28 w-28 flex items-center justify-center">
              {/* Outer dashed spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-full"
              />
              {/* Inner solid spinning gradient ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-1.5 border-t-2 border-indigo-600 rounded-full"
              />
              {/* Logo Core (CasaFinder Icon) */}
              <div className="relative h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl shadow-indigo-100">
                🏠
              </div>
            </div>
          </div>

          {/* Name of CasaFinder */}
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl font-black tracking-tight text-stone-900">
              CasaFinder
            </h1>
            <p className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
              Student Housing Network
            </p>
          </div>

          {/* Loading Design (Clean Progress Bar & Percent Indicator) */}
          <div className="space-y-3 px-2">
            <div className="h-2 w-full bg-stone-200/60 rounded-full overflow-hidden relative border border-stone-100">
              <motion.div 
                style={{ width: `${loadingProgress}%` }}
                className="h-full bg-indigo-600 rounded-full transition-all duration-100"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-500">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                LOADING...
              </span>
              <span className="text-indigo-600">{loadingProgress}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="h-screen h-[100dvh] w-full bg-gradient-to-br from-pink-50/80 via-white to-blue-50/80 text-stone-900 font-sans flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 antialiased relative overflow-hidden">
        {/* Background ambient glowing spheres */}
        <div className="absolute top-0 left-0 w-80 h-80 sm:w-96 sm:h-96 lg:w-[480px] lg:h-[480px] bg-pink-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 sm:w-96 sm:h-96 lg:w-[480px] lg:h-[480px] bg-blue-300/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-pink-100/90 p-4 sm:p-6 md:p-7 shadow-2xl shadow-pink-500/10 relative z-10 my-auto overflow-y-auto max-h-[92dvh] sm:max-h-[88dvh] flex flex-col justify-center mx-auto"
        >
          <div className="flex flex-col space-y-3.5 sm:space-y-4 w-full">
            {/* Header: Logo, Title, Subtitle */}
            <div className="text-center space-y-1">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-tr from-pink-500 via-pink-600 to-blue-600 rounded-2xl items-center justify-center text-white font-display font-bold text-lg sm:text-xl shadow-md shadow-pink-500/20 mb-0.5">
                🎓
              </div>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">CasaFinder Gumaca</h2>
              <p className="text-[10px] sm:text-xs text-stone-500 max-w-xs sm:max-w-sm mx-auto font-light leading-snug">
                {authMode === "signup"
                  ? t("signupSubTitle")
                  : authMode === "forgot"
                  ? t("forgotSubTitle")
                  : t("loginSubTitle")}
              </p>
            </div>

            {/* 1. Log In vs Sign Up Tab Switcher (Right after Website Title) */}
            {authMode !== "forgot" && authMode !== "adminLogin" && (
              <div className="flex border-b border-pink-100 pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setLoginUsername("");
                    setLoginPassword("");
                    setSignupEmail("");
                    setLoginError("");
                  }}
                  className={`flex-1 pb-1 sm:pb-1.5 text-[11px] sm:text-xs lg:text-sm font-bold transition-all border-b-2 text-center cursor-pointer ${
                    authMode === "login"
                      ? "border-pink-600 text-pink-600 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {t("loginTab")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setLoginUsername("");
                    setLoginPassword("");
                    setSignupEmail("");
                    setLoginError("");
                  }}
                  className={`flex-1 pb-1 sm:pb-1.5 text-[11px] sm:text-xs lg:text-sm font-bold transition-all border-b-2 text-center cursor-pointer ${
                    authMode === "signup"
                      ? "border-pink-600 text-pink-600 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {t("signupTab")}
                </button>
              </div>
            )}

            {/* 2. Role Choice Tabs */}
            {authMode !== "forgot" && authMode !== "adminLogin" && (
              <div className="space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-pink-600/80 block text-center sm:text-left">
                  {t("selectRole")}
                </span>
                <div className="grid grid-cols-2 p-1 bg-gradient-to-r from-pink-50/90 to-blue-50/90 border border-pink-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole("student");
                      setLoginError("");
                    }}
                    className={`py-1.5 sm:py-2 px-3 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginRole === "student"
                        ? "bg-white text-pink-600 shadow-xs border border-pink-200/60"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    {t("studentRole")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole("landlord");
                      setLoginError("");
                    }}
                    className={`py-1.5 sm:py-2 px-3 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginRole === "landlord"
                        ? "bg-white text-blue-600 shadow-xs border border-blue-200/60"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Building className="h-3.5 w-3.5" />
                    {t("landlordRole")}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {loginError && (
              <div className="p-2 sm:p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[10px] sm:text-xs lg:text-sm text-rose-600 font-medium">
                ⚠️ {loginError}
              </div>
            )}

            {/* Forms & Controls */}
            <div className="space-y-2.5 sm:space-y-3 flex flex-col justify-center">

              {/* EXCLUSIVE ADMIN LOGIN MODE */}
              {authMode === "adminLogin" ? (
                <div className="space-y-2.5 sm:space-y-3 bg-stone-900 text-white p-3.5 sm:p-4 rounded-2xl border border-amber-500/40 shadow-xl">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-300 font-bold text-xs sm:text-sm font-display">
                      <Shield className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>🔒 Exclusive System Admin Portal</span>
                    </div>
                    <p className="text-[10px] text-stone-300 leading-tight">
                      Restricted Access • Authorized Municipal & Campus Officers Only (2 Exclusive Accounts: <span className="text-amber-200 font-mono font-bold">admin.gumaca</span> & <span className="text-amber-200 font-mono font-bold">admin.campus</span>)
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                        <UserCog className="h-3.5 w-3.5 text-amber-400" />
                        Admin Username or Email
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. admin.gumaca or admin.campus"
                        value={loginUsername}
                        onChange={e => setLoginUsername(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 focus:border-amber-400 focus:bg-stone-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5 text-amber-400" />
                        Admin Security Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          className="w-full bg-stone-800 border border-stone-700 focus:border-amber-400 focus:bg-stone-800 rounded-xl pl-3 pr-8 py-1.5 text-xs text-white font-mono focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-black py-2 px-3 rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Shield className="h-3.5 w-3.5 text-stone-950" />
                      <span>Verify & Enter Admin Portal 🛡️</span>
                    </button>
                  </form>

                  <div className="text-center pt-1 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setLoginRole("student");
                        setLoginError("");
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span>Back to Public Tenant & Landlord Login</span>
                    </button>
                  </div>
                </div>
              ) : authMode === "forgot" ? (
                <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                  <div className="p-2 sm:p-2.5 lg:p-3 bg-pink-50/80 border border-pink-100 rounded-xl space-y-0.5 lg:space-y-1">
                    <div className="flex items-center gap-1.5 text-pink-900 font-bold text-[10px] sm:text-xs lg:text-sm">
                      <KeyRound className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-pink-600 shrink-0" />
                      <span>Password Recovery</span>
                    </div>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-pink-700 font-light leading-snug">
                      Enter your Username, Email address, or Mobile number to find your account.
                    </p>
                  </div>

                  {forgotSuccessMsg ? (
                    <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                      <div className="p-2.5 lg:p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-[10px] sm:text-xs lg:text-sm space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-blue-600 shrink-0" />
                          <span>Success!</span>
                        </div>
                        <p className="font-medium leading-snug">{forgotSuccessMsg}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          if (forgotFoundUser) {
                            setLoginUsername(forgotFoundUser.username);
                            setLoginRole(forgotFoundUser.role);
                          }
                          setLoginPassword("");
                          setLoginError("");
                          setForgotFoundUser(null);
                          setForgotQuery("");
                          setForgotSuccessMsg("");
                        }}
                        className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white font-bold py-1.5 sm:py-2 lg:py-2.5 px-3 lg:px-4 rounded-xl text-[10px] sm:text-xs lg:text-sm transition-all shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Log In with New Password 🚀</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {!forgotFoundUser ? (
                        /* Step 1: Find Account */
                        <form onSubmit={handleSearchForgotAccount} className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                          <div className="space-y-0.5 lg:space-y-1">
                            <label className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                              <Search className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-pink-500" />
                              Username, Email, or Mobile
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. juan.student / juan@example.com"
                              value={forgotQuery}
                              onChange={(e) => setForgotQuery(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 focus:border-pink-500 focus:bg-white rounded-xl px-2.5 py-1 sm:py-1.5 lg:py-2 lg:px-3 text-[11px] sm:text-xs lg:text-sm text-stone-800 font-medium focus:outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white font-bold py-1.5 sm:py-2 lg:py-2.5 px-3 lg:px-4 rounded-xl text-[10px] sm:text-xs lg:text-sm transition-all shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Search className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            <span>Find Account 🔍</span>
                          </button>
                        </form>
                      ) : (
                        /* Step 2: Reset Password Form */
                        <form onSubmit={handleResetForgotPassword} className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                          {/* Found Account Info Badge */}
                          <div className="p-2 lg:p-2.5 bg-stone-50 border border-pink-100 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                                Account Found
                              </span>
                              <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-stone-800">{forgotFoundUser.name}</p>
                              <p className="text-[9px] sm:text-[10px] lg:text-xs text-stone-500 font-mono">@{forgotFoundUser.username}</p>
                            </div>
                            <span className={`text-[8px] sm:text-[9px] lg:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${
                              forgotFoundUser.role === "student"
                                ? "bg-pink-50 text-pink-700 border-pink-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {forgotFoundUser.role === "student" ? "STUDENT" : "LANDLORD"}
                            </span>
                          </div>

                          <div className="space-y-0.5 lg:space-y-1">
                            <label className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                              <Lock className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-pink-500" />
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showForgotNewPassword ? "text" : "password"}
                                required
                                placeholder="At least 3 characters"
                                value={forgotNewPassword}
                                onChange={(e) => setForgotNewPassword(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 focus:border-pink-500 focus:bg-white rounded-xl pl-2.5 pr-8 py-1 sm:py-1.5 lg:py-2 lg:pl-3 lg:pr-9 text-[11px] sm:text-xs lg:text-sm text-stone-800 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                                className="absolute right-2.5 lg:right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                              >
                                {showForgotNewPassword ? <EyeOff className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> : <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-0.5 lg:space-y-1">
                            <label className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                              <Lock className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-pink-500" />
                              Confirm New Password
                            </label>
                            <input
                              type={showForgotNewPassword ? "text" : "password"}
                              required
                              placeholder="Must match new password"
                              value={forgotConfirmPassword}
                              onChange={(e) => setForgotConfirmPassword(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 focus:border-pink-500 focus:bg-white rounded-xl px-2.5 py-1 sm:py-1.5 lg:py-2 lg:px-3 text-[11px] sm:text-xs lg:text-sm text-stone-800 font-mono"
                            />
                          </div>

                          <div className="flex gap-1.5 lg:gap-2 pt-0.5 lg:pt-1">
                            <button
                              type="button"
                              onClick={() => setForgotFoundUser(null)}
                              className="px-2.5 lg:px-3 py-1.5 lg:py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] sm:text-xs lg:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                              Different User
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-gradient-to-r from-pink-500 via-pink-600 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white font-bold py-1.5 lg:py-2 px-3 lg:px-4 rounded-xl text-[10px] sm:text-xs lg:text-sm transition-all shadow-md shadow-pink-500/20 flex items-center justify-center gap-1 lg:gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Save className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                              <span>Save New Password 🔒</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}

                  {/* Back to Login Link */}
                  <div className="text-center pt-0.5 border-t border-pink-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setLoginError("");
                        setForgotFoundUser(null);
                        setForgotQuery("");
                      }}
                      className="text-[10px] sm:text-xs lg:text-sm text-pink-600 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-pink-600" />
                      <span>Back to Log In</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Login/Signup Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-1.5 sm:space-y-2 lg:space-y-3 animate-none">
                    {authMode === "signup" && (
                      <div className="space-y-0.5 lg:space-y-1">
                        <label className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                          <Mail className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-pink-500" />
                          {prefLanguage === "tagalog" ? "Email Address o Mobile Number" : "Email Address or Mobile Number"}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={
                            loginRole === "student"
                              ? (prefLanguage === "tagalog" ? "e.g. juan@example.com o 09123456789" : "e.g. juan@example.com or 09123456789")
                              : (prefLanguage === "tagalog" ? "e.g. nena@example.com o 09987654321" : "e.g. nena@example.com or 09987654321")
                          }
                          value={signupEmail}
                          onChange={e => setSignupEmail(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-pink-500 focus:bg-white rounded-xl px-2.5 py-1 sm:py-1.5 lg:py-2 lg:px-3 text-[11px] sm:text-xs lg:text-sm text-stone-800 focus:outline-hidden transition-all font-medium"
                        />
                      </div>
                    )}

                    <div className="space-y-0.5 lg:space-y-1">
                      <label className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                        <Shield className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-pink-500" />
                        {authMode === "signup" 
                          ? (prefLanguage === "tagalog" ? "Gumawa ng Username" : "Create Username") 
                          : (prefLanguage === "tagalog" ? "Username, Email, o Mobile" : "Username, Email, or Mobile")
                        }
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          authMode === "signup"
                            ? (loginRole === "student" ? "e.g. juan.student" : "e.g. nena.landlord")
                            : "e.g. juan.student or juan@example.com"
                        }
                        value={loginUsername}
                        onChange={e => setLoginUsername(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-pink-500 focus:bg-white rounded-xl px-2.5 py-1 sm:py-1.5 lg:py-2 lg:px-3 text-[11px] sm:text-xs lg:text-sm text-stone-800 focus:outline-hidden transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-0.5 lg:space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                          <Lock className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-pink-500" />
                          Password
                        </label>
                        {authMode === "login" && (
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("forgot");
                              setLoginError("");
                              setForgotQuery(loginUsername || "");
                              setForgotFoundUser(null);
                              setForgotNewPassword("");
                              setForgotConfirmPassword("");
                              setForgotSuccessMsg("");
                            }}
                            className="text-[9px] sm:text-[10px] lg:text-xs text-pink-600 hover:text-pink-800 font-bold hover:underline cursor-pointer"
                          >
                            {t("forgotPasswordLink")}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-pink-500 focus:bg-white rounded-xl pl-2.5 pr-8 py-1 sm:py-1.5 lg:py-2 lg:pl-3 lg:pr-9 text-[11px] sm:text-xs lg:text-sm text-stone-800 focus:outline-hidden transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 lg:right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                          title={showPassword ? "Hide Password" : "Show Password"}
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> : <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white font-bold py-1.5 sm:py-2 lg:py-2.5 px-3 lg:px-4 rounded-xl text-[11px] sm:text-xs lg:text-sm transition-all shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 cursor-pointer mt-0.5 lg:mt-1 active:scale-95"
                    >
                      {authMode === "signup" ? (
                        <>{t("signupBtn")}</>
                      ) : (
                        <>{prefLanguage === "tagalog" ? `Mag-log In (${loginRole === "student" ? "Estudyante" : "Landlord"}) 🚀` : `Log In (${loginRole === "student" ? "Student" : "Landlord"}) 🚀`}</>
                      )}
                    </button>
                  </form>

                  {/* Switch to Admin Portal link */}
                  {authMode === "login" && (
                    <div className="text-center pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("adminLogin");
                          setLoginRole("admin");
                          setLoginUsername("");
                          setLoginPassword("");
                          setLoginError("");
                        }}
                        className="text-[10px] sm:text-[11px] text-amber-700 hover:text-amber-900 font-bold hover:underline cursor-pointer inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70"
                      >
                        <Shield className="h-3 w-3 text-amber-600 shrink-0" />
                        <span>{prefLanguage === "tagalog" ? "Esklusibong Portal ng Admin Login 🔒" : "Exclusive System Admin Portal 🔒"}</span>
                      </button>
                    </div>
                  )}

                  {/* Alternate switch link */}
                  <div className="text-center text-[10px] sm:text-[11px] lg:text-xs pt-0.5">
                    {authMode === "login" ? (
                      <span className="text-stone-500">
                        {prefLanguage === "tagalog" ? "Bago sa CasaFinder? " : "New to CasaFinder? "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("signup");
                            setLoginUsername("");
                            setLoginPassword("");
                            setSignupEmail("");
                            setLoginError("");
                          }}
                          className="text-pink-600 font-bold hover:underline cursor-pointer"
                        >
                          {prefLanguage === "tagalog" ? "Mag-sign Up dito!" : "Sign Up here!"}
                        </button>
                      </span>
                    ) : (
                      <span className="text-stone-500">
                        {prefLanguage === "tagalog" ? "May account na? " : "Already have an account? "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setLoginUsername("");
                            setLoginPassword("");
                            setSignupEmail("");
                            setLoginError("");
                          }}
                          className="text-pink-600 font-bold hover:underline cursor-pointer"
                        >
                          {prefLanguage === "tagalog" ? "Mag-log In dito!" : "Log In here!"}
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Quick Demo Credentials */}
                  <div className="pt-2.5 border-t border-pink-100/80 space-y-1">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-pink-600/80 text-center">
                      {t("quickAccessDemo")}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickLogin("student")}
                        className="bg-pink-50/80 hover:bg-pink-100/80 border border-pink-200/80 rounded-xl p-1.5 sm:p-2 text-center transition-all cursor-pointer group shadow-2xs active:scale-95"
                      >
                        <div className="text-[9px] sm:text-[11px] font-bold text-pink-700 group-hover:scale-102 transition-transform truncate">
                          Demo Tenant 🎓
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-pink-500 font-mono mt-0.5">Quick Access</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin("landlord")}
                        className="bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl p-1.5 sm:p-2 text-center transition-all cursor-pointer group shadow-2xs active:scale-95"
                      >
                        <div className="text-[9px] sm:text-[11px] font-bold text-blue-700 group-hover:scale-102 transition-transform truncate">
                          Demo Landlord 🏠
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-blue-500 font-mono mt-0.5">Property Owner</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin("admin")}
                        className="bg-amber-50/90 hover:bg-amber-100 border border-amber-300/80 rounded-xl p-1.5 sm:p-2 text-center transition-all cursor-pointer group shadow-2xs active:scale-95"
                      >
                        <div className="text-[9px] sm:text-[11px] font-bold text-amber-800 group-hover:scale-102 transition-transform truncate">
                          Demo Admin 🛡️
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-amber-600 font-mono mt-0.5">2 Accs Portal</div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-black text-stone-900 dark:text-stone-100 font-sans flex flex-col antialiased">
      {/* Dynamic Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 py-3 sm:py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Logo & Role Subheading */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-tr from-pink-500 via-pink-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg sm:text-xl shadow-md shadow-pink-500/20 shrink-0">
                {userSession.role === "student" ? "🎓" : userSession.role === "landlord" ? "🏠" : "🛡️"}
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-stone-950 dark:text-stone-100 flex items-center gap-1.5">
                    <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">CasaFinder</span>
                    <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md border ${
                      userSession.role === "student"
                        ? "text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-950/80 border-pink-300 dark:border-pink-800"
                        : userSession.role === "landlord"
                        ? "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800"
                        : "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800"
                    }`}>
                      {userSession.role === "student" ? t("studentRole") : userSession.role === "landlord" ? t("landlordRole") : "System Admin 🛡️"}
                    </span>
                  </h1>
                </div>
                <p className="text-[11px] sm:text-xs text-black dark:text-black force-black font-semibold mt-0.5">
                  {t("hello")} <span className="font-bold text-black dark:text-black force-black">{userSession.name}</span> • Gumaca Housing Page
                </p>
              </div>
            </div>

            {/* Mobile Profile Icon Button */}
            <div className="md:hidden relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-stone-800 dark:to-stone-800 hover:from-pink-100 hover:to-blue-100 text-stone-800 dark:text-stone-100 border border-pink-200/70 dark:border-stone-700 rounded-xl p-2.5 transition-all flex items-center justify-center cursor-pointer shadow-2xs active:scale-95"
                title="Profile & Settings"
              >
                <UserCog className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </button>

              {/* Mobile Profile Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setShowUserMenu(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className="absolute right-0 top-11 z-50 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-2 space-y-1 font-sans text-xs"
                    >
                      <div className="p-2.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-100 dark:border-stone-700 mb-1">
                        <p className="font-bold text-stone-800 dark:text-stone-100 text-xs truncate">{userSession.name}</p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">@{userSession.username}</p>
                        <span className={`inline-block text-[8px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded border ${
                          userSession.role === "student"
                            ? "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800"
                            : userSession.role === "landlord"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                        }`}>
                          {userSession.role === "student" ? t("studentAccount") : userSession.role === "landlord" ? t("landlordAccount") : "System Admin 🛡️"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 dark:text-stone-100 hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{t("tabProfileInfo")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("settings");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 dark:text-stone-100 hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{t("tabSecurity")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("notifications");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 dark:text-stone-100 hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Bell className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{t("tabPreferences")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("about");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 dark:text-stone-100 hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{t("tabAbout")}</span>
                      </button>

                      <div className="border-t border-stone-100 my-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleSignOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>{t("logOut")} 🚪</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Header Buttons & Desktop Menu */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Desktop Profile & Settings Menu Dropdown */}
            <div className="hidden md:block relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-stone-800 dark:to-stone-800 hover:from-pink-100 hover:to-blue-100 text-stone-800 dark:text-stone-100 border border-pink-200/70 dark:border-stone-700 rounded-xl p-2.5 transition-all flex items-center justify-center cursor-pointer shadow-2xs active:scale-95"
                title="Profile & Settings"
              >
                <UserCog className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </button>

              {/* Desktop Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setShowUserMenu(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className="absolute right-0 top-11 z-50 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-2 space-y-1 font-sans text-xs"
                    >
                      <div className="p-2.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-100 dark:border-stone-700 mb-1">
                        <p className="font-bold text-stone-800 dark:text-stone-100 text-xs truncate">{userSession.name}</p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">@{userSession.username}</p>
                        <span className={`inline-block text-[8px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded border ${
                          userSession.role === "student"
                            ? "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800"
                            : userSession.role === "landlord"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                        }`}>
                          {userSession.role === "student" ? t("studentAccount") : userSession.role === "landlord" ? t("landlordAccount") : "System Admin 🛡️"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 dark:text-stone-100 hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{t("tabProfileInfo")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("settings");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 dark:text-stone-100 hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{t("tabSecurity")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("notifications");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 dark:text-stone-100 hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Bell className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{t("tabPreferences")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("about");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 dark:text-stone-100 hover:bg-pink-50 dark:hover:bg-pink-950/60 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{t("tabAbout")}</span>
                      </button>

                      <div className="border-t border-stone-100 my-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleSignOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>{t("logOut")} 🚪</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {userSession.role === "landlord" && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl py-2 px-3.5 sm:px-4 text-xs font-bold hover:from-pink-600 hover:to-rose-700 transition-all flex items-center gap-1.5 shadow-md shadow-pink-500/20 cursor-pointer w-full sm:w-auto justify-center active:scale-95"
              >
                <Plus className="h-4 w-4" />
                {t("postProperty")}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowMapPage(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2 px-3.5 sm:px-4 text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer w-full sm:w-auto justify-center active:scale-95"
            >
              <MapPin className="h-4 w-4" />
              {t("tabMap")}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col space-y-5">
        
        {/* Search Panel - Only visible for Students */}
        {userSession.role === "student" && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-pink-100 dark:border-stone-800 p-3 sm:p-5 shadow-sm shadow-pink-500/5 space-y-3 sm:space-y-4 transition-all">
            {/* Header / Mobile Toggle Bar */}
            <div className="flex items-center justify-between gap-2 border-b border-pink-50 dark:border-stone-800 pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  <span>{prefLanguage === "tagalog" ? "Maghanap at I-filter" : "Search & Filter"}</span>
                </h3>
                <span className="text-[10px] bg-gradient-to-r from-pink-50 to-blue-50 dark:from-stone-800 dark:to-stone-800 text-pink-700 dark:text-pink-300 border border-pink-200/80 dark:border-stone-700 font-bold px-2 py-0.5 rounded-full">
                  {processedProperties.length} {processedProperties.length === 1 ? (prefLanguage === "tagalog" ? "Tuluyan" : "House") : (prefLanguage === "tagalog" ? "Mga Tuluyan" : "Houses")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {(boardingHouseSearchQuery || barangaySearchQuery || barangayInput !== "All" || typeInput !== "All" || priceInput !== "All" || amenityGenderInput !== "All") && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-stone-400 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 text-[10px] sm:text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    <span className="hidden xs:inline">{t("resetFilters")}</span>
                  </button>
                )}

                {/* Mobile Expand / Shrink Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
                  className="sm:hidden bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{isMobileSearchExpanded ? t("collapse") : t("filterOptions")}</span>
                  {isMobileSearchExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* Mobile Fast Search Bar (Always visible on mobile when collapsed) */}
            <div className="sm:hidden">
              <div className="relative">
                <input
                  type="text"
                  value={boardingHouseSearchQuery}
                  onChange={(e) => setBoardingHouseSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-8 pr-8 py-2 text-[11px] text-stone-800 dark:text-stone-100 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-900 shadow-2xs"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                {boardingHouseSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBoardingHouseSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Full Filters Grid - Collapsible on Mobile, always expanded on Desktop */}
            <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3 items-end ${
              isMobileSearchExpanded ? "grid" : "hidden sm:grid"
            }`}>
              {/* 1. Boarding House Search Bar (Typing) */}
              <div className="col-span-2 sm:col-span-2 lg:col-span-2 flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Home className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                    {prefLanguage === "tagalog" ? "Pangalan ng Tuluyan" : "Boarding House Search"}
                  </span>
                  <span className="text-[9px] text-stone-400 font-normal">{prefLanguage === "tagalog" ? "I-type ang pangalan" : "Type house name"}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={boardingHouseSearchQuery}
                    onChange={(e) => setBoardingHouseSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-8 pr-8 py-1.5 sm:py-2 text-[11px] sm:text-xs text-stone-800 dark:text-stone-100 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-900 transition-all shadow-2xs"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  {boardingHouseSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBoardingHouseSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Barangay Search Bar (Typing) */}
              <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                    {t("filterBarangay")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="barangay-suggestions"
                    value={barangaySearchQuery}
                    onChange={(e) => {
                      setBarangaySearchQuery(e.target.value);
                      setBarangayInput(e.target.value);
                    }}
                    placeholder={prefLanguage === "tagalog" ? "Mag-type ng barangay..." : "Type barangay..."}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-8 pr-8 py-1.5 sm:py-2 text-[11px] sm:text-xs text-stone-800 dark:text-stone-100 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-900 transition-all shadow-2xs"
                  />
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  {barangaySearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setBarangaySearchQuery("");
                        setBarangayInput("All");
                        setActiveBarangay("All");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <datalist id="barangay-suggestions">
                    <option value={t("allBarangays")} />
                    {GUMACA_BARANGAYS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* 3. Property Type Selector */}
              <div className="col-span-1 flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
                  {t("filterType")}
                </label>
                <select
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-1.5 sm:py-2 text-[11px] sm:text-xs text-stone-800 dark:text-stone-100 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-900 cursor-pointer shadow-2xs truncate"
                >
                  <option value="All">{t("allTypes")}</option>
                  <option value="Boarding House">{t("typeBoardingHouse")}</option>
                  <option value="Apartment">{t("typeApartment")}</option>
                  <option value="Others">{t("typeOthers")}</option>
                </select>
              </div>

              {/* 4. Amenities / Gender Filter */}
              <div className="col-span-1 flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
                  {prefLanguage === "tagalog" ? "Uri ng Kasarian" : "Gender Type"}
                </label>
                <select
                  value={amenityGenderInput}
                  onChange={(e) => setAmenityGenderInput(e.target.value as "All" | "Both" | "Girls Only" | "Boys Only")}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-1.5 sm:py-2 text-[11px] sm:text-xs text-stone-800 dark:text-stone-100 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-900 cursor-pointer shadow-2xs truncate"
                >
                  <option value="All">{prefLanguage === "tagalog" ? "Lahat" : "All Types"}</option>
                  <option value="Girls Only">{prefLanguage === "tagalog" ? "Pang-babae 👧" : "Girls Only 👧"}</option>
                  <option value="Boys Only">{prefLanguage === "tagalog" ? "Pang-lalaki 👦" : "Boys Only 👦"}</option>
                  <option value="Both">{prefLanguage === "tagalog" ? "Co-ed 🚻" : "Both / Co-ed 🚻"}</option>
                </select>
              </div>

              {/* 5. Max Price & Filter Button */}
              <div className="col-span-2 sm:col-span-1 flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {t("filterBudget")}
                </label>
                <select
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-1.5 sm:py-2 text-[11px] sm:text-xs text-stone-800 dark:text-stone-100 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-900 cursor-pointer font-mono shadow-2xs"
                >
                  <option value="All">{prefLanguage === "tagalog" ? "Kahit Anong Presyo" : "Any Price"}</option>
                  <option value="under1500">{prefLanguage === "tagalog" ? "Mababa sa ₱1,500" : "Under ₱1,500"}</option>
                  <option value="1500-3000">₱1,500 – ₱3,000</option>
                  <option value="3000-5000">₱3,000 – ₱5,000</option>
                  <option value="5000-10000">₱5,000 – ₱10,000</option>
                  <option value="above10000">{prefLanguage === "tagalog" ? "Higit sa ₱10,000" : "Above ₱10,000"}</option>
                </select>
              </div>
            </div>

            {/* Filter Action Button Row */}
            <div className={`flex items-center justify-between pt-1 gap-2 ${
              isMobileSearchExpanded ? "flex" : "hidden sm:flex"
            }`}>
              <span className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {t("showingResults")} <strong className="text-pink-600 dark:text-pink-400 font-bold">{processedProperties.length}</strong> {processedProperties.length === 1 ? t("boardingHouse") : t("boardingHouses")}
              </span>

              <button
                type="button"
                onClick={handleSearch}
                className="bg-gradient-to-r from-pink-500 via-pink-600 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white rounded-xl py-1.5 sm:py-2 px-4 sm:px-5 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-pink-500/20 cursor-pointer active:scale-95 shrink-0"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{t("searchBtn")}</span>
              </button>
            </div>
          </div>
        )}

          {/* Admin Moderation Bar */}
          {userSession?.role === "admin" && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 border-2 border-amber-400 dark:border-amber-600/80 rounded-2xl p-4 mb-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-500 text-stone-900 rounded-xl text-lg font-bold shadow-xs shrink-0">👑</span>
                  <div>
                    <h3 className="font-display font-extrabold text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-snug">
                      Admin Moderation Dashboard
                    </h3>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                      Manage landlord posts. Unapproved landlord posts are strictly hidden from students and guests until approved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/60 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setAdminTabFilter("pending")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminTabFilter === "pending"
                      ? "bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 border border-amber-200 dark:border-stone-700"
                  }`}
                >
                  <span>⏳ Pending Approval</span>
                  <span className="px-1.5 py-0.5 bg-amber-900 text-white rounded-full text-[10px]">
                    {propertiesList.filter(p => p.approvalStatus === "pending").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTabFilter("approved")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminTabFilter === "approved"
                      ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 border border-stone-200 dark:border-stone-700"
                  }`}
                >
                  <span>✅ Approved Public Listings</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-white rounded-full text-[10px]">
                    {propertiesList.filter(p => p.approvalStatus === "approved" || !p.approvalStatus).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTabFilter("rejected")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminTabFilter === "rejected"
                      ? "bg-red-600 text-white shadow-md ring-2 ring-red-400"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 border border-stone-200 dark:border-stone-700"
                  }`}
                >
                  <span>❌ Rejected Listings</span>
                  <span className="px-1.5 py-0.5 bg-red-950 text-white rounded-full text-[10px]">
                    {propertiesList.filter(p => p.approvalStatus === "rejected").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTabFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    adminTabFilter === "all"
                      ? "bg-stone-800 text-white shadow-md"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 border border-stone-200 dark:border-stone-700"
                  }`}
                >
                  <span>📂 All Properties</span>
                  <span className="px-1.5 py-0.5 bg-stone-900 text-white rounded-full text-[10px]">
                    {propertiesList.length}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Landlord View Navigation Bar */}
          {userSession?.role === "landlord" && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-stone-900 text-white rounded-2xl p-3.5 sm:p-4 mb-5 border border-indigo-700/50 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl text-lg font-bold border border-indigo-400/30 shrink-0">
                    🏠
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-white text-xs sm:text-sm">
                      {prefLanguage === "tagalog" ? "Landlord Management Dashboard" : "Landlord Management Dashboard"}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-300">
                      {prefLanguage === "tagalog"
                        ? "Ang iyong mga ipinost na tuluyan ay lalabas muna bilang 'Pending' (Kulay Grey) sa iyong Sariling Page hangga't 'di pa inaaprubahan ng Admin."
                        : "Your newly posted listings appear as 'Pending' (Greyed out) on your personal page until approved by an Admin."}
                    </p>
                  </div>
                </div>

                {/* Switcher Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-indigo-800/80 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setShowLandlordPendingOnly(false)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                      !showLandlordPendingOnly
                        ? "bg-pink-600 text-white border-pink-400 shadow-sm font-extrabold"
                        : "bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700"
                    }`}
                  >
                    <span>🌐 Public Search Feed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLandlordPendingOnly(true)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                      showLandlordPendingOnly
                        ? "bg-amber-500 text-stone-950 border-amber-300 shadow-sm font-extrabold"
                        : "bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700"
                    }`}
                  >
                    <span>🏠 My Personal Page</span>
                    <span className="px-1.5 py-0.2 bg-stone-950/40 rounded-full text-[10px] font-mono">
                      {propertiesList.filter(p => p.landlordUsername === userSession.username || p.landlordEmail === userSession.username).length}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Property Cards Grid */}
          {processedProperties.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                <Home className="h-8 w-8 animate-none" />
              </div>
              
              {propertiesList.length === 0 ? (
                // Entire network is empty (first load / all deleted)
                <div className="max-w-md mx-auto space-y-4">
                  <p className="font-display font-bold text-stone-900 text-lg">
                    {t("noResultsTitle")}
                  </p>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    {t("noResultsSub")}
                  </p>
                  {userSession.role === "landlord" ? (
                    <div className="pt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        {t("postProperty")}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-700 font-medium leading-relaxed">
                      💡 <strong>{prefLanguage === "tagalog" ? "Paalala sa Tenant:" : "Tenant Note:"}</strong> {prefLanguage === "tagalog" ? "Maaaring sabihan ang inyong landlords sa Gumaca na mag-post ng kanilang tuluyan dito!" : "Please inform your landlords or homeowners in Gumaca to post their listings here so the tenant community can find them!"}
                    </div>
                  )}
                </div>
              ) : (
                // Filters matched nothing
                <div className="max-w-md mx-auto space-y-4">
                  <p className="font-display font-bold text-stone-900 text-base">
                    {t("noResultsTitle")}
                  </p>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    {t("noResultsSub")}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    {t("resetFilters")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-stone-400 font-mono">
                  {t("showingResults")} {processedProperties.length} {processedProperties.length === 1 ? t("boardingHouse") : t("boardingHouses")}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">
                {processedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={() => {
                      setSelectedProperty(property);
                      setDetailModalProperty(property);
                    }}
                    onApprove={(p) => handleApproveProperty(p.id)}
                    onReject={(p) => handleRejectProperty(p.id)}
                    onViewLandlordProfile={(prop) => setLandlordProfileProperty(prop)}
                    onViewOnMap={handleViewOnMap}
                    currentUserRole={userSession?.role}
                    language={prefLanguage}
                  />
                ))}
              </div>
            </div>
          )}

      </main>

      {/* About CasaFinder Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        prefLanguage={prefLanguage}
      />

      {/* Welcome / Onboarding Setup Multi-Slide Modal after Login or Signup */}
      <AnimatePresence>
        {showOnboardingModal && userSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
            {/* Backdrop (non-clickable so setup cannot be bypassed) */}
            <div className="absolute inset-0" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 z-10 my-auto flex flex-col text-stone-800 dark:text-stone-100"
            >
              {/* Modal Top Hero Header Banner */}
              <div className="bg-gradient-to-r from-stone-900 via-pink-950/95 to-indigo-950 p-6 sm:p-7 text-white relative overflow-hidden shrink-0 border-b border-white/10">
                {/* Glowing Ambient Background Orbs */}
                <div className="absolute -top-16 -left-16 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

                {/* Top Row: Step Badge */}
                <div className="flex items-center justify-between relative z-10 mb-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-wide text-pink-200 border border-white/15">
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                    <span>
                      {prefLanguage === "tagalog"
                        ? `CasaFinder Guide • Hakbang ${onboardingSlide + 1} sa 4`
                        : `CasaFinder Guide • Step ${onboardingSlide + 1} of 4`
                      }
                    </span>
                  </div>
                </div>

                {/* Hero Icon & Title Header */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 p-0.5 shadow-xl shadow-pink-500/20">
                      <div className="w-full h-full rounded-[14px] bg-stone-900/90 backdrop-blur-md flex items-center justify-center text-3xl">
                        {userSession.role === "student" ? "🎓" : "🏠"}
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-[10px] shadow-xs border-2 border-stone-900">
                      ✨
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl tracking-tight text-white drop-shadow-sm leading-snug">
                      {onboardingSlide === 0 && (
                        prefLanguage === "tagalog"
                          ? (userSession.role === "student" ? "Maligayang Pagdating, Tenant!" : "Maligayang Pagdating, Landlord!")
                          : (userSession.role === "student" ? "Welcome, Tenant!" : "Welcome, Landlord!")
                      )}
                      {onboardingSlide === 1 && (prefLanguage === "tagalog" ? "Tampok na Kasangkapan" : "Platform Features & Tools")}
                      {onboardingSlide === 2 && (prefLanguage === "tagalog" ? "Setup ng Profile at Contact" : "Profile & Contact Setup")}
                      {onboardingSlide === 3 && (prefLanguage === "tagalog" ? "Handa Na Mag-Explore!" : "Ready to Explore!")}
                    </h3>
                    <p className="text-xs text-stone-300 font-medium mt-0.5 truncate">
                      {userSession.name} (@{userSession.username}) • Gumaca Housing Directory
                    </p>
                  </div>
                </div>

                {/* Animated Step Progress Bar */}
                <div className="mt-5 relative z-10">
                  <div className="flex justify-between text-[10px] font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                    <span>{prefLanguage === "tagalog" ? "Progreso" : "Progress"}</span>
                    <span>{((onboardingSlide + 1) * 25)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-indigo-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(onboardingSlide + 1) * 25}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-5 sm:p-6 bg-stone-50/60 dark:bg-stone-900/60 flex-1 overflow-y-auto max-h-[62vh]">
                <AnimatePresence mode="wait">
                  {/* SLIDE 0: Hero Welcome Card */}
                  {onboardingSlide === 0 && (
                    <motion.div
                      key="slide0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Greeting Card with Modern Glass Gradient */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50 dark:from-stone-800 dark:via-pink-950/30 dark:to-stone-800 border border-pink-200/80 dark:border-stone-700 space-y-3 relative overflow-hidden shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-pink-600 text-white rounded-xl text-xs font-bold shadow-xs">🏠</span>
                          <div>
                            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                              {prefLanguage === "tagalog" ? "CasaFinder Housing Portal Gumaca" : "CasaFinder Gumaca Housing Directory"}
                            </h4>
                            <p className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold">
                              {userSession.role === "student" ? "🎓 Registered Tenant Account" : "🏠 Verified Landlord Account"}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
                          {userSession.role === "student"
                            ? (prefLanguage === "tagalog"
                                ? "Subaybayan at maghanap ng pinakabagong boarding house, apartment, at dorm sa bayan ng Gumaca. May kasama itong live interactive barangay map, tricycle fare calculator, at roommate budget splitter."
                                : "Discover and connect with verified boarding houses, apartments, and dormitories in Gumaca, Quezon. Built-in with an interactive map, tricycle fare calculator, and roommate split tool.")
                            : (prefLanguage === "tagalog"
                                ? "I-post at pamahalaan ang inyong mga papaupahang silid para sa mga estudyante ng SLSU Gumaca, EQC, at mga manggagawa sa bayan. Libreng mag-upload ng mga larawan at permits."
                                : "List and manage your rental spaces for SLSU students, workers, and local tenants in Gumaca. Easily upload photos, terms, and Mayor's Permit verification.")
                          }
                        </p>
                      </div>

                      {/* 3 Quick Feature Highlight Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 space-y-1 shadow-2xs">
                          <span className="text-base block">🏢</span>
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-[11px]">
                            {prefLanguage === "tagalog" ? "100% Rehistrado" : "Verified Listings"}
                          </p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-light">
                            {prefLanguage === "tagalog" ? "Lahat ng uri ng tuluyan sa bayan" : "Comprehensive housing catalogue"}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 space-y-1 shadow-2xs">
                          <span className="text-base block">🗺️</span>
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-[11px]">
                            {prefLanguage === "tagalog" ? "Barangay Map" : "Interactive Map"}
                          </p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-light">
                            {prefLanguage === "tagalog" ? "Plotted sa Tabing Dagat & Mabini" : "Pinpoint locations near campuses"}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 space-y-1 shadow-2xs">
                          <span className="text-base block">🚕</span>
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-[11px]">
                            {prefLanguage === "tagalog" ? "Fare & Splitter" : "Fare & Utilities"}
                          </p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-light">
                            {prefLanguage === "tagalog" ? "Kalkulado ang pamasahe sa trike" : "Local tricycle fare calculator"}
                          </p>
                        </div>
                      </div>

                      {/* Action Navigation */}
                      <div className="pt-2 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setOnboardingSlide(1)}
                          className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>{prefLanguage === "tagalog" ? "Magsimula / Tingnan ang Tampok ➡️" : "Start / Explore Features ➡️"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* SLIDE 1: Interactive Features Overview */}
                  {onboardingSlide === 1 && (
                    <motion.div
                      key="slide1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-2 sm:space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-1.5 sm:pb-2">
                        <h4 className="font-bold text-stone-900 dark:text-stone-100 text-[11px] sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <span className="p-1 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 rounded-md">💡</span>
                          {prefLanguage === "tagalog" ? "Ano ang Magagawa Mo sa CasaFinder?" : "What You Can Do on CasaFinder"}
                        </h4>
                        <span className="text-[9px] sm:text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-1.5 py-0.5 rounded-full border border-pink-200/50 dark:border-pink-800">
                          {userSession.role === "student" ? "Tenant Mode" : "Landlord Mode"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                        {userSession.role === "student" ? (
                          <>
                            <div className="p-2 sm:p-3.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs hover:border-pink-300 dark:hover:border-pink-700 transition-colors">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xs sm:text-sm">
                                🔍
                              </div>
                              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-[10px] sm:text-xs leading-tight">{prefLanguage === "tagalog" ? "Filter sa Badyet" : "Filter by Budget"}</h5>
                              <p className="text-[9px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-tight font-light">
                                {prefLanguage === "tagalog" ? "Boarding house & apartment." : "Search by room type & price."}
                              </p>
                            </div>

                            <div className="p-2 sm:p-3.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs sm:text-sm">
                                🚕
                              </div>
                              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-[10px] sm:text-xs leading-tight">{prefLanguage === "tagalog" ? "Trike Fare Calc" : "Tricycle Fare Calc"}</h5>
                              <p className="text-[9px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-tight font-light">
                                {prefLanguage === "tagalog" ? "Pamasahe papuntang SLSU." : "Trike fare to campus."}
                              </p>
                            </div>

                            <div className="p-2 sm:p-3.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs sm:text-sm">
                                💰
                              </div>
                              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-[10px] sm:text-xs leading-tight">{prefLanguage === "tagalog" ? "Rent Splitter" : "Rent Splitter"}</h5>
                              <p className="text-[9px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-tight font-light">
                                {prefLanguage === "tagalog" ? "Hatian sa kuryente at upa." : "Split rent & utilities."}
                              </p>
                            </div>

                            <div className="p-2 sm:p-3.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs sm:text-sm">
                                💬
                              </div>
                              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-[10px] sm:text-xs leading-tight">{prefLanguage === "tagalog" ? "Direct Contact" : "Direct Call & FB"}</h5>
                              <p className="text-[9px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-tight font-light">
                                {prefLanguage === "tagalog" ? "Mabilisang tawag sa landlord." : "Contact verified landlords."}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 sm:p-3.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs sm:text-sm">
                                📢
                              </div>
                              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-[10px] sm:text-xs leading-tight">{prefLanguage === "tagalog" ? "Post Listing" : "Post Vacant Rooms"}</h5>
                              <p className="text-[9px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-tight font-light">
                                {prefLanguage === "tagalog" ? "Mag-upload ng larawan." : "Upload real room photos."}
                              </p>
                            </div>

                            <div className="p-2 sm:p-3.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs sm:text-sm">
                                🛡️
                              </div>
                              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-[10px] sm:text-xs leading-tight">{prefLanguage === "tagalog" ? "Permit Badge" : "Mayor's Permit"}</h5>
                              <p className="text-[9px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-tight font-light">
                                {prefLanguage === "tagalog" ? "Verified landlord badge." : "Earn verified badge."}
                              </p>
                            </div>

                            <div className="p-2 sm:p-3.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs sm:text-sm">
                                📱
                              </div>
                              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-[10px] sm:text-xs leading-tight">{prefLanguage === "tagalog" ? "Inquiries" : "Tenant Leads"}</h5>
                              <p className="text-[9px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-tight font-light">
                                {prefLanguage === "tagalog" ? "Tanggapin ang tawag." : "Direct calls from tenants."}
                              </p>
                            </div>

                            <div className="p-2 sm:p-3.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs hover:border-pink-300 dark:hover:border-pink-700 transition-colors">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xs sm:text-sm">
                                🗺️
                              </div>
                              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-[10px] sm:text-xs leading-tight">{prefLanguage === "tagalog" ? "Town Map" : "Pinpoint Location"}</h5>
                              <p className="text-[9px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-tight font-light">
                                {prefLanguage === "tagalog" ? "I-plot sa Gumaca map." : "Plot location on map."}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-1 sm:pt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setOnboardingSlide(0)}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          {prefLanguage === "tagalog" ? "⬅️ Bumalik" : "⬅️ Back"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setOnboardingSlide(2)}
                          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                        >
                          <span>{prefLanguage === "tagalog" ? "I-set up ang Profile ➡️" : "Set Up Profile ➡️"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* SLIDE 2: Profile & Contact Quick Setup */}
                  {onboardingSlide === 2 && (
                    <motion.div
                      key="slide2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-2 sm:space-y-3.5"
                    >
                      <div className="border-b border-stone-200 dark:border-stone-800 pb-1 sm:pb-2">
                        <h4 className="font-bold text-stone-900 dark:text-stone-100 text-[11px] sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <span className="p-1 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 rounded-md">👤</span>
                          {prefLanguage === "tagalog" ? "Setup ng Profile at Impormasyon" : "Profile & Contact Setup"}
                        </h4>
                      </div>

                      {/* Interactive Profile Photo Upload Card */}
                      <div className="p-2.5 sm:p-4 bg-gradient-to-r from-stone-50 via-pink-50/60 to-stone-50 dark:from-stone-800 dark:via-pink-950/20 dark:to-stone-800 text-stone-800 dark:text-stone-100 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 shadow-xs border border-stone-200/80 dark:border-stone-700 relative overflow-hidden">
                        {/* Avatar Halo Frame */}
                        <div className="relative group shrink-0 z-10">
                          <label className="cursor-pointer block relative">
                            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 shadow-md shadow-pink-500/20 group-hover:scale-105 transition-all">
                              <div className="w-full h-full rounded-full bg-white dark:bg-stone-900 overflow-hidden flex items-center justify-center border border-white dark:border-stone-800 relative">
                                {onboardingAvatar && (onboardingAvatar.startsWith("data:image/") || onboardingAvatar.startsWith("http")) ? (
                                  <img src={onboardingAvatar} alt="Profile Preview" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" referrerPolicy="no-referrer" />
                                ) : (
                                  <span className="text-lg sm:text-2xl">{onboardingAvatar || (userSession.role === "student" ? "🎓" : "🏠")}</span>
                                )}
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) {
                                  alert(prefLanguage === "tagalog" ? "Masyadong malaki ang larawan. Pumili ng mas mababa sa 5MB." : "Image too large. Select under 5MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  if (evt.target?.result) setOnboardingAvatar(evt.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0 z-10">
                          <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1">
                            <Camera className="h-3 w-3 text-pink-500" />
                            {prefLanguage === "tagalog" ? "Larawan sa Profile" : "Profile Picture"}
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95">
                              <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span>{prefLanguage === "tagalog" ? "Mag-upload" : "Upload Photo"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert(prefLanguage === "tagalog" ? "Masyadong malaki ang larawan. Pumili ng mas mababa sa 5MB." : "Image too large. Select under 5MB.");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    if (evt.target?.result) setOnboardingAvatar(evt.target.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>

                            {onboardingAvatar && (onboardingAvatar.startsWith("data:image/") || onboardingAvatar.startsWith("http")) && (
                              <button
                                type="button"
                                onClick={() => setOnboardingAvatar(userSession.role === "student" ? "🎓" : "🏠")}
                                className="px-2 py-1 text-[10px] sm:text-xs text-stone-600 dark:text-stone-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg sm:rounded-xl font-bold border border-stone-200 dark:border-stone-700 transition-colors"
                              >
                                {prefLanguage === "tagalog" ? "Alisin" : "Remove"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Inputs Grid on Mobile (2 columns) */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Full Name */}
                        <div className="space-y-0.5">
                          <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1">
                            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-pink-500" />
                            {prefLanguage === "tagalog" ? "Pangalan" : "Name"}
                          </label>
                          <input
                            type="text"
                            placeholder={userSession.role === "student" ? "Maria Santos" : "Aling Nena"}
                            value={onboardingName}
                            onChange={(e) => setOnboardingName(e.target.value)}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden font-medium"
                          />
                        </div>

                        {/* Phone / Mobile Number */}
                        <div className="space-y-0.5">
                          <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-pink-500" />
                            {prefLanguage === "tagalog" ? "Telepono" : "Phone"}
                          </label>
                          <input
                            type="tel"
                            placeholder="09171234567"
                            value={onboardingMobile}
                            onChange={(e) => setOnboardingMobile(e.target.value)}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-stone-800 dark:text-stone-100 font-mono"
                          />
                        </div>

                        {/* Barangay / Address */}
                        <div className="space-y-0.5">
                          <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-pink-500" />
                            {prefLanguage === "tagalog" ? "Barangay" : "Barangay"}
                          </label>
                          <input
                            type="text"
                            placeholder="Brgy. Mabini"
                            value={onboardingAddress}
                            onChange={(e) => setOnboardingAddress(e.target.value)}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-stone-800 dark:text-stone-100 font-medium"
                          />
                        </div>

                        {/* School / Workplace */}
                        <div className="space-y-0.5">
                          <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1">
                            <GraduationCap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-pink-500" />
                            {prefLanguage === "tagalog" ? "Paaralan / Work" : "School / Work"}
                          </label>
                          <input
                            type="text"
                            placeholder="SLSU Gumaca"
                            value={onboardingSchool}
                            onChange={(e) => setOnboardingSchool(e.target.value)}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm text-stone-800 dark:text-stone-100 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1">
                          <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-pink-500" />
                          {prefLanguage === "tagalog" ? "Maikling Bio" : "Short Bio"}
                        </label>
                        <textarea
                          rows={1}
                          placeholder={
                            userSession.role === "student"
                              ? (prefLanguage === "tagalog" ? "e.g. SLSU Student..." : "e.g. SLSU Student...")
                              : (prefLanguage === "tagalog" ? "e.g. Nagpapaupa sa Brgy. Mabini..." : "e.g. Renting rooms...")
                          }
                          value={onboardingBio}
                          onChange={(e) => setOnboardingBio(e.target.value)}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 rounded-lg sm:rounded-xl px-2 py-1 sm:p-2.5 text-[11px] sm:text-xs text-stone-800 dark:text-stone-100 font-medium resize-none"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="pt-1 sm:pt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setOnboardingSlide(1)}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          {prefLanguage === "tagalog" ? "⬅️ Bumalik" : "⬅️ Back"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setOnboardingSlide(3)}
                          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                        >
                          <span>{prefLanguage === "tagalog" ? "Susunod ➡️" : "Next ➡️"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* SLIDE 3: Features Tour & Finish */}
                  {onboardingSlide === 3 && (
                    <motion.div
                      key="slide3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-2.5 sm:space-y-4"
                    >
                      <div className="text-center space-y-1 sm:space-y-2 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-stone-800 dark:via-pink-950/30 dark:to-stone-800 border border-pink-200/80 dark:border-stone-700 p-3 sm:p-5 rounded-2xl shadow-xs">
                        <div className="text-2xl sm:text-4xl animate-bounce">🎉</div>
                        <h4 className="font-extrabold text-stone-900 dark:text-stone-100 text-xs sm:text-base">
                          {prefLanguage === "tagalog" ? "Handa ka nang mag-explore sa CasaFinder!" : "You're all set to explore CasaFinder!"}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-stone-600 dark:text-stone-300 max-w-xs mx-auto font-medium">
                          {prefLanguage === "tagalog"
                            ? "I-save ang iyong impormasyon para tuluyan nang ma-enjoy ang mga tampok na kasangkapan."
                            : "Save your details to complete setup and start exploring."
                          }
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-left">
                        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 sm:p-3 rounded-xl text-[10px] sm:text-xs space-y-0.5 shadow-2xs">
                          <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">📋 Listings</span>
                          <p className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400">{prefLanguage === "tagalog" ? "Lahat ng tuluyan" : "Complete catalogue"}</p>
                        </div>
                        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 sm:p-3 rounded-xl text-[10px] sm:text-xs space-y-0.5 shadow-2xs">
                          <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">🗺️ Map</span>
                          <p className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400">{prefLanguage === "tagalog" ? "Plotted sa Gumaca" : "Plotted map"}</p>
                        </div>
                        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 sm:p-3 rounded-xl text-[10px] sm:text-xs space-y-0.5 shadow-2xs">
                          <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">🚕 Fare Calc</span>
                          <p className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400">{prefLanguage === "tagalog" ? "Pamasahe sa trike" : "Trike estimates"}</p>
                        </div>
                        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 sm:p-3 rounded-xl text-[10px] sm:text-xs space-y-0.5 shadow-2xs">
                          <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">💰 Splitter</span>
                          <p className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400">{prefLanguage === "tagalog" ? "Hatiang badyet" : "Rent sharing"}</p>
                        </div>
                      </div>

                      {/* Final Submit / Finish Button */}
                      <form onSubmit={handleSaveOnboarding} className="pt-1 sm:pt-2 flex items-center justify-between gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setOnboardingSlide(2)}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          {prefLanguage === "tagalog" ? "⬅️ Bumalik" : "⬅️ Back"}
                        </button>

                        <button
                          type="submit"
                          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ml-auto"
                        >
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>{prefLanguage === "tagalog" ? "I-save & Magsimula Na 🎉" : "Save & Start Exploring 🎉"}</span>
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pop-up detail modal */}
      <AnimatePresence>
        {detailModalProperty && (
          <PropertyModal
            property={detailModalProperty}
            onClose={() => setDetailModalProperty(null)}
            onDelete={userSession?.role === "landlord" ? handleDeleteProperty : undefined}
            onViewLandlordProfile={(prop) => setLandlordProfileProperty(prop)}
            onViewOnMap={(prop, schoolId) => {
              setDetailModalProperty(null);
              handleViewOnMap(prop, schoolId);
            }}
            userSession={userSession}
            onAddReview={handleAddReview}
            onAddReply={handleAddReply}
            language={prefLanguage}
          />
        )}
      </AnimatePresence>

      {/* Landlord Profile Modal */}
      <AnimatePresence>
        {landlordProfileProperty && (() => {
          const propUsername = landlordProfileProperty.landlordUsername;
          const propName = landlordProfileProperty.landlordName || "Aling Nena";

          // Look up matched registered user if available
          const matchedUser = registeredUsers.find(
            (u) => (propUsername && u.username.toLowerCase() === propUsername.toLowerCase()) ||
                   (u.name.toLowerCase() === propName.toLowerCase())
          );

          const actualName = matchedUser?.name || landlordProfileProperty.landlordName || "Aling Nena";
          const actualUsername = matchedUser?.username || landlordProfileProperty.landlordUsername || "nena.landlord";
          const actualMobile = matchedUser?.mobile || landlordProfileProperty.landlordMobile || "09987654321";
          const actualEmail = matchedUser?.email || landlordProfileProperty.landlordEmail || (actualUsername ? `${actualUsername}@casafinder.ph` : "alingnena.housing@gmail.com");
          const actualBio = matchedUser?.bio || landlordProfileProperty.landlordBio || (prefLanguage === "tagalog"
            ? "Rehistradong Operator at May-ari ng Boarding House sa Gumaca, Quezon. Nagbibigay ng ligtas at malinis na tuluyan para sa mga estudyante."
            : "Registered Boarding House & Accommodation Owner in Gumaca, Quezon. Dedicated to providing safe, comfortable, and student-friendly lodgings.");
          const actualAvatar = landlordProfileProperty.landlordAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";

          const userPermitNo = matchedUser?.permitNo;
          const propPermits = landlordProfileProperty.landlordPermits;

          const actualPermits = {
            businessPermit: propPermits?.businessPermit || (userPermitNo ? (userPermitNo.startsWith("BP-") ? userPermitNo : `BP-GMC-${userPermitNo}`) : ""),
            barangayClearance: propPermits?.barangayClearance || "",
            fireSafetyCert: propPermits?.fireSafetyCert || "",
            dtiRegistration: propPermits?.dtiRegistration || "",
            sanitaryPermit: propPermits?.sanitaryPermit || ""
          };

          let matchedProperties = propertiesList.filter((p) => {
            if (p.id === landlordProfileProperty.id) return true;

            const pUsername = (p.landlordUsername || "").toLowerCase();
            const u1 = (actualUsername || "").toLowerCase();
            const u2 = (propUsername || "").toLowerCase();
            if (pUsername && ((u1 && pUsername === u1) || (u2 && pUsername === u2))) return true;

            const pName = (p.landlordName || "").toLowerCase();
            const n1 = (actualName || "").toLowerCase();
            const n2 = (propName || "").toLowerCase();
            if (pName && ((n1 && pName === n1) || (n2 && pName === n2))) return true;

            const pEmail = (p.landlordEmail || "").toLowerCase();
            const e1 = (actualEmail || "").toLowerCase();
            const e2 = (landlordProfileProperty.landlordEmail || "").toLowerCase();
            if (pEmail && ((e1 && pEmail === e1) || (e2 && pEmail === e2))) return true;

            const pMobile = p.landlordMobile || "";
            const m1 = actualMobile || "";
            const m2 = landlordProfileProperty.landlordMobile || "";
            if (pMobile && ((m1 && pMobile === m1) || (m2 && pMobile === m2))) return true;

            return false;
          });
          if (!matchedProperties.some(p => p.id === landlordProfileProperty.id)) {
            matchedProperties = [landlordProfileProperty, ...matchedProperties];
          }

          return (
            <LandlordProfileModal
              landlordInfo={{
                username: actualUsername,
                name: actualName,
                mobile: actualMobile,
                email: actualEmail,
                facebook: matchedUser?.facebook || "",
                avatar: actualAvatar,
                bio: actualBio,
                permits: actualPermits,
              }}
              landlordProperties={matchedProperties}
              onClose={() => setLandlordProfileProperty(null)}
              onSelectProperty={(prop) => {
                setSelectedProperty(prop);
                setDetailModalProperty(prop);
                setLandlordProfileProperty(null);
              }}
              onViewOnMap={handleViewOnMap}
              language={prefLanguage}
            />
          );
        })()}
      </AnimatePresence>

      {/* Homeowner / Landlord Upload Boarding House Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-stone-900/60 backdrop-blur-md overflow-y-auto">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-200 z-10 max-h-[92vh] lg:max-h-[88vh] my-auto"
            >
              {/* Modal Header */}
              <div className="bg-indigo-600 text-white p-3.5 sm:p-5 lg:p-6 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="text-lg sm:text-xl lg:text-2xl">🏠</span>
                  <div>
                    <h3 className="font-display font-bold text-xs sm:text-base lg:text-xl">{t("modalPostTitle")}</h3>
                    <p className="text-[9px] sm:text-[10px] lg:text-xs text-indigo-100 font-light mt-0.5">{prefLanguage === "tagalog" ? "I-anunsyo ang iyong bakanteng silid para sa mga estudyante sa Gumaca" : "Advertise your vacant room for Gumaca students"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 lg:p-2 bg-indigo-700/50 hover:bg-indigo-700 hover:scale-105 rounded-full transition-all text-white cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddPropertySubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-3.5 sm:space-y-4 lg:space-y-6 animate-none">
                {/* Basic Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2.5 sm:gap-4 lg:gap-6">
                  <div className="flex flex-col space-y-1 lg:space-y-1.5">
                    <label className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Pangalan ng Tuluyan *" : "Boarding House Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={prefLanguage === "tagalog" ? "hal. Mary's Boarding House" : "e.g. Mary's Cozy Boarding House"}
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 sm:py-2 lg:py-2.5 lg:px-3.5 text-xs lg:text-sm text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 lg:space-y-1.5">
                    <label className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Buwanang Upa (PHP) *" : "Monthly Rent (PHP) *"}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 2500"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 sm:py-2 lg:py-2.5 lg:px-3.5 text-xs lg:text-sm text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Type & Specs Section */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">
                      {t("filterType")}
                    </label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value as "Boarding House" | "Apartment" | "Others")}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 sm:py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer truncate"
                    >
                      <option value="Boarding House">{t("typeBoardingHouse")}</option>
                      <option value="Apartment">{t("typeApartment")}</option>
                      <option value="Others">{t("typeOthers")}</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">
                      {prefLanguage === "tagalog" ? "Kama" : "Beds"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newBeds}
                      onChange={e => setNewBeds(Number(e.target.value))}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 sm:py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">
                      {prefLanguage === "tagalog" ? "Banyo" : "Baths"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newBaths}
                      onChange={e => setNewBaths(Number(e.target.value))}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 sm:py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Location Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Barangay sa Gumaca, Quezon *
                    </label>
                    <select
                      value={newNeighborhood}
                      onChange={e => {
                        const brgy = e.target.value;
                        setNewNeighborhood(brgy);
                      }}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white cursor-pointer"
                    >
                      {GUMACA_BARANGAYS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Lokasyon / Landmark sa Gumaca *" : "General Location / Landmark in Gumaca *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={prefLanguage === "tagalog" ? "hal. Malapit sa SLSU Gumaca Campus" : "e.g. Near SLSU Gumaca, Barangay Tabing Dagat, Gumaca, Quezon"}
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-stone-500 italic mt-0.5">
                      🔒 {prefLanguage === "tagalog" ? "Payo: Maglagay ng landmark o kalsada sa Gumaca, Quezon (hal. 'Malapit sa SLSU Gate')." : "Tip: Enter a landmark or street in Gumaca, Quezon (e.g. 'Near SLSU Gumaca Main Gate')."}
                    </p>
                  </div>
                </div>

                {/* Interactive Map for Posting Location & GPS Pin */}
                <PostingLocationMap
                  lat={newCustomLat}
                  lng={newCustomLng}
                  onChangeLocation={(lat, lng) => {
                    setNewCustomLat(lat);
                    setNewCustomLng(lng);
                    setIsPinCustomized(true);
                  }}
                  neighborhood={newNeighborhood}
                  language={prefLanguage}
                />

                {/* Gender Accommodation Selection */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {prefLanguage === "tagalog" ? "Uri ng Kasarian *" : "Gender Type *"}
                  </label>
                  <select
                    value={newGenderPolicy}
                    onChange={e => setNewGenderPolicy(e.target.value as "Both" | "Girls Only" | "Boys Only")}
                    className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 sm:py-2 text-xs text-stone-800 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white cursor-pointer"
                  >
                    <option value="Both">{prefLanguage === "tagalog" ? "Lahat (Co-ed)" : "Both (Co-ed)"}</option>
                    <option value="Girls Only">{prefLanguage === "tagalog" ? "Pang-babae Lamang 👧" : "Girls Only 👧"}</option>
                    <option value="Boys Only">{prefLanguage === "tagalog" ? "Pang-lalaki Lamang 👦" : "Boys Only 👦"}</option>
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {prefLanguage === "tagalog" ? "Deskripsyon at Detalye (Curfew, Kontak, atbp.)" : "Description & Details (Contact, Curfew, etc.)"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={prefLanguage === "tagalog" ? "hal. Bukod na submeter sa kuryente. Malapit sa SLSU Gumaca Campus. Kontak: 09123456789." : "e.g. Separate electric meter. Near SLSU Gumaca Campus. Contact: 09123456789."}
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white resize-none"
                  />
                </div>

                {/* Photo Upload Section */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700 font-bold">
                      <Camera className="h-4 w-4 text-pink-600" />
                      {prefLanguage === "tagalog" ? "Litrato ng Tuluyan *" : "Establishment Photo *"}
                    </span>
                    {isCustomUpload && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" /> {prefLanguage === "tagalog" ? "Na-upload Na" : "Uploaded"}
                      </span>
                    )}
                  </label>

                  {/* Upload Box */}
                  <div className="border-2 border-dashed border-stone-200 hover:border-pink-400 bg-stone-50/70 rounded-2xl p-4 transition-all text-center relative group">
                    <input
                      type="file"
                      accept="image/*"
                      id="establishment-photo-upload"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />

                    {newImageUrl ? (
                      <div className="space-y-3">
                        <div className="relative aspect-video max-h-52 mx-auto rounded-xl overflow-hidden border border-stone-200 shadow-md group">
                          <img
                            src={newImageUrl}
                            alt="Uploaded Establishment"
                            className="w-full h-full object-cover"
                          />
                          {isCustomUpload && (
                            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                              <Check className="h-3 w-3" /> {prefLanguage === "tagalog" ? "Tunay na Litrato" : "Real Establishment Photo"}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setNewImageUrl("");
                              setIsCustomUpload(false);
                              setUploadedFileName("");
                            }}
                            className="absolute top-2 right-2 bg-stone-900/80 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all cursor-pointer shadow-md"
                            title="Remove Photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {uploadedFileName && (
                          <p className="text-[11px] font-mono text-stone-500 truncate max-w-xs mx-auto">
                            📄 {uploadedFileName}
                          </p>
                        )}

                        <label
                          htmlFor="establishment-photo-upload"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                        >
                          <Upload className="h-3.5 w-3.5 text-stone-600" />
                          <span>{prefLanguage === "tagalog" ? "Palitan ang Litrato mula sa CP / Kamera" : "Change Photo from Device/Camera"}</span>
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="establishment-photo-upload"
                        className="flex flex-col items-center justify-center py-5 cursor-pointer space-y-2 group"
                      >
                        <div className="w-12 h-12 bg-pink-50 group-hover:bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center transition-all shadow-xs">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-800 group-hover:text-pink-600 transition-colors">
                            {prefLanguage === "tagalog" ? "Pindutin para mag-upload ng Tunay na Litrato ng Silid" : "Click to upload a Real Photo of the Room / Establishment"}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {prefLanguage === "tagalog" ? "Mula sa CP Gallery, File, o kumuha gamit ang Kamera (PNG, JPG, WEBP)" : "From Phone Gallery, File, or take with Camera (PNG, JPG, WEBP)"}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Optional Sample Presets Accordion / Fallback */}
                  <details className="text-stone-500 text-xs mt-1">
                    <summary className="cursor-pointer text-[10px] font-semibold text-stone-400 hover:text-stone-600 select-none">
                      {prefLanguage === "tagalog" ? "Wala pang litrato? Pumili sa Halimbawang Sampol (Opsyonal)" : "No photo yet? Choose from Sample Examples (Optional)"}
                    </summary>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-stone-100">
                      {IMAGE_PRESETS.map((preset) => {
                        const isSelected = newImageUrl === preset.url && !isCustomUpload;
                        return (
                          <div
                            key={preset.url}
                            onClick={() => {
                              setNewImageUrl(preset.url);
                              setIsCustomUpload(false);
                              setUploadedFileName("");
                            }}
                            className={`relative aspect-video rounded-xl overflow-hidden border cursor-pointer transition-all ${
                              isSelected ? "ring-2 ring-pink-500 border-transparent scale-[1.02]" : "border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-stone-900/60 p-1 text-[8px] text-white text-center font-medium truncate">
                              {preset.label}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-gradient-to-r from-pink-500 to-blue-600 text-white rounded-full p-0.5 shadow-md">
                                <Check className="h-2.5 w-2.5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>

                {/* Amenities checklist */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-400">
                    {prefLanguage === "tagalog" ? "Magdagdag ng Amenities / Serbiyo (Piliin ang nararapat)" : "Add Amenities / Features (Select all that apply)"}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-2.5">
                    {AMENITY_PRESETS.map((amenity) => {
                      const isChecked = newSelectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 lg:py-2 rounded-lg border text-left text-[11px] lg:text-xs transition-all cursor-pointer ${
                            isChecked
                              ? "bg-pink-50 border-pink-200 text-pink-700 font-medium"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 lg:w-4 lg:h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-gradient-to-r from-pink-500 to-blue-600 border-transparent text-white" : "border-stone-300 bg-white"
                          }`}>
                            {isChecked && <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-stone-100 flex gap-2 lg:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl py-2.5 lg:py-3 text-xs lg:text-sm font-semibold transition-all cursor-pointer"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white rounded-xl py-2.5 lg:py-3 text-xs lg:text-sm font-bold transition-all shadow-md shadow-pink-500/20 cursor-pointer"
                  >
                    {prefLanguage === "tagalog" ? "I-save at I-post ang Tuluyan 🚀" : "Save & Post Listing 🚀"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Map Page */}
      <AnimatePresence>
        {showMapPage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-[#faf9f6] flex flex-col"
          >
            {/* Map Page Header */}
            <header className="bg-white border-b border-stone-200 px-3 py-2.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 shadow-xs shrink-0">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="p-2 sm:p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-100 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display font-bold text-stone-900 text-sm sm:text-base md:text-lg leading-snug truncate">
                    {prefLanguage === "tagalog" ? "Mapa ng mga Tuluyan sa Gumaca 🗺️" : "Gumaca Housing & Dormitory Map 🗺️"}
                  </h2>
                  <p className="text-[10px] text-stone-400 font-light mt-0.5 hidden xs:block truncate">
                    {prefLanguage === "tagalog" ? "Hanapin sa mapa ang mga boarding house malapit sa SLSU Gumaca Campus & Eastern Quezon College" : "Visually locate boarding rooms and apartments near SLSU Gumaca Campus & Eastern Quezon College"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMapPage(false)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto shrink-0"
              >
                <X className="h-4 w-4" />
                <span>{prefLanguage === "tagalog" ? "Isara ang Mapa" : "Close Map view"}</span>
              </button>
            </header>

            {/* Mobile Tab Switcher (Interactive Map vs Plotted List) */}
            <div className="lg:hidden flex border-b border-stone-200 bg-stone-100 p-1.5 gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMapTab("map")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileMapTab === "map"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{prefLanguage === "tagalog" ? "Interactive Map 🗺️" : "Interactive Map 🗺️"}</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMapTab("list")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileMapTab === "list"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                <span>{prefLanguage === "tagalog" ? `Listahan (${processedProperties.length})` : `Listings (${processedProperties.length})`}</span>
              </button>
            </div>

            {/* Map Page Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
              {/* Left Side: Plotted Listings sidebar */}
              <div className={`w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-stone-200 bg-white flex flex-col h-full overflow-hidden ${
                mobileMapTab === "list" ? "flex" : "hidden lg:flex"
              }`}>
                <div className="p-3 sm:p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center shrink-0">
                  <span className="text-xs font-mono font-bold text-stone-500">
                    {processedProperties.length} {prefLanguage === "tagalog" ? "Pla-notted na Tuluyan" : "Student Listings Plotted"}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-100/55 animate-pulse">
                    {prefLanguage === "tagalog" ? "Pindutin ang pin sa mapa" : "Click pins on map to select"}
                  </span>
                </div>
                
                {/* Scrollable list of properties on map */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                  {processedProperties.length === 0 ? (
                    <div className="text-center py-12 px-4 text-stone-400 text-xs font-light">
                      {prefLanguage === "tagalog" ? "Walang boarding house na tumugma. Subukang baguhin ang mga filter!" : "No boarding houses fit your search query. Adjust the keyword search on the main dashboard!"}
                    </div>
                  ) : (
                    processedProperties.map((p) => {
                      const isSelected = selectedProperty?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProperty(p);
                            setMobileMapTab("map");
                          }}
                          className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                              : "bg-white border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex gap-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-14 h-14 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wide mb-1">
                                ₱{p.price.toLocaleString()} / mo
                              </span>
                              <h4 className="font-sans font-semibold text-xs text-stone-900 truncate">
                                {p.title}
                              </h4>
                              <p className="text-[10px] text-stone-400 font-light truncate mt-0.5">
                                {p.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Side: Interactive Map Frame */}
              <div className={`flex-1 bg-stone-50 p-1.5 sm:p-4 lg:p-6 flex flex-col h-full relative overflow-hidden ${
                mobileMapTab === "map" ? "flex" : "hidden lg:flex"
              }`}>
                <div className="flex-1 bg-white border border-stone-200 rounded-xl sm:rounded-2xl shadow-xs overflow-hidden relative">
                  <NeighborhoodMap
                    properties={processedProperties}
                    selectedProperty={selectedProperty}
                    onSelectProperty={(prop) => {
                      setSelectedProperty(prop);
                      if (!prop) {
                        setSelectedSchoolIdForMap("none");
                      }
                    }}
                    onOpenDetails={(prop) => {
                      setSelectedProperty(prop);
                      setDetailModalProperty(prop);
                    }}
                    selectedSchoolId={selectedSchoolIdForMap}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile & Account Settings Modal */}
      <AnimatePresence>
        {showProfileModal && userSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-md w-full overflow-hidden my-auto max-h-[88vh] flex flex-col text-stone-800 dark:text-stone-100"
            >
              {/* Modal Header */}
              <div className="bg-stone-900 dark:bg-stone-950 text-white p-3.5 sm:p-4 relative flex items-center gap-3 shrink-0 border-b border-stone-800">
                <div className="h-10 w-10 bg-gradient-to-tr from-pink-500 to-blue-600 rounded-xl flex items-center justify-center text-lg shadow-md shadow-pink-500/20 shrink-0 overflow-hidden">
                  {userSession.avatar && (userSession.avatar.startsWith("data:image/") || userSession.avatar.startsWith("http")) ? (
                    <img src={userSession.avatar} alt={userSession.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    userSession.avatar || (userSession.role === "student" ? "🎓" : "🏠")
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-display font-bold text-sm text-white truncate">
                      {t("profileTitle")}
                    </h2>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                      userSession.role === "student"
                        ? "bg-pink-950/80 text-pink-300 border-pink-800"
                        : "bg-blue-950/80 text-blue-300 border-blue-800"
                    }`}>
                      {userSession.role === "student" ? t("studentAccount") : t("landlordAccount")}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-300 font-light truncate mt-0.5">
                    {userSession.name} (@{userSession.username})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/90 dark:bg-stone-900 px-3 pt-2 gap-1.5 overflow-x-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setProfileTab("profile")}
                  className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-t-xl ${
                    profileTab === "profile"
                      ? "border-pink-500 bg-pink-600 dark:bg-pink-600 text-white dark:text-white shadow-2xs"
                      : "border-transparent text-stone-900 dark:text-black bg-stone-200/80 dark:bg-stone-300 hover:bg-stone-300 dark:hover:bg-stone-200"
                  }`}
                >
                  <User className={`h-3.5 w-3.5 ${profileTab === "profile" ? "text-white dark:text-white" : "text-pink-600 dark:text-pink-700"}`} />
                  <span className={profileTab === "profile" ? "text-white dark:text-white font-bold" : "text-black dark:text-black force-black font-bold"}>{t("tabProfileInfo")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab("settings")}
                  className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-t-xl ${
                    profileTab === "settings"
                      ? "border-pink-500 bg-pink-600 dark:bg-pink-600 text-white dark:text-white shadow-2xs"
                      : "border-transparent text-stone-900 dark:text-black bg-stone-200/80 dark:bg-stone-300 hover:bg-stone-300 dark:hover:bg-stone-200"
                  }`}
                >
                  <Lock className={`h-3.5 w-3.5 ${profileTab === "settings" ? "text-white dark:text-white" : "text-pink-600 dark:text-pink-700"}`} />
                  <span className={profileTab === "settings" ? "text-white dark:text-white font-bold" : "text-black dark:text-black force-black font-bold"}>{t("tabSecurity")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab("notifications")}
                  className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-t-xl ${
                    profileTab === "notifications"
                      ? "border-pink-500 bg-pink-600 dark:bg-pink-600 text-white dark:text-white shadow-2xs"
                      : "border-transparent text-stone-900 dark:text-black bg-stone-200/80 dark:bg-stone-300 hover:bg-stone-300 dark:hover:bg-stone-200"
                  }`}
                >
                  <Bell className={`h-3.5 w-3.5 ${profileTab === "notifications" ? "text-white dark:text-white" : "text-pink-600 dark:text-pink-700"}`} />
                  <span className={profileTab === "notifications" ? "text-white dark:text-white font-bold" : "text-black dark:text-black force-black font-bold"}>{t("tabPreferences")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab("about")}
                  className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-t-xl ${
                    profileTab === "about"
                      ? "border-pink-500 bg-pink-600 dark:bg-pink-600 text-white dark:text-white shadow-2xs"
                      : "border-transparent text-stone-900 dark:text-black bg-stone-200/80 dark:bg-stone-300 hover:bg-stone-300 dark:hover:bg-stone-200"
                  }`}
                >
                  <Info className={`h-3.5 w-3.5 ${profileTab === "about" ? "text-white dark:text-white" : "text-pink-600 dark:text-pink-700"}`} />
                  <span className={profileTab === "about" ? "text-white dark:text-white font-bold" : "text-black dark:text-black force-black font-bold"}>{t("tabAbout")}</span>
                </button>
              </div>

              {/* Modal Body & Form */}
              <form onSubmit={handleSaveProfile} className="p-3.5 space-y-3 overflow-y-auto flex-1">
                {profileSuccessMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </motion.div>
                )}

                {/* TAB 1: Profile Info */}
                {profileTab === "profile" && (
                  <div className="space-y-4">
                    {/* Profile Photo Upload & Header Card - MLBB Light Style */}
                    <div className="p-5 bg-gradient-to-b from-stone-50 via-pink-50/50 to-stone-50 dark:from-stone-900 dark:via-pink-950/20 dark:to-stone-900 text-stone-800 dark:text-stone-100 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-xs border border-stone-200/90 dark:border-stone-800 relative overflow-hidden">
                      {/* Blurred Photo Backdrop if photo is set */}
                      {profileEditAvatar && (profileEditAvatar.startsWith("data:image/") || profileEditAvatar.startsWith("http")) && (
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
                          <img
                            src={profileEditAvatar}
                            alt="Background"
                            className="w-full h-full object-cover scale-150 blur-2xl opacity-35 dark:opacity-20"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-white/25 dark:bg-black/40" />
                        </div>
                      )}

                      <div className="text-[10px] font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400 flex items-center gap-1.5 z-10">
                        <Camera className="h-3.5 w-3.5 text-pink-500 dark:text-pink-400" />
                        <span>{prefLanguage === "tagalog" ? "Larawan sa Profile at Frame" : "Profile Picture & Avatar Frame"}</span>
                      </div>

                      {/* Interactive MLBB Circular Avatar with Frame Ring & Camera Overlay Badge */}
                      <div className="relative group z-10 my-1">
                        <label className="cursor-pointer block relative">
                          {/* MLBB Golden/Pink Halo Frame Ring */}
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-all duration-300">
                            <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-white relative">
                              {profileEditAvatar && (profileEditAvatar.startsWith("data:image/") || profileEditAvatar.startsWith("http")) ? (
                                <img src={profileEditAvatar} alt="Profile" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-4xl">{profileEditAvatar || (userSession.role === "student" ? "🎓" : "🏠")}</span>
                              )}

                              {/* Hover Overlay Camera */}
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="h-8 w-8 text-white drop-shadow-md" />
                              </div>
                            </div>
                          </div>

                          {/* MLBB Style Floating Camera Badge at Bottom Right */}
                          <div className="absolute bottom-0 right-0 bg-gradient-to-r from-pink-500 to-rose-600 text-white p-2 rounded-full shadow-md border-2 border-white group-hover:scale-110 transition-transform flex items-center justify-center">
                            <Camera className="h-4 w-4" />
                          </div>

                          {/* Hidden File Input */}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                alert(prefLanguage === "tagalog" ? "Masyadong malaki ang larawan. Pumili ng mas mababa sa 5MB." : "Image too large. Select under 5MB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                if (evt.target?.result) setProfileEditAvatar(evt.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>

                      <p className="text-[11px] text-stone-600 font-medium z-10">
                        {prefLanguage === "tagalog" ? "Pindutin ang larawan para mag-upload mula sa Gallery" : "Tap picture to upload from gallery"}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-2 flex-wrap z-10 pt-1">
                        <label className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{prefLanguage === "tagalog" ? "Mag-upload ng Larawan" : "Upload Photo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                alert(prefLanguage === "tagalog" ? "Masyadong malaki ang larawan. Pumili ng mas mababa sa 5MB." : "Image too large. Select under 5MB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                if (evt.target?.result) setProfileEditAvatar(evt.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>

                        {profileEditAvatar && (profileEditAvatar.startsWith("data:image/") || profileEditAvatar.startsWith("http")) && (
                          <button
                            type="button"
                            onClick={() => setProfileEditAvatar(userSession.role === "student" ? "🎓" : "🏠")}
                            className="px-3 py-2 text-xs text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold border border-stone-200 transition-colors"
                          >
                            {prefLanguage === "tagalog" ? "Alisin" : "Remove"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <User className="h-3 w-3 text-stone-400" />
                          {t("fullName")}
                        </label>
                        <input
                          type="text"
                          required
                          value={profileEditName}
                          onChange={(e) => setProfileEditName(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-medium outline-none"
                          placeholder={t("fullName")}
                        />
                      </div>

                      {/* Username (Read Only) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3 text-stone-400" />
                            Username
                          </span>
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 font-normal">{prefLanguage === "tagalog" ? "Hindi Mababago" : "Fixed ID"}</span>
                        </label>
                        <input
                          type="text"
                          disabled
                          value={userSession.username}
                          className="w-full bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 rounded-xl px-3 py-2 text-xs text-stone-500 dark:text-stone-400 font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-stone-400" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileEditEmail}
                          onChange={(e) => setProfileEditEmail(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-medium outline-none"
                          placeholder="email@example.com"
                        />
                      </div>

                      {/* Mobile Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-stone-400" />
                          {prefLanguage === "tagalog" ? "Numero ng Telepono / Mobile" : "Mobile Number"}
                        </label>
                        <input
                          type="tel"
                          value={profileEditMobile}
                          onChange={(e) => setProfileEditMobile(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-mono outline-none"
                          placeholder="09123456789"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Address in Gumaca */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-stone-400" />
                          {prefLanguage === "tagalog" ? "Barangay / Tirahan sa Gumaca" : "Barangay / Address in Gumaca"}
                        </label>
                        <input
                          type="text"
                          value={profileEditAddress}
                          onChange={(e) => setProfileEditAddress(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-medium outline-none"
                          placeholder="e.g. Brgy. Mabini, Gumaca, Quezon"
                        />
                      </div>

                      {/* Emergency Contact */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <PhoneCall className="h-3 w-3 text-stone-400" />
                          {prefLanguage === "tagalog" ? "Emergency Contact / Magulang" : "Emergency Contact / Guardian"}
                        </label>
                        <input
                          type="text"
                          value={profileEditEmergencyContact}
                          onChange={(e) => setProfileEditEmergencyContact(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-medium outline-none"
                          placeholder={userSession.role === "student" ? "Pangalan at Numero ng Magulang/Guardian" : "Barangay / Office Contact"}
                        />
                      </div>
                    </div>

                    {/* Facebook Profile Link / Messenger */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Facebook className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        {prefLanguage === "tagalog" ? "Facebook Account / Profile Link (Messenger)" : "Facebook Profile Link / Messenger"}
                      </label>
                      <input
                        type="url"
                        value={profileEditFacebook}
                        onChange={(e) => setProfileEditFacebook(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-medium outline-none"
                        placeholder="https://facebook.com/your.profile"
                      />
                    </div>

                    {/* School / Institution / Business */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        {userSession.role === "student" ? (
                          <GraduationCap className="h-3 w-3 text-stone-400" />
                        ) : (
                          <Building className="h-3 w-3 text-stone-400" />
                        )}
                        {userSession.role === "student" ? (prefLanguage === "tagalog" ? "Paaralan / Trabaho / Unibersidad" : "School / Workplace / College") : (prefLanguage === "tagalog" ? "Pangalan ng Negosyo / Tuluyan" : "Housing Business Name")}
                      </label>
                      <input
                        type="text"
                        value={profileEditSchool}
                        onChange={(e) => setProfileEditSchool(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-medium outline-none"
                        placeholder={userSession.role === "student" ? "SLSU Gumaca / PUP / Empleyado sa Bayan" : "Dormitory / Apartment Name"}
                      />
                    </div>

                    {/* Short Bio / Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        {prefLanguage === "tagalog" ? "Maikling Tungkol sa Sarili / Bio" : "Short Bio / Note"}
                      </label>
                      <textarea
                        rows={3}
                        value={profileEditBio}
                        onChange={(e) => setProfileEditBio(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-normal resize-none outline-none"
                        placeholder={prefLanguage === "tagalog" ? "Ipakilala ang sarili o mag-iwan ng maikling tala..." : "Introduce yourself or leave a short note..."}
                      />
                    </div>

                    {/* Business Permit & Verification Proof Section (Landlords only) */}
                    {userSession.role === "landlord" && (
                      <div className="pt-3.5 border-t border-stone-200/80 dark:border-stone-700/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide">
                              {prefLanguage === "tagalog" ? "Business Permit at Katibayan (Proof)" : "Business Permit & Proof Documents"}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2.5 py-0.5 rounded-full">
                            <ShieldCheck className="h-3 w-3 text-stone-500 shrink-0" />
                            {profileEditPermitStatus || (prefLanguage === "tagalog" ? "Hindi pa nafi-fill out" : "Not Provided")}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {/* Permit / Document Number */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                              <Award className="h-3 w-3 text-stone-400 shrink-0" />
                              {prefLanguage === "tagalog" ? "Numero ng Mayor's / Business Permit" : "Mayor's / Business Permit No."}
                            </label>
                            <input
                              type="text"
                              value={profileEditPermitNo}
                              onChange={(e) => setProfileEditPermitNo(e.target.value)}
                              className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 font-mono outline-none"
                              placeholder="e.g. BP-2026-GUM-8842"
                            />
                          </div>

                          {/* Upload Attachment File */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                              <FileText className="h-3 w-3 text-stone-400 shrink-0" />
                              {prefLanguage === "tagalog" ? "Kopyang Permit / Dokumento (Attachment)" : "Proof Document / Permit File"}
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type="file"
                                id="profile-permit-file-upload"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setProfileEditPermitFile(file.name);
                                    setProfileEditPermitStatus(prefLanguage === "tagalog" ? "Naka-upload (Para sa Review)" : "Uploaded - Pending Review");
                                  }
                                }}
                              />
                              <label
                                htmlFor="profile-permit-file-upload"
                                className="w-full bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-200 font-medium flex items-center justify-between cursor-pointer transition-colors"
                              >
                                <span className="truncate max-w-[160px] font-mono text-[11px] text-stone-600 dark:text-stone-300">
                                  {profileEditPermitFile || (prefLanguage === "tagalog" ? "Pumili ng permit file..." : "Choose permit file...")}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-2 py-0.5 rounded-md shrink-0">
                                  <Upload className="h-3 w-3" />
                                  {prefLanguage === "tagalog" ? "I-upload" : "Upload"}
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* File Document Attached Banner */}
                        {profileEditPermitFile && (
                          <div className="p-2.5 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center justify-between text-xs text-stone-700">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="h-4 w-4 text-pink-600 shrink-0" />
                              <span className="font-mono text-[11px] font-medium text-stone-800 truncate">{profileEditPermitFile}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md shrink-0">
                              {prefLanguage === "tagalog" ? "Naka-attach na Katibayan" : "Attached Proof"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Security & Password */}
                {profileTab === "settings" && (
                  <div className="space-y-4">
                    {/* Security Success / Error Messages */}
                    {securityMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{securityMsg}</span>
                      </div>
                    )}
                    {securityErrorMsg && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>{securityErrorMsg}</span>
                      </div>
                    )}

                    {/* Security Health Status Card */}
                    <div className="p-4 bg-gradient-to-r from-stone-900 via-pink-950 to-stone-900 text-white rounded-2xl shadow-md border border-stone-800 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-stone-100">
                              {prefLanguage === "tagalog" ? "Status ng Account Security" : "Account Security Status"}
                            </h4>
                            <p className="text-[10px] text-stone-300">
                              {prefLanguage === "tagalog" ? "Protektado ng end-to-end encryption" : "Protected with end-to-end encryption"}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] rounded-full flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {is2FAEnabled
                            ? (prefLanguage === "tagalog" ? "HIGH SECURITY 🛡️" : "HIGH SECURITY 🛡️")
                            : (prefLanguage === "tagalog" ? "PROTECTED 🟢" : "PROTECTED 🟢")}
                        </span>
                      </div>

                      {/* Security Features Overview Badges */}
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-800/80 text-[10px]">
                        <div className="bg-stone-800/60 p-2 rounded-xl text-center border border-stone-700/50">
                          <span className="text-stone-400 block text-[9px] uppercase font-bold">{prefLanguage === "tagalog" ? "Password" : "Password"}</span>
                          <span className="font-bold text-emerald-400">{profileEditPassword ? (prefLanguage === "tagalog" ? "Naka-set 🔒" : "Configured 🔒") : (prefLanguage === "tagalog" ? "Aktibo 🟢" : "Active 🟢")}</span>
                        </div>
                        <div className="bg-stone-800/60 p-2 rounded-xl text-center border border-stone-700/50">
                          <span className="text-stone-400 block text-[9px] uppercase font-bold">2FA (SMS/OTP)</span>
                          <span className={`font-bold ${is2FAEnabled ? "text-emerald-400" : "text-amber-400"}`}>
                            {is2FAEnabled ? (prefLanguage === "tagalog" ? "Naka-ON 🟢" : "ON 🟢") : (prefLanguage === "tagalog" ? "Naka-OFF ⚪" : "OFF ⚪")}
                          </span>
                        </div>
                        <div className="bg-stone-800/60 p-2 rounded-xl text-center border border-stone-700/50">
                          <span className="text-stone-400 block text-[9px] uppercase font-bold">4-Digit PIN</span>
                          <span className="font-bold text-pink-300">{securityPin ? (prefLanguage === "tagalog" ? "Naka-set 🔑" : "Set 🔑") : (prefLanguage === "tagalog" ? "Wala pa" : "Not Set")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Change Password & Password Strength Meter */}
                    <div className="bg-stone-50/80 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 space-y-3">
                      <div className="flex items-center gap-2 border-b border-stone-200/60 dark:border-stone-700/60 pb-2">
                        <KeyRound className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" />
                        <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          {prefLanguage === "tagalog" ? "Pagbabago ng Password" : "Change Password"}
                        </h4>
                      </div>

                      {/* Kasalukuyang Password (Current Password) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                          {prefLanguage === "tagalog" ? "Kasalukuyang Password (I-type para kumpirmahin)" : "Current Password (Optional)"}
                        </label>
                        <div className="relative">
                          <input
                            type={showProfileCurrentPassword ? "text" : "password"}
                            value={profileCurrentPassword}
                            onChange={(e) => setProfileCurrentPassword(e.target.value)}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:border-pink-500 rounded-xl pl-3 pr-10 py-2 text-xs text-stone-800 dark:text-stone-100 font-mono outline-none"
                            placeholder={prefLanguage === "tagalog" ? "I-type ang kasalukuyang password" : "Type current password"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowProfileCurrentPassword(!showProfileCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                          >
                            {showProfileCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Bagong Password */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                          {prefLanguage === "tagalog" ? "Bagong Password" : "New Password"}
                        </label>
                        <div className="relative">
                          <input
                            type={showProfilePassword ? "text" : "password"}
                            value={profileEditPassword}
                            onChange={(e) => setProfileEditPassword(e.target.value)}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:border-pink-500 rounded-xl pl-3 pr-10 py-2 text-xs text-stone-800 dark:text-stone-100 font-mono outline-none"
                            placeholder={prefLanguage === "tagalog" ? "I-type ang bagong password" : "Type new password"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowProfilePassword(!showProfilePassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                          >
                            {showProfilePassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                            {prefLanguage === "tagalog" ? "Kumpirmahin ang Bagong Password" : "Confirm New Password"}
                          </label>
                          {profileEditPassword && profileConfirmPassword && (
                            <span className={`text-[10px] font-bold ${profileEditPassword === profileConfirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {profileEditPassword === profileConfirmPassword
                                ? (prefLanguage === "tagalog" ? "✓ Nagmamatch" : "✓ Match")
                                : (prefLanguage === "tagalog" ? "✕ Hindi Nagmamatch" : "✕ Doesn't Match")}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showProfileConfirmPassword ? "text" : "password"}
                            value={profileConfirmPassword}
                            onChange={(e) => setProfileConfirmPassword(e.target.value)}
                            className={`w-full bg-white dark:bg-stone-900 border rounded-xl pl-3 pr-10 py-2 text-xs text-stone-800 dark:text-stone-100 font-mono outline-none ${
                              profileConfirmPassword && profileEditPassword !== profileConfirmPassword
                                ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                                : "border-stone-200 dark:border-stone-700 focus:border-pink-500"
                            }`}
                            placeholder={prefLanguage === "tagalog" ? "I-type muli ang bagong password" : "Re-type new password"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowProfileConfirmPassword(!showProfileConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                          >
                            {showProfileConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Interactive Password Strength Meter */}
                      {profileEditPassword && (
                        <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-700/80 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-stone-600 dark:text-stone-300">
                              {prefLanguage === "tagalog" ? "Lakas ng Password:" : "Password Strength:"}
                            </span>
                            <span className={`font-bold ${
                              profileEditPassword.length < 6
                                ? "text-rose-600 dark:text-rose-400"
                                : profileEditPassword.length >= 8 && /[0-9]/.test(profileEditPassword) && /[A-Z]/.test(profileEditPassword)
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}>
                              {profileEditPassword.length < 6
                                ? (prefLanguage === "tagalog" ? "Mahina 🔴" : "Weak 🔴")
                                : profileEditPassword.length >= 8 && /[0-9]/.test(profileEditPassword) && /[A-Z]/.test(profileEditPassword)
                                ? (prefLanguage === "tagalog" ? "Matatag / Malakas 🟢" : "Strong 🟢")
                                : (prefLanguage === "tagalog" ? "Katamtaman 🟡" : "Fair 🟡")}
                            </span>
                          </div>

                          {/* Colored Progress Bar */}
                          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                profileEditPassword.length < 6
                                  ? "w-1/4 bg-rose-500"
                                  : profileEditPassword.length >= 8 && /[0-9]/.test(profileEditPassword) && /[A-Z]/.test(profileEditPassword)
                                  ? "w-full bg-emerald-500"
                                  : "w-2/3 bg-amber-500"
                              }`}
                            ></div>
                          </div>

                          {/* Criteria Checklist */}
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-stone-600 dark:text-stone-300 pt-1">
                            <span className={`flex items-center gap-1 ${profileEditPassword.length >= 8 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-stone-400"}`}>
                              {profileEditPassword.length >= 8 ? "✓" : "○"} {prefLanguage === "tagalog" ? "8+ na letra" : "8+ characters"}
                            </span>
                            <span className={`flex items-center gap-1 ${/[0-9]/.test(profileEditPassword) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-stone-400"}`}>
                              {/[0-9]/.test(profileEditPassword) ? "✓" : "○"} {prefLanguage === "tagalog" ? "May numero (0-9)" : "Includes numbers"}
                            </span>
                            <span className={`flex items-center gap-1 ${/[A-Z]/.test(profileEditPassword) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-stone-400"}`}>
                              {/[A-Z]/.test(profileEditPassword) ? "✓" : "○"} {prefLanguage === "tagalog" ? "May malaking letra (A-Z)" : "Capital letters"}
                            </span>
                            <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(profileEditPassword) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-stone-400"}`}>
                              {/[^A-Za-z0-9]/.test(profileEditPassword) ? "✓" : "○"} {prefLanguage === "tagalog" ? "Special symbol (!@#$)" : "Special symbol"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Two-Factor Authentication (2FA) */}
                    <div className="p-3.5 bg-stone-50/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 rounded-xl shrink-0">
                          <Smartphone className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">
                            {prefLanguage === "tagalog" ? "Two-Factor Authentication (2FA)" : "Two-Factor Authentication"}
                          </span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 block leading-tight">
                            {prefLanguage === "tagalog"
                              ? "Hihingi ng SMS / Email OTP verification bago mag-login sa bagong cellphone o computer."
                              : "Require SMS or Email OTP verification when logging in from new devices."}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !is2FAEnabled;
                          setIs2FAEnabled(nextState);
                          localStorage.setItem("casafinder_2fa", JSON.stringify(nextState));
                          setSecurityMsg(
                            nextState
                              ? (prefLanguage === "tagalog" ? "Naka-ON na ang Two-Factor Authentication (2FA)! 🔒" : "2-Factor Authentication enabled! 🔒")
                              : (prefLanguage === "tagalog" ? "Naka-OFF na ang Two-Factor Authentication." : "2-Factor Authentication disabled.")
                          );
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          is2FAEnabled ? "bg-gradient-to-r from-pink-500 to-blue-600" : "bg-stone-300 dark:bg-stone-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            is2FAEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Section 3: 4-Digit Quick Security PIN */}
                    <div className="p-3.5 bg-stone-50/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {prefLanguage === "tagalog" ? "4-Digit Security PIN" : "4-Digit Security PIN"}
                          </span>
                        </div>
                        <span className="text-[10px] text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/50 px-2 py-0.5 rounded-md font-medium">
                          {prefLanguage === "tagalog" ? "Para sa mabilis na Kumpirmasyon" : "For Fast Confirmation"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showSecurityPin ? "text" : "password"}
                            maxLength={4}
                            value={securityPin}
                            onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:border-pink-500 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-stone-800 dark:text-stone-100 outline-none"
                            placeholder="****"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecurityPin(!showSecurityPin)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                          >
                            {showSecurityPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-light">
                        {prefLanguage === "tagalog"
                          ? "Gamitin ang 4-digit PIN na ito para sa mabilis na pag-verify sa booking at reservation."
                          : "Use this 4-digit PIN for quick booking & landlord action verification."}
                      </p>
                    </div>

                    {/* Section 4: Active Devices & Session Log */}
                    <div className="p-3.5 bg-stone-50/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-700/60 pb-2">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" />
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {prefLanguage === "tagalog" ? "Mga Naka-login na Device (Active Sessions)" : "Active Device Sessions"}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                          {activeSessions.length} {prefLanguage === "tagalog" ? "Device" : "Device(s)"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {activeSessions.map((session) => (
                          <div key={session.id} className="p-2.5 bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-700/70 rounded-xl flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-start gap-2.5 min-w-0">
                              {session.device.includes("Mobile") || session.device.includes("iPhone") ? (
                                <Smartphone className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0 mt-0.5" />
                              ) : (
                                <Laptop className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-stone-800 dark:text-stone-100 text-[11px] block truncate">{session.device}</span>
                                <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">{session.location} ({session.ip})</span>
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                              session.current ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                            }`}>
                              {session.current
                                ? (prefLanguage === "tagalog" ? "Kasalukuyan 🟢" : "Active Now 🟢")
                                : session.time}
                            </span>
                          </div>
                        ))}
                      </div>

                      {activeSessions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = activeSessions.filter(s => s.current);
                            setActiveSessions(filtered);
                            localStorage.setItem("casafinder_active_sessions", JSON.stringify(filtered));
                            setSecurityMsg(
                              prefLanguage === "tagalog"
                                ? "Na-logout na ang lahat ng ibang mga lumang device!"
                                : "Successfully logged out all other device sessions!"
                            );
                          }}
                          className="w-full mt-1 py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300 hover:border-rose-200 dark:hover:border-rose-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>
                            {prefLanguage === "tagalog" ? "I-logout sa Lahat ng Ibang Device" : "Log Out All Other Devices"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: Preferences */}
                {profileTab === "notifications" && (
                  <div className="space-y-4">
                    {/* Compact Field Options: Language & Theme */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50/80 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-700/80">
                      {/* Language Field Option */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-100">
                          <Globe className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
                          <span>{t("prefLanguageLabel")}</span>
                        </label>
                        <select
                          value={prefLanguage}
                          onChange={(e) => setPrefLanguage(e.target.value as "tagalog" | "english")}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none cursor-pointer shadow-2xs"
                        >
                          <option value="english" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">🇺🇸 English</option>
                          <option value="tagalog" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">🇵🇭 Tagalog (Filipino)</option>
                        </select>
                      </div>

                      {/* Theme Field Option */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-100">
                          {prefTheme === "dark" ? (
                            <Moon className="h-3.5 w-3.5 text-pink-500 dark:text-pink-400 shrink-0" />
                          ) : (
                            <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          )}
                          <span>{t("prefThemeLabel")}</span>
                        </label>
                        <select
                          value={prefTheme}
                          onChange={(e) => setPrefTheme(e.target.value as "light" | "dark")}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none cursor-pointer shadow-2xs"
                        >
                          <option value="light" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">☀️ Light Mode</option>
                          <option value="dark" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">🌙 Dark Mode</option>
                        </select>
                      </div>
                    </div>

                    {/* Alerts & Other Preferences */}
                    <div className="space-y-2.5 pt-1">
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{prefLanguage === "tagalog" ? "Mga Setting ng Notipikasyon at Mapa" : "Notification & Map Preferences"}</span>
                      </div>

                      <label className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-2xl cursor-pointer hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                          <div>
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-100 block">{prefLanguage === "tagalog" ? "Notipikasyon sa Email" : "Email Alerts"}</span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-light">{prefLanguage === "tagalog" ? "Makatanggap ng email updates sa mga bagong boarding house." : "Receive email updates about new boarding houses."}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefEmailNotifications}
                          onChange={(e) => setPrefEmailNotifications(e.target.checked)}
                          className="h-4 w-4 accent-pink-600 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-2xl cursor-pointer hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-100 block">{prefLanguage === "tagalog" ? "Notipikasyon sa SMS / CP" : "SMS Notification Alerts"}</span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-light">{prefLanguage === "tagalog" ? "Makatanggap ng text alert sa iyong cell phone number." : "Receive text alerts on your mobile phone number."}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefSmsAlerts}
                          onChange={(e) => setPrefSmsAlerts(e.target.checked)}
                          className="h-4 w-4 accent-pink-600 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-2xl cursor-pointer hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-100 block">{prefLanguage === "tagalog" ? "Awtomatikong Ipakita ang Hangganan ng Mapa" : "Auto-Highlight Map Boundaries"}</span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-light">{prefLanguage === "tagalog" ? "Awtomatikong ipakita ang outline ng barangay sa mapa." : "Automatically display barangay boundary outlines."}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefAutoShowMap}
                          onChange={(e) => setPrefAutoShowMap(e.target.checked)}
                          className="h-4 w-4 accent-pink-600 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* About CasaFinder Tab Content */}
                {profileTab === "about" && (
                  <div className="space-y-4 font-sans text-xs">
                    <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden shadow-inner">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg text-sm font-bold">🏠</span>
                        <div>
                          <h3 className="font-display font-extrabold text-sm text-amber-400">CasaFinder Gumaca</h3>
                          <p className="text-[10px] text-stone-300">{prefLanguage === "tagalog" ? "Housing Directory ng Gumaca, Quezon" : "Gumaca Housing & Boarding Directory"}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-300 font-light leading-relaxed">
                        {prefLanguage === "tagalog"
                          ? "Ang opisyal na Housing at Boarding House Directory sa bayan ng Gumaca, Quezon. Idinisenyo upang tulungan ang mga tenant, estudyante, at mga manggagawa na makahanap ng ligtas, abot-kaya, at kumportableng tirahan malapit sa kanilang eskwelahan at trabaho."
                          : "The official Housing & Boarding House Directory of Gumaca, Quezon. Built to empower tenants, students, and workers in finding safe, affordable, and comfortable homes near local schools and workplaces."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                      <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl p-3 space-y-1 hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors">
                        <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>🎓</span> {prefLanguage === "tagalog" ? "Tenants / Umuupa" : "Tenants"}
                        </p>
                        <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-normal font-light">
                          {prefLanguage === "tagalog" ? "Kalkulado ang oras ng lakad at biyahe sa trike papuntang eskwelahan." : "Calculates walk & trike time to nearby campuses."}
                        </p>
                      </div>
                      <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl p-3 space-y-1 hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors">
                        <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>🔑</span> {prefLanguage === "tagalog" ? "Landlords" : "Landlords"}
                        </p>
                        <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-normal font-light">
                          {prefLanguage === "tagalog" ? "Libreng pag-post at pag-upload ng Mayor's Permit at BFP Safety Certificates." : "Free listing and permit verification uploads."}
                        </p>
                      </div>
                      <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl p-3 space-y-1 hover:bg-stone-100/80 dark:hover:bg-stone-800 transition-colors">
                        <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>🛡️</span> {prefLanguage === "tagalog" ? "Rehistrado" : "Verified"}
                        </p>
                        <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-normal font-light">
                          {prefLanguage === "tagalog" ? "May transparent reviews, ratings, at interactive barangay map." : "Verified ratings, reviews, and interactive maps."}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl space-y-2 text-[11px]">
                      <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{prefLanguage === "tagalog" ? "Mga Nakasasakop na Paaralan sa Gumaca:" : "Schools Covered in Gumaca, Quezon:"}</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-stone-700 dark:text-stone-300">
                        <span className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg shadow-2xs">🏫 SLSU Gumaca</span>
                        <span className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg shadow-2xs">🎓 Eastern Quezon College (EQC)</span>
                        <span className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg shadow-2xs">🎨 PIAT College</span>
                        <span className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg shadow-2xs">🏫 Gumaca National High School (GNHS)</span>
                        <span className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg shadow-2xs">🏫 Holy Child Jesus College</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {t("close")}
                  </button>
                  {profileTab !== "notifications" && profileTab !== "about" && (
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Save className="h-4 w-4" />
                      <span>
                        {profileTab === "settings"
                          ? (prefLanguage === "tagalog" ? "I-save ang Security at Password" : "Save Security & Password")
                          : (prefLanguage === "tagalog" ? "I-save ang Profile" : "Save Profile")}
                      </span>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
