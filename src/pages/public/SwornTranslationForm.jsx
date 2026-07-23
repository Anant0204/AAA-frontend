import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://aaa-consultancy-production.up.railway.app/api/v1';

const LANGUAGES = [
  { value: 'English', label: 'English 🇺🇸' },
  { value: 'Arabic', label: 'Arabic 🇦🇪' },
  { value: 'Urdu', label: 'Urdu 🇵🇰' },
  { value: 'Multi-Language', label: 'Multi-Language / Custom 🌐' }
];

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
    sourceLanguage: 'English',
    targetLanguage: 'Spanish'
  });

  const [countryCode, setCountryCode] = useState("+971");
  const [localNumber, setLocalNumber] = useState("");

  React.useEffect(() => {
    if (formData.phone) {
      const { countryCode: cCode, localNumber: lNum } = parsePhone(formData.phone);
      if (cCode !== countryCode) setCountryCode(cCode);
      if (lNum !== localNumber) setLocalNumber(lNum);
    }
  }, [formData.phone]);

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

  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Passport');
  const [customCategory, setCustomCategory] = useState('');
  const [status, setStatus] = useState(null);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setQuote(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Please fill in all personal details first.');
      return;
    }
    if (!file) {
      setError('Please upload a PDF document.');
      return;
    }

    try {
      setStatus('loading');
      setError(null);
      
      const formDataUpload = new FormData();
      formDataUpload.append('document', file);
      formDataUpload.append('firstName', formData.firstName);
      formDataUpload.append('lastName', formData.lastName);
      formDataUpload.append('email', formData.email);
      formDataUpload.append('phone', formData.phone);
      formDataUpload.append('nationality', formData.nationality);
      formDataUpload.append('sourceLanguage', formData.sourceLanguage);
      formDataUpload.append('targetLanguage', formData.targetLanguage);

      const res = await axios.post(`${API_URL}/booking/translation/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setQuote(res.data.data);
        setStatus('success');
      }
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
    if (!file) {
      setError('Please upload a PDF document.');
      return;
    }

    try {
      setStatus('loading');
      setError(null);

      const formDataCheckout = new FormData();
      formDataCheckout.append('document', file);
      
      let finalCategory = category;
      if (category === 'Other') {
        finalCategory = `Other: ${customCategory || 'General Document'}`;
      }
      formDataCheckout.append('category', finalCategory);
      formDataCheckout.append('firstName', formData.firstName);
      formDataCheckout.append('lastName', formData.lastName);
      formDataCheckout.append('email', formData.email);
      formDataCheckout.append('phone', formData.phone);
      formDataCheckout.append('nationality', formData.nationality);
      formDataCheckout.append('sourceLanguage', formData.sourceLanguage);
      formDataCheckout.append('targetLanguage', formData.targetLanguage);
      formDataCheckout.append('wordCount', quote.wordCount);
      formDataCheckout.append('estimatedPrice', quote.estimatedPrice);

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

      <div style={{ width: '100%', maxWidth: '600px' }}>
        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
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
              AAA Visa
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
            Certified Spanish Sworn Translation
          </p>
        </div>

        {/* Card Panel */}
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>
              Sworn Translation Quote
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 16px' }}>
              Upload your PDF document to get an instant word count and estimated price.
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

            {/* Grid: Nationality & Source Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nationality *</label>
                <select
                  name="nationality"
                  required
                  value={formData.nationality}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, color: '#fff' }}
                >
                  <option value="" style={{ background: '#24243e' }}>Select Nationality</option>
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n} style={{ background: '#24243e', color: '#fff' }}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Source Language *</label>
                <select
                  name="sourceLanguage"
                  value={formData.sourceLanguage}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, color: '#fff' }}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value} style={{ background: '#24243e', color: '#fff' }}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Language (Static Spanish) */}
            <div>
              <label style={labelStyle}>Target Language</label>
              <input
                type="text"
                readOnly
                value="Spanish (Español) 🇪🇸"
                style={{
                  ...inputStyle,
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'rgba(255, 255, 255, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            {/* File Upload Box */}
            <div>
              <label style={labelStyle}>Upload PDF Document *</label>
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                    setQuote(null);
                  }
                }}
                onClick={() => document.getElementById('landing-file-input').click()}
                style={{
                  border: isDragActive ? '2px dashed #38ef7d' : '2px dashed rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'rgba(56, 239, 125, 0.05)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s ease',
                }}
              >
                <input 
                  id="landing-file-input"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📁</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600, display: 'block' }}>
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here, or click to browse'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  Supports PDF (Max 10MB)
                </span>
              </div>
            </div>

            {/* Uploaded File Category Selector directly above button */}
            {file && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={labelStyle}>Uploaded File & Category:</span>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#fff',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>📄</span>
                      <div>
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </span>
                        <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setQuote(null);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'color 0.2s',
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Category Selection Dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>Select Category:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(0,0,0,0.2)',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Passport" style={{ background: '#1c1e22' }}>Passport</option>
                      <option value="Birth Certificate" style={{ background: '#1c1e22' }}>Birth Certificate</option>
                      <option value="Marriage Certificate" style={{ background: '#1c1e22' }}>Marriage Certificate</option>
                      <option value="Criminal Record Certificate" style={{ background: '#1c1e22' }}>Criminal Record Certificate</option>
                      <option value="Academic Transcript / Diploma" style={{ background: '#1c1e22' }}>Academic Transcript / Diploma</option>
                      <option value="Bank Statement" style={{ background: '#1c1e22' }}>Bank Statement</option>
                      <option value="Other" style={{ background: '#1c1e22' }}>Other (specify below)</option>
                    </select>
                  </div>

                  {/* Custom Category Input if "Other" is selected */}
                  {category === 'Other' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>Specify Document Category:</label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="e.g. Health Certificate"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(0,0,0,0.2)',
                          color: '#fff',
                          fontSize: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ paddingTop: '10px' }}>
              <button
                type="submit"
                disabled={status === 'loading' || !file}
                style={btnPrimaryStyle}
              >
                {status === 'loading' ? 'Calculating words...' : '🔍 Get Instant Quote'}
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
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px', textAlign: 'center' }}>
                📊 Your Estimated Quote
              </h3>
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
                  <li>English to Spanish: <strong>€0.15</strong> per word</li>
                  <li>Arabic to Spanish: <strong>€0.25</strong> per word</li>
                  <li>Urdu to Spanish: <strong>€0.40</strong> per word</li>
                </ul>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginTop: '6px' }}>
                  * Delivery within maximum 7 working days from payment confirmation.
                </span>
              </div>

              {(() => {
                const subtotal = quote.subtotal ? Number(quote.subtotal) : Number((quote.estimatedPrice / 1.05).toFixed(2));
                const vat = quote.vat ? Number(quote.vat) : Number((quote.estimatedPrice - subtotal).toFixed(2));
                const total = quote.estimatedPrice ? Number(quote.estimatedPrice) : Number((subtotal + vat).toFixed(2));

                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Word Count</span>
                        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>{quote.wordCount} words</span>
                      </div>
                      <div style={{ textAlign: 'center', background: 'rgba(56, 239, 125, 0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 239, 125, 0.2)' }}>
                        <span style={{ display: 'block', color: 'rgba(56, 239, 125, 0.7)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Incl. 5% VAT</span>
                        <span style={{ color: '#38ef7d', fontSize: '18px', fontWeight: 800 }}>
                          {new Intl.NumberFormat('en-IE', { style: 'currency', currency: quote.currency || 'EUR' }).format(total)}
                        </span>
                      </div>
                    </div>

                    {/* VAT Breakdown */}
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
                      <span>+ 5% VAT: <strong>€{vat.toFixed(2)}</strong></span>
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
                  💳 Proceed with Payment (Stripe Checkout)
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

// ── Theme Style Definitions (Twin to Intake Form) ──
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
  padding: '36px',
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
