import React, { useState, useMemo, useEffect } from "react";
import { Property } from "./data/properties";
import { studentDemoProperties } from "./data/studentDemos";
import PropertyCard from "./components/PropertyCard";
import PropertyModal from "./components/PropertyModal";
import LandlordProfileModal from "./components/LandlordProfileModal";
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
  Lock,
  Eye,
  EyeOff,
  Shield,
  Building,
  Users,
  Sparkles,
  Mail,
  Phone,
  Upload,
  Settings,
  Bell,
  Save,
  GraduationCap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  KeyRound,
  ArrowLeft,
  HelpCircle,
  Sun,
  Moon,
  Globe,
  Languages
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
  "Wi-Fi",
  "Aircon",
  "Study Desk",
  "Cooking Allowed",
  "Separate Bathroom",
  "Bed Included",
  "No Curfew",
  "Female Only",
  "Male Only",
  "Near SLSU Campus",
  "Near Eastern Quezon College"
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
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [registeredUsers, setRegisteredUsers] = useState<{ name: string; username: string; role: "student" | "landlord"; password?: string; email?: string; mobile?: string; school?: string; bio?: string }[]>(() => {
    const saved = localStorage.getItem("casafinder_registered_users");
    if (saved) return JSON.parse(saved);
    return [
      { name: "Juan Dela Cruz", username: "juan.student", role: "student", password: "123", email: "juan@example.com", mobile: "09123456789", school: "Gumaca National High School", bio: "Senior High Student looking for clean lodging near school." },
      { name: "Aling Nena", username: "nena.landlord", role: "landlord", password: "123", email: "nena@example.com", mobile: "09987654321", school: "Nena's Residences & Boarding", bio: "Managing student boarding houses in Barangay Tabing Dagat since 2018." }
    ];
  });
  const [userSession, setUserSession] = useState<{ role: "student" | "landlord"; name: string; username: string } | null>(() => {
    const saved = localStorage.getItem("casafinder_user_session");
    return saved ? JSON.parse(saved) : null;
  });

  // Login Form States
  const [loginRole, setLoginRole] = useState<"student" | "landlord">("student");
  const [loginName, setLoginName] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [loginError, setLoginError] = useState("");

  // Forgot Password States
  const [forgotQuery, setForgotQuery] = useState("");
  const [forgotFoundUser, setForgotFoundUser] = useState<{ name: string; username: string; role: "student" | "landlord"; password?: string; email?: string; mobile?: string; school?: string; bio?: string } | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");

  // Profile & Settings Modal & Dropdown Menu State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "settings" | "notifications">("profile");
  const [profileEditName, setProfileEditName] = useState("");
  const [profileEditEmail, setProfileEditEmail] = useState("");
  const [profileEditMobile, setProfileEditMobile] = useState("");
  const [profileEditSchool, setProfileEditSchool] = useState("");
  const [profileEditBio, setProfileEditBio] = useState("");
  const [profileEditPassword, setProfileEditPassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
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
    const saved = localStorage.getItem("gumaca_student_properties");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const demoIds = new Set(["slsu-elite-dorm", "dagat-bay-coliving", "la-villa-estudiante", "green-eco-apts"]);
          const filtered = parsed.filter((p: Property) => !demoIds.has(p.id));
          return filtered;
        }
      } catch (e) {
        console.error("Failed to parse saved properties:", e);
      }
    }
    return [];
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailModalProperty, setDetailModalProperty] = useState<Property | null>(null);
  const [showMapPage, setShowMapPage] = useState(false);

  // Homeowner Add Property Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newType, setNewType] = useState<"Apartment" | "Bedspace">("Apartment");
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
  const [selectedSchoolIdForMap, setSelectedSchoolIdForMap] = useState<string>("all");

  const handleViewOnMap = (prop: Property, schoolId?: string) => {
    setSelectedProperty(prop);
    setSelectedSchoolIdForMap(schoolId || "all");
    setShowMapPage(true);
  };

  // Search Option Inputs State (User's selections before clicking Search)
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [boardingHouseSearchQuery, setBoardingHouseSearchQuery] = useState("");
  const [barangaySearchQuery, setBarangaySearchQuery] = useState("");
  const [barangayInput, setBarangayInput] = useState("All");
  const [typeInput, setTypeInput] = useState("All");
  const [priceInput, setPriceInput] = useState(15000);
  const [amenityGenderInput, setAmenityGenderInput] = useState<"Both" | "Girls Only" | "Boys Only">("Both");

  // Active filter states (only applied when clicking the Search button)
  const [activeBarangay, setActiveBarangay] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [activeMaxPrice, setActiveMaxPrice] = useState(15000);
  const [activeAmenityGender, setActiveAmenityGender] = useState<"Both" | "Girls Only" | "Boys Only">("Both");

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
    const emailVal = signupEmail.trim().toLowerCase();
    const mobileVal = signupMobile.trim();
    const displayName = usernameVal.charAt(0).toUpperCase() + usernameVal.slice(1);
    
    if (authMode === "signup") {
      if (!usernameVal || !emailVal || !mobileVal || !loginPassword.trim()) {
        setLoginError("Please fill in your Username, Email, Mobile Number, and Password!");
        return;
      }
      
      // Check if username already exists
      const existingUsername = registeredUsers.find(u => u.username === usernameVal);
      if (existingUsername) {
        setLoginError("This username is already taken! Please choose another one.");
        return;
      }

      if (emailVal) {
        const existingEmail = registeredUsers.find(u => u.email === emailVal);
        if (existingEmail) {
          setLoginError("This email address is already registered! Please log in instead.");
          return;
        }
      }

      if (mobileVal) {
        const existingMobile = registeredUsers.find(u => u.mobile === mobileVal);
        if (existingMobile) {
          setLoginError("This mobile number is already registered! Please log in instead.");
          return;
        }
      }

      // Create new user
      const newUser = {
        name: displayName,
        username: usernameVal,
        role: loginRole,
        password: loginPassword,
        email: emailVal,
        mobile: mobileVal
      };

      setRegisteredUsers(prev => [...prev, newUser]);
      
      // Auto login
      setUserSession({
        role: loginRole,
        name: displayName,
        username: usernameVal
      });

      // Reset
      setLoginName("");
      setLoginUsername("");
      setLoginPassword("");
      setSignupEmail("");
      setSignupMobile("");
      setLoginError("");
    } else {
      // Login mode
      if (!usernameVal || !loginPassword.trim()) {
        setLoginError("Please enter both your Username and Password!");
        return;
      }

      const user = registeredUsers.find(u => 
        u.username === usernameVal
      );
      
      if (!user) {
        setLoginError("This account is not registered yet. Please Sign Up first!");
        return;
      }

      if (user.role !== loginRole) {
        setLoginError(`This account is not registered as a ${loginRole === "student" ? "Student" : "Landlord"}. Please select the correct role above.`);
        return;
      }

      if (user.password && user.password !== loginPassword) {
        setLoginError("Incorrect password! Please try again.");
        return;
      }

      // Successful login
      setUserSession({
        role: user.role,
        name: user.name,
        username: user.username
      });

      // Reset
      setLoginName("");
      setLoginUsername("");
      setLoginPassword("");
      setSignupEmail("");
      setSignupMobile("");
      setLoginError("");
    }
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
  const handleQuickLogin = (role: "student" | "landlord") => {
    if (role === "student") {
      setUserSession({
        role: "student",
        name: "Juan Dela Cruz",
        username: "juan.student"
      });
    } else {
      setUserSession({
        role: "landlord",
        name: "Aling Nena",
        username: "nena.landlord"
      });
    }
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
      password: "",
      school: "",
      bio: ""
    };
    setProfileEditName(current.name || userSession.name);
    setProfileEditEmail(current.email || "");
    setProfileEditMobile(current.mobile || "");
    setProfileEditSchool(current.school || (userSession.role === "student" ? "Gumaca National High School" : "Gumaca Housing Network"));
    setProfileEditBio(current.bio || (userSession.role === "student" ? "Student looking for affordable boarding house in Gumaca." : "Managing student boarding houses in Gumaca."));
    setProfileEditPassword(current.password || "");
    setProfileSuccessMsg("");
    setProfileTab("profile");
    setShowProfileModal(true);
  };

  const handleOpenProfileTab = (tab: "profile" | "settings" | "notifications" = "profile") => {
    handleOpenProfile();
    setProfileTab(tab);
  };

  // Handle Profile update save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession) return;

    const updatedUsers = registeredUsers.map(u => {
      if (u.username === userSession.username) {
        return {
          ...u,
          name: profileEditName.trim() || u.name,
          email: profileEditEmail.trim(),
          mobile: profileEditMobile.trim(),
          school: profileEditSchool.trim(),
          bio: profileEditBio.trim(),
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
    setActiveMaxPrice(priceInput);
    setActiveAmenityGender(amenityGenderInput);
  };

  // Reset all search and filter options
  const handleResetFilters = () => {
    setBoardingHouseSearchQuery("");
    setBarangaySearchQuery("");
    setBarangayInput("All");
    setTypeInput("All");
    setPriceInput(15000);
    setAmenityGenderInput("Both");
    setActiveBarangay("All");
    setActiveType("All");
    setActiveMaxPrice(15000);
    setActiveAmenityGender("Both");
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
    const defaultCoords = getNeighborhoodDefaultLatLng("Barangay Tabing Dagat");
    setNewCustomLat(defaultCoords[0]);
    setNewCustomLng(defaultCoords[1]);
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
      genderPolicy: newGenderPolicy
    };

    setPropertiesList(prev => [newProperty, ...prev]);

    // Reset Form Fields
    setNewTitle("");
    setNewPrice("");
    setNewType("Apartment");
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
  };

  // Delete a specific landlord-created property listing
  const handleDeleteProperty = (id: string) => {
    setPropertiesList(prev => prev.filter(p => p.id !== id));
    setSelectedProperty(null);
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

    // Filter by Max Price Limit
    result = result.filter((p) => p.price <= activeMaxPrice);

    // Filter by Amenities / Gender Preference (Girls Only, Boys Only, Both)
    if (activeAmenityGender === "Girls Only") {
      result = result.filter((p) => {
        if (p.genderPolicy === "Girls Only") return true;
        if (p.genderPolicy === "Boys Only") return false;
        if (p.genderPolicy === "Both") return true;

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
          lowerDesc.includes("female") || lowerDesc.includes("girls") ||
          !p.genderPolicy
        );
      });
    } else if (activeAmenityGender === "Boys Only") {
      result = result.filter((p) => {
        if (p.genderPolicy === "Boys Only") return true;
        if (p.genderPolicy === "Girls Only") return false;
        if (p.genderPolicy === "Both") return true;

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
          lowerDesc.includes("male") || lowerDesc.includes("boys") ||
          !p.genderPolicy
        );
      });
    }

    // Sort descending by price
    result.sort((a, b) => b.price - a.price);

    return result;
  }, [propertiesList, boardingHouseSearchQuery, barangaySearchQuery, activeBarangay, activeType, activeMaxPrice, activeAmenityGender]);

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
      <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans flex items-center justify-center p-4 antialiased relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl border border-stone-200 p-8 shadow-xl relative z-10 space-y-6"
        >
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-14 w-14 bg-indigo-600 rounded-2xl items-center justify-center text-white font-display font-bold text-2xl shadow-lg shadow-indigo-100 mb-2">
              🎓
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-stone-950">CasaFinder Gumaca</h2>
            <p className="text-xs text-stone-400 max-w-xs mx-auto font-light leading-relaxed">
              {authMode === "signup"
                ? t("signupSubTitle")
                : authMode === "forgot"
                ? t("forgotSubTitle")
                : t("loginSubTitle")}
            </p>
          </div>

          {/* Log In vs Sign Up Tab switcher */}
          {authMode !== "forgot" && (
            <div className="flex border-b border-stone-100 pb-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setLoginError("");
                }}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                  authMode === "login"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {t("loginTab")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setLoginError("");
                }}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                  authMode === "signup"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {t("signupTab")}
              </button>
            </div>
          )}

          {/* Error Message */}
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 font-medium">
              ⚠️ {loginError}
            </div>
          )}

          {/* FORGOT PASSWORD MODE FLOW */}
          {authMode === "forgot" ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <KeyRound className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Password Recovery</span>
                </div>
                <p className="text-[11px] text-indigo-700 font-light leading-relaxed">
                  Enter your Username, Email address, or Mobile number to find your account.
                </p>
              </div>

              {forgotSuccessMsg ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <span>Success!</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed">{forgotSuccessMsg}</p>
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
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Log In with New Password 🚀</span>
                  </button>
                </div>
              ) : (
                <>
                  {!forgotFoundUser ? (
                    /* Step 1: Find Account */
                    <form onSubmit={handleSearchForgotAccount} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <Search className="h-3.5 w-3.5 text-stone-400" />
                          Username, Email, or Mobile Number
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. juan.student / juan@example.com / 09123456789"
                          value={forgotQuery}
                          onChange={(e) => setForgotQuery(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800 font-medium focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Search className="h-4 w-4" />
                        <span>Find Account 🔍</span>
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Reset Password Form */
                    <form onSubmit={handleResetForgotPassword} className="space-y-4">
                      {/* Found Account Info Badge */}
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider block">
                            Account Found
                          </span>
                          <p className="text-xs font-bold text-stone-800">{forgotFoundUser.name}</p>
                          <p className="text-[10px] text-stone-500 font-mono">@{forgotFoundUser.username}</p>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          forgotFoundUser.role === "student"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {forgotFoundUser.role === "student" ? "STUDENT" : "LANDLORD"}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <Lock className="h-3.5 w-3.5 text-stone-400" />
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showForgotNewPassword ? "text" : "password"}
                            required
                            placeholder="At least 3 characters"
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-3 pr-10 py-2.5 text-xs text-stone-800 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                          >
                            {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <Lock className="h-3.5 w-3.5 text-stone-400" />
                          Confirm New Password
                        </label>
                        <input
                          type={showForgotNewPassword ? "text" : "password"}
                          required
                          placeholder="Must match new password"
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800 font-mono"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForgotFoundUser(null)}
                          className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                          Different User
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save New Password 🔒</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* Back to Login Link */}
              <div className="text-center pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setLoginError("");
                    setForgotFoundUser(null);
                    setForgotQuery("");
                  }}
                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Log In</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Role Choice Tabs */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  {t("selectRole")}
                </span>
                <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole("student");
                      setLoginError("");
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginRole === "student"
                        ? "bg-white text-indigo-700 shadow-sm"
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
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginRole === "landlord"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Building className="h-3.5 w-3.5" />
                    {t("landlordRole")}
                  </button>
                </div>
              </div>

              {/* Login/Signup Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-none">
                {authMode === "signup" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-stone-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={loginRole === "student" ? "e.g. juan@example.com" : "e.g. nena@example.com"}
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-hidden transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-stone-400" />
                        {prefLanguage === "tagalog" ? "Mobiile Number / Telepono" : "Mobile Number"}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={loginRole === "student" ? "e.g. 09123456789" : "e.g. 09987654321"}
                        value={signupMobile}
                        onChange={e => setSignupMobile(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-hidden transition-all font-medium"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-stone-400" />
                    {authMode === "signup" ? (prefLanguage === "tagalog" ? "Gumawa ng Username" : "Create Username") : "Username"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={loginRole === "student" ? "e.g. juan.student" : "e.g. nena.landlord"}
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-hidden transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-stone-400" />
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
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
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
                      className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-3 pr-10 py-2.5 text-xs text-stone-800 focus:outline-hidden transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  {authMode === "signup" ? (
                    <>{t("signupBtn")}</>
                  ) : (
                    <>{prefLanguage === "tagalog" ? `Mag-log In bilang ${loginRole === "student" ? "Estudyante" : "Landlord"} 🚀` : `Log In as ${loginRole === "student" ? "Student" : "Landlord"} 🚀`}</>
                  )}
                </button>
              </form>

              {/* Alternate switch link */}
              <div className="text-center text-xs pt-1">
                {authMode === "login" ? (
                  <span className="text-stone-500">
                    {prefLanguage === "tagalog" ? "Bago sa CasaFinder? " : "New to CasaFinder? "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setLoginError("");
                      }}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
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
                        setLoginError("");
                      }}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      {prefLanguage === "tagalog" ? "Mag-log In dito!" : "Log In here!"}
                    </button>
                  </span>
                )}
              </div>
            </>
          )}

          {/* Quick Demo Credentials */}
          <div className="pt-5 border-t border-stone-100 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 text-center">
              {t("quickAccessDemo")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin("student")}
                className="bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 text-center transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-indigo-700 group-hover:scale-102 transition-transform">
                  {prefLanguage === "tagalog" ? "Demo Estudyante 🎓" : "Demo Student 🎓"}
                </div>
                <div className="text-[9px] text-indigo-500 font-mono mt-0.5">Quick Access</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("landlord")}
                className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-emerald-700 group-hover:scale-102 transition-transform">
                  {prefLanguage === "tagalog" ? "Demo Landlord 🏠" : "Demo Landlord 🏠"}
                </div>
                <div className="text-[9px] text-emerald-500 font-mono mt-0.5">Property Owner</div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans flex flex-col antialiased">
      {/* Dynamic Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-3 sm:py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Logo & Role Subheading */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg sm:text-xl shadow-md shadow-indigo-100 shrink-0">
                {userSession.role === "student" ? "🎓" : "🏠"}
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-stone-950 flex items-center gap-1.5">
                    <span>CasaFinder</span>
                    <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md border ${
                      userSession.role === "student"
                        ? "text-indigo-600 bg-indigo-50 border-indigo-100"
                        : "text-emerald-600 bg-emerald-50 border-emerald-100"
                    }`}>
                      {userSession.role === "student" ? t("studentRole") : t("landlordRole")}
                    </span>
                  </h1>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-500 font-light mt-0.5">
                  {t("hello")} <span className="font-semibold text-stone-800">{userSession.name}</span> • Gumaca Housing
                </p>
              </div>
            </div>

            {/* Mobile Profile Icon Button (Placed right beside CasaFinder on mobile) */}
            <div className="md:hidden relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl p-2 transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                title={t("profileSettings")}
              >
                <User className="h-4 w-4 text-indigo-600" />
                <Settings className="h-3.5 w-3.5 text-stone-500" />
                <ChevronDown className="h-3 w-3 text-stone-400" />
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
                      className="absolute right-0 top-11 z-50 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 space-y-1 font-sans text-xs"
                    >
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 mb-1">
                        <p className="font-bold text-stone-800 text-xs truncate">{userSession.name}</p>
                        <p className="text-[10px] text-stone-500 font-mono truncate">@{userSession.username}</p>
                        <span className={`inline-block text-[8px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded border ${
                          userSession.role === "student"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {userSession.role === "student" ? t("studentAccount") : t("landlordAccount")}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{t("tabProfileInfo")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("settings");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{t("tabSecurity")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("notifications");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Bell className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{t("tabPreferences")}</span>
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
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl py-2 px-3 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <User className="h-3.5 w-3.5 text-indigo-600" />
                <span>{t("profileSettings")}</span>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
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
                      className="absolute right-0 top-11 z-50 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 space-y-1 font-sans text-xs"
                    >
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 mb-1">
                        <p className="font-bold text-stone-800 text-xs truncate">{userSession.name}</p>
                        <p className="text-[10px] text-stone-500 font-mono truncate">@{userSession.username}</p>
                        <span className={`inline-block text-[8px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded border ${
                          userSession.role === "student"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {userSession.role === "student" ? t("studentAccount") : t("landlordAccount")}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{t("tabProfileInfo")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("settings");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{t("tabSecurity")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleOpenProfileTab("notifications");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Bell className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{t("tabPreferences")}</span>
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
                className="bg-indigo-600 text-white rounded-xl py-2 px-3.5 sm:px-4 text-xs font-semibold hover:bg-indigo-700 hover:shadow-xs transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                {t("postProperty")}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowMapPage(true)}
              className="bg-emerald-600 text-white rounded-xl py-2 px-3.5 sm:px-4 text-xs font-semibold hover:bg-emerald-700 hover:shadow-xs transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-100 cursor-pointer w-full sm:w-auto justify-center"
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
          <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4 transition-all">
            {/* Header / Mobile Toggle Bar */}
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                  <span>{prefLanguage === "tagalog" ? "Maghanap at I-filter" : "Search & Filter"}</span>
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-bold px-2 py-0.5 rounded-full">
                  {processedProperties.length} {processedProperties.length === 1 ? (prefLanguage === "tagalog" ? "Tuluyan" : "House") : (prefLanguage === "tagalog" ? "Mga Tuluyan" : "Houses")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {(boardingHouseSearchQuery || barangaySearchQuery || barangayInput !== "All" || typeInput !== "All" || priceInput !== 15000 || amenityGenderInput !== "Both") && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-stone-400 hover:text-red-600 text-[10px] sm:text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    <span className="hidden xs:inline">{t("resetFilters")}</span>
                  </button>
                )}

                {/* Mobile Expand / Shrink Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
                  className="sm:hidden bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1 cursor-pointer transition-colors"
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-8 py-2 text-[11px] text-stone-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white shadow-2xs"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                {boardingHouseSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBoardingHouseSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Full Filters Grid - Collapsible on Mobile, always expanded on Desktop */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3 items-end ${
              isMobileSearchExpanded ? "block" : "hidden sm:grid"
            }`}>
              {/* 1. Boarding House Search Bar (Typing) - Hidden on mobile if already shown in fast bar */}
              <div className="hidden sm:flex flex-col space-y-1 sm:col-span-2 lg:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Home className="h-3 w-3 text-indigo-600" />
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-8 py-1.5 sm:py-2.5 text-[11px] sm:text-xs text-stone-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  {boardingHouseSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBoardingHouseSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Barangay Search Bar (Typing) */}
              <div className="flex flex-col space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-indigo-600" />
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-8 py-1.5 sm:py-2.5 text-[11px] sm:text-xs text-stone-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
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
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {t("filterType")}
                </label>
                <select
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 sm:py-2.5 text-[11px] sm:text-xs text-stone-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer shadow-2xs"
                >
                  <option value="All">{t("allTypes")}</option>
                  <option value="Apartment">{t("typeApartment")}</option>
                  <option value="Bedspace">{t("typeBedspace")}</option>
                  <option value="Studio">{t("typeStudio")}</option>
                  <option value="Single Room">{t("typeSingle")}</option>
                  <option value="Transient">{t("typeTransient")}</option>
                </select>
              </div>

              {/* 4. Amenities / Gender Filter */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {prefLanguage === "tagalog" ? "Kasarian / Patakaran" : "Amenities / Gender"}
                </label>
                <select
                  value={amenityGenderInput}
                  onChange={(e) => setAmenityGenderInput(e.target.value as "Both" | "Girls Only" | "Boys Only")}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 sm:py-2.5 text-[11px] sm:text-xs text-stone-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer shadow-2xs"
                >
                  <option value="Both">{prefLanguage === "tagalog" ? "Lahat (Co-ed)" : "Both (All / Co-ed)"}</option>
                  <option value="Girls Only">{prefLanguage === "tagalog" ? "Pang-babae Lamang 👧" : "Girls Only 👧"}</option>
                  <option value="Boys Only">{prefLanguage === "tagalog" ? "Pang-lalaki Lamang 👦" : "Boys Only 👦"}</option>
                </select>
              </div>

              {/* 4. Max Price & Filter Button */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {t("filterBudget")}
                </label>
                <select
                  value={priceInput}
                  onChange={(e) => setPriceInput(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 sm:py-2.5 text-[11px] sm:text-xs text-stone-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer font-mono shadow-2xs"
                >
                  <option value="15000">{prefLanguage === "tagalog" ? "Kahit Anong Presyo" : "Any Price"}</option>
                  <option value="1500">₱1,500 pababa</option>
                  <option value="2000">₱2,000 pababa</option>
                  <option value="2500">₱2,500 pababa</option>
                  <option value="3000">₱3,000 pababa</option>
                  <option value="4000">₱4,000 pababa</option>
                  <option value="5000">₱5,000 pababa</option>
                  <option value="10000">₱10,000 pababa</option>
                </select>
              </div>
            </div>

            {/* Filter Action Button Row */}
            <div className={`flex items-center justify-between pt-1 gap-2 ${
              isMobileSearchExpanded ? "flex" : "hidden sm:flex"
            }`}>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
                {t("showingResults")} <strong className="text-indigo-600 font-bold">{processedProperties.length}</strong> {processedProperties.length === 1 ? t("boardingHouse") : t("boardingHouses")}
              </span>

              <button
                type="button"
                onClick={handleSearch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-1.5 sm:py-2 px-4 sm:px-5 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{t("searchBtn")}</span>
              </button>
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
                      💡 <strong>{prefLanguage === "tagalog" ? "Paalala sa Estudyante:" : "Student Note:"}</strong> {prefLanguage === "tagalog" ? "Maaaring sabihan ang inyong landlords sa Gumaca na mag-post ng kanilang tuluyan dito!" : "Please inform your landlords or homeowners in Gumaca to post their listings here so the student community can find them!"}
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
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {processedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onSelect={() => {
                        setSelectedProperty(property);
                        setDetailModalProperty(property);
                      }}
                      onViewLandlordProfile={(prop) => setLandlordProfileProperty(prop)}
                      onViewOnMap={handleViewOnMap}
                      currentUserRole={userSession?.role}
                      language={prefLanguage}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
      </main>

      {/* Footer credits */}
      <footer className="mt-auto py-8 bg-white border-t border-stone-200 text-center text-xs text-stone-400 font-light flex flex-col items-center justify-center gap-4 px-4">
        <p>&copy; {new Date().getFullYear()} CasaFinder Inc. Gumaca College & High School Housing Network. All rights reserved.</p>
      </footer>

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
        {landlordProfileProperty && (
          <LandlordProfileModal
            landlordInfo={{
              name: landlordProfileProperty.landlordName || "Registered Landlord",
              avatar: landlordProfileProperty.landlordAvatar,
              permits: landlordProfileProperty.landlordPermits,
            }}
            landlordProperties={propertiesList.filter(
              (p) => (p.landlordName || "Registered Landlord") === (landlordProfileProperty.landlordName || "Registered Landlord")
            )}
            onClose={() => setLandlordProfileProperty(null)}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            onViewOnMap={handleViewOnMap}
          />
        )}
      </AnimatePresence>

      {/* Homeowner / Landlord Upload Boarding House Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md overflow-y-auto">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-200 z-10 max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-indigo-600 text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏠</span>
                  <div>
                    <h3 className="font-display font-bold text-sm md:text-base">{t("modalPostTitle")}</h3>
                    <p className="text-[10px] text-indigo-100 font-light mt-0.5">{prefLanguage === "tagalog" ? "I-anunsyo ang iyong bakanteng silid para sa mga estudyante sa Gumaca" : "Advertise your vacant room for Gumaca students"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 bg-indigo-700/50 hover:bg-indigo-700 hover:scale-105 rounded-full transition-all text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddPropertySubmit} className="flex-1 overflow-y-auto p-6 space-y-5 animate-none">
                {/* Basic Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Pangalan ng Tuluyan *" : "Boarding House Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={prefLanguage === "tagalog" ? "hal. Mary's Boarding House" : "e.g. Mary's Cozy Boarding House"}
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Buwanang Upa (PHP) *" : "Monthly Rent (PHP) *"}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 2500"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Type & Specs Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {t("filterType")}
                    </label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value as "Apartment" | "Bedspace")}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
                    >
                      <option value="Apartment">{t("typeApartment")}</option>
                      <option value="Bedspace">{t("typeBedspace")}</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Bilang ng Kama" : "Number of Beds"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newBeds}
                      onChange={e => setNewBeds(Number(e.target.value))}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Bilang ng Banyo" : "Number of Baths"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newBaths}
                      onChange={e => setNewBaths(Number(e.target.value))}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono"
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
                        // Only auto-center pin to new barangay if user has not set a custom pinpoint on the map
                        if (!isPinCustomized) {
                          const coords = getNeighborhoodDefaultLatLng(brgy);
                          setNewCustomLat(coords[0]);
                          setNewCustomLng(coords[1]);
                        }
                      }}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
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
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
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
                />

                {/* Utilities & Gender Accommodation Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Kasarian / Patakaran *" : "Gender Preference / Policy *"}
                    </label>
                    <select
                      value={newGenderPolicy}
                      onChange={e => setNewGenderPolicy(e.target.value as "Both" | "Girls Only" | "Boys Only")}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
                    >
                      <option value="Both">{prefLanguage === "tagalog" ? "Lahat (Co-ed)" : "Both (Co-ed)"}</option>
                      <option value="Girls Only">{prefLanguage === "tagalog" ? "Pang-babae Lamang 👧" : "Girls Only 👧"}</option>
                      <option value="Boys Only">{prefLanguage === "tagalog" ? "Pang-lalaki Lamang 👦" : "Boys Only 👦"}</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Paradahan ng Sasakyan" : "Parking Arrangement"}
                    </label>
                    <select
                      value={newParking}
                      onChange={e => setNewParking(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
                    >
                      <option value="No Parking">{prefLanguage === "tagalog" ? "Walang Paradahan" : "No Parking Space"}</option>
                      <option value="Motorcycle Only">{prefLanguage === "tagalog" ? "Motorsiklo Lamang" : "Motorcycle Parking Only"}</option>
                      <option value="Car & Motorcycle">{prefLanguage === "tagalog" ? "May Paradahan (Kotse at Motor)" : "Available (Car & Motorcycle)"}</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {prefLanguage === "tagalog" ? "Bentilasyon / Araw at Hangin" : "Ventilation / Cooling"}
                    </label>
                    <select
                      value={newCooling}
                      onChange={e => setNewCooling(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
                    >
                      <option value="Electric Fan">{prefLanguage === "tagalog" ? "Electric Fan Lamang" : "Electric Fan Only"}</option>
                      <option value="Aircon Ready">{prefLanguage === "tagalog" ? "May Aircon" : "Aircon Installed"}</option>
                      <option value="Well-Ventilated (Windows)">{prefLanguage === "tagalog" ? "Presko / Bintana Lamang" : "Well-Ventilated (Windows Only)"}</option>
                    </select>
                  </div>
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
                    className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white resize-none"
                  />
                </div>

                {/* Photo Upload Section */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700 font-bold">
                      <Camera className="h-4 w-4 text-indigo-600" />
                      {prefLanguage === "tagalog" ? "Litrato ng Tuluyan *" : "Establishment Photo *"}
                    </span>
                    {isCustomUpload && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" /> {prefLanguage === "tagalog" ? "Na-upload Na" : "Uploaded"}
                      </span>
                    )}
                  </label>

                  {/* Upload Box */}
                  <div className="border-2 border-dashed border-stone-200 hover:border-indigo-400 bg-stone-50/70 rounded-2xl p-4 transition-all text-center relative group">
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
                        <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center transition-all shadow-xs">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-800 group-hover:text-indigo-600 transition-colors">
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
                              isSelected ? "ring-2 ring-indigo-600 border-transparent scale-[1.02]" : "border-stone-200 hover:border-stone-300"
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
                              <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-md">
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {prefLanguage === "tagalog" ? "Magdagdag ng Amenities / Serbiyo (Piliin ang nararapat)" : "Add Amenities / Features (Select all that apply)"}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITY_PRESETS.map((amenity) => {
                      const isChecked = newSelectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                            isChecked
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-stone-300 bg-white"
                          }`}>
                            {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span className="truncate">{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-stone-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-100 cursor-pointer"
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
            <header className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shrink-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-stone-900 text-base md:text-lg">
                    {prefLanguage === "tagalog" ? "Mapa ng mga Tuluyan sa Gumaca 🗺️" : "Gumaca Student Housing Campus Map 🗺️"}
                  </h2>
                  <p className="text-[10px] text-stone-400 font-light mt-0.5">
                    {prefLanguage === "tagalog" ? "Hanapin sa mapa ang mga boarding house malapit sa SLSU Gumaca Campus & Eastern Quezon College" : "Visually locate boarding rooms and apartments near SLSU Gumaca Campus & Eastern Quezon College"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMapPage(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer w-full sm:w-auto"
              >
                <X className="h-4 w-4" />
                <span>{prefLanguage === "tagalog" ? "Isara ang Mapa" : "Close Map view"}</span>
              </button>
            </header>

            {/* Map Page Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Side: Plotted Listings sidebar */}
              <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-stone-200 bg-white flex flex-col h-1/2 lg:h-full overflow-hidden">
                <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center shrink-0">
                  <span className="text-xs font-mono font-bold text-stone-500">
                    {processedProperties.length} {prefLanguage === "tagalog" ? "Pla-notted na Tuluyan" : "Student Listings Plotted"}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-100/55 animate-pulse">
                    {prefLanguage === "tagalog" ? "Pindutin ang pin sa mapa" : "Click pins on map to select"}
                  </span>
                </div>
                
                {/* Scrollable list of properties on map */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                          onClick={() => setSelectedProperty(p)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
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
              <div className="flex-1 bg-stone-50 p-4 lg:p-6 flex flex-col h-1/2 lg:h-full relative overflow-hidden">
                <div className="flex-1 bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden relative">
                  <NeighborhoodMap
                    properties={processedProperties}
                    selectedProperty={selectedProperty}
                    onSelectProperty={(prop) => setSelectedProperty(prop)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-stone-900 text-white p-6 relative flex items-center gap-4">
                <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 shrink-0">
                  {userSession.role === "student" ? "🎓" : "🏠"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-lg text-white">
                      {t("profileTitle")}
                    </h2>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      userSession.role === "student"
                        ? "bg-indigo-950 text-indigo-300 border-indigo-800"
                        : "bg-emerald-950 text-emerald-300 border-emerald-800"
                    }`}>
                      {userSession.role === "student" ? t("studentAccount") : t("landlordAccount")}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-light mt-0.5">
                    {userSession.name} (@{userSession.username})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="absolute right-5 top-5 text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-stone-200 bg-stone-50/80 px-6 pt-3 gap-2">
                <button
                  type="button"
                  onClick={() => setProfileTab("profile")}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    profileTab === "profile"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{t("tabProfileInfo")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab("settings")}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    profileTab === "settings"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>{t("tabSecurity")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab("notifications")}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    profileTab === "notifications"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>{t("tabPreferences")}</span>
                </button>
              </div>

              {/* Modal Body & Form */}
              <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <User className="h-3 w-3 text-stone-400" />
                          {t("fullName")}
                        </label>
                        <input
                          type="text"
                          required
                          value={profileEditName}
                          onChange={(e) => setProfileEditName(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-stone-800 font-medium"
                          placeholder={t("fullName")}
                        />
                      </div>

                      {/* Username (Read Only) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3 text-stone-400" />
                            Username
                          </span>
                          <span className="text-[9px] text-stone-400 font-normal">Fixed ID</span>
                        </label>
                        <input
                          type="text"
                          disabled
                          value={userSession.username}
                          className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-500 font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-stone-400" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileEditEmail}
                          onChange={(e) => setProfileEditEmail(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-stone-800 font-medium"
                          placeholder="email@example.com"
                        />
                      </div>

                      {/* Mobile Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-stone-400" />
                          {prefLanguage === "tagalog" ? "Mobiile Number / Telepono" : "Mobile Number"}
                        </label>
                        <input
                          type="tel"
                          value={profileEditMobile}
                          onChange={(e) => setProfileEditMobile(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-stone-800 font-mono"
                          placeholder="09123456789"
                        />
                      </div>
                    </div>

                    {/* School / Institution / Business */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                        {userSession.role === "student" ? (
                          <GraduationCap className="h-3 w-3 text-stone-400" />
                        ) : (
                          <Building className="h-3 w-3 text-stone-400" />
                        )}
                        {userSession.role === "student" ? (prefLanguage === "tagalog" ? "Paaralan / Kolehiyo" : "School / College") : (prefLanguage === "tagalog" ? "Pangalan ng Negosyo / Tuluyan" : "Housing Business Name")}
                      </label>
                      <input
                        type="text"
                        value={profileEditSchool}
                        onChange={(e) => setProfileEditSchool(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-stone-800 font-medium"
                        placeholder={userSession.role === "student" ? "Gumaca National High School / SLSU Gumaca" : "Dormitory / Apartment Name"}
                      />
                    </div>

                    {/* Short Bio / Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-stone-400" />
                        {prefLanguage === "tagalog" ? "Maikling Tungkol sa Sarili / Bio" : "Short Bio / Note"}
                      </label>
                      <textarea
                        rows={3}
                        value={profileEditBio}
                        onChange={(e) => setProfileEditBio(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-stone-800 font-normal resize-none"
                        placeholder={prefLanguage === "tagalog" ? "Ipakilala ang sarili o mag-iwan ng maikling tala..." : "Introduce yourself or leave a short note..."}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: Security & Password */}
                {profileTab === "settings" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-start gap-3">
                      <Shield className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs">{prefLanguage === "tagalog" ? "Proteksyon ng Password ng Account" : "Account Password Protection"}</h4>
                        <p className="text-[11px] text-indigo-700 font-light mt-0.5">
                          {prefLanguage === "tagalog" ? "Maaari mong baguhin ang iyong password anumang oras para sa seguridad." : "You can change your password anytime for account security."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5 text-stone-400" />
                        {prefLanguage === "tagalog" ? "Bagong Password" : "Account Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={showProfilePassword ? "text" : "password"}
                          value={profileEditPassword}
                          onChange={(e) => setProfileEditPassword(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-3 pr-10 py-2.5 text-xs text-stone-800 font-mono"
                          placeholder={prefLanguage === "tagalog" ? "I-type ang bagong password" : "Type new password"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfilePassword(!showProfilePassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showProfilePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Preferences */}
                {profileTab === "notifications" && (
                  <div className="space-y-4">
                    {/* Live Auto-save Banner */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          {prefLanguage === "tagalog"
                            ? "Awtomatikong nag-aapply at naka-save agad ang iyong Wika, Tema, at Notipikasyon!"
                            : "Language, Theme, and Alert settings apply immediately & auto-save!"}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase shrink-0">
                        {prefLanguage === "tagalog" ? "NAKA-SAVE" : "AUTO-SAVED"}
                      </span>
                    </div>

                    {/* Compact Field Options: Language & Theme */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80">
                      {/* Language Field Option */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                          <Globe className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span>{t("prefLanguageLabel")}</span>
                        </label>
                        <select
                          value={prefLanguage}
                          onChange={(e) => setPrefLanguage(e.target.value as "tagalog" | "english")}
                          className="w-full bg-white border border-stone-200 text-stone-900 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer shadow-2xs"
                        >
                          <option value="english">🇺🇸 English</option>
                          <option value="tagalog">🇵🇭 Tagalog (Filipino)</option>
                        </select>
                      </div>

                      {/* Theme Field Option */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                          {prefTheme === "dark" ? (
                            <Moon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          ) : (
                            <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          )}
                          <span>{t("prefThemeLabel")}</span>
                        </label>
                        <select
                          value={prefTheme}
                          onChange={(e) => setPrefTheme(e.target.value as "light" | "dark")}
                          className="w-full bg-white border border-stone-200 text-stone-900 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer shadow-2xs"
                        >
                          <option value="light">☀️ Light Mode</option>
                          <option value="dark">🌙 Dark Mode</option>
                        </select>
                      </div>
                    </div>

                    {/* Alerts & Other Preferences */}
                    <div className="space-y-2.5 pt-1">
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{prefLanguage === "tagalog" ? "Mga Setting ng Notipikasyon at Mapa" : "Notification & Map Preferences"}</span>
                      </div>

                      <label className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-indigo-600" />
                          <div>
                            <span className="text-xs font-bold text-stone-800 block">{prefLanguage === "tagalog" ? "Notipikasyon sa Email" : "Email Alerts"}</span>
                            <span className="text-[10px] text-stone-500 font-light">{prefLanguage === "tagalog" ? "Makatanggap ng email updates sa mga bagong boarding house." : "Receive email updates about new boarding houses."}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefEmailNotifications}
                          onChange={(e) => setPrefEmailNotifications(e.target.checked)}
                          className="h-4 w-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-emerald-600" />
                          <div>
                            <span className="text-xs font-bold text-stone-800 block">{prefLanguage === "tagalog" ? "Notipikasyon sa SMS / CP" : "SMS Notification Alerts"}</span>
                            <span className="text-[10px] text-stone-500 font-light">{prefLanguage === "tagalog" ? "Makatanggap ng text alert sa iyong cell phone number." : "Receive text alerts on your mobile phone number."}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefSmsAlerts}
                          onChange={(e) => setPrefSmsAlerts(e.target.checked)}
                          className="h-4 w-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <div>
                            <span className="text-xs font-bold text-stone-800 block">{prefLanguage === "tagalog" ? "Awtomatikong Ipakita ang Hangganan ng Mapa" : "Auto-Highlight Map Boundaries"}</span>
                            <span className="text-[10px] text-stone-500 font-light">{prefLanguage === "tagalog" ? "Awtomatikong ipakita ang outline ng barangay sa mapa." : "Automatically display barangay boundary outlines."}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefAutoShowMap}
                          onChange={(e) => setPrefAutoShowMap(e.target.checked)}
                          className="h-4 w-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                  {profileTab === "notifications" ? (
                    <>
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>
                          {prefLanguage === "tagalog"
                            ? "Awtomatikong naka-save ang mga bagong setting!"
                            : "Preferences auto-saved!"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowProfileModal(false)}
                        className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                      >
                        {prefLanguage === "tagalog" ? "Isara ✨" : "Done / Close ✨"}
                      </button>
                    </>
                  ) : (
                    <>
                      <div />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowProfileModal(false)}
                          className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          {t("close")}
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Save className="h-4 w-4" />
                          <span>{t("saveProfile")}</span>
                        </button>
                      </div>
                    </>
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
