import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation } from '@tanstack/react-query';

// Spain Theme Image Assets
import spainSevillePlaza from '../../assets/spain_seville_plaza.png';
import spainRelocationLifestyle from '../../assets/spain_relocation_lifestyle.png';
import waelMadiPhoto from '../../assets/wael_madi.png';

// Material Icons
import TranslateIcon from '@mui/icons-material/Translate';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShieldIcon from '@mui/icons-material/Shield';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import PublicIcon from '@mui/icons-material/Public';
import CheckIcon from '@mui/icons-material/Check';

// Services
import { dbService } from '../../services/dbService';
import { useAlert } from '../../contexts/AlertContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  
  // Mobile Nav State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  // Login Dropdown State
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  // Custom Scroll Helper for HashRouter Compatibility
  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    countryOfResidence: '',
    preferredLanguage: 'English',
    serviceType: 'Digital Nomad Visa (DNV)',
  });

  // API Call Mutation
  const leadMutation = useMutation({
    mutationFn: dbService.createLead,
    onSuccess: () => {
      showAlert('Thank you! Your eligibility assessment request has been submitted successfully. Our representative will contact you soon.', 'success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        countryOfResidence: '',
        preferredLanguage: 'English',
        serviceType: 'Digital Nomad Visa (DNV)',
      });
    },
    onError: (error) => {
      console.error(error);
      showAlert('Failed to submit request. Please verify your details or try again later.', 'error');
    }
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }
    leadMutation.mutate({
      ...formData,
      status: 'New Lead'
    });
  };

  // Nav items
  const navItems = [
    { label: 'Services', href: '#services' },
    { label: 'Why Choose Us', href: '#why-us' },
    { label: 'Packages', href: '#packages' },
    { label: 'Our Founder', href: '#ceo' },
    { label: 'FAQs', href: '#faqs' },
    { label: 'Contact', href: '#contact' },
  ];

  // Core Services
  const services = [
    {
      title: 'Digital Nomad Visa (DNV)',
      desc: 'Remote work residency solutions tailored for professionals, freelancers, and global entrepreneurs planning to operate from Spain.',
      icon: <BusinessCenterIcon className="text-brand-gold text-3xl" />,
      tag: 'Most Popular'
    },
    {
      title: 'Non-Lucrative Visa (NLV)',
      desc: 'Perfect residency option for retirees, families, and financially independent individuals wishing to reside in Spain without employment.',
      icon: <VerifiedUserIcon className="text-brand-gold text-3xl" />
    },
    {
      title: 'Self-Employed / Business Residency',
      desc: 'Expert support for entrepreneurs and business owners establishing startups or local companies in Spain.',
      icon: <PublicIcon className="text-brand-gold text-3xl" />
    },
    {
      title: 'Study Visa',
      desc: 'Complete assistance for university admissions, prestigious language schools, master\'s programs, and Spain’s PCE preparation.',
      icon: <SchoolIcon className="text-brand-gold text-3xl" />
    },
    {
      title: 'Partner & Family Reunification',
      desc: 'Reliable residency support and documentation guidance to reunite legal residents or EU citizens with their spouses and children.',
      icon: <FamilyRestroomIcon className="text-brand-gold text-3xl" />
    },
    {
      title: 'Tourism Visa & Schengen Guidance',
      desc: 'Professional itinerary planning, documents checklist preparation, and support for Schengen short-stay tourist applications.',
      icon: <FlightTakeoffIcon className="text-brand-gold text-3xl" />
    },
    {
      title: 'Property Investment Guidance',
      desc: 'Comprehensive advice for global property buyers, high-net-worth investors, and local relocation compliance.',
      icon: <HomeIcon className="text-brand-gold text-3xl" />
    },
    {
      title: 'Spanish Sworn Translation',
      desc: 'Certified translation of official documents (PCC, Birth Certificate, Bank Statements) from English, Arabic, Urdu, or French to Spanish by Ministry-approved sworn translators.',
      icon: <TranslateIcon className="text-brand-gold text-3xl" />
    }
  ];

  // Why Choose Us
  const whyUsPoints = [
    {
      title: 'Dubai-Based Headquarters',
      desc: 'Conveniently located in Dubai, proudly serving clients across the UAE, GCC, Asia, and globally.'
    },
    {
      title: 'Specialized Spain Focus',
      desc: 'Unlike generic agencies, we specialize exclusively in Spain visa, residency, and relocation pathways.'
    },
    {
      title: 'Dedicated Case Managers',
      desc: 'Personalized support with a single point of contact holding extensive experience in Spanish regulatory affairs.'
    },
    {
      title: 'AI-Powered System & Automation',
      desc: 'Optimized CRM and documentation checks for efficient processing and prompt status updates.'
    },
    {
      title: 'End-to-End Support Services',
      desc: 'We assist with everything from initial consultations and document verification to local Spanish settlement support.'
    },
    {
      title: 'Complete Honesty & Transparency',
      desc: 'No hidden charges. Clear contracts, honest assessments, and realistic feedback on application strength.'
    }
  ];

  // Workflow Phases
  const workflowSteps = [
    {
      step: '01',
      title: 'Eligibility & Profile Assessment',
      desc: 'We evaluate your profile, financial logs, and credentials to identify the optimal visa or residency pathway.'
    },
    {
      step: '02',
      title: 'Document Preparation & Verification',
      desc: 'Our team prepares checklists, verifies translations, coordinates legalizations, and reviews drafts to eliminate errors.'
    },
    {
      step: '03',
      title: 'Submission & Legal Coordination',
      desc: 'We coordinate with Spanish consulates and government offices, managing appointment scheduling and tracking.'
    },
    {
      step: '04',
      title: 'Post-Visa Relocation Support',
      desc: 'After approval, we assist with NIE/TIE, local registration (Empadronamiento), bank accounts, and settlement.'
    }
  ];

  // Packages list
  const packages = [
    {
      title: 'Schengen Tourist Visa Package',
      desc: 'Short-Stay Tourist Visa Support',
      includes: [
        'Initial Consultation & Profile Assessment',
        'Personalized Documents Checklist',
        'Flight Itinerary Route Guidance',
        'Financial Documents Guidance',
        'Application Forms Review',
        'Appointment Booking Support',
        'Submission Guidance & Updates'
      ],
      price: 'Standard Service Fee Apply',
      accent: false
    },
    {
      title: 'Residency Full Processing Package',
      desc: 'Complete End-to-End Residency Applications',
      includes: [
        'Everything in Assessment Phase',
        'Personalized Spain Residency Strategy',
        'Risk & Weakness Profile Analysis',
        'Sworn Translation Support',
        'Legal Coordination in Spain & GCC',
        'Full Dossier Review & Quality Check',
        'Appeal Support (If applicable)'
      ],
      price: 'Comprehensive Pricing Available',
      accent: false
    },
    {
      title: 'Relocation Administrative Package',
      desc: 'Essential In-Spain Setup Support',
      includes: [
        'Spanish NIE/NIF Assistance & Guidance',
        'TIE Card & Fingerprint Appointment Assist',
        'Local Empadronamiento Registration',
        'Spanish Bank Account Opening Support',
        'Digital Certificate Setup & Activation',
        'Social Security & SIP Health Card Support',
        'Spanish SIM Card & Mobile Connection'
      ],
      price: 'Relocation Assistance Rates',
      accent: false
    },
    {
      title: 'Premium Full Package',
      desc: 'Our Ultimate All-Inclusive Relocation Solution',
      includes: [
        'Full Residency Processing (Assessment to Approval)',
        'Full In-Spain Relocation & Admin Package',
        'Priority Case Handling & VIP Status',
        'Dedicated Senior Case Manager',
        'Resubmission & Appeal Fees Included',
        'Regular Milestones Progress Updates',
        'Customized Settlement Roadmap'
      ],
      price: 'All-In-One Premium Rates',
      accent: true
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Aditya Tyagi',
      role: 'Digital Nomad from Dubai',
      text: 'Thanks to the AAA team, my Spain Digital Nomad Visa application was approved in record time! Their dedicated case manager reviewed every line of my bank statements and employment documents.',
      rating: 5
    },
    {
      name: 'Elena Rostova',
      role: 'NLV Visa Holder',
      text: 'I wanted to retire in Costa del Sol. AAA Business Consultancy guided us through the complex financial requirements of the Non-Lucrative Visa. The process was transparent and stress-free.',
      rating: 5
    },
    {
      name: 'Omar Al-Mansoori',
      role: 'Business Investor',
      text: 'AAA managed our company registration and business visa from Dubai. Their coordination with local lawyers in Madrid was seamless. Truly a top-grade professional service.',
      rating: 5
    }
  ];

  // FAQ Accordion Data
  const faqs = [
    {
      q: 'What is the Spain Digital Nomad Visa (DNV)?',
      a: 'The Spain Digital Nomad Visa allows remote workers, freelancers, and entrepreneurs who work for non-Spanish companies to reside in Spain. It offers a fast-track process, residency for up to 5 years, and potential tax benefits.'
    },
    {
      q: 'Do you assist with document translations and legalizations?',
      a: 'Yes! We provide complete Sworn Translation (Traducción Jurada) support as part of our full residency packages, which is mandatory for Spanish consulates. We also guide you on apostille and legalization procedures.'
    },
    {
      q: 'How long does the Non-Lucrative Visa (NLV) process take?',
      a: 'The Non-Lucrative Visa processing time typically varies between 4 to 8 weeks after document submission at the Spanish consulate in your home country. Gathering all the required documents (financial proof, medical certificates, background checks) takes another 3 to 4 weeks.'
    },
    {
      q: 'Can you help us open a Spanish bank account and get NIE?',
      a: 'Absolutely. NIE (Número de Identidad de Extranjero) assistance is included in our relocation packages. We also help you open your Spanish bank account remotely or immediately upon arrival, and assist with fingerprint appointments for the TIE card.'
    },
    {
      q: 'Why should I choose a Dubai-based consultancy?',
      a: 'Being based in Dubai allows us to provide real-time, face-to-face support for GCC-based clients. We understand the specific document requirements of consulates in the Middle East and coordinate directly with government entities locally and in Spain.'
    }
  ];

  const handleFaqToggle = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="font-plus-jakarta bg-slate-50 text-slate-900 scroll-smooth selection:bg-brand-gold selection:text-white min-h-screen">
      
      {/* 1. STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-brand-navy/95 backdrop-blur-md border-b border-brand-navy-light shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 bg-gradient-to-tr from-brand-gold via-yellow-500 to-brand-gold-dark rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              {/* Stylized A3 Logo */}
              <span className="font-outfit font-extrabold text-2xl text-brand-navy tracking-tighter">A³</span>
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-bold text-lg text-white leading-tight tracking-wide group-hover:text-brand-gold transition-colors">
                AAA BUSINESS CONSULTANCY
              </span>
              <span className="text-[10px] text-brand-gold uppercase tracking-[0.25em] font-semibold">
                Advise • Assist • Achieve
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href.replace('#', ''))}
                className="text-slate-300 hover:text-brand-gold text-sm font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center">
            <Link
              to="/login"
              className="text-xs font-semibold bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-6 py-3 rounded-lg shadow-md hover:shadow-brand-gold/20 transition-all transform hover:-translate-y-0.5"
            >
              Staff Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-navy border-t border-brand-navy-light px-4 pt-4 pb-6 space-y-3"
            >
              {navItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleScroll(e, item.href.replace('#', ''));
                  }}
                  className="block text-slate-300 hover:text-brand-gold py-2 text-base font-medium border-b border-brand-navy-light"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-brand-gold text-brand-navy py-2.5 rounded-lg text-sm font-bold shadow-sm"
                >
                  Staff Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative bg-brand-navy overflow-hidden py-12 lg:py-20">
        {/* Background Gradients & Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(197,155,39,0.08),transparent_50%)]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
              <div className="inline-flex self-center lg:self-start items-center space-x-2 bg-brand-navy-light/60 border border-brand-gold/20 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-brand-gold rounded-full animate-ping" />
                <span className="text-[11px] font-outfit text-brand-gold uppercase tracking-[0.2em] font-bold">
                  Dubai Headquartered • Global Services
                </span>
              </div>
              
              <h1 className="font-outfit font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]!">
                Spain Visa &amp; <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold-light">
                  Relocation Experts
                </span>
              </h1>
              
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Your trusted partner for a better future in Spain. We simplify your immigration journey with personalized visa strategies, secure document verification, and end-to-end relocation assistance.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                <a
                  href="#contact"
                  onClick={(e) => handleScroll(e, 'contact')}
                  className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-brand-gold/20 transition-all flex items-center justify-center space-x-2 text-sm transform hover:-translate-y-0.5 animate-pulse"
                >
                  <span>Contact Corporate Offices</span>
                  <ArrowForwardIcon className="text-sm!" />
                </a>
                <button
                  onClick={() => navigate('/public/translation')}
                  className="bg-transparent border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm transform hover:-translate-y-0.5"
                >
                  <span>🇪🇸 Spain Sworn Translation</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-10 border-t border-brand-navy-light/60 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-xl font-bold font-outfit text-white">22+ Years</div>
                  <div className="text-[11px] text-slate-400">CEO Experience</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-outfit text-white">100%</div>
                  <div className="text-[11px] text-slate-400">Transparency</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-outfit text-white">Dedicated</div>
                  <div className="text-[11px] text-slate-400">Case Managers</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual (Responsive stacked on mobile, absolute rotated cards on desktop) */}
            <div className="lg:col-span-5 relative w-full flex flex-col space-y-6 py-6 lg:pt-0 lg:pb-16 lg:block">
              
              {/* Spain Seville Plaza Background Image Card */}
              <div className="w-full lg:w-[85%] aspect-[4/3] rounded-2xl overflow-hidden border border-brand-gold/30 shadow-2xl bg-slate-900 relative z-10 lg:transform lg:-rotate-3">
                <img
                  src={spainSevillePlaza}
                  alt="Seville, Spain"
                  className="w-full h-full object-cover filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
                <div className="absolute bottom-2 left-3 bg-brand-navy/80 px-2 py-0.5 rounded text-[8px] text-brand-gold font-bold">
                  Plaza de España, Spain
                </div>
              </div>
              
              {/* Main Card (Spain Visa Card) - Overlapping the bottom right on desktop */}
              <div className="w-full lg:absolute lg:-bottom-10 lg:right-0 bg-brand-navy-light/95 border border-brand-gold/20 p-5 rounded-xl shadow-2xl z-20 backdrop-blur-sm lg:max-w-[320px] lg:transform lg:rotate-2 lg:hover:rotate-0 lg:hover:scale-102 transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-[8px] uppercase bg-brand-gold/15 text-brand-gold font-bold px-1.5 py-0.5 rounded border border-brand-gold/10">
                    LIVE TRACKER
                  </span>
                </div>

                <h3 className="font-outfit font-bold text-sm text-white mb-2 leading-tight">Relocation Roadmap</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2 bg-brand-navy/60 p-2 rounded border border-brand-gold/10">
                    <CheckCircleIcon className="text-brand-gold text-sm mt-0.5!" />
                    <div>
                      <div className="text-[10px] font-semibold text-white">Profile Approved</div>
                      <div className="text-[8px] text-slate-400">DNV Eligibility check passed</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 bg-brand-navy/60 p-2 rounded border border-brand-gold/10">
                    <CheckCircleIcon className="text-brand-gold text-sm mt-0.5!" />
                    <div>
                      <div className="text-[10px] font-semibold text-white">Documents Sworn Translated</div>
                      <div className="text-[8px] text-slate-400">Apostilled &amp; translated to Spanish</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 bg-brand-navy/30 p-2 rounded border border-slate-700/50">
                    <div className="w-3.5 h-3.5 rounded-full border border-dashed border-brand-gold/50 flex items-center justify-center text-[8px] text-brand-gold font-bold animate-pulse">
                      ●
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-white">Consulate Appointment</div>
                      <div className="text-[8px] text-slate-400">Scheduling appointment in Dubai / GCC</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-navy/80 flex items-center justify-between text-[9px] text-slate-400">
                  <span>Est. Processing: 21 Days</span>
                  <span className="text-brand-gold font-semibold">Stage 3 of 4</span>
                </div>
              </div>

              {/* Sub Card 1 (Relocation Check) - Floating top right */}
              <div className="absolute -top-6 right-4 bg-white p-3 rounded-lg shadow-xl z-30 border border-slate-100 flex items-center space-x-2 hidden lg:flex">
                <div className="p-1 bg-green-50 rounded text-green-600">
                  <CheckIcon className="text-sm!" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-900">Spanish NIE Issued</div>
                  <div className="text-[8px] text-slate-400">TIE appointment set</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. TRUSTED BY / CLIENTS */}
      <section className="bg-slate-100 border-y border-slate-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-center md:text-left">
            <span className="text-xs font-outfit uppercase tracking-widest text-slate-400 font-bold mb-2 md:mb-0">
              Trusted by Clients Across the Globe
            </span>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-12 opacity-70">
              <span className="font-outfit font-extrabold text-[10px] sm:text-xs text-slate-600 uppercase tracking-widest text-center">DUBAI HEADQUARTERS</span>
              <span className="font-outfit font-extrabold text-[10px] sm:text-xs text-slate-600 uppercase tracking-widest text-center">GCC COVERAGE</span>
              <span className="font-outfit font-extrabold text-[10px] sm:text-xs text-slate-600 uppercase tracking-widest text-center">ASIA &amp; MIDDLE EAST</span>
              <span className="font-outfit font-extrabold text-[10px] sm:text-xs text-slate-600 uppercase tracking-widest text-center">SPAIN PARTNERS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT COMPANY */}
      <section className="py-12 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
                About Our Firm
              </div>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-brand-navy">
                Advise. Assist. Achieve. <br className="hidden md:inline" />
                Your Journey. Our Expertise.
              </h2>
              <div className="h-1 w-12 bg-brand-gold rounded" />
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                AAA Business Consultancy is a professional consultancy firm specializing in Spain visa, residency, study, and relocation solutions. Based in Dubai and serving clients worldwide, we provide personalized guidance and professional support for individuals, families, entrepreneurs, remote workers, and investors planning their future in Spain.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                With a modern approach powered by professional consultation, digital systems, and strategic partnerships, our mission is to make the Spain visa, residency, and relocation journey simple, transparent, and stress-free. We don’t just process applications — we help our clients build new opportunities, new lifestyles, and a better future in Spain.
              </p>

              {/* Values grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
                {['Integrity & Honesty', 'Professionalism', 'Transparency', 'Client Focus', 'Excellence', 'Commitment'].map((val, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-slate-700">
                    <CheckCircleIcon className="text-brand-gold text-sm!" />
                    <span className="text-xs font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right graphics - Spain Relocation Lifestyle Image + Foundations */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="relative rounded-2xl overflow-hidden border-2 border-brand-gold/30 shadow-xl group aspect-[4/3] bg-slate-900">
                <img
                  src={spainRelocationLifestyle}
                  alt="Relocating to Spain"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                  <span className="text-[10px] font-outfit text-brand-gold uppercase tracking-widest font-bold">Relocation Lifestyle</span>
                  <p className="text-xs text-white mt-1 font-light leading-snug">
                    "Helping clients build new opportunities, new lifestyles, and a better future in Spain."
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 shadow-sm min-h-[135px] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block">Our Mission</span>
                    <p className="text-[10px] text-slate-600 mt-2 leading-relaxed font-light">
                      To make the Spain visa, residency, and relocation journey simple, transparent, and stress-free through client-centric legal compliance and proactive document coordination.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 shadow-sm min-h-[135px] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block">Our Vision</span>
                    <p className="text-[10px] text-slate-600 mt-2 leading-relaxed font-light">
                      To be the most preferred, trusted corporate and client consultancy for Spain immigration across the GCC, recognized for absolute integrity and high approval rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SERVICES */}
      <section className="py-12 bg-slate-50 border-t border-slate-200" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-4">
            <span className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
              Specialized Pathways
            </span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-navy">
              Spain Visa &amp; Residency Services
            </h2>
            <p className="text-slate-500 text-sm font-light max-w-xl mx-auto leading-relaxed">
              Whether you are relocating for work, business, study, retirement, family, or investment, our team is committed to providing reliable support at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, boxShadow: '0px 20px 25px -5px rgba(15, 23, 42, 0.05), 0px 10px 10px -5px rgba(15, 23, 42, 0.05)' }}
                onClick={() => item.link ? navigate(item.link) : null}
                className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative flex flex-col h-full group transition-all ${item.link ? 'cursor-pointer' : ''}`}
              >
                {item.tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/25 px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                )}
                <div className="w-14 h-14 bg-brand-navy/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-gold/15 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-outfit font-bold text-base text-brand-navy mb-3 group-hover:text-brand-gold transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed font-light flex-grow">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Translation mini-CTA */}
          {/* Informational Subtext */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-light">
              * Legalizations, sworn translations, and consular appointments are coordinated directly through our Madrid legal hub.
            </p>
          </div>

        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="py-12 bg-white" id="why-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
                Why Clients Trust AAA
              </span>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-navy leading-tight!">
                Professional Spain Relocation Solutions
              </h2>
              <div className="h-1 w-12 bg-brand-gold rounded" />
              <p className="text-slate-600 text-sm font-light leading-relaxed">
                AAA Business Consultancy was built on a strong foundation of trust, honesty, and long-term client relationships. We do not just submit application packets; we verify, improve, translate, and secure every document to maximize your approval rates.
              </p>
              
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center space-x-3">
                <ShieldIcon className="text-brand-gold text-2xl!" />
                <div>
                  <div className="text-xs font-bold text-brand-navy">100% Confidential &amp; Secure</div>
                  <div className="text-[11px] text-slate-500">Your personal details are protected at every stage.</div>
                </div>
              </div>
            </div>

            {/* Right Points Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {whyUsPoints.map((item, idx) => (
                <div key={idx} className="p-5 border border-slate-100 hover:border-brand-gold/30 rounded-xl transition-all space-y-2">
                  <h3 className="font-outfit font-bold text-sm text-brand-navy flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 7. PROCESS / WORKFLOW */}
      <section className="py-12 bg-slate-50 border-y border-slate-200" id="process">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-4">
            <span className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
              The Path to Spain
            </span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-navy">
              Structured Journey &amp; Workflow
            </h2>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              We apply an step-by-step rigorous mechanism to verify eligibility, prepare credentials, submit files, and assist with settlement in Spain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting lines for large screens */}
            <div className="hidden lg:block absolute top-1/3 left-0 right-0 h-0.5 bg-slate-200 -z-10" />

            {workflowSteps.map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-brand-navy text-brand-gold rounded-full flex items-center justify-center font-outfit font-extrabold text-sm mb-4 border border-brand-navy-light">
                    {step.step}
                  </div>
                  <h3 className="font-outfit font-bold text-sm text-brand-navy mb-2 group-hover:text-brand-gold transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. PACKAGES */}
      <section className="py-12 bg-white" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-4">
            <span className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
              Select Your Plan
            </span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-navy">
              Residency &amp; Relocation Packages
            </h2>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              Select from our standard consular visa package, full residency processing, relocation administrative setup, or all-inclusive VIP packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 flex flex-col justify-between h-full border transition-all ${
                  pkg.accent
                    ? 'bg-brand-navy text-white border-brand-gold shadow-xl scale-105'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-brand-gold/30 shadow-sm'
                }`}
              >
                <div className="space-y-6">
                  <div>
                    {pkg.accent && (
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-brand-gold text-brand-navy px-2 py-0.5 rounded mb-2 inline-block">
                        Best Value (VIP)
                      </span>
                    )}
                    <h3 className="font-outfit font-extrabold text-base leading-tight">
                      {pkg.title}
                    </h3>
                    <p className={`text-[10px] mt-1 ${pkg.accent ? 'text-slate-300' : 'text-slate-400'}`}>
                      {pkg.desc}
                    </p>
                  </div>

                  <div className={`h-px ${pkg.accent ? 'bg-brand-navy-light' : 'bg-slate-100'}`} />

                  <ul className="space-y-3 flex-grow">
                    {pkg.includes.map((inc, iIdx) => (
                      <li key={iIdx} className="flex items-start space-x-2 text-[10px]">
                        <CheckIcon className={`text-xs mt-0.5 ${pkg.accent ? 'text-brand-gold' : 'text-green-600'} flex-shrink-0`} />
                        <span className={pkg.accent ? 'text-slate-200' : 'text-slate-600'}>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100/10">
                  <div className={`text-xs font-extrabold ${pkg.accent ? 'text-brand-gold' : 'text-brand-navy'} text-center uppercase tracking-wider`}>
                    {pkg.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. CEO MESSAGE */}
      <section className="py-12 bg-brand-navy text-white relative overflow-hidden" id="ceo">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(197,155,39,0.05),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* CEO Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm">
                <div className="absolute -inset-2 bg-gradient-to-tr from-brand-gold to-brand-gold-dark rounded-2xl opacity-40 blur-lg group-hover:opacity-60 transition-opacity" />
                <div className="relative bg-brand-navy-light p-3 rounded-2xl border border-brand-gold/20 shadow-2xl">
                  {/* Real Photo of CEO Wael Madi */}
                  <div className="w-72 h-80 rounded-xl overflow-hidden flex flex-col justify-end p-4 relative bg-slate-900 border border-brand-gold/10">
                    <img
                      src={waelMadiPhoto}
                      alt="Wael Madi"
                      className="w-full h-full object-cover absolute inset-0 filter brightness-95 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent z-10 pointer-events-none" />
                    <div className="relative z-20 text-center">
                      <h4 className="font-outfit font-bold text-sm text-white">Wael Madi</h4>
                      <p className="text-[10px] text-brand-gold uppercase tracking-wider">Founder &amp; CEO</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CEO Text */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
                Founder's Message
              </span>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl">
                Built on Trust &amp; Professional Integrity
              </h2>
              <div className="h-1 w-12 bg-brand-gold rounded" />
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light italic">
                "With more than 22 years of business experience in Dubai and international markets, AAA Business Consultancy was built on a strong foundation of trust, honesty, professionalism, and long-term relationships."
              </p>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                "At AAA, we believe that our success comes from the success of our clients. That is why we are committed to providing reliable guidance, transparent support, and personalized solutions for every client we serve. Our carefully selected team combines dedication and deep market understanding to support your journey to Spain."
              </p>

              <div className="pt-4 flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="font-outfit font-bold text-sm text-brand-gold">Wael Madi</span>
                  <span className="text-[10px] text-slate-400">Founder &amp; CEO, AAA Business Consultancy</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. STATISTICS */}
      <section className="py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1">
              <div className="font-outfit font-black text-4xl sm:text-5xl text-brand-navy">22+</div>
              <div className="text-xs text-slate-500 font-medium">Years CEO Business Experience</div>
            </div>

            <div className="space-y-1">
              <div className="font-outfit font-black text-4xl sm:text-5xl text-brand-navy">100%</div>
              <div className="text-xs text-slate-500 font-medium">Immigration Transparency</div>
            </div>

            <div className="space-y-1">
              <div className="font-outfit font-black text-4xl sm:text-5xl text-brand-navy">10+</div>
              <div className="text-xs text-slate-500 font-medium">In-Spain Relocation Procedures</div>
            </div>

            <div className="space-y-1">
              <div className="font-outfit font-black text-4xl sm:text-5xl text-brand-navy">Global</div>
              <div className="text-xs text-slate-500 font-medium">Clients Serviced from Dubai</div>
            </div>

          </div>
        </div>
      </section>

      {/* 11. TESTIMONIALS */}
      <section className="py-12 bg-white" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-4">
            <span className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
              Success Stories
            </span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-navy">
              What Our Clients Say
            </h2>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              Discover stories of professionals, retirees, and families who relocated smoothly with our Dubai consultancy team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm relative flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <StarIcon key={i} className="text-brand-gold text-sm!" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-light italic">
                    "{test.text}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-gold flex items-center justify-center font-bold text-xs font-outfit">
                    {test.name[0]}
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-xs text-brand-navy">{test.name}</h4>
                    <p className="text-[10px] text-slate-400">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 12. FAQ SECTION */}
      <section className="py-12 bg-slate-50 border-t border-slate-200" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8 space-y-4">
            <span className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
              Common Queries
            </span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-navy">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              Everything you need to know about Spain visas, residency applications, document translations, and local registration.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => handleFaqToggle(idx)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
                  >
                    <span className="font-outfit font-bold text-sm text-brand-navy">
                      {faq.q}
                    </span>
                    <span className="text-brand-gold">
                      {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-5 text-xs text-slate-500 leading-relaxed font-light border-t border-slate-100 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 13. GLOBAL OFFICES & CONTACT */}
      <section className="py-12 bg-brand-navy text-white relative overflow-hidden" id="contact">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(197,155,39,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Corporate Strategy & Inquiries */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-outfit uppercase tracking-widest text-brand-gold font-bold">
                  Corporate Directory
                </span>
                <h2 className="font-outfit font-black text-3xl sm:text-4xl">
                  Connect With Our Global Team
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                  AAA Business Consultancy provides seamless immigration coordination between the GCC region and Spain. Contact our corporate hubs to align on client visa processing, documentation support, and relocation coordination.
                </p>
              </div>

              {/* Direct Contact Channels - Prominent and separate */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase text-brand-gold tracking-widest font-bold">
                  Direct Communication
                </div>
                
                <a 
                  href="tel:+971509554142" 
                  className="flex items-center space-x-4 bg-brand-navy-light/80 border-2 border-brand-gold/30 p-4 rounded-xl hover:border-brand-gold hover:bg-slate-800 transition-all shadow-lg group"
                >
                  <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center flex-shrink-0 border border-green-500/20 group-hover:scale-110 transition-transform">
                    <LocalPhoneIcon className="text-xl!" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Call &amp; WhatsApp Hotline</div>
                    <div className="text-sm font-black text-white mt-0.5 group-hover:text-brand-gold transition-colors">+971 50 955 4142</div>
                  </div>
                </a>

                <a 
                  href="mailto:info@aaabusinessconsultancy.com" 
                  className="flex items-center space-x-4 bg-brand-navy-light/80 border-2 border-brand-gold/30 p-4 rounded-xl hover:border-brand-gold hover:bg-slate-800 transition-all shadow-lg group"
                >
                  <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center flex-shrink-0 border border-brand-gold/20 group-hover:scale-110 transition-transform">
                    <EmailIcon className="text-xl!" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Official Corporate Email</div>
                    <div className="text-sm font-black text-white mt-0.5 group-hover:text-brand-gold transition-colors">info@aaabusinessconsultancy.com</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Global Office Cards */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Dubai Card */}
              <div className="bg-brand-navy-light/95 border border-slate-700/50 p-8 rounded-2xl shadow-xl min-h-[210px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase bg-brand-gold/15 text-brand-gold font-bold px-2 py-0.5 rounded border border-brand-gold/10">
                        DUBAI HEADQUARTERS
                      </span>
                      <h3 className="font-outfit font-bold text-lg text-white mt-2">AAA Business Consultancy L.L.C</h3>
                    </div>
                    <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                      <LocationOnIcon className="text-base!" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed font-light mt-4">
                    Business Village, Block B, 4th Floor, Office F09, Port Saeed, Deira, Dubai, UAE
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-850 flex justify-between text-[10px] text-slate-400 font-light">
                  <span>Trade License: 4429675.01</span>
                  <span>TRN: 105469065400001</span>
                </div>
              </div>

              {/* Spain Card */}
              <div className="bg-brand-navy-light/95 border border-slate-700/50 p-8 rounded-2xl shadow-xl min-h-[210px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded">
                        SPAIN REPRESENTATIVE OFFICE
                      </span>
                      <h3 className="font-outfit font-bold text-lg text-white mt-2">Legal Coordination Hub</h3>
                    </div>
                    <div className="w-8 h-8 bg-slate-700/20 rounded-full flex items-center justify-center text-slate-400">
                      <LocationOnIcon className="text-base!" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed font-light mt-4">
                    Calle de Serrano, 41, Recoletos, 28001 Madrid, Spain
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-light">
                  <span className="text-slate-300 font-semibold">Specialization:</span> Sworn Translations, NIE/TIE Fingerprints &amp; Local Settlement
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="bg-[#030e20] text-slate-400 border-t border-slate-800 pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-800">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center">
                  <span className="font-outfit font-extrabold text-lg text-brand-navy">A³</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-outfit font-bold text-sm text-white leading-tight">
                    AAA BUSINESS CONSULTANCY
                  </span>
                  <span className="text-[9px] text-brand-gold uppercase tracking-[0.2em]">
                    Advise • Assist • Achieve
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-light leading-relaxed">
                Spain visa, residency, study, and administrative relocation assistance. Dubai-headquartered international immigration consultancy.
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Trade License No: 4429675.01</div>
                <div>TRN: 105469065400001</div>
                <div>AAA Business Consultancy FZC LLC</div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h4 className="font-outfit font-bold text-xs text-white uppercase tracking-wider">Quick Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#services" onClick={(e) => handleScroll(e, 'services')} className="hover:text-brand-gold transition-colors">Immigration Services</a></li>
                <li><a href="#why-us" onClick={(e) => handleScroll(e, 'why-us')} className="hover:text-brand-gold transition-colors">Why Choose Us</a></li>
                <li><a href="#packages" onClick={(e) => handleScroll(e, 'packages')} className="hover:text-brand-gold transition-colors">Pricing Packages</a></li>
                <li><a href="#ceo" onClick={(e) => handleScroll(e, 'ceo')} className="hover:text-brand-gold transition-colors">Our Founder</a></li>
                <li><a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="hover:text-brand-gold transition-colors">Client Reviews</a></li>
              </ul>
            </div>

            {/* Column 3: Portals & Links */}
            <div className="space-y-4">
              <h4 className="font-outfit font-bold text-xs text-white uppercase tracking-wider">System Access</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-brand-gold transition-colors">Employee Logins</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact & Socials */}
            <div className="space-y-4">
              <h4 className="font-outfit font-bold text-xs text-white uppercase tracking-wider">Social Channels</h4>
              <p className="text-[11px] font-light leading-relaxed">Follow our social channels for latest updates on Spain immigration laws.</p>
              
              {/* Social List */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-300">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold">Facebook</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold">Instagram</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold">LinkedIn</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold">YouTube</a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold">TikTok</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold">Twitter / X</a>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 space-y-4 sm:space-y-0 text-center">
            <div>
              &copy; {new Date().getFullYear()} AAA Business Consultancy FZC LLC. All Rights Reserved.
            </div>
            <div className="space-x-4">
              <span>Terms &amp; Conditions Apply</span>
              <span>•</span>
              <span>Refund Policy</span>
              <span>•</span>
              <span>Payment Policy</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
