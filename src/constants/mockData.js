export const SERVICES = [
  { id: 'dnv', name: 'Digital Nomad Visa (DNV)', category: 'Residency', basePrice: 2000 },
  { id: 'nlv', name: 'Non-Lucrative Visa (NLV)', category: 'Residency', basePrice: 1800 },
  { id: 'self_employed', name: 'Self-Employed / Business Residency', category: 'Residency', basePrice: 2500 },
  { id: 'study', name: 'Study Visa', category: 'Study', basePrice: 1200 },
  { id: 'family', name: 'Partner & Family Reunification', category: 'Residency', basePrice: 1500 },
  { id: 'tourism', name: 'Tourism Visa & Schengen Guidance', category: 'Schengen', basePrice: 400 },
  { id: 'property', name: 'Property Investment Guidance', category: 'Investment', basePrice: 3000 },
  { id: 'sworn_translation', name: 'Sworn Translation', category: 'Translation', basePrice: 150 },
];

export const RELOCATION_SERVICES = [
  { id: 'nie', name: 'NIE Assistance & Guidance' },
  { id: 'tie', name: 'TIE & Fingerprint Appointment' },
  { id: 'empadronamiento', name: 'Empadronamiento Assistance' },
  { id: 'digital_cert', name: 'Digital Certificate Assistance' },
  { id: 'clave', name: 'Cl@ve Registration Assistance' },
  { id: 'nif_tax', name: 'NIF & Tax Registration Guidance' },
  { id: 'social_security', name: 'Social Security Registration' },
  { id: 'sip_health', name: 'SIP Health Card Assistance' },
  { id: 'bank_account', name: 'Spanish Bank Account Guidance' },
  { id: 'sim_card', name: 'SIM Card Assistance' },
];

export const PACKAGES = [
  {
    id: 'full_process',
    name: 'Full Process Package',
    description: 'Complete, Professional & End-to-End Support for Spain Residency Applications from eligibility to submission.',
    includes: [
      'Eligibility Verification & Initial Assessment',
      'Professional Case Evaluation & Strategy',
      'Financial Profile Assessment',
      'Risk & Weakness Analysis',
      'Sworn Translation Support',
      'Submission Coordination',
      'Follow-Up Coordination',
      'Support Until Final Decision',
    ]
  },
  {
    id: 'premium',
    name: 'Premium Package',
    description: 'Includes EVERYTHING in Full Process Package + Complete Relocation & Administrative Assistance.',
    includes: [
      'All Full Process features',
      'NIE Assistance & Guidance',
      'TIE & Fingerprint Appointment assistance',
      'Empadronamiento local registration support',
      'Digital Certificate & Cl@ve Registration',
      'Spanish Bank Account opening assistance',
      'Private/Public Health Card and Social Security help',
      'Dedicated case manager and priority handling',
    ]
  }
];

export const AGENTS = [
  {
    id: 'c1',
    name: 'Sofia Rodriguez',
    email: 'sofia.r@aaabusinessconsultancy.com',
    password: 'password123',
    phone: '+971 50 123 4567',
    role: 'consultant',
    languages: ['Spanish', 'English'],
    nationalities: ['Spanish', 'Mexican'],
    casesCount: 18,
    conversionRate: 68,
    revenueGenerated: 34500,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    bio: 'Senior Spain immigration expert with 8 years of residency law expertise. Specializes in Digital Nomad and Business Visas.',
    joiningDate: '2024-03-12',
  },
  {
    id: 'c2',
    name: 'Lucas Gomez',
    email: 'lucas.g@aaabusinessconsultancy.com',
    password: 'password123',
    phone: '+971 50 987 6543',
    role: 'operations',
    languages: ['Spanish', 'English', 'Arabic'],
    nationalities: ['Spanish', 'Lebanese'],
    casesCount: 14,
    conversionRate: 55,
    revenueGenerated: 22000,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    bio: 'Fluent in Arabic and Spanish, specializing in GCC relocatees, Golden Visas, and Non-Lucrative applications.',
    joiningDate: '2024-08-20',
  },
  {
    id: 'c3',
    name: 'Amir Hassan',
    email: 'amir.h@aaabusinessconsultancy.com',
    password: 'password123',
    phone: '+971 50 955 4142',
    role: 'admin',
    languages: ['Arabic', 'English'],
    nationalities: ['Emirati', 'Egyptian'],
    casesCount: 8,
    conversionRate: 85,
    revenueGenerated: 45000,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'General Manager at AAA Business Consultancy. Oversees visa processing teams, client relations, and operational management.',
    joiningDate: '2022-01-10',
  },
  {
    id: 'c4',
    name: 'Elena Rostova',
    email: 'elena.r@aaabusinessconsultancy.com',
    password: 'password123',
    phone: '+971 50 555 7788',
    role: 'marketing',
    languages: ['Russian', 'English', 'Spanish'],
    nationalities: ['Russian'],
    casesCount: 12,
    conversionRate: 60,
    revenueGenerated: 18500,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    bio: 'Specialist for Eastern European relocations, student visa admissions, and family reunions in Spain.',
  },
  {
    id: 'c5',
    name: 'David Vance',
    email: 'david.v@aaabusinessconsultancy.com',
    password: 'password123',
    phone: '+971 50 333 4455',
    role: 'finance',
    languages: ['English', 'Spanish'],
    nationalities: ['British', 'American'],
    casesCount: 15,
    conversionRate: 72,
    revenueGenerated: 29800,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    bio: 'Focuses on UK, US, and Canadian clients seeking Spain Digital Nomad Visas (DNV) post-Brexit.',
  }
];

export const MOCK_LEADS = [
  {
    id: 'LD1001',
    firstName: 'Amelia',
    lastName: 'Watson',
    email: 'amelia.w@example.com',
    phone: '+44 7911 123456',
    nationality: 'British',
    preferredLanguage: 'English',
    serviceId: 'dnv',
    applicantsCount: 1, // Main Applicant Only
    status: 'New Lead',
    assignedConsultantId: 'c5',
    source: 'Google Ads',
    createdDate: '2026-06-17T09:30:00Z',
    qualificationData: {
      workStatus: 'Remote Employee',
      monthlyIncome: '€3,800',
      companyLocation: 'UK'
    },
    notes: 'Inquired about DNV. Verified income criteria is met.',
    timeline: [
      { date: '2026-06-17T09:30:00Z', event: 'Lead Created via Google Ads form', user: 'System' },
      { date: '2026-06-17T09:31:00Z', event: 'Automated WhatsApp response sent', user: 'System' }
    ]
  },
  {
    id: 'LD1002',
    firstName: 'Tariq',
    lastName: 'Mahmood',
    email: 'tariq.m@example.com',
    phone: '+971 52 444 8899',
    nationality: 'Pakistani',
    preferredLanguage: 'Arabic',
    serviceId: 'nlv',
    applicantsCount: 3, // Main + 2 dependents
    status: 'Under Consultation',
    assignedConsultantId: 'c2',
    source: 'Facebook Ads',
    createdDate: '2026-06-16T11:20:00Z',
    qualificationData: {
      passiveIncome: '€4,200',
      savings: '€45,000',
      residency: 'Dubai UAE'
    },
    notes: 'Consultation scheduled for today at 3 PM to review bank statements.',
    timeline: [
      { date: '2026-06-16T11:20:00Z', event: 'Lead Created', user: 'System' },
      { date: '2026-06-16T14:30:00Z', event: 'Assigned to Consultant Lucas Gomez', user: 'System' },
      { date: '2026-06-17T10:00:00Z', event: 'Status updated to Under Consultation', user: 'Lucas Gomez' }
    ]
  },
  {
    id: 'LD1003',
    firstName: 'Chloe',
    lastName: 'Dupont',
    email: 'chloe.dupont@example.com',
    phone: '+33 6 1234 5678',
    nationality: 'French',
    preferredLanguage: 'English',
    serviceId: 'study',
    applicantsCount: 1,
    status: 'Processing',
    assignedConsultantId: 'c4',
    source: 'Website Traffic',
    createdDate: '2026-06-15T15:40:00Z',
    qualificationData: {
      schoolName: 'Complutense University of Madrid',
      programType: 'Masters in Finance',
      duration: '1 Year'
    },
    notes: 'Applying for Study Visa. Verification of university admission letter done.',
    timeline: [
      { date: '2026-06-15T15:40:00Z', event: 'Lead Created via website form', user: 'System' },
      { date: '2026-06-16T09:00:00Z', event: 'Consultation completed successfully', user: 'Elena Rostova' }
    ]
  },
  {
    id: 'LD1004',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'm.vance@example.com',
    phone: '+1 415 555 2671',
    nationality: 'American',
    preferredLanguage: 'English',
    serviceId: 'property',
    applicantsCount: 2,
    status: 'Waiting for Payment',
    assignedConsultantId: 'c5',
    source: 'Instagram Ads',
    createdDate: '2026-06-14T08:15:00Z',
    qualificationData: {
      budget: '€550,000',
      propertyLocation: 'Malaga'
    },
    notes: 'Wants Golden Visa. Selected Premium Package for main applicant + spouse. Waiting for deposit.',
    timeline: [
      { date: '2026-06-14T08:15:00Z', event: 'Lead Created', user: 'System' },
      { date: '2026-06-15T11:00:00Z', event: 'Consultation Completed. Selected Premium Package', user: 'David Vance' },
      { date: '2026-06-15T11:15:00Z', event: 'Invoice INV-2026-004 generated', user: 'Finance Bot' }
    ]
  },
  {
    id: 'LD1005',
    firstName: 'Ahmed',
    lastName: 'Al-Mansoori',
    email: 'ahmed.mansoori@example.ae',
    phone: '+971 50 777 1122',
    nationality: 'Emirati',
    preferredLanguage: 'Arabic',
    serviceId: 'self_employed',
    applicantsCount: 4,
    status: 'New Lead',
    assignedConsultantId: 'c3',
    source: 'WhatsApp Click Ads',
    createdDate: '2026-06-18T10:00:00Z',
    qualificationData: {
      businessSector: 'E-commerce logistics setup',
      investmentCapital: '€120,000'
    },
    notes: 'Very hot lead. High budget, wants business setup in Barcelona.',
    timeline: [
      { date: '2026-06-18T10:00:00Z', event: 'Lead created from WhatsApp Ads click', user: 'System' }
    ]
  },
  // Adding more mock leads to reach 20
  { id: 'LD1006', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '+1 555 123 4567', nationality: 'American', preferredLanguage: 'English', serviceId: 'dnv', applicantsCount: 1, status: 'Cold Lead', assignedConsultantId: 'c5', source: 'Google Ads', createdDate: '2026-06-01T12:00:00Z', notes: 'No response to follow up emails.', timeline: [] },
  { id: 'LD1007', firstName: 'Maria', lastName: 'Ivanova', email: 'maria.i@example.ru', phone: '+7 901 222 3344', nationality: 'Russian', preferredLanguage: 'English', serviceId: 'nlv', applicantsCount: 2, status: 'Lost Lead', assignedConsultantId: 'c4', source: 'Facebook Ads', createdDate: '2026-05-20T10:30:00Z', notes: 'Denied. Insufficient passive income statement.', timeline: [] },
  { id: 'LD1008', firstName: 'Yuki', lastName: 'Tanaka', email: 'y.tanaka@example.jp', phone: '+81 90 9999 8888', nationality: 'Japanese', preferredLanguage: 'English', serviceId: 'study', applicantsCount: 1, status: 'New Lead', assignedConsultantId: 'c4', source: 'Website Traffic', createdDate: '2026-06-18T06:45:00Z', notes: 'Interested in Spanish language school visa.', timeline: [] },
  { id: 'LD1009', firstName: 'Fatima', lastName: 'Hassan', email: 'fatima.h@example.com', phone: '+971 52 333 4422', nationality: 'Egyptian', preferredLanguage: 'Arabic', serviceId: 'family', applicantsCount: 3, status: 'Under Consultation', assignedConsultantId: 'c2', source: 'WhatsApp Click Ads', createdDate: '2026-06-16T16:20:00Z', notes: 'Spouse of a Spanish resident. Wants family reunion assistance.', timeline: [] },
  { id: 'LD1010', firstName: 'William', lastName: 'Smith', email: 'w.smith@example.ca', phone: '+1 604 111 2222', nationality: 'Canadian', preferredLanguage: 'English', serviceId: 'dnv', applicantsCount: 1, status: 'Documents Pending', assignedConsultantId: 'c5', source: 'Organic Social Media Content', createdDate: '2026-06-10T14:00:00Z', notes: 'Needs FBI background check with Apostille.', timeline: [] },
  { id: 'LD1011', firstName: 'Rajesh', lastName: 'Kumar', email: 'r.kumar@example.in', phone: '+91 98765 43210', nationality: 'Indian', preferredLanguage: 'English', serviceId: 'self_employed', applicantsCount: 2, status: 'New Lead', assignedConsultantId: 'c2', source: 'Google Ads', createdDate: '2026-06-18T08:15:00Z', notes: 'Consultant entrepreneur establishing SaaS office in Valencia.', timeline: [] },
  { id: 'LD1012', firstName: 'Carlos', lastName: 'Silva', email: 'carlos.silva@example.br', phone: '+55 11 98888 7777', nationality: 'Brazilian', preferredLanguage: 'English', serviceId: 'property', applicantsCount: 1, status: 'Under Consultation', assignedConsultantId: 'c1', source: 'Instagram DM', createdDate: '2026-06-17T11:45:00Z', notes: 'Buying flat in Madrid for Golden Visa.', timeline: [] },
  { id: 'LD1013', firstName: 'Zara', lastName: 'Ali', email: 'zara.ali@example.ae', phone: '+971 56 123 7890', nationality: 'Jordanian', preferredLanguage: 'Arabic', serviceId: 'tourism', applicantsCount: 2, status: 'Waiting for Payment', assignedConsultantId: 'c2', source: 'Website Forms', createdDate: '2026-06-15T09:12:00Z', notes: 'Schengen tourism visa guidance. Straightforward profile, no packages needed.', timeline: [] },
  { id: 'LD1014', firstName: 'Oliver', lastName: 'Brown', email: 'oliver.brown@example.co.uk', phone: '+44 7711 445566', nationality: 'British', preferredLanguage: 'English', serviceId: 'dnv', applicantsCount: 3, status: 'New Lead', assignedConsultantId: 'c5', source: 'Google Ads', createdDate: '2026-06-18T11:00:00Z', notes: 'Applying for DNV with spouse and child.', timeline: [] },
  { id: 'LD1015', firstName: 'Sophia', lastName: 'Miller', email: 's.miller@example.com', phone: '+1 202 555 0192', nationality: 'American', preferredLanguage: 'English', serviceId: 'nlv', applicantsCount: 1, status: 'Under Process', assignedConsultantId: 'c1', source: 'TikTok Ads', createdDate: '2026-06-05T10:00:00Z', notes: 'NLV filed at consulate. Waiting for response.', timeline: [] },
  { id: 'LD1016', firstName: 'Hassan', lastName: 'El-Khoury', email: 'hassan.k@example.lb', phone: '+961 3 123 456', nationality: 'Lebanese', preferredLanguage: 'Arabic', serviceId: 'property', applicantsCount: 4, status: 'New Lead', assignedConsultantId: 'c3', source: 'Telegram', createdDate: '2026-06-18T05:30:00Z', notes: 'Family looking to relocate, buying a villa in Marbella.', timeline: [] },
  { id: 'LD1017', firstName: 'Li', lastName: 'Wei', email: 'li.wei@example.cn', phone: '+86 139 0101 2345', nationality: 'Chinese', preferredLanguage: 'English', serviceId: 'study', applicantsCount: 1, status: 'Documents Pending', assignedConsultantId: 'c4', source: 'WeChat', createdDate: '2026-06-12T13:45:00Z', notes: 'Awaiting Spanish language center payment receipt.', timeline: [] },
  { id: 'LD1018', firstName: 'Emma', lastName: 'Nielsen', email: 'emma.n@example.dk', phone: '+45 30 40 50 60', nationality: 'Danish', preferredLanguage: 'English', serviceId: 'dnv', applicantsCount: 1, status: 'Under Consultation', assignedConsultantId: 'c1', source: 'Website Traffic', createdDate: '2026-06-17T15:20:00Z', notes: 'Software contractor, fully remote. Pre-qualified.', timeline: [] },
  { id: 'LD1019', firstName: 'Zuri', lastName: 'Adebayor', email: 'zuri.ade@example.ng', phone: '+234 803 111 2222', nationality: 'Nigerian', preferredLanguage: 'English', serviceId: 'study', applicantsCount: 1, status: 'Cold Lead', assignedConsultantId: 'c4', source: 'Facebook Comments', createdDate: '2026-05-25T08:00:00Z', notes: 'Non-responsive to email scheduling.', timeline: [] },
  { id: 'LD1020', firstName: 'Nour', lastName: 'Dagher', email: 'nour.dagher@example.com', phone: '+971 54 443 2190', nationality: 'Syrian', preferredLanguage: 'Arabic', serviceId: 'family', applicantsCount: 2, status: 'Under Process', assignedConsultantId: 'c2', source: 'WhatsApp', createdDate: '2026-06-08T09:30:00Z', notes: 'Spouse residency renewal and child entry visa.', timeline: [] },
  { id: 'LD1021', firstName: 'Liam', lastName: "O'Connor", email: 'liam.oc@example.ie', phone: '+353 1 496 0123', nationality: 'Irish', preferredLanguage: 'English', serviceId: 'study', applicantsCount: 1, status: 'New Lead', assignedConsultantId: 'c4', source: 'WeChat', createdDate: '2026-06-19T10:00:00Z', notes: 'Undergraduate student applying for Spain Study Visa.', timeline: [] },
  { id: 'LD1022', firstName: 'Noah', lastName: 'Weber', email: 'noah.w@example.de', phone: '+49 89 2019 8273', nationality: 'German', preferredLanguage: 'English', serviceId: 'dnv', applicantsCount: 2, status: 'Under Consultation', assignedConsultantId: 'c5', source: 'Google Ads', createdDate: '2026-06-19T11:00:00Z', notes: 'Remote consultant, DNV eligibility review.', timeline: [] },
  { id: 'LD1023', firstName: 'Isabella', lastName: 'Rossi', email: 'isabella.rossi@example.it', phone: '+39 02 8812 3456', nationality: 'Italian', preferredLanguage: 'English', serviceId: 'family', applicantsCount: 3, status: 'Processing', assignedConsultantId: 'c1', source: 'Facebook Ads', createdDate: '2026-06-19T12:00:00Z', notes: 'Husband is Spanish citizen. Family reunion visa.', timeline: [] },
  { id: 'LD1024', firstName: 'Lucas', lastName: 'Dubois', email: 'lucas.d@example.fr', phone: '+33 1 4720 9811', nationality: 'French', preferredLanguage: 'English', serviceId: 'self_employed', applicantsCount: 1, status: 'New Lead', assignedConsultantId: 'c3', source: 'Website Forms', createdDate: '2026-06-19T13:00:00Z', notes: 'Autonomo registration in Barcelona.', timeline: [] },
  { id: 'LD1025', firstName: 'Emma', lastName: 'Novak', email: 'emma.n@example.pl', phone: '+48 22 555 0122', nationality: 'Polish', preferredLanguage: 'English', serviceId: 'nlv', applicantsCount: 1, status: 'Cold Lead', assignedConsultantId: 'c1', source: 'Instagram Ads', createdDate: '2026-06-19T14:00:00Z', notes: 'Passive income review.', timeline: [] },
  { id: 'LD1026', firstName: 'Sophia', lastName: 'Lindqvist', email: 'sophia.l@example.se', phone: '+46 8 123 4567', nationality: 'Swedish', preferredLanguage: 'English', serviceId: 'dnv', applicantsCount: 2, status: 'New Lead', assignedConsultantId: 'c5', source: 'WhatsApp', createdDate: '2026-06-19T15:00:00Z', notes: 'Tech company employee DNV.', timeline: [] },
  { id: 'LD1027', firstName: 'Alexander', lastName: 'Pavlov', email: 'alex.p@example.ru', phone: '+7 495 111 2233', nationality: 'Russian', preferredLanguage: 'English', serviceId: 'property', applicantsCount: 4, status: 'Under Consultation', assignedConsultantId: 'c4', source: 'Telegram', createdDate: '2026-06-19T16:00:00Z', notes: 'Golden Visa investment in Alicante.', timeline: [] },
  { id: 'LD1028', firstName: 'Daniel', lastName: 'Kim', email: 'daniel.k@example.kr', phone: '+82 2 999 8888', nationality: 'Korean', preferredLanguage: 'English', serviceId: 'study', applicantsCount: 1, status: 'Waiting for Payment', assignedConsultantId: 'c4', source: 'WeChat', createdDate: '2026-06-19T17:00:00Z', notes: 'Awaiting language school deposit confirmation.', timeline: [] },
  { id: 'LD1029', firstName: 'Gabriel', lastName: 'Martinez', email: 'gabriel.m@example.mx', phone: '+52 55 1234 5678', nationality: 'Mexican', preferredLanguage: 'Spanish', serviceId: 'self_employed', applicantsCount: 2, status: 'New Lead', assignedConsultantId: 'c1', source: 'Website Traffic', createdDate: '2026-06-19T18:00:00Z', notes: 'Wants to start a consultancy in Madrid.', timeline: [] },
  { id: 'LD1030', firstName: 'Mei', lastName: 'Chen', email: 'mei.chen@example.cn', phone: '+86 21 6666 8888', nationality: 'Chinese', preferredLanguage: 'English', serviceId: 'nlv', applicantsCount: 1, status: 'Under Process', assignedConsultantId: 'c1', source: 'WhatsApp Click Ads', createdDate: '2026-06-19T19:00:00Z', notes: 'NLV visa file submitted.', timeline: [] }
];

export const MOCK_CLIENTS = [
  {
    id: 'CL2001',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'm.vance@example.com',
    phone: '+1 415 555 2671',
    nationality: 'American',
    preferredLanguage: 'English',
    serviceId: 'property',
    packageId: 'premium',
    applicantsCount: 2,
    assignedConsultantId: 'c5',
    status: 'Waiting for Payment',
    visaStatus: 'Not Started',
    onboardingDate: '2026-06-15T11:00:00Z',
    profileSummary: 'Wants Spain Golden Visa for purchase of €550,000 property in Malaga. Enrolled in Premium Relocation package.'
  },
  {
    id: 'CL2002',
    firstName: 'Chloe',
    lastName: 'Dupont',
    email: 'chloe.dupont@example.com',
    phone: '+33 6 1234 5678',
    nationality: 'French',
    preferredLanguage: 'English',
    serviceId: 'study',
    packageId: 'full_process',
    applicantsCount: 1,
    assignedConsultantId: 'c4',
    status: 'Documents Pending',
    visaStatus: 'Document Preparation',
    onboardingDate: '2026-06-16T09:00:00Z',
    profileSummary: 'Study Visa applicant for Complutense University. Needs medical insurance certificate and bank statements translated.'
  },
  {
    id: 'CL2003',
    firstName: 'Sophia',
    lastName: 'Miller',
    email: 's.miller@example.com',
    phone: '+1 202 555 0192',
    nationality: 'American',
    preferredLanguage: 'English',
    serviceId: 'nlv',
    packageId: 'full_process',
    applicantsCount: 1,
    assignedConsultantId: 'c1',
    status: 'Under Process',
    visaStatus: 'Submitted - Pending Decision',
    onboardingDate: '2026-06-05T10:00:00Z',
    profileSummary: 'NLV filed at the Washington DC Consulate. All financial qualifications approved.'
  },
  {
    id: 'CL2004',
    firstName: 'Nour',
    lastName: 'Dagher',
    email: 'nour.dagher@example.com',
    phone: '+971 54 443 2190',
    nationality: 'Syrian',
    preferredLanguage: 'Arabic',
    serviceId: 'family',
    packageId: 'premium',
    applicantsCount: 2,
    assignedConsultantId: 'c2',
    status: 'Under Process',
    visaStatus: 'NIE / Local Registration',
    onboardingDate: '2026-06-08T09:30:00Z',
    profileSummary: 'Completed visa process, now in Spain undergoing NIE registration and finger print appointments in Madrid.'
  },
  {
    id: 'CL2005',
    firstName: 'David',
    lastName: 'Hume',
    email: 'd.hume@example.co.uk',
    phone: '+44 7888 123456',
    nationality: 'British',
    preferredLanguage: 'English',
    serviceId: 'dnv',
    packageId: 'premium',
    applicantsCount: 1,
    assignedConsultantId: 'c5',
    status: 'Completed',
    visaStatus: 'Visa Approved',
    onboardingDate: '2026-05-10T14:30:00Z',
    profileSummary: 'DNV approved. NIE card collected. Relocation successfully completed to Barcelona.'
  },
  {
    id: 'CL2006',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 's.jenkins@example.com',
    phone: '+1 312 555 9811',
    nationality: 'American',
    preferredLanguage: 'English',
    serviceId: 'dnv',
    packageId: 'full_process',
    applicantsCount: 1,
    assignedConsultantId: 'c5',
    status: 'Under Process',
    visaStatus: 'Document Review',
    onboardingDate: '2026-06-01T09:00:00Z',
    profileSummary: 'Digital Nomad applicant. Translating employment verification letters and checking social security coverage agreement.'
  },
  {
    id: 'CL2007',
    firstName: 'Tareq',
    lastName: 'Nasser',
    email: 'tareq.n@example.ae',
    phone: '+971 55 909 0101',
    nationality: 'Emirati',
    preferredLanguage: 'Arabic',
    serviceId: 'property',
    packageId: 'full_process',
    applicantsCount: 3,
    assignedConsultantId: 'c3',
    status: 'Under Process',
    visaStatus: 'Submitted - Pending Decision',
    onboardingDate: '2026-05-25T11:00:00Z',
    profileSummary: 'Residency application filed. Property purchased in Valencia. Waiting for Spanish Ministry response.'
  },
  {
    id: 'CL2008',
    firstName: 'Olga',
    lastName: 'Kuznetsova',
    email: 'olga.k@example.ru',
    phone: '+7 916 444 5566',
    nationality: 'Russian',
    preferredLanguage: 'English',
    serviceId: 'nlv',
    packageId: 'full_process',
    applicantsCount: 2,
    assignedConsultantId: 'c4',
    status: 'Documents Pending',
    visaStatus: 'Apostille & Translations',
    onboardingDate: '2026-06-11T13:00:00Z',
    profileSummary: 'Awaiting clean criminal record certificate apostilled in Moscow and medical report translation.'
  },
  {
    id: 'CL2009',
    firstName: 'Rohan',
    lastName: 'Mehta',
    email: 'rohan.m@example.com',
    phone: '+971 52 111 8888',
    nationality: 'Indian',
    preferredLanguage: 'English',
    serviceId: 'self_employed',
    packageId: 'premium',
    applicantsCount: 1,
    assignedConsultantId: 'c1',
    status: 'Waiting for Payment',
    visaStatus: 'Not Started',
    onboardingDate: '2026-06-17T16:00:00Z',
    profileSummary: 'SaaS founder relocation. Awaiting package deposit payment to start business plan drafting.'
  },
  {
    id: 'CL2010',
    firstName: 'Isabella',
    lastName: 'Gallo',
    email: 'isabella.g@example.com',
    phone: '+39 333 123 4567',
    nationality: 'Italian',
    preferredLanguage: 'English',
    serviceId: 'family',
    packageId: 'premium',
    applicantsCount: 2,
    assignedConsultantId: 'c2',
    status: 'Completed',
    visaStatus: 'Visa Rejected',
    onboardingDate: '2026-04-12T10:00:00Z',
    profileSummary: 'Spouse reunification application was rejected due to insufficient financial documentation.'
  },
  {
    id: 'CL2011',
    firstName: 'Liam',
    lastName: "O'Connor",
    email: 'liam.oc@example.ie',
    phone: '+353 1 496 0123',
    nationality: 'Irish',
    preferredLanguage: 'English',
    serviceId: 'study',
    packageId: 'full_process',
    applicantsCount: 1,
    assignedConsultantId: 'c4',
    status: 'Documents Pending',
    visaStatus: 'Document Preparation',
    onboardingDate: '2026-06-19T10:00:00Z',
    profileSummary: 'Study Visa case for Universidad Complutense de Madrid.'
  },
  {
    id: 'CL2012',
    firstName: 'Noah',
    lastName: 'Weber',
    email: 'noah.w@example.de',
    phone: '+49 89 2019 8273',
    nationality: 'German',
    preferredLanguage: 'English',
    serviceId: 'dnv',
    packageId: 'premium',
    applicantsCount: 2,
    assignedConsultantId: 'c5',
    status: 'Under Process',
    visaStatus: 'Document Review',
    onboardingDate: '2026-06-19T11:00:00Z',
    profileSummary: 'Remote developer DNV case. Awaiting German social security form.'
  },
  {
    id: 'CL2013',
    firstName: 'Isabella',
    lastName: 'Rossi',
    email: 'isabella.rossi@example.it',
    phone: '+39 02 8812 3456',
    nationality: 'Italian',
    preferredLanguage: 'English',
    serviceId: 'family',
    packageId: 'premium',
    applicantsCount: 3,
    assignedConsultantId: 'c1',
    status: 'Completed',
    visaStatus: 'Client Withdraw',
    onboardingDate: '2026-06-19T12:00:00Z',
    profileSummary: 'Family reunion process started but client chose to withdraw application.'
  },
  {
    id: 'CL2014',
    firstName: 'Lucas',
    lastName: 'Dubois',
    email: 'lucas.d@example.fr',
    phone: '+33 1 4720 9811',
    nationality: 'French',
    preferredLanguage: 'English',
    serviceId: 'self_employed',
    packageId: 'full_process',
    applicantsCount: 1,
    assignedConsultantId: 'c3',
    status: 'Under Process',
    visaStatus: 'Submitted - Pending Decision',
    onboardingDate: '2026-06-19T13:00:00Z',
    profileSummary: 'Autonomo registration submitted to immigration authorities.'
  },
  {
    id: 'CL2015',
    firstName: 'Sophia',
    lastName: 'Lindqvist',
    email: 'sophia.l@example.se',
    phone: '+46 8 123 4567',
    nationality: 'Swedish',
    preferredLanguage: 'English',
    serviceId: 'dnv',
    packageId: 'premium',
    applicantsCount: 2,
    assignedConsultantId: 'c5',
    status: 'Waiting for Payment',
    visaStatus: 'Not Started',
    onboardingDate: '2026-06-19T15:00:00Z',
    profileSummary: 'DNV package setup. Awaiting invoice payment.'
  },
  {
    id: 'CL2016',
    firstName: 'Alexander',
    lastName: 'Pavlov',
    email: 'alex.p@example.ru',
    phone: '+7 495 111 2233',
    nationality: 'Russian',
    preferredLanguage: 'English',
    serviceId: 'property',
    packageId: 'premium',
    applicantsCount: 4,
    assignedConsultantId: 'c4',
    status: 'Under Process',
    visaStatus: 'NIE / Local Registration',
    onboardingDate: '2026-06-19T16:00:00Z',
    profileSummary: 'Golden Visa. Purchase complete. Undertaking local registration in Alicante.'
  },
  {
    id: 'CL2017',
    firstName: 'Daniel',
    lastName: 'Kim',
    email: 'daniel.k@example.kr',
    phone: '+82 2 999 8888',
    nationality: 'Korean',
    preferredLanguage: 'English',
    serviceId: 'study',
    packageId: 'full_process',
    applicantsCount: 1,
    assignedConsultantId: 'c4',
    status: 'Documents Pending',
    visaStatus: 'Document Preparation',
    onboardingDate: '2026-06-19T17:00:00Z',
    profileSummary: 'Korean study visa applicant. Awaiting visa medical certificate translation.'
  },
  {
    id: 'CL2018',
    firstName: 'Gabriel',
    lastName: 'Martinez',
    email: 'gabriel.m@example.mx',
    phone: '+52 55 1234 5678',
    nationality: 'Mexican',
    preferredLanguage: 'Spanish',
    serviceId: 'self_employed',
    packageId: 'full_process',
    applicantsCount: 2,
    assignedConsultantId: 'c1',
    status: 'Completed',
    visaStatus: 'Refund Completed',
    onboardingDate: '2026-06-19T18:00:00Z',
    profileSummary: 'Autonomo setup package cancelled by client and 50% refund processed.'
  },
  {
    id: 'CL2019',
    firstName: 'Mei',
    lastName: 'Chen',
    email: 'mei.chen@example.cn',
    phone: '+86 21 6666 8888',
    nationality: 'Chinese',
    preferredLanguage: 'English',
    serviceId: 'nlv',
    packageId: 'full_process',
    applicantsCount: 1,
    assignedConsultantId: 'c1',
    status: 'Completed',
    visaStatus: 'Case Canceled',
    onboardingDate: '2026-06-19T19:00:00Z',
    profileSummary: 'NLV application cancelled due to change in client circumstances.'
  },
  {
    id: 'CL2020',
    firstName: 'Emma',
    lastName: 'Novak',
    email: 'emma.n@example.pl',
    phone: '+48 22 555 0122',
    nationality: 'Polish',
    preferredLanguage: 'English',
    serviceId: 'nlv',
    packageId: 'full_process',
    applicantsCount: 1,
    assignedConsultantId: 'c1',
    status: 'Under Process',
    visaStatus: 'Document Preparation',
    onboardingDate: '2026-06-19T14:00:00Z',
    profileSummary: 'Awaiting medical insurance and bank certificate translations.'
  }
];

export const MOCK_CONSULTATIONS = [
  {
    id: 'CS3001',
    leadId: 'LD1002',
    clientName: 'Tariq Mahmood',
    meetingDate: '2026-06-18',
    meetingTime: '15:00',
    durationMinutes: 45,
    assignedConsultantId: 'c2',
    status: 'Scheduled',
    meetingLink: 'https://zoom.us/j/987654321',
    notes: 'To discuss passive income certificates from UAE assets.',
    recordingUrl: '',
    outcome: null
  },
  {
    id: 'CS3002',
    leadId: 'LD1003',
    clientName: 'Chloe Dupont',
    meetingDate: '2026-06-16',
    meetingTime: '10:00',
    durationMinutes: 30,
    assignedConsultantId: 'c4',
    status: 'Completed',
    meetingLink: 'https://zoom.us/j/123456789',
    notes: 'Qualifies easily for Study Visa. Needs full processing support. Standard tuition verification is ready.',
    recordingUrl: 'https://storage.googleapis.com/aaa-consultancy-recordings/CS3002_recording.mp3',
    outcome: {
      clientRequestedService: 'Study Visa',
      aaaRecommendedService: 'Study Visa',
      notes: 'Recommended standard Full Process Package. Checked translation services requirements.'
    }
  },
  {
    id: 'CS3003',
    leadId: 'LD1004',
    clientName: 'Marcus Vance',
    meetingDate: '2026-06-15',
    meetingTime: '11:00',
    durationMinutes: 60,
    assignedConsultantId: 'c5',
    status: 'Completed',
    meetingLink: 'https://zoom.us/j/444555666',
    notes: 'Wants to buy €550,000 villa in Malaga. Needs residency + complete NIE, Spanish bank accounts, utilities, and tax registration assistance.',
    recordingUrl: 'https://storage.googleapis.com/aaa-consultancy-recordings/CS3003_recording.mp3',
    outcome: {
      clientRequestedService: 'Property Investment Guidance',
      aaaRecommendedService: 'Property Investment Guidance',
      notes: 'Strongly recommended the Premium Package to handle both the Golden Visa process and relocation tasks.'
    }
  },
  {
    id: 'CS3004',
    leadId: 'LD1006',
    clientName: 'John Doe',
    meetingDate: '2026-06-03',
    meetingTime: '14:00',
    durationMinutes: 30,
    assignedConsultantId: 'c5',
    status: 'Cancelled',
    meetingLink: 'https://zoom.us/j/111222333',
    notes: 'Client cancelled 1 hour before due to personal issues.',
    recordingUrl: '',
    outcome: null
  },
  {
    id: 'CS3005',
    leadId: 'LD1007',
    clientName: 'Maria Ivanova',
    meetingDate: '2026-05-19',
    meetingTime: '11:30',
    durationMinutes: 45,
    assignedConsultantId: 'c4',
    status: 'Completed',
    meetingLink: 'https://zoom.us/j/333444555',
    notes: 'Passive income details were unclear. Questionable source of dividends.',
    recordingUrl: 'https://storage.googleapis.com/aaa-consultancy-recordings/CS3005_recording.mp3',
    outcome: {
      clientRequestedService: 'Non-Lucrative Visa (NLV)',
      aaaRecommendedService: 'Non-Lucrative Visa (NLV)',
      notes: 'Warned client about high chance of consulate rejection unless dividend history is cleared. Client insisted on proceeding.'
    }
  },
  {
    id: 'CS3006',
    leadId: 'LD1012',
    clientName: 'Carlos Silva',
    meetingDate: '2026-06-18',
    meetingTime: '16:30',
    durationMinutes: 45,
    assignedConsultantId: 'c1',
    status: 'Scheduled',
    meetingLink: 'https://zoom.us/j/888999000',
    notes: 'Reviewing real estate investment options in Madrid and Golden Visa eligibility.',
    recordingUrl: '',
    outcome: null
  },
  {
    id: 'CS3007',
    leadId: 'LD1018',
    clientName: 'Emma Nielsen',
    meetingDate: '2026-06-18',
    meetingTime: '11:00',
    durationMinutes: 30,
    assignedConsultantId: 'c1',
    status: 'No Show',
    meetingLink: 'https://zoom.us/j/222333444',
    notes: 'Client did not log in. Tried calling, no answer. Triggered automatics rebook email notifications.',
    recordingUrl: '',
    outcome: null
  }
];

export const MOCK_PAYMENTS = [
  {
    id: 'INV-2026-001',
    clientId: 'CL2005',
    clientName: 'David Hume',
    serviceId: 'dnv',
    packageId: 'premium',
    amount: 2500, // base 2000 + relocation add-on
    discount: 500, // main applicant discount
    totalPaid: 2000,
    status: 'Paid',
    billingDate: '2026-05-11',
    dueDate: '2026-05-25',
    paymentMethod: 'Visa',
    transactionId: 'TXN-90218731'
  },
  {
    id: 'INV-2026-002',
    clientId: 'CL2003',
    clientName: 'Sophia Miller',
    serviceId: 'nlv',
    packageId: 'full_process',
    amount: 1800,
    discount: 0,
    totalPaid: 1800,
    status: 'Paid',
    billingDate: '2026-06-06',
    dueDate: '2026-06-20',
    paymentMethod: 'Mastercard',
    transactionId: 'TXN-48719812'
  },
  {
    id: 'INV-2026-003',
    clientId: 'CL2004',
    clientName: 'Nour Dagher',
    serviceId: 'family',
    packageId: 'premium',
    amount: 2200, // 1500 + 700 relocation
    discount: 750, // Premium package discount: 500 main + 250 dependent
    totalPaid: 1450,
    status: 'Paid',
    billingDate: '2026-06-09',
    dueDate: '2026-06-23',
    paymentMethod: 'Apple Pay',
    transactionId: 'TXN-77319022'
  },
  {
    id: 'INV-2026-004',
    clientId: 'CL2001',
    clientName: 'Marcus Vance',
    serviceId: 'property',
    packageId: 'premium',
    amount: 3700, // 3000 + 700 add-on
    discount: 750, // 500 main + 250 dependent
    totalPaid: 0,
    status: 'Pending',
    billingDate: '2026-06-15',
    dueDate: '2026-06-29',
    paymentMethod: '-',
    transactionId: '-'
  },
  {
    id: 'INV-2026-005',
    clientId: 'CL2002',
    clientName: 'Chloe Dupont',
    serviceId: 'study',
    packageId: 'full_process',
    amount: 1200,
    discount: 0,
    totalPaid: 0,
    status: 'Pending',
    billingDate: '2026-06-16',
    dueDate: '2026-06-30',
    paymentMethod: '-',
    transactionId: '-'
  },
  {
    id: 'INV-2026-006',
    clientId: 'CL2007',
    clientName: 'Tareq Nasser',
    serviceId: 'property',
    packageId: 'full_process',
    amount: 3000,
    discount: 0,
    totalPaid: 3000,
    status: 'Paid',
    billingDate: '2026-05-26',
    dueDate: '2026-06-09',
    paymentMethod: 'Tamara',
    transactionId: 'TXN-11228833'
  },
  {
    id: 'INV-2026-007',
    clientId: 'CL2008',
    clientName: 'Olga Kuznetsova',
    serviceId: 'nlv',
    packageId: 'full_process',
    amount: 1800,
    discount: 0,
    totalPaid: 1800,
    status: 'Paid',
    billingDate: '2026-06-11',
    dueDate: '2026-06-25',
    paymentMethod: 'Tabby',
    transactionId: 'TXN-49381022'
  },
  {
    id: 'INV-2026-008',
    clientId: 'CL2009',
    clientName: 'Rohan Mehta',
    serviceId: 'self_employed',
    packageId: 'premium',
    amount: 3200, // 2500 + 700 add-on
    discount: 500, // 500 main
    totalPaid: 0,
    status: 'Pending',
    billingDate: '2026-06-17',
    dueDate: '2026-07-01',
    paymentMethod: '-',
    transactionId: '-'
  },
  {
    id: 'INV-2026-009',
    clientId: 'CL2010',
    clientName: 'Isabella Gallo',
    serviceId: 'family',
    packageId: 'premium',
    amount: 2200,
    discount: 750, // 500 main + 250 dep
    totalPaid: 1450,
    status: 'Paid',
    billingDate: '2026-04-13',
    dueDate: '2026-04-27',
    paymentMethod: 'Google Pay',
    transactionId: 'TXN-90998822'
  },
  {
    id: 'INV-2026-010',
    clientId: 'CL2006',
    clientName: 'Sarah Jenkins',
    serviceId: 'dnv',
    packageId: 'full_process',
    amount: 2000,
    discount: 0,
    totalPaid: 0,
    status: 'Failed',
    billingDate: '2026-06-01',
    dueDate: '2026-06-15',
    paymentMethod: 'Visa',
    transactionId: 'TXN-FAILED-4819'
  }
];

export const MOCK_DOCUMENTS = [
  {
    id: 'DOC4001',
    clientId: 'CL2005',
    clientName: 'David Hume',
    category: 'Passport',
    fileName: 'david_hume_passport.pdf',
    fileSize: '2.4 MB',
    uploadedDate: '2026-05-12T10:00:00Z',
    status: 'Approved',
    comment: 'Valid until 2035. Crisp scanned copy.',
    fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800' // mockup preview
  },
  {
    id: 'DOC4002',
    clientId: 'CL2005',
    clientName: 'David Hume',
    category: 'Bank Statement',
    fileName: 'bank_statement_3months_hume.pdf',
    fileSize: '4.8 MB',
    uploadedDate: '2026-05-12T10:15:00Z',
    status: 'Approved',
    comment: 'Shows €35,000 balance matching criteria.',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'
  },
  {
    id: 'DOC4003',
    clientId: 'CL2003',
    clientName: 'Sophia Miller',
    category: 'Employment Letter',
    fileName: 'us_company_remote_allowance.pdf',
    fileSize: '1.2 MB',
    uploadedDate: '2026-06-06T11:00:00Z',
    status: 'Approved',
    comment: 'Confirming remote work allowance in Spain and monthly salary €4,100.',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800'
  },
  {
    id: 'DOC4004',
    clientId: 'CL2003',
    clientName: 'Sophia Miller',
    category: 'Passport',
    fileName: 'sophia_passport_scan.pdf',
    fileSize: '3.1 MB',
    uploadedDate: '2026-06-06T11:05:00Z',
    status: 'Approved',
    comment: 'Validated. Clean bio-page copy.',
    fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800'
  },
  {
    id: 'DOC4005',
    clientId: 'CL2002',
    clientName: 'Chloe Dupont',
    category: 'Education Documents',
    fileName: 'complutense_admission_letter.pdf',
    fileSize: '1.9 MB',
    uploadedDate: '2026-06-16T10:00:00Z',
    status: 'Approved',
    comment: 'Official university letter for Masters Program 2026/2027.',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800'
  },
  {
    id: 'DOC4006',
    clientId: 'CL2002',
    clientName: 'Chloe Dupont',
    category: 'Passport',
    fileName: 'dupont_passport.pdf',
    fileSize: '2.2 MB',
    uploadedDate: '2026-06-16T10:05:00Z',
    status: 'Approved',
    comment: 'Valid EU Passport.',
    fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800'
  },
  {
    id: 'DOC4007',
    clientId: 'CL2002',
    clientName: 'Chloe Dupont',
    category: 'Bank Statement',
    fileName: 'french_bank_savings.pdf',
    fileSize: '1.5 MB',
    uploadedDate: '2026-06-17T09:00:00Z',
    status: 'Pending Review',
    comment: 'Needs verification if savings amount is sufficient for study duration.',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'
  },
  {
    id: 'DOC4008',
    clientId: 'CL2004',
    clientName: 'Nour Dagher',
    category: 'Marriage Certificate',
    fileName: 'syrian_marriage_sworn_translation.pdf',
    fileSize: '3.4 MB',
    uploadedDate: '2026-06-09T14:00:00Z',
    status: 'Approved',
    comment: 'Sworn Spanish translation attached. Certified by Ministry.',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800'
  },
  {
    id: 'DOC4009',
    clientId: 'CL2004',
    clientName: 'Nour Dagher',
    category: 'Passport',
    fileName: 'nour_passport.pdf',
    fileSize: '2.5 MB',
    uploadedDate: '2026-06-09T14:05:00Z',
    status: 'Approved',
    comment: 'Valid for 4 years.',
    fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800'
  },
  {
    id: 'DOC4010',
    clientId: 'CL2004',
    clientName: 'Nour Dagher',
    category: 'Others',
    fileName: 'madrid_empadronamiento_sheet.pdf',
    fileSize: '1.0 MB',
    uploadedDate: '2026-06-12T15:30:00Z',
    status: 'Pending Review',
    comment: 'Local registration sheet. Verify if address details match TIE application draft.',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800'
  },
  // Additional documents to ensure at least 20
  { id: 'DOC4011', clientId: 'CL2001', clientName: 'Marcus Vance', category: 'Passport', fileName: 'marcus_passport.pdf', fileSize: '2.0 MB', uploadedDate: '2026-06-15T12:00:00Z', status: 'Approved', comment: 'Approved by David.', fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800' },
  { id: 'DOC4012', clientId: 'CL2001', clientName: 'Marcus Vance', category: 'Bank Statement', fileName: 'property_escrow_deposit.pdf', fileSize: '5.1 MB', uploadedDate: '2026-06-15T12:10:00Z', status: 'Pending Review', comment: 'Verifying escrow letter.', fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800' },
  { id: 'DOC4013', clientId: 'CL2007', clientName: 'Tareq Nasser', category: 'Passport', fileName: 'tareq_passport.pdf', fileSize: '2.3 MB', uploadedDate: '2026-05-25T11:30:00Z', status: 'Approved', comment: '', fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800' },
  { id: 'DOC4014', clientId: 'CL2007', clientName: 'Tareq Nasser', category: 'Marriage Certificate', fileName: 'emirati_marriage_cert.pdf', fileSize: '3.0 MB', uploadedDate: '2026-05-25T11:45:00Z', status: 'Approved', comment: '', fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800' },
  { id: 'DOC4015', clientId: 'CL2007', clientName: 'Tareq Nasser', category: 'Others', fileName: 'valencia_deed_draft.pdf', fileSize: '4.5 MB', uploadedDate: '2026-05-26T09:00:00Z', status: 'Approved', comment: 'Property registration deed verified.', fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800' },
  { id: 'DOC4016', clientId: 'CL2008', clientName: 'Olga Kuznetsova', category: 'Passport', fileName: 'olga_passport.pdf', fileSize: '2.1 MB', uploadedDate: '2026-06-11T13:30:00Z', status: 'Approved', comment: '', fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800' },
  { id: 'DOC4017', clientId: 'CL2008', clientName: 'Olga Kuznetsova', category: 'Bank Statement', fileName: 'rub_account_balance.pdf', fileSize: '3.3 MB', uploadedDate: '2026-06-11T13:45:00Z', status: 'Rejected', comment: 'Ruble statements must be translated and have equivalent EUR showing.', fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800' },
  { id: 'DOC4018', clientId: 'CL2008', clientName: 'Olga Kuznetsova', category: 'Employment Letter', fileName: 'work_retirement_proof.pdf', fileSize: '1.7 MB', uploadedDate: '2026-06-12T10:00:00Z', status: 'Approved', comment: '', fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800' },
  { id: 'DOC4019', clientId: 'CL2006', clientName: 'Sarah Jenkins', category: 'Passport', fileName: 'sarah_passport.pdf', fileSize: '2.2 MB', uploadedDate: '2026-06-01T09:30:00Z', status: 'Approved', comment: '', fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800' },
  { id: 'DOC4020', clientId: 'CL2006', clientName: 'Sarah Jenkins', category: 'Employment Letter', fileName: 'us_w2_and_contracts.pdf', fileSize: '3.9 MB', uploadedDate: '2026-06-01T10:00:00Z', status: 'Approved', comment: 'Satisfies remote employee income criteria.', fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800' },
  { id: 'DOC4021', clientId: 'CL2010', clientName: 'Isabella Gallo', category: 'Passport', fileName: 'isabella_passport.pdf', fileSize: '2.5 MB', uploadedDate: '2026-04-12T10:30:00Z', status: 'Approved', comment: '', fileUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800' }
];

export const EMAIL_TEMPLATES = [
  {
    id: 'et1',
    name: 'Appointment Confirmation',
    subject: 'Your Consultation with AAA Business Consultancy is Scheduled',
    body: `Dear {clientName},

Your Spain Visa & Residency consultation has been successfully booked.

Details:
- Date: {meetingDate}
- Time: {meetingTime}
- Meeting Link: {meetingLink}

Attached to this email, you will find our Spain Residency & Relocation Company Profile.

If you need to reschedule, please click here: {rescheduleLink}

Best Regards,
Client Relations Team
AAA Business Consultancy LLC
clients@aaabusinessconsultancy.com`
  },
  {
    id: 'et2',
    name: 'Consultation No-Show Follow Up',
    subject: 'We missed you! Reschedule your Spain Visa Consultation',
    body: `Dear {clientName},

We noticed you were unable to attend your scheduled Spain Visa & Residency Consultation on {meetingDate} at {meetingTime}.

We would love to help you build your future in Spain. Please click the link below to select a new date and time that works for you:

{bookingLink}

If you have any questions, feel free to reply directly to this email or contact us via WhatsApp.

Best Regards,
AAA Business Consultancy LLC`
  },
  {
    id: 'et3',
    name: 'Payment Remainder & Invoice',
    subject: 'Invoice {invoiceId} from AAA Business Consultancy LLC',
    body: `Dear {clientName},

Thank you for choosing AAA Business Consultancy LLC for your Spain Visa & Residency journey.

Please find attached Invoice {invoiceId} for your selected {packageName}.
Total Amount Due: {amount}

You can pay securely online via Apple Pay, Google Pay, or Visa/Mastercard using this link:
{paymentLink}

Please make the payment before {dueDate} to avoid any delays in document drafting.

Best Regards,
Finance Team
AAA Business Consultancy LLC`
  }
];

export const WHATSAPP_TEMPLATES = [
  {
    id: 'wt1',
    name: 'Welcome & Qualification Ask',
    body: `Greetings from AAA Business Consultancy LLC.
Thank you for contacting us regarding Spain Visa & Residency Services.

To help us guide you, please answer:
1. Which service would you like to apply for? (DNV, NLV, Self-Employed, Study, Family, Schengen)
2. How many applicants are included?

For further assistance, we will continue our conversation here.`
  },
  {
    id: 'wt2',
    name: 'Consultation Invite Link',
    body: `Congratulations! Based on your initial information, you are invited to book a FREE Assessment & Verification Consultation with one of our consultants.

Please use this booking link to select your preferred date and time:
{bookingLink}`
  },
  {
    id: 'wt3',
    name: 'Meeting 30m Reminder',
    body: `Friendly reminder: Your consultation with {consultantName} is starting in 30 minutes (at {meetingTime}).
Please confirm if you are ready to join:
[Confirm Attendance] [Reschedule]`
  }
];
export const ROLES = [
  { id: 'admin', name: 'Administrator', description: 'Full access to all CRM settings, deletion, reports, configuration, and data.' },
  { id: 'consultant', name: 'Consultant', description: 'Manage assigned leads/clients, view calendar scheduler, add notes, and upload/review client documents.' },
  { id: 'finance', name: 'Finance Staff', description: 'Full access to payment modules, invoices, revenue reports, and settings.' },
  { id: 'operations', name: 'Operations Staff', description: 'Oversee all leads and clients, document review pipeline, consultations, and consultant assignments.' }
];
export const NOTIFICATIONS = [
  { id: 'n1', title: 'New Lead Registered', message: 'Amelia Watson registered via Google Ads for Digital Nomad Visa.', type: 'lead', time: '5m ago', read: false },
  { id: 'n2', title: 'Payment Received', message: 'Invoice INV-2026-003 for Nour Dagher (€1,450) was paid.', type: 'payment', time: '1h ago', read: false },
  { id: 'n3', title: 'Document Uploaded', message: 'Chloe Dupont uploaded Bank Statement.', type: 'document', time: '2h ago', read: false },
  { id: 'n4', title: 'Meeting Confirmed', message: 'Tariq Mahmood confirmed attendance for today 3:00 PM.', type: 'meeting', time: '3h ago', read: true },
];
