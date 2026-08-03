export const COUNTRY_CODES = [
  { code: "+971", name: "UAE" },
  { code: "+91", name: "India" },
  { code: "+34", name: "Spain" },
  { code: "+44", name: "UK" },
  { code: "+1", name: "USA / Canada" },
  { code: "+92", name: "Pakistan" },
  { code: "+63", name: "Philippines" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+974", name: "Qatar" },
  { code: "+965", name: "Kuwait" },
  { code: "+968", name: "Oman" },
  { code: "+973", name: "Bahrain" },
  { code: "+20", name: "Egypt" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
  { code: "+39", name: "Italy" },
  { code: "+31", name: "Netherlands" },
  { code: "+41", name: "Switzerland" },
  { code: "+61", name: "Australia" },
  { code: "+64", name: "New Zealand" },
  { code: "+60", name: "Malaysia" },
  { code: "+65", name: "Singapore" },
  { code: "+234", name: "Nigeria" },
  { code: "+27", name: "South Africa" },
  { code: "+55", name: "Brazil" },
  { code: "+52", name: "Mexico" },
  { code: "+86", name: "China" },
  { code: "+81", name: "Japan" },
  { code: "+82", name: "South Korea" },
  { code: "+90", name: "Turkey" },
  { code: "+212", name: "Morocco" },
  { code: "+213", name: "Algeria" },
  { code: "+216", name: "Tunisia" },
  { code: "+962", name: "Jordan" },
  { code: "+961", name: "Lebanon" },
  { code: "+964", name: "Iraq" },
  { code: "+880", name: "Bangladesh" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+977", name: "Nepal" }
];

export const parsePhone = (rawPhone) => {
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
