import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { NATIONALITIES } from '../../constants/nationalities';

const API_URL = import.meta.env.VITE_API_URL || 'https://aaa-consultancy-backend-production.up.railway.app/api/v1';

const getLanguageFlag = (langName) => {
  const lower = (langName || '').toLowerCase().trim();
  if (lower.includes('english')) return '🇺🇸';
  if (lower.includes('arabic')) return '🇦🇪';
  if (lower.includes('urdu')) return '🇵🇰';
  if (lower.includes('french')) return '🇫🇷';
  if (lower.includes('german')) return '🇩🇪';
  if (lower.includes('hindi')) return '🇮🇳';
  if (lower.includes('russian')) return '🇷🇺';
  if (lower.includes('italian')) return '🇮🇹';
  if (lower.includes('portuguese')) return '🇵🇹';
  if (lower.includes('chinese')) return '🇨🇳';
  if (lower.includes('turkish')) return '🇹🇷';
  if (lower.includes('spanish')) return '🇪🇸';
  if (lower.includes('dutch')) return '🇳🇱';
  if (lower.includes('japanese')) return '🇯🇵';
  if (lower.includes('bengali')) return '🇧🇩';
  if (lower.includes('persian') || lower.includes('farsi')) return '🇮🇷';
  return '🌐';
};

const DEFAULT_LANGUAGES = [
  { value: 'English', label: 'English 🇺🇸', rate: 0.15 },
  { value: 'Arabic', label: 'Arabic 🇦🇪', rate: 0.25 },
  { value: 'Urdu', label: 'Urdu 🇵🇰', rate: 0.40 }
];

const DOCUMENT_CATEGORIES = [
  'Passport',
  'Birth Certificate',
  'Marriage Certificate',
  'Clean Criminal Record Certificate',
  'Academic Transcript / Diploma',
  'Bank Statement / Financial Proof',
  'Medical Certificate',
  'Power of Attorney',
  'Other'
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

  const getOptValue = (opt) => (typeof opt === "object" && opt !== null ? opt.value : opt);
  const getOptLabel = (opt) => (typeof opt === "object" && opt !== null ? opt.label : opt);

  const selectedItem = options.find(opt => getOptValue(opt) === value);
  const selectedDisplay = selectedItem ? getOptLabel(selectedItem) : (value || placeholder);

  const filteredOptions = options.filter(opt => {
    const labelText = getOptLabel(opt);
    return String(labelText).toLowerCase().includes(searchQuery.toLowerCase());
  });

  React.useEffect(() => {
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
      {label && <label style={labelStyle}>{label}</label>}
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
          {selectedDisplay}
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
            placeholder="🔍 Type to search..."
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
              filteredOptions.map((opt) => {
                const optVal = getOptValue(opt);
                const optLabel = getOptLabel(opt);
                const isSelected = optVal === value;
                return (
                  <div
                    key={optVal}
                    onClick={() => {
                      onChange(optVal);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: isSelected ? "#667eea" : "#fff",
                      background: isSelected ? "rgba(102, 126, 234, 0.2)" : "transparent",
                      fontWeight: isSelected ? 600 : 400,
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {optLabel}
                  </div>
                );
              })
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

const SwornTranslationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilled = location.state?.prefilledLead || {};

  const [formData, setFormData] = useState({
    firstName: prefilled.firstName || '',
    lastName: prefilled.lastName || '',
    email: prefilled.email || '',
    phone: prefilled.phone || '',
    nationality: prefilled.nationality || '',
    targetLanguage: 'Spanish'
  });

  const [countryCode, setCountryCode] = useState("+971");
  const [localNumber, setLocalNumber] = useState("");

  // Multiple Documents State
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      file: null,
      documentLanguage: 'English',
      otherLanguage: '',
      category: 'Passport',
      customCategory: '',
      isDragActive: false
    }
  ]);

  const [status, setStatus] = useState(null);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Dynamic Translation Rates & Selectable Languages state
  const [availableLanguages, setAvailableLanguages] = useState(DEFAULT_LANGUAGES);
  const [translationRates, setTranslationRates] = useState(DEFAULT_LANGUAGES);

  useEffect(() => {
    if (location.state?.prefilledLead) {
      const pf = location.state.prefilledLead;
      setFormData((prev) => ({
        ...prev,
        firstName: pf.firstName || prev.firstName,
        lastName: pf.lastName || prev.lastName,
        email: pf.email || prev.email,
        phone: pf.phone || prev.phone,
        nationality: pf.nationality || prev.nationality
      }));
    }
  }, [location.state]);

  useEffect(() => {
    if (formData.phone) {
      const { countryCode: cCode, localNumber: lNum } = parsePhone(formData.phone);
      if (cCode !== countryCode) setCountryCode(cCode);
      if (lNum !== localNumber) setLocalNumber(lNum);
    }
  }, [formData.phone]);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/settings/company`);
        const companyData = res.data?.data || res.data || {};
        let rates = companyData.swornTranslationRates;
        if (typeof rates === 'string') {
          try { rates = JSON.parse(rates); } catch (e) {}
        }
        if (Array.isArray(rates) && rates.length > 0) {
          const formatted = rates.map(r => {
            const rawName = r.name || r.label || r.value || 'Language';
            const flag = getLanguageFlag(rawName);
            return {
              id: r.id || `lang_${rawName}`,
              value: rawName,
              label: `${rawName} ${flag}`,
              name: rawName,
              rate: parseFloat(r.rate) || 0.15
            };
          });
          setAvailableLanguages(formatted);
          setTranslationRates(formatted);
        } else {
          setAvailableLanguages(DEFAULT_LANGUAGES);
          setTranslationRates(DEFAULT_LANGUAGES);
        }
      } catch (err) {
        console.warn('Failed to load dynamic translation rates:', err.message);
        setAvailableLanguages(DEFAULT_LANGUAGES);
        setTranslationRates(DEFAULT_LANGUAGES);
      }
    };
    fetchCompanySettings();
  }, []);

  const handleCountryCodeChange = (newCode) => {
    setCountryCode(newCode);
    const cleanDigits = localNumber.replace(/[^\d]/g, "");
    const combined = cleanDigits ? `${newCode}${cleanDigits}` : newCode;
    setFormData((prev) => ({ ...prev, phone: combined }));
  };

  const handleLocalNumberChange = (rawVal) => {
    const cleanDigits = rawVal.replace(/[^\d]/g, "");
    setLocalNumber(cleanDigits);
    const combined = cleanDigits ? `${countryCode}${cleanDigits}` : countryCode;
    setFormData((prev) => ({ ...prev, phone: combined }));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Multi-document management
  const handleAddDocument = () => {
    setDocuments((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        file: null,
        documentLanguage: 'English',
        otherLanguage: '',
        category: 'Passport',
        customCategory: '',
        isDragActive: false
      }
    ]);
    setQuote(null);
  };

  const handleRemoveDocument = (index) => {
    if (documents.length <= 1) return;
    setDocuments((prev) => prev.filter((_, i) => i !== index));
    setQuote(null);
  };

  const handleUpdateDoc = (index, field, value) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (field === 'file') {
      setQuote(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Please fill in all personal details first.');
      return;
    }

    // Verify all documents have files
    const missingFileIdx = documents.findIndex(d => !d.file);
    if (missingFileIdx !== -1) {
      setError(`Please upload a PDF document for Document #${missingFileIdx + 1}.`);
      return;
    }

    try {
      setStatus('loading');
      setError(null);

      // Process each document individually with field name 'document' for 100% backend compatibility
      const docPromises = documents.map(async (doc, idx) => {
        let finalLang = doc.documentLanguage;
        if (doc.documentLanguage === 'Other' && doc.otherLanguage?.trim()) {
          finalLang = doc.otherLanguage.trim();
        }
        let finalCat = doc.category;
        if (doc.category === 'Other' && doc.customCategory?.trim()) {
          finalCat = `Other: ${doc.customCategory.trim()}`;
        }

        const singleForm = new FormData();
        singleForm.append('document', doc.file);
        singleForm.append('category', finalCat);
        singleForm.append('sourceLanguage', finalLang);
        singleForm.append('targetLanguage', formData.targetLanguage);
        singleForm.append('firstName', formData.firstName);
        singleForm.append('lastName', formData.lastName);
        singleForm.append('email', formData.email);
        singleForm.append('phone', formData.phone);
        singleForm.append('nationality', formData.nationality);

        const res = await axios.post(`${API_URL}/booking/translation/upload`, singleForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const resData = res.data?.data || {};
        const wordCount = Number(resData.wordCount) || 0;
        const rate = Number(resData.rate) || (
          translationRates.find(r => (r.name || r.value || '').toLowerCase().includes(finalLang.toLowerCase()))?.rate || 0.15
        );
        const subtotal = Number(resData.subtotal) || parseFloat((wordCount * rate).toFixed(2));
        const vat = Number(resData.vat) || parseFloat((subtotal * 0.05).toFixed(2));
        const estimatedPrice = Number(resData.estimatedPrice) || parseFloat((subtotal + vat).toFixed(2));

        return {
          index: idx,
          name: doc.file.name,
          category: finalCat,
          documentLanguage: finalLang,
          wordCount,
          rate,
          subtotal,
          vat,
          estimatedPrice
        };
      });

      const docResults = await Promise.all(docPromises);

      const totalWordCount = docResults.reduce((sum, d) => sum + d.wordCount, 0);
      const totalSubtotal = parseFloat(docResults.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2));
      const totalVat = parseFloat((totalSubtotal * 0.05).toFixed(2));
      const totalEstimatedPrice = parseFloat((totalSubtotal + totalVat).toFixed(2));

      setQuote({
        documents: docResults,
        totalWordCount,
        wordCount: totalWordCount,
        subtotal: totalSubtotal,
        vat: totalVat,
        estimatedPrice: totalEstimatedPrice,
        currency: 'EUR'
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to upload and calculate document words.');
    }
  };

  const handleProceed = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Please fill in all personal details first.');
      return;
    }
    if (!quote) return;

    try {
      setStatus('loading');
      setError(null);

      const formDataCheckout = new FormData();
      if (documents[0] && documents[0].file) {
        formDataCheckout.append('document', documents[0].file);
      }

      formDataCheckout.append('firstName', formData.firstName);
      formDataCheckout.append('lastName', formData.lastName);
      formDataCheckout.append('email', formData.email);
      formDataCheckout.append('phone', formData.phone);
      formDataCheckout.append('nationality', formData.nationality);
      formDataCheckout.append('targetLanguage', formData.targetLanguage);
      formDataCheckout.append('wordCount', quote.totalWordCount || quote.wordCount || 0);
      formDataCheckout.append('estimatedPrice', quote.estimatedPrice || 0);

      const metadata = (quote.documents || documents).map((doc, idx) => {
        const matchingDocState = documents[idx] || {};
        let finalLang = doc.documentLanguage || matchingDocState.documentLanguage || 'English';
        if (matchingDocState.documentLanguage === 'Other' && matchingDocState.otherLanguage?.trim()) {
          finalLang = matchingDocState.otherLanguage.trim();
        }
        let finalCat = doc.category || matchingDocState.category || 'Passport';
        if (matchingDocState.category === 'Other' && matchingDocState.customCategory?.trim()) {
          finalCat = `Other: ${matchingDocState.customCategory.trim()}`;
        }
        return {
          index: idx,
          name: doc.name || matchingDocState.file?.name || `Document_${idx + 1}.pdf`,
          documentLanguage: finalLang,
          category: finalCat,
          wordCount: doc.wordCount || 0
        };
      });

      formDataCheckout.append('documentsMetadata', JSON.stringify(metadata));
      formDataCheckout.append('category', metadata.map(m => m.category).join(', '));
      formDataCheckout.append('sourceLanguage', metadata.map(m => m.documentLanguage).join(', '));

      const res = await axios.post(`${API_URL}/booking/translation/checkout`, formDataCheckout, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success && res.data.data.paymentUrl) {
        window.location.href = res.data.data.paymentUrl;
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to initialize payment checkout.');
    }
  };

  return (
    <div style={wrapperStyle}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div style={{ width: '100%', maxWidth: '660px' }}>
        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}
            >
              🌍
            </div>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              Certified Spanish Sworn Translation
            </span>
          </div>
        </div>

        {/* Card Panel */}
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>
              Sworn Translation Quote
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 16px' }}>
              Upload your PDF documents and select each document's language for an instant price quote.
            </p>
          </div>

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Grid: First Name & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Grid: Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  style={inputStyle}
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
                        background: "rgba(255, 255, 255, 0.07)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#fff",
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
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer"
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
                    type="tel"
                    required
                    value={localNumber}
                    onChange={(e) => handleLocalNumberChange(e.target.value)}
                    placeholder="50 123 4567"
                    style={{
                      ...inputStyle,
                      flex: 1
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Grid: Nationality & Target Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <SearchableCountrySelect
                  label="Nationality *"
                  value={formData.nationality}
                  onChange={(val) => setFormData((prev) => ({ ...prev, nationality: val }))}
                  options={
                    formData.nationality && !NATIONALITIES.includes(formData.nationality)
                      ? [formData.nationality, ...NATIONALITIES]
                      : NATIONALITIES
                  }
                  placeholder="Select Nationality"
                  disabled={false}
                  labelStyle={labelStyle}
                  inputStyle={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Target Language</label>
                <input
                  type="text"
                  readOnly
                  value="Spanish (Español) 🇪🇸"
                  style={{
                    ...inputStyle,
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>

            {/* Documents Section Header */}
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ ...labelStyle, fontSize: '13px', color: '#a78bfa', margin: 0 }}>
                Upload Documents & Select Languages *
              </label>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {documents.length} {documents.length === 1 ? 'document' : 'documents'}
              </span>
            </div>

            {/* List of Documents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Document Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        #{idx + 1}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                        Document {idx + 1}
                      </span>
                    </div>

                    {documents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  {/* Document Language Dropdown */}
                  <div>
                    <label style={{ ...labelStyle, fontSize: '11px', color: '#cbd5e1' }}>
                      Document Language *
                    </label>
                    <select
                      value={doc.documentLanguage}
                      onChange={(e) => handleUpdateDoc(idx, 'documentLanguage', e.target.value)}
                      style={{ ...inputStyle, color: '#fff', padding: '9px 12px' }}
                    >
                      {availableLanguages.map((lang) => (
                        <option key={lang.value || lang.name} value={lang.value || lang.name} style={{ background: '#24243e', color: '#fff' }}>
                          {lang.label || `${lang.name} ${getLanguageFlag(lang.name)}`}
                        </option>
                      ))}
                    </select>

                    {/* Custom Language input if "Other" is chosen */}
                    {doc.documentLanguage === 'Other' && (
                      <input
                        type="text"
                        placeholder="Please specify document language (e.g. Dutch, Tagalog)"
                        value={doc.otherLanguage}
                        onChange={(e) => handleUpdateDoc(idx, 'otherLanguage', e.target.value)}
                        style={{ ...inputStyle, marginTop: '8px', padding: '8px 12px', fontSize: '12px' }}
                      />
                    )}
                  </div>

                  {/* Document Category Dropdown */}
                  <div>
                    <label style={{ ...labelStyle, fontSize: '11px', color: '#cbd5e1' }}>
                      Document Category
                    </label>
                    <select
                      value={doc.category}
                      onChange={(e) => handleUpdateDoc(idx, 'category', e.target.value)}
                      style={{ ...inputStyle, color: '#fff', padding: '9px 12px' }}
                    >
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} style={{ background: '#24243e', color: '#fff' }}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {/* Custom Category if "Other" is chosen */}
                    {doc.category === 'Other' && (
                      <input
                        type="text"
                        placeholder="Specify document name / type"
                        value={doc.customCategory}
                        onChange={(e) => handleUpdateDoc(idx, 'customCategory', e.target.value)}
                        style={{ ...inputStyle, marginTop: '8px', padding: '8px 12px', fontSize: '12px' }}
                      />
                    )}
                  </div>

                  {/* File Upload Box */}
                  <div>
                    <label style={{ ...labelStyle, fontSize: '11px', color: '#cbd5e1' }}>
                      Upload PDF File *
                    </label>

                    {doc.file ? (
                      /* Uploaded file preview card */
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: 'rgba(56, 239, 125, 0.08)',
                          border: '1px solid rgba(56, 239, 125, 0.25)',
                          borderRadius: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <span style={{ fontSize: '22px' }}>📄</span>
                          <div style={{ minWidth: 0 }}>
                            <span style={{
                              display: 'block',
                              color: '#fff',
                              fontSize: '13px',
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {doc.file.name}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                              {(doc.file.size / 1024).toFixed(1)} KB · PDF
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpdateDoc(idx, 'file', null)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '16px',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'color 0.2s'
                          }}
                          title="Change file"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      /* Drag and Drop Box */
                      <div
                        onDragOver={(e) => { e.preventDefault(); handleUpdateDoc(idx, 'isDragActive', true); }}
                        onDragLeave={() => handleUpdateDoc(idx, 'isDragActive', false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleUpdateDoc(idx, 'isDragActive', false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleUpdateDoc(idx, 'file', e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => document.getElementById(`file-input-${doc.id}`).click()}
                        style={{
                          border: doc.isDragActive ? '2px dashed #38ef7d' : '2px dashed rgba(255,255,255,0.2)',
                          borderRadius: '10px',
                          padding: '20px 14px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: doc.isDragActive ? 'rgba(56, 239, 125, 0.05)' : 'rgba(255,255,255,0.02)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <input
                          id={`file-input-${doc.id}`}
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUpdateDoc(idx, 'file', e.target.files[0]);
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>📁</span>
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, display: 'block' }}>
                          {doc.isDragActive ? 'Drop PDF file here' : 'Click to browse or drag PDF here'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                          Supports PDF (Max 10MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Document Button */}
            <div>
              <button
                type="button"
                onClick={handleAddDocument}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px dashed rgba(167, 139, 250, 0.5)',
                  borderRadius: '12px',
                  color: '#c4b5fd',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>➕</span> Add Another Document
              </button>
            </div>

            <div style={{ paddingTop: '8px' }}>
              <button
                type="submit"
                disabled={status === 'loading' || documents.some(d => !d.file)}
                style={{
                  ...btnPrimaryStyle,
                  opacity: documents.some(d => !d.file) ? 0.5 : 1,
                  cursor: documents.some(d => !d.file) ? 'not-allowed' : 'pointer'
                }}
              >
                {status === 'loading' ? 'Calculating words & price...' : '🔍 Get Instant Quote'}
              </button>
            </div>
          </form>

          {status === 'error' && (
            <div style={errorCardStyle}>
              <p style={{ color: '#ff8a8a', fontSize: '13px', margin: 0, fontWeight: 600 }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          {status === 'success' && quote && (
            <div style={successCardStyle}>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 16px', textAlign: 'center' }}>
                📊 Your Sworn Translation Quote
              </h3>

              {/* Translation Rates Reference */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'left'
              }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>💰 Translation Rates (excluding 5% VAT):</strong>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e0' }}>
                  {translationRates && translationRates.length > 0 ? (
                    translationRates.map((r, idx) => (
                      <li key={idx}>
                        {r.name || r.label || 'Language Pair'}: <strong>€{Number(r.rate || 0).toFixed(2)}</strong> per word
                      </li>
                    ))
                  ) : (
                    <>
                      <li>English to Spanish: <strong>€0.15</strong> per word</li>
                      <li>Arabic to Spanish: <strong>€0.25</strong> per word</li>
                      <li>Urdu to Spanish: <strong>€0.40</strong> per word</li>
                    </>
                  )}
                </ul>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginTop: '6px' }}>
                  * Official Spain Sworn certification included. Delivered within max 7 working days.
                </span>
              </div>

              {/* Itemized Document Breakdown */}
              {quote.documents && quote.documents.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ ...labelStyle, fontSize: '11px', color: '#cbd5e1', marginBottom: '8px' }}>
                    Itemized Documents Breakdown:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quote.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1, paddingRight: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.name}
                            </span>
                            <span style={{
                              background: 'rgba(102, 126, 234, 0.2)',
                              color: '#a78bfa',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              {doc.category || 'Document'}
                            </span>
                          </div>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                            {doc.documentLanguage || doc.sourceLanguage} ➔ Spanish · {doc.wordCount} words (@€{Number(doc.rate || 0.15).toFixed(2)}/word)
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ color: '#38ef7d', fontWeight: 700, fontSize: '14px' }}>
                            €{Number(doc.estimatedPrice || doc.subtotal || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Summary Cards */}
              {(() => {
                const subtotal = quote.subtotal ? Number(quote.subtotal) : Number((quote.estimatedPrice / 1.05).toFixed(2));
                const vat = quote.vat ? Number(quote.vat) : Number((quote.estimatedPrice - subtotal).toFixed(2));
                const total = quote.estimatedPrice ? Number(quote.estimatedPrice) : Number((subtotal + vat).toFixed(2));
                const words = quote.totalWordCount || quote.wordCount || 0;

                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Word Count</span>
                        <span style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>{words} words</span>
                      </div>
                      <div style={{ textAlign: 'center', background: 'rgba(56, 239, 125, 0.06)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(56, 239, 125, 0.2)' }}>
                        <span style={{ display: 'block', color: 'rgba(56, 239, 125, 0.7)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Incl. 5% VAT</span>
                        <span style={{ color: '#38ef7d', fontSize: '20px', fontWeight: 800 }}>
                          {new Intl.NumberFormat('en-IE', { style: 'currency', currency: quote.currency || 'EUR' }).format(total)}
                        </span>
                      </div>
                    </div>

                    {/* Subtotal & VAT Breakdown */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>Subtotal: <strong>€{subtotal.toFixed(2)}</strong></span>
                      <span>+ 5% Official VAT: <strong>€{vat.toFixed(2)}</strong></span>
                    </div>
                  </>
                );
              })()}

              {/* Mandatory Terms Checkbox */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                textAlign: 'left'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#fff', fontSize: '13px', cursor: 'pointer', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#38ef7d', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>
                    I have read and accepted the Company's <a href="https://aaabusinessconsultancy.com/terms-conditions/" target="_blank" rel="noopener noreferrer" style={{ color: '#38ef7d', textDecoration: 'underline' }}>Terms and Conditions</a>. *
                  </span>
                </label>
              </div>

              <div>
                <button
                  onClick={handleProceed}
                  disabled={!termsAccepted}
                  style={{
                    ...btnCheckoutStyle,
                    opacity: termsAccepted ? 1 : 0.4,
                    cursor: termsAccepted ? 'pointer' : 'not-allowed',
                    background: termsAccepted ? 'linear-gradient(135deg, #11998e, #38ef7d)' : '#4a5568'
                  }}
                >
                  💳 Proceed with Payment
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '20px' }}>
          © 2026 AAA Visa Consultancy · All rights reserved
        </p>
      </div>
    </div>
  );
};

// ── Theme Style Definitions ──
const wrapperStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  fontFamily: "'Inter', sans-serif"
};

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '20px',
  padding: '32px',
  boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '12px',
  fontWeight: 600,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
  fontFamily: 'inherit'
};

const btnPrimaryStyle = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'opacity 0.2s ease'
};

const btnCheckoutStyle = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #11998e, #38ef7d)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'opacity 0.2s ease'
};

const errorCardStyle = {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.35)',
  borderRadius: '10px',
  padding: '12px 16px',
  marginTop: '16px'
};

const successCardStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '14px',
  padding: '20px',
  marginTop: '24px'
};

export default SwornTranslationForm;
