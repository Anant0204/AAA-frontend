import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getServicesForCountry, ALL_COUNTRIES } from "../../constants/countryServices";

const API_URL = import.meta.env.VITE_API_URL || "https://aaa-consultancy-production.up.railway.app/api/v1";



const LANGUAGES = ["English", "Arabic", "Urdu", "Spanish", "French", "German"];

const NATIONALITIES = [
  "Pakistani",
  "Indian",
  "Bangladeshi",
  "Egyptian",
  "Moroccan",
  "Algerian",
  "Saudi Arabian",
  "Emirati",
  "Nigerian",
  "British",
  "American",
  "Canadian",
  "Filipino",
  "Indonesian",
  "Syrian",
  "Lebanese",
  "Jordanian",
  "Yemeni",
  "Other",
];

const COUNTRIES = [
  "United Arab Emirates",
  "Spain",
  "Pakistan",
  "India",
  "Saudi Arabia",
  "United Kingdom",
  "United States",
  "Canada",
  "Egypt",
  "Morocco",
  "Algerian",
  "Bangladesh",
  "Philippines",
  "Indonesia",
  "Syria",
  "Lebanon",
  "Jordan",
  "Yemen",
  "Other"
];

const COUNTRY_CODES = [
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+1", flag: "🇺🇸", name: "USA / Canada" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "+213", flag: "🇩🇿", name: "Algeria" },
  { code: "+216", flag: "🇹🇳", name: "Tunisia" },
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" }
];

const parsePhone = (rawPhone) => {
  if (!rawPhone) return { countryCode: "+971", localNumber: "" };
  let clean = rawPhone.trim();
  if (!clean.startsWith("+")) {
    clean = "+" + clean;
  }
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  const matched = sorted.find((c) => clean.startsWith(c.code));
  if (matched) {
    return {
      countryCode: matched.code,
      localNumber: clean.slice(matched.code.length).replace(/[^\d]/g, "")
    };
  }
  return {
    countryCode: "+971",
    localNumber: clean.replace(/[^\d]/g, "")
  };
};

const SearchableCountrySelect = ({ label, value, onChange, options, placeholder, disabled, labelStyle, inputStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = React.useRef(null);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <label style={labelStyle}>{label}</label>
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          background: disabled ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.07)",
          color: value ? "#fff" : "rgba(255, 255, 255, 0.4)",
          border: disabled ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(255, 255, 255, 0.15)"
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || placeholder}
        </span>
        <span style={{ fontSize: "10px", opacity: 0.6, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </div>

      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            marginTop: "4px",
            background: "#1E1B3A",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            padding: "8px",
            maxHeight: "260px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <input
            type="text"
            autoFocus
            placeholder="🔍 Type to filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "13px",
              marginBottom: "6px",
              outline: "none"
            }}
          />

          <div
            style={{
              overflowY: "auto",
              maxHeight: "200px",
              display: "flex",
              flexDirection: "column",
              gap: "2px"
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: opt === value ? "#667eea" : "#fff",
                    background: opt === value ? "rgba(102, 126, 234, 0.2)" : "transparent",
                    fontWeight: opt === value ? 600 : 400,
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    if (opt !== value) e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (opt !== value) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div style={{ padding: "12px", textAlign: "center", color: "rgba(255, 255, 255, 0.5)", fontSize: "13px" }}>
                No match found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const LeadSelfFillForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: unified form, 2: success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warningPopup, setWarningPopup] = useState(null);
  // Reschedule & Cancel state
  const [rescheduleConsultationId, setRescheduleConsultationId] = useState(null);
  const [cancelConsultationId, setCancelConsultationId] = useState(null);
  const [actionDoneMsg, setActionDoneMsg] = useState("");

  // Optional lookup state
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [isExistingLead, setIsExistingLead] = useState(false);
  const [customizationSettings, setCustomizationSettings] = useState(null);

  const [countryCode, setCountryCode] = useState("+971");
  const [localNumber, setLocalNumber] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/settings/customization`)
      .then(res => {
        setCustomizationSettings(res.data);
      })
      .catch(err => console.error("Failed to load customization settings:", err));
  }, []);

  const [serviceCategory, setServiceCategory] = useState("visa"); // visa, case_assessment, property, translation

  const flowSettings = customizationSettings?.flowAutomationSettings || {};
  const bookingAllowedStart = flowSettings.bookingAllowedStart || '09:00';
  const bookingAllowedEnd = flowSettings.bookingAllowedEnd || '18:00';

  const generateTimeSlots = (startStr, endStr) => {
    const slots = [];
    let [startH, startM] = (startStr || '09:00').split(':').map(Number);
    let [endH, endM] = (endStr || '18:00').split(':').map(Number);
    let current = startH * 60 + (startM || 0);
    const end = endH * 60 + (endM || 0);

    while (current <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current += 30; // 30 min slots
    }
    return slots;
  };

  const availableTimeSlots = generateTimeSlots(bookingAllowedStart, bookingAllowedEnd);

  // Form fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    countryOfResidence: "",
    preferredLanguage: "English",
    serviceId: "dnv",
    applicantsCount: "Main Only",
    dependentsDetails: [],
    meetingPreferredDate: "",
    meetingPreferredTime: "",
    meetingPreferredLanguage: "English",
    meetingNotes: "",
    preferableAreaInSpain: "",
    budget: "€100k - €250k"
  });

  // Parse URL query parameters on mount to auto-populate fields or load from ID
  useEffect(() => {
    const searchString = window.location.search || (window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "");
    const params = new URLSearchParams(searchString);
    const idParam = params.get("id") || "";
    const tokenParam = params.get("token") || "";
    const phoneParam = params.get("phone") || params.get("whatsapp") || "";
    const emailParam = params.get("email") || "";
    const serviceParam = params.get("service") || params.get("program") || "";
    const applicantsParam = params.get("applicants") || "";
    const nationalityParam = params.get("nationality") || "";
    const isReschedule = params.get("reschedule") === "true";
    const isCancel = params.get("cancel") === "true";
    const cId = params.get("consultationId");

    if (isReschedule && cId) {
      setRescheduleConsultationId(cId);
    } else if (isCancel && cId) {
      setCancelConsultationId(cId);
    }

    // Set initial category from URL parameter
    if (serviceParam) {
      const lowerSvc = decodeURIComponent(serviceParam).toLowerCase();
      if (lowerSvc.includes("property") || lowerSvc.includes("investment") || lowerSvc === "3") {
        setServiceCategory("property");
      } else if (lowerSvc.includes("translation") || lowerSvc.includes("sworn") || lowerSvc === "4") {
        setServiceCategory("translation");
      } else if (lowerSvc.includes("assessment") || lowerSvc === "2") {
        setServiceCategory("case_assessment");
      } else {
        setServiceCategory("visa");
      }
    }

    if (tokenParam) {
      setLoading(true);
      axios.get(`${API_URL}/booking/prefill?token=${tokenParam}`)
        .then((res) => {
          if (res.data.success) {
            const data = res.data.data;
            
            const serviceTypeLower = (data.serviceType || "").toLowerCase();
            if (serviceTypeLower.includes("property") || serviceTypeLower.includes("investment")) {
              setServiceCategory("property");
            } else if (serviceTypeLower.includes("translation") || serviceTypeLower.includes("sworn")) {
              setServiceCategory("translation");
            } else if (serviceTypeLower.includes("assessment")) {
              setServiceCategory("case_assessment");
            } else {
              setServiceCategory("visa");
            }

            setForm((prev) => {
              const applicantsVal = data.applicantsCount || prev.applicantsCount;
              const count = getDepsCount(applicantsVal);
              const initialDeps = [];
              for (let i = 0; i < count; i++) {
                initialDeps.push({ firstName: "", lastName: "", relation: "Spouse", passportNumber: "", nationality: "" });
              }
              return {
                ...prev,
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email || "",
                phone: data.phone || "",
                nationality: data.nationality || "",
                countryOfResidence: data.countryOfResidence || "",
                preferredLanguage: data.preferredLanguage || "English",
                serviceId: data.serviceType || "dnv",
                applicantsCount: applicantsVal,
                dependentsDetails: initialDeps,
                meetingPreferredDate: "",
                meetingPreferredTime: "",
                meetingPreferredLanguage: data.preferredLanguage || "English",
                meetingNotes: "",
                preferableAreaInSpain: data.preferableArea || "",
                budget: data.budget || "€100k - €250k"
              };
            });
            setIsExistingLead(true);
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Invalid or expired re-booking token.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (idParam) {
      setLoading(true);
      axios.get(`${API_URL}/leads/${idParam}/public-details`)
        .then((res) => {
          const data = res.data;
          
          const serviceTypeLower = (data.serviceType || "").toLowerCase();
          if (serviceTypeLower.includes("property") || serviceTypeLower.includes("investment")) {
            setServiceCategory("property");
          } else if (serviceTypeLower.includes("translation") || serviceTypeLower.includes("sworn")) {
            setServiceCategory("translation");
          } else if (serviceTypeLower.includes("assessment")) {
            setServiceCategory("case_assessment");
          } else {
            setServiceCategory("visa");
          }

          setForm((prev) => {
            const applicantsVal = data.applicantsCount || prev.applicantsCount;
            const count = getDepsCount(applicantsVal);
            const currentDeps = data.dependentsDetails || [];
            const initialDeps = [];
            for (let i = 0; i < count; i++) {
              initialDeps.push({
                firstName: currentDeps[i]?.firstName || "",
                lastName: currentDeps[i]?.lastName || "",
                relation: currentDeps[i]?.relation || "Spouse",
                passportNumber: currentDeps[i]?.passportNumber || "",
                nationality: currentDeps[i]?.nationality || ""
              });
            }
            const qData = data.qualificationData || {};
            return {
              ...prev,
              id: data.id,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              nationality: data.nationality || "",
              countryOfResidence: data.countryOfResidence || "",
              preferredLanguage: data.preferredLanguage || "English",
              serviceId: data.serviceType || "dnv",
              applicantsCount: applicantsVal,
              dependentsDetails: initialDeps,
              meetingPreferredDate: data.meetingPreferredDate || "",
              meetingPreferredTime: data.meetingPreferredTime || "",
              meetingPreferredLanguage: data.meetingPreferredLanguage || data.preferredLanguage || "English",
              meetingNotes: data.meetingNotes || "",
              preferableAreaInSpain: qData.preferableAreaInSpain || "",
              budget: qData.budget || "€100k - €250k"
            };
          });
          setIsExistingLead(true);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Invalid or expired booking link.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setForm((prev) => {
        const applicantsVal = applicantsParam ? decodeURIComponent(applicantsParam).trim() : prev.applicantsCount;
        const count = getDepsCount(applicantsVal);
        const initialDeps = [];
        for (let i = 0; i < count; i++) {
          initialDeps.push({ firstName: "", lastName: "", relation: "Spouse", passportNumber: "", nationality: "" });
        }
        
        return {
          ...prev,
          phone: phoneParam ? decodeURIComponent(phoneParam).trim() : prev.phone,
          email: emailParam ? decodeURIComponent(emailParam).trim() : prev.email,
          serviceId: serviceParam ? decodeURIComponent(serviceParam).trim() : prev.serviceId,
          applicantsCount: applicantsVal,
          dependentsDetails: initialDeps,
          nationality: nationalityParam ? decodeURIComponent(nationalityParam).trim() : prev.nationality,
          countryOfResidence: prev.countryOfResidence
        };
      });
    }
  }, []);

  // Sync phone string with country code and local number
  useEffect(() => {
    if (form.phone) {
      const { countryCode: cCode, localNumber: lNum } = parsePhone(form.phone);
      if (cCode !== countryCode) setCountryCode(cCode);
      if (lNum !== localNumber) setLocalNumber(lNum);
    }
  }, [form.phone]);

  const handleCountryCodeChange = (newCode) => {
    setCountryCode(newCode);
    const cleanDigits = localNumber.replace(/[^\d]/g, "");
    const combined = cleanDigits ? `${newCode}${cleanDigits}` : newCode;
    setForm((prev) => ({ ...prev, phone: combined }));
  };

  const handleLocalNumberChange = (rawVal) => {
    const cleanDigits = rawVal.replace(/[^\d]/g, "");
    setLocalNumber(cleanDigits);
    const combined = cleanDigits ? `${countryCode}${cleanDigits}` : countryCode;
    setForm((prev) => ({ ...prev, phone: combined }));
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupEmail) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${API_URL}/leads/find-by-email?email=${encodeURIComponent(lookupEmail.trim())}`,
      );
      const data = res.data;
      setForm((prev) => ({
        ...prev,
        firstName: data.firstName || prev.firstName,
        lastName: data.lastName || prev.lastName,
        phone: data.phone || prev.phone,
        email: data.email || prev.email,
        nationality: data.nationality || prev.nationality,
        countryOfResidence: data.countryOfResidence || prev.countryOfResidence,
        preferredLanguage: data.preferredLanguage || prev.preferredLanguage,
        serviceId: data.serviceType || prev.serviceId,
        meetingPreferredDate: data.meetingPreferredDate || prev.meetingPreferredDate,
        meetingPreferredTime: data.meetingPreferredTime || prev.meetingPreferredTime,
        meetingPreferredLanguage:
          data.meetingPreferredLanguage || data.preferredLanguage || prev.meetingPreferredLanguage,
        meetingNotes: data.meetingNotes || prev.meetingNotes,
      }));
      setLookupOpen(false);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Profile not found with this email. Please fill in details manually.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getDepsCount = (countStr) => {
    if (!countStr || countStr === 'Main Only') return 0;
    const numericVal = parseInt(countStr, 10);
    if (!isNaN(numericVal) && String(numericVal) === countStr.trim()) {
      return Math.max(0, numericVal - 1);
    }
    const match = countStr.match(/Main\s*\+\s*(\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  };

  const handleCancelBooking = async () => {
    if (!cancelConsultationId) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.patch(`${API_URL}/consultations/public/cancel`, {
        consultationId: cancelConsultationId
      });
      if (res.data.success) {
        setActionDoneMsg("Your appointment booking has been successfully cancelled.");
        setCancelConsultationId(null);
        setStep(2);
      }
    } catch (cErr) {
      setError(cErr.response?.data?.message || "Failed to cancel consultation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission

    if (rescheduleConsultationId) {
      if (!form.meetingPreferredDate || !form.meetingPreferredTime) {
        setError("Please select your preferred meeting date and time.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await axios.patch(`${API_URL}/consultations/public/reschedule`, {
          consultationId: rescheduleConsultationId,
          date: form.meetingPreferredDate,
          timeSlot: form.meetingPreferredTime
        });
        if (res.data.success) {
          setActionDoneMsg(`Your consultation has been rescheduled to ${form.meetingPreferredDate} at ${form.meetingPreferredTime} (UTC).`);
          setRescheduleConsultationId(null);
          setStep(2);
          return;
        }
      } catch (rErr) {
        setError(rErr.response?.data?.message || "Failed to reschedule consultation.");
        setLoading(false);
        return;
      }
    }

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError("Please fill in all required personal details (Name, Email, Phone).");
      return;
    }
    
    if (serviceCategory === "translation") {
      navigate("/public/translation", { state: { prefilledLead: { ...form, serviceType: "Spanish Sworn Translation" } } });
      return;
    }
    
    if (!form.meetingPreferredDate || !form.meetingPreferredTime) {
      setError("Please select your preferred meeting date and time.");
      return;
    }
    const flowSettings = customizationSettings?.flowAutomationSettings || {};
    const selectTime = form.meetingPreferredTime;
    const allowedStart = flowSettings.bookingAllowedStart || '09:00';
    const allowedEnd = flowSettings.bookingAllowedEnd || '18:00';
    if (selectTime && (selectTime < allowedStart || selectTime > allowedEnd)) {
      setError(`Preferred meeting time must be between ${allowedStart} and ${allowedEnd}.`);
      return;
    }
    setLoading(true);
    setError("");

    // Prepare payload
    const payload = { 
      ...form,
      preferableArea: serviceCategory === "property" ? form.preferableAreaInSpain : undefined,
      budget: serviceCategory === "property" ? form.budget : undefined
    };
    if (serviceCategory === "property") {
      payload.serviceType = "Property Investment Guidance";
      payload.serviceId = "property";
      payload.qualificationData = {
        preferableAreaInSpain: form.preferableAreaInSpain,
        budget: form.budget
      };
    } else {
      payload.serviceType = form.serviceId;
    }

    try {
      if (isExistingLead && form.id) {
        await axios.patch(`${API_URL}/leads/${form.id}/meeting-preference`, payload);
      } else {
        await axios.post(`${API_URL}/leads`, payload);
      }
      setStep(2);
    } catch (err) {
      const errData = err.response?.data || {};
      if (errData.code === 'BLACKLISTED') {
        setWarningPopup({
          title: "⚠️ Assessment Limit Reached (No-Show)",
          message: "Our system detected a previous missed free appointment associated with this profile. Under our policy, you are not eligible for another free assessment. Please check your WhatsApp/Email for the €250 Case Review payment link to proceed, or contact support.",
          code: 'BLACKLISTED'
        });
      } else if (errData.code === 'DUPLICATE_LEAD') {
        setWarningPopup({
          title: "🗓️ Active Booking Exists",
          message: "You already have an active eligibility assessment booked or under review. Please check your email for your confirmation details or contact support to reschedule.",
          code: 'DUPLICATE_LEAD'
        });
      } else if (errData.code === 'BLOCKED') {
        setWarningPopup({
          title: "🚫 Account Restricted",
          message: "Your profile cannot be processed automatically due to account restrictions. Please contact our support desk for assistance.",
          code: 'BLOCKED'
        });
      } else {
        setError(
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setError(""); // Clear previous errors on user edit
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDependentChange = (index, field, value) => {
    setForm((prev) => {
      const updatedDeps = [...prev.dependentsDetails];
      updatedDeps[index] = { ...updatedDeps[index], [field]: value };
      return { ...prev, dependentsDetails: updatedDeps };
    });
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];



  const countryFilteredServices = getServicesForCountry(form.countryOfResidence);
  const SERVICES = countryFilteredServices.map(s => ({ id: s.id, name: s.name }));
  if (!SERVICES.some(s => s.id === 'sworn_translation')) {
    SERVICES.push({ id: "sworn_translation", name: "Spanish Sworn Translation" });
  }

  const APPLICANTS = [
    { value: "Main Only", label: "Main Applicant Only" },
    { value: "Main + 1", label: "Main + 1 Dependent" },
    { value: "Main + 2", label: "Main + 2 Dependents" },
    { value: "Main + 3", label: "Main + 3 Dependents" },
    { value: "Main + 4", label: "Main + 4 Dependents" },
    { value: "Main + 5", label: "Main + 5 Dependents" },
    { value: "Main + 6", label: "Main + 6 Dependents" },
    { value: "Main + 7", label: "Main + 7 Dependents" },
    { value: "Main + 8", label: "Main + 8 Dependents" },
    { value: "Main + 9", label: "Main + 9 Dependents" }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div style={{ width: "100%", maxWidth: "560px" }}>
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              🌍
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.5px",
              }}
            >
              AAA Consultancy Services 
            </span>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Free Eligibility Consultation Booking
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "20px",
            padding: "36px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
          }}
        >
          {/* ─── STEP 1: Unified Booking & Intake Form ─── */}
          {step === 1 && cancelConsultationId && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
              <h3 style={{ color: "#ff4d4d", fontSize: "20px", fontWeight: 700, margin: "0 0 12px" }}>
                Cancel Consultation Appointment
              </h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
                Are you sure you want to cancel your scheduled Spain Visa Eligibility Assessment?
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={loading}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {loading ? "Cancelling..." : "❌ Yes, Cancel Booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setCancelConsultationId(null)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  🔙 Keep My Booking
                </button>
              </div>
            </div>
          )}

          {step === 1 && !cancelConsultationId && (
            <>
              {rescheduleConsultationId && (
                <div style={{ background: "rgba(79, 70, 229, 0.2)", border: "1px solid rgba(79, 70, 229, 0.5)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#a5b4fc", fontSize: "13px", fontWeight: 600 }}>
                  🔄 Rescheduling Consultation Booking #{rescheduleConsultationId.substring(0, 8)} — Please select your new date & time below.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "22px",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {rescheduleConsultationId ? "Reschedule Assessment 🔄" : "Book Assessment 📅"}
                </h2>
              </div>

              <p
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "14px",
                  margin: "0 0 28px",
                  lineHeight: 1.6,
                }}
              >
                Please provide your details and choose a convenient date/time for your Free 20-Minute Eligibility Assessment.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Service Category Dropdown */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={labelStyle}>Select Service Category *</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => {
                      setError("");
                      setServiceCategory(e.target.value);
                    }}
                    style={{ ...inputStyle, color: "#fff", border: "1px solid rgba(102, 126, 234, 0.4)" }}
                  >
                    <option value="visa" style={{ background: "#24243e" }}>✈️ Spain Visa & Residency Services</option>
                    <option value="property" style={{ background: "#24243e" }}>🏠 Property Investment Guidance Service</option>
                    <option value="translation" style={{ background: "#24243e" }}>📄 Spanish Sworn Translation Services</option>
                  </select>
                </div>

                {/* Section: Personal Details */}
                <div style={sectionHeaderStyle}>📋 Your Details</div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>First Name *</label>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      placeholder="John"
                      disabled={isExistingLead}
                      style={{
                        ...inputStyle,
                        background: isExistingLead ? "rgba(255, 255, 255, 0.03)" : inputStyle.background,
                        color: isExistingLead ? "rgba(255, 255, 255, 0.4)" : inputStyle.color,
                        border: isExistingLead ? "1px solid rgba(255, 255, 255, 0.08)" : inputStyle.border,
                        cursor: isExistingLead ? "not-allowed" : "text"
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name *</label>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Doe"
                      disabled={isExistingLead}
                      style={{
                        ...inputStyle,
                        background: isExistingLead ? "rgba(255, 255, 255, 0.03)" : inputStyle.background,
                        color: isExistingLead ? "rgba(255, 255, 255, 0.4)" : inputStyle.color,
                        border: isExistingLead ? "1px solid rgba(255, 255, 255, 0.08)" : inputStyle.border,
                        cursor: isExistingLead ? "not-allowed" : "text"
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="you@example.com"
                      disabled={isExistingLead}
                      style={{
                        ...inputStyle,
                        background: isExistingLead ? "rgba(255, 255, 255, 0.03)" : inputStyle.background,
                        color: isExistingLead ? "rgba(255, 255, 255, 0.4)" : inputStyle.color,
                        border: isExistingLead ? "1px solid rgba(255, 255, 255, 0.08)" : inputStyle.border,
                        cursor: isExistingLead ? "not-allowed" : "text"
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ position: "relative", width: "80px", flexShrink: 0 }}>
                        <div
                          style={{
                            ...inputStyle,
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "11px 6px",
                            background: isExistingLead ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.07)",
                            border: isExistingLead ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(255, 255, 255, 0.15)",
                            color: isExistingLead ? "rgba(255, 255, 255, 0.4)" : "#fff",
                            fontWeight: 600,
                            fontSize: "13px",
                            pointerEvents: "none"
                          }}
                        >
                          <span>{countryCode}</span>
                          <span style={{ fontSize: "9px", opacity: 0.6 }}>▼</span>
                        </div>
                        <select
                          value={countryCode}
                          onChange={(e) => handleCountryCodeChange(e.target.value)}
                          disabled={isExistingLead}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: isExistingLead ? "not-allowed" : "pointer"
                          }}
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code + c.name} value={c.code} style={{ background: "#24243e", color: "#fff" }}>
                              {c.flag} {c.code} ({c.name})
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        required
                        type="tel"
                        value={localNumber}
                        onChange={(e) => handleLocalNumberChange(e.target.value)}
                        placeholder="50 123 4567"
                        disabled={isExistingLead}
                        style={{
                          ...inputStyle,
                          flex: 1,
                          background: isExistingLead ? "rgba(255, 255, 255, 0.03)" : inputStyle.background,
                          color: isExistingLead ? "rgba(255, 255, 255, 0.4)" : inputStyle.color,
                          border: isExistingLead ? "1px solid rgba(255, 255, 255, 0.08)" : inputStyle.border,
                          cursor: isExistingLead ? "not-allowed" : "text"
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <SearchableCountrySelect
                    label="Nationality *"
                    value={form.nationality}
                    onChange={(val) => handleChange("nationality", val)}
                    options={NATIONALITIES}
                    placeholder="Select Nationality"
                    disabled={isExistingLead}
                    labelStyle={labelStyle}
                    inputStyle={inputStyle}
                  />
                  <SearchableCountrySelect
                    label="Country of Residence *"
                    value={form.countryOfResidence}
                    onChange={(val) => handleChange("countryOfResidence", val)}
                    options={ALL_COUNTRIES}
                    placeholder="Select Country"
                    disabled={isExistingLead}
                    labelStyle={labelStyle}
                    inputStyle={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "14px",
                    marginBottom: "28px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Your Language</label>
                    <select
                      value={form.preferredLanguage}
                      onChange={(e) =>
                        handleChange("preferredLanguage", e.target.value)
                      }
                      style={{ ...inputStyle, color: "#fff" }}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l} style={{ background: "#24243e", color: "#fff" }}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section: Visa Program (only for visa category) */}
                {serviceCategory === 'visa' && (
                  <>
                    <div style={sectionHeaderStyle}>✈️ Relocation Details</div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                        marginBottom: "28px",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Visa Program of Interest</label>
                        <select
                          value={form.serviceId}
                          onChange={(e) =>
                            handleChange("serviceId", e.target.value)
                          }
                          style={{ ...inputStyle, color: "#fff" }}
                        >
                          {SERVICES.map((s) => (
                            <option key={s.id} value={s.id} style={{ background: "#24243e", color: "#fff" }}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Total Applicants</label>
                        <select
                          value={form.applicantsCount}
                          onChange={(e) =>
                            handleChange("applicantsCount", e.target.value)
                          }
                          style={{ ...inputStyle, color: "#fff" }}
                        >
                          {APPLICANTS.map((a) => (
                            <option key={a.value} value={a.value} style={{ background: "#24243e", color: "#fff" }}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Section: Property Preferences (only for property category) */}
                {serviceCategory === 'property' && (
                  <>
                    <div style={sectionHeaderStyle}>🏠 Property Preferences</div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                        marginBottom: "28px",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Preferable Area in Spain *</label>
                        <select
                          required={serviceCategory === 'property'}
                          value={form.preferableAreaInSpain}
                          onChange={(e) => handleChange("preferableAreaInSpain", e.target.value)}
                          style={{ ...inputStyle, color: "#fff" }}
                        >
                          <option value="" disabled style={{ background: "#24243e" }}>Select Area in Spain</option>
                          <option value="Madrid" style={{ background: "#24243e" }}>Madrid</option>
                          <option value="Barcelona" style={{ background: "#24243e" }}>Barcelona</option>
                          <option value="Malaga" style={{ background: "#24243e" }}>Malaga & Costa del Sol</option>
                          <option value="Valencia" style={{ background: "#24243e" }}>Valencia</option>
                          <option value="Alicante" style={{ background: "#24243e" }}>Alicante & Costa Blanca</option>
                          <option value="Balearic Islands" style={{ background: "#24243e" }}>Balearic Islands (Mallorca, Ibiza)</option>
                          <option value="Canary Islands" style={{ background: "#24243e" }}>Canary Islands</option>
                          <option value="Costa Brava" style={{ background: "#24243e" }}>Costa Brava (Girona)</option>
                          <option value="Marbella" style={{ background: "#24243e" }}>Marbella & Andalusia</option>
                          <option value="Other" style={{ background: "#24243e" }}>Other / Not Decided</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Investment Budget *</label>
                        <select
                          value={form.budget}
                          onChange={(e) => handleChange("budget", e.target.value)}
                          style={{ ...inputStyle, color: "#fff" }}
                        >
                          <option value="€100k - €250k" style={{ background: "#24243e" }}>€100,000 – €250,000</option>
                          <option value="€250k - €500k" style={{ background: "#24243e" }}>€250,000 – €500,000</option>
                          <option value="€500k+ (Golden Visa)" style={{ background: "#24243e" }}>€500,000+ (Golden Visa)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Section: Sworn Translation redirect notice */}
                {serviceCategory === 'translation' && (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      padding: "20px",
                      marginBottom: "24px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", margin: "0 0 10px", lineHeight: 1.6 }}>
                      For Spanish Sworn Translation services, you will be redirected to our translation quote tool where you can upload your PDF document for an instant word count and price estimation.
                    </p>
                  </div>
                )}

                {/* Section: Meeting Preferences */}
                {serviceCategory !== "translation" && (
                  <>
                    <div style={sectionHeaderStyle}>📅 Meeting Preferences</div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={labelStyle}>Preferred Meeting Date *</label>
                      <input
                        type="date"
                        required={serviceCategory !== "translation"}
                        min={today}
                        value={form.meetingPreferredDate}
                        onChange={(e) =>
                          handleChange("meetingPreferredDate", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={labelStyle}>Preferred Time Slot *</label>
                      <select
                        required={serviceCategory !== "translation"}
                        value={form.meetingPreferredTime}
                        onChange={(e) =>
                          handleChange("meetingPreferredTime", e.target.value)
                        }
                        style={{ ...inputStyle, color: "#fff" }}
                      >
                        <option value="" disabled style={{ background: "#24243e" }}>Select Preferred Time Slot ({bookingAllowedStart} - {bookingAllowedEnd} UTC)</option>
                        {availableTimeSlots.map((slot) => (
                          <option key={slot} value={slot} style={{ background: "#24243e" }}>
                            ⏰ {slot} (UTC)
                          </option>
                        ))}
                      </select>
                    </div>

                    {serviceCategory === "visa" && (
                      <div style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "14px",
                        fontSize: "12px",
                        lineHeight: "1.5",
                        color: "#fca5a5"
                      }}>
                        ⚠️ <strong>Important:</strong> If you do not join your scheduled Free Eligibility Assessment within 10 minutes of the appointment time, your booking will be automatically cancelled. Due to high demand, missed appointments are not eligible for rescheduling. This policy helps us provide fair access to all applicants.
                      </div>
                    )}

                    <div style={{ marginBottom: "14px" }}>
                      <label style={labelStyle}>Consultation Language</label>
                      <select
                        value={form.meetingPreferredLanguage}
                        onChange={(e) =>
                          handleChange("meetingPreferredLanguage", e.target.value)
                        }
                        style={{ ...inputStyle, color: "#fff" }}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l} style={{ background: "#24243e", color: "#fff" }}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: "28px" }}>
                      <label style={labelStyle}>
                        Your Questions / Goals (optional)
                      </label>
                      <textarea
                        value={form.meetingNotes}
                        onChange={(e) =>
                          handleChange("meetingNotes", e.target.value)
                        }
                        rows={3}
                        placeholder={
                          serviceCategory === "property"
                            ? "What are your property investment goals? E.g. 'I want a Golden Visa property in Malaga...'"
                            : "What would you like to discuss? E.g. 'I want to know about DNV visa requirements for my family...'"
                        }
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          minHeight: "80px",
                        }}
                      />
                    </div>
                  </>
                )}

                {error && <div style={errorStyle}>{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  style={btnPrimaryStyle}
                >
                  {loading
                    ? "Submitting..."
                    : serviceCategory === "translation"
                    ? "✅ Proceed to Sworn Translation Tool"
                    : serviceCategory === "property"
                    ? "✅ Book Free Consultation"
                    : serviceCategory === "case_assessment"
                    ? "✅ Book Free Case Assessment"
                    : "✅ Book Free Eligibility Assessment"}
                </button>
              </form>
            </>
          )}

          {/* ─── STEP 2: Success ─── */}
          {step === 2 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "24px",
                  fontWeight: 800,
                  margin: "0 0 12px",
                }}
              >
                All Done!
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  margin: "0 0 28px",
                }}
              >
                {actionDoneMsg || (
                  <>
                    Thank you! Your details and meeting preferences have been saved.
                    <br />
                    Our team will contact you shortly with a confirmed meeting time.
                  </>
                )}
              </p>
              <div
                style={{
                  background: "rgba(102,126,234,0.15)",
                  border: "1px solid rgba(102,126,234,0.4)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "13px",
                    margin: "0 0 4px",
                  }}
                >
                  What happens next:
                </p>
                <ul
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "14px",
                    margin: 0,
                    paddingLeft: "18px",
                    lineHeight: 2,
                  }}
                >
                  <li>Our team reviews your preferred time</li>
                  <li>
                    {serviceCategory === "property" 
                      ? "A property investment expert is assigned to your case" 
                      : "A Spain Visa expert is assigned to your case"}
                  </li>
                  <li>
                    You receive a WhatsApp/Email confirmation with meeting link
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.3)",
            fontSize: "12px",
            marginTop: "20px",
          }}
        >
          © 2026 AAA Visa Consultancy · All rights reserved
        </p>
      </div>

      {/* Warning Popup Modal */}
      {warningPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: "rgba(10, 8, 28, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#1E1B3A",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "20px",
              padding: "36px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px"
            }}
          >
            <h3 style={{ color: "#ff4d4d", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {warningPopup.title}
            </h3>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
              {warningPopup.message}
            </p>
            <button
              onClick={() => setWarningPopup(null)}
              style={{
                background: "linear-gradient(135deg, #ff4d4d 0%, #cc0000 100%)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(255, 77, 77, 0.3)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              Okay, I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Shared Styles ──
const labelStyle = {
  display: "block",
  color: "rgba(255,255,255,0.6)",
  fontSize: "12px",
  fontWeight: 600,
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
  fontFamily: "inherit",
};

const btnPrimaryStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "opacity 0.2s ease",
  fontFamily: "inherit",
};

const errorStyle = {
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.4)",
  borderRadius: "10px",
  color: "#fca5a5",
  padding: "10px 14px",
  fontSize: "13px",
  marginBottom: "16px",
};

const sectionHeaderStyle = {
  color: "rgba(255,255,255,0.5)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "14px",
  paddingBottom: "8px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

export default LeadSelfFillForm;
