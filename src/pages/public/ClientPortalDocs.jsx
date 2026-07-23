import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { dbService } from '../../services/dbService';
import FileUploader from '../../components/FileUploader';
import StatusBadge from '../../components/StatusBadge';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import spainSevillePlaza from '../../assets/spain_seville_plaza.png';
import spainRelocationLifestyle from '../../assets/spain_relocation_lifestyle.png';
import { SERVICES } from '../../constants/mockData';

const TRANSLATIONS = {
  English: {
    welcome: "Welcome",
    logout: "Log out",
    schedule_tab: "1. Schedule Consultation",
    docs_tab: "1. Document Center",
    booking_title: "Book Free Expert Consultation",
    booking_desc: "Please select a date and an available hour. Our system will automatically match you with a case officer.",
    policy_title: "⚠️ IMPORTANT POLICY NOTE",
    policy_desc: "If you do not join your scheduled Free Eligibility Assessment within 10 minutes of the appointment time, your booking will be automatically cancelled. Due to high demand, missed appointments are not eligible for rescheduling. This policy helps us provide fair access to all applicants.",
    step1: "Step 1: Choose Date",
    step2: "Step 2: Choose Available Slot (Movie-Ticket Style)",
    step3: "Step 3: Client Details & Language Preference",
    lang_label: "Preferred Consultation Language",
    nationality: "Nationality",
    residence: "Country of Residence",
    step4: "Step 4: Consultation Objective",
    notes_label: "What is your main goal for this visa consultation?",
    confirm_booking: "Confirm Consultation Booking",
    booked_consultations: "Your Consultations History",
    no_consultations: "No consultation records found.",
    checklist_title: "Required Documents Checklist",
    checklist_desc: "Upload required visa application documents. Category-specific folders are automatically managed.",
    upload_required: "Please upload the following documents to continue with your visa application.",
    calculator_title: "Spanish Sworn Translation Word Counter & Price Calculator",
    calculator_desc: "Determine your translation costs instantly by entering your source language and word count. Upload documents directly for sworn certified Spanish translations.",
    select_source_lang: "Select Source Language",
    word_count: "Word Count",
    upload_targets: "Upload Target Documents for Verification",
    calculate_price: "Calculate Price",
    total_words: "Total Words",
    final_price: "Final Price",
    proceed_payment: "Proceed with Payment"
  },
  Arabic: {
    welcome: "مرحباً",
    logout: "تسجيل الخروج",
    schedule_tab: "١. جدولة الاستشارة",
    docs_tab: "٢. مركز المستندات",
    booking_title: "احجز استشارتك المجانية مع الخبراء",
    booking_desc: "يرجى تحديد التاريخ والوقت المتاحين. سيقوم نظامنا بمطابقتك مع موظف الحالة تلقائياً.",
    policy_title: "⚠️ تنبيه هام بخصوص السياسة",
    policy_desc: "إذا لم تنضم إلى تقييم الأهلية المجاني المقرر خلال 10 دقائق من موعد الموعد، فسيتم إلغاء حجزك تلقائياً. نظراً للطلب المتزايد، فإن المواعيد الفائتة غير قابلة لإعادة الجدولة. تساعدنا هذه السياسة في توفير وصول عادل لجميع المتقدمين.",
    step1: "الخطوة ١: اختر التاريخ",
    step2: "الخطوة ٢: اختر الموعد المتاح (بنظام التذاكر)",
    step3: "الخطوة ٣: تفاصيل العميل واللغة المفضلة",
    lang_label: "اللغة المفضلة للاستشارة",
    nationality: "الجنسية",
    residence: "بلد الإقامة",
    step4: "الخطوة ٤: هدف الاستشارة",
    notes_label: "ما هو هدفك الرئيسي من هذه الاستشارة الخاصة بالتأشيرة؟",
    confirm_booking: "تأكيد حجز الاستشارة",
    booked_consultations: "سجل الاستشارات الخاصة بك",
    no_consultations: "لم يتم العثور على سجلات استشارة.",
    checklist_title: "قائمة المستندات المطلوبة",
    checklist_desc: "قم بتحميل مستندات طلب التأشيرة المطلوبة. يتم إدارة المجلدات الخاصة بكل فئة تلقائياً.",
    upload_required: "يرجى تحميل المستندات التالية لمتابعة طلب التأشيرة الخاص بك.",
    calculator_title: "حاسبة الأسعار وعداد الكلمات للترجمة الإسبانية المحلفة",
    calculator_desc: "حدد تكلفة الترجمة فوراً عن طريق إدخال لغتك الأم وعدد الكلمات. قم بتحميل المستندات مباشرة للحصول على ترجمة إسبانية معتمدة ومحلفة.",
    select_source_lang: "اختر اللغة الأم",
    word_count: "عدد الكلمات",
    upload_targets: "تحميل المستندات المراد ترجمتها للتحقق",
    calculate_price: "احسب السعر",
    total_words: "إجمالي الكلمات",
    final_price: "السعر النهائي",
    proceed_payment: "المتابعة لإجراء الدفع"
  },
  Spanish: {
    welcome: "Bienvenido",
    logout: "Cerrar sesión",
    schedule_tab: "1. Programar Consulta",
    docs_tab: "2. Centro de Documentos",
    booking_title: "Reservar Consulta Gratuita con Expertos",
    booking_desc: "Seleccione una fecha y una hora disponible. Nuestro sistema le asignará automáticamente un asesor de casos.",
    policy_title: "⚠️ NOTA DE POLÍTICA IMPORTANTE",
    policy_desc: "Si no se une a su Evaluación de Elegibilidad Gratuita programada dentro de los 10 minutos posteriores a la hora de la cita, su reserva se cancelará automáticamente. Debido a la alta demanda, las citas perdidas no son elegibles para reprogramación. Esta política nos ayuda a brindar un acceso justo a todos los solicitantes.",
    step1: "Paso 1: Elija la Fecha",
    step2: "Paso 2: Elija el Horario Disponible (Estilo Boleto de Cine)",
    step3: "Paso 3: Detalles del Cliente y Preferencia de Idioma",
    lang_label: "Idioma de Consulta Preferido",
    nationality: "Nacionalidad",
    residence: "País de Residencia",
    step4: "Paso 4: Objetivo de la Consulta",
    notes_label: "¿Cuál es su objetivo principal para esta consulta de visa?",
    confirm_booking: "Confirmar Reserva de Consulta",
    booked_consultations: "Historial de sus Consultas",
    no_consultations: "No se encontraron registros de consultas.",
    checklist_title: "Lista de Documentos Requeridos",
    checklist_desc: "Suba los documentos requeridos para la solicitud de visa. Las carpetas específicas por categoría se gestionan automáticamente.",
    upload_required: "Por favor, suba los siguientes documentos para continuar con su solicitud de visa.",
    calculator_title: "Calculadora de Precios y Contador de Palabras de Traducción Jurada al Español",
    calculator_desc: "Determine los costos de traducción al instante ingresando el idioma de origen y el número de palabras. Suba documentos directamente para traducciones juradas certificadas al español.",
    select_source_lang: "Seleccionar Idioma de Origen",
    word_count: "Cantidad de Palabras",
    upload_targets: "Subir Documentos para Verificación",
    calculate_price: "Calcular Precio",
    total_words: "Total de Palabras",
    final_price: "Precio Final",
    proceed_payment: "Proceder al Pago"
  },
  French: {
    welcome: "Bienvenue",
    logout: "Se déconnecter",
    schedule_tab: "1. Planifier la Consultation",
    docs_tab: "2. Centre de Documents",
    booking_title: "Réserver une Consultation Gratuite",
    booking_desc: "Veuillez sélectionner une date et une heure disponible. Notre système vous affectera automatiquement un gestionnaire de dossier.",
    policy_title: "⚠️ NOTE DE POLITIQUE IMPORTANTE",
    policy_desc: "Si vous ne rejoignez pas votre évaluation d'éligibilité gratuite planifiée dans les 10 minutes suivant l'heure du rendez-vous, votre réservation sera automatiquement annulée. En raison de la forte demande, les rendez-vous manqués ne peuvent pas être reprogrammés. Cette politique nous aide à offrir un accès équitable à tous les candidats.",
    step1: "Étape 1: Choisissez la Date",
    step2: "Étape 2: Choisissez un Créneau Disponible",
    step3: "Étape 3: Détails du Client et Langue Préférée",
    lang_label: "Langue de Consultation Préférée",
    nationality: "Nationalité",
    residence: "Pays de Résidence",
    step4: "Étape 4: Objectif de la Consultation",
    notes_label: "Quel est votre objectif principal pour cette consultation de visa?",
    confirm_booking: "Confirmer la Réservation",
    booked_consultations: "Historique de vos Consultations",
    no_consultations: "Aucun dossier de consultation trouvé.",
    checklist_title: "Liste des Documents Requis",
    checklist_desc: "Téléchargez les documents de demande de visa requis. Les dossiers spécifiques aux catégories sont gérés automatiquement.",
    upload_required: "Veuillez télécharger les documents suivants pour continuer votre demande de visa.",
    calculator_title: "Calculateur de Prix & Compteur de Mots pour Traduction Assermentée en Espagnol",
    calculator_desc: "Déterminez instantanément vos coûts de traduction en saisissant votre langue source et le nombre de mots. Téléchargez les documents pour une traduction assermentée certifiée espagnole.",
    select_source_lang: "Sélectionner la Langue Source",
    word_count: "Nombre de Mots",
    upload_targets: "Télécharger les Documents pour Vérification",
    calculate_price: "Calculer le Prix",
    total_words: "Total des Mots",
    final_price: "Prix Final",
    proceed_payment: "Procéder au Paiement"
  },
  German: {
    welcome: "Willkommen",
    logout: "Abmelden",
    schedule_tab: "1. Beratung buchen",
    docs_tab: "2. Dokumentencenter",
    booking_title: "Kostenlose Expertenberatung buchen",
    booking_desc: "Bitte wählen Sie ein Datum und ein verfügbares Zeitfenster. Unser System wird Ihnen automatisch einen Fallbearbeiter zuweisen.",
    policy_title: "⚠️ WICHTIGER RICHTLINIENHINWEIS",
    policy_desc: "Wenn Sie nicht innerhalb von 10 Minuten nach dem vereinbarten Termin an Ihrer geplanten kostenlosen Eignungsprüfung teilnehmen, wird Ihre Buchung automatisch storniert. Aufgrund der hohen Nachfrage können verpasste Termine nicht verschoben werden. Diese Richtlinie hilft uns, allen Bewerbern einen fairen Zugang zu bieten.",
    step1: "Schritt 1: Datum wählen",
    step2: "Schritt 2: Verfügbares Zeitfenster wählen",
    step3: "Schritt 3: Kundendetails & Bevorzugte Sprache",
    lang_label: "Bevorzugte Beratungssprache",
    nationality: "Staatsangehörigkeit",
    residence: "Wohnsitzland",
    step4: "Schritt 4: Beratungsziel",
    notes_label: "Was ist Ihr Hauptziel für diese Visumberatung?",
    confirm_booking: "Beratungsbuchung bestätigen",
    booked_consultations: "Ihre Beratungshistorie",
    no_consultations: "Keine Beratungsdaten gefunden.",
    checklist_title: "Checkliste für erforderliche Dokumente",
    checklist_desc: "Laden Sie die erforderlichen Unterlagen für den Visumantrag hoch. Kategoriespezifische Ordner werden automatisch verwaltet.",
    upload_required: "Bitte laden Sie die folgenden Dokumente hoch, um mit Ihrem Visumantrag fortzufahren.",
    calculator_title: "Wortzähler und Preisrechner für vereidigte spanische Übersetzungen",
    calculator_desc: "Ermitteln Sie Ihre Übersetzungskosten sofort, indem Sie Ihre Ausgangssprache und die Wortanzahl eingeben. Laden Sie Dokumente direkt für eine zertifizierte vereidigte spanische Übersetzung hoch.",
    select_source_lang: "Ausgangssprache auswählen",
    word_count: "Wortanzahl",
    upload_targets: "Zieldokumente zur Überprüfung hochladen",
    calculate_price: "Preis berechnen",
    total_words: "Gesamtwörter",
    final_price: "Endpreis",
    proceed_payment: "Mit der Zahlung fortfahren"
  },
  Urdu: {
    welcome: "خوش آمدید",
    logout: "لاگ آؤٹ",
    schedule_tab: "1۔ مشاورت کا شیڈول",
    docs_tab: "2۔ دستاویزات کا مرکز",
    booking_title: "مفت ماہرانہ مشاورت بک کریں",
    booking_desc: "براہ کرم دستیاب تاریخ اور وقت منتخب کریں۔ ہمارا نظام خود بخود آپ کو کیس آفیسر سے مماثل کر دے گا۔",
    policy_title: "⚠️ اہم پالیسی نوٹ",
    policy_desc: "اگر آپ مقررہ وقت کے 10 منٹ کے اندر اپنی طے شدہ مفت اہلیت کی تشخیص میں شامل نہیں ہوتے ہیں، تو آپ کی بکنگ خود بخود منسوخ ہو جائے گی۔ زیادہ مانگ کی وجہ سے، چھوٹ جانے والی ملاقاتیں دوبارہ شیڈول کرنے کی اہل نہیں ہیں۔ یہ پالیسی ہمیں تمام درخواست دہندگان کو یکساں رسائی فراہم کرنے میں مدد کرتی ہے۔",
    step1: "مرحلہ 1: تاریخ منتخب کریں",
    step2: "مرحلہ 2: دستیاب وقت منتخب کریں (ٹکٹ کے انداز میں)",
    step3: "مرحلہ 3: کسٹمر کی تفصیلات اور زبان کی ترجیح",
    lang_label: "مشاورت کی پسندیدہ زبان",
    nationality: "قومیت",
    residence: "رہائشی ملک",
    step4: "مرحلہ 4: مشاورت کا مقصد",
    notes_label: "اس ویزا مشاورت کے لیے آپ کا بنیادی مقصد کیا ہے؟",
    confirm_booking: "مشاورت کی بکنگ کی تصدیق کریں",
    booked_consultations: "آپ کی مشاورت کی تاریخ",
    no_consultations: "کوئی مشاورتی ریکارڈ نہیں ملا۔",
    checklist_title: "مطلوبہ دستاویزات کی فہرست",
    checklist_desc: "ویزہ کی درخواست کے لیے مطلوبہ دستاویزات اپ لوڈ کریں۔ زمرہ کے لحاظ سے فولڈرز کا انتظام خود بخود کیا جاتا ہے۔",
    upload_required: "اپنی ویزا درخواست جاری رکھنے کے لیے براہ کرم درج ذیل دستاویزات اپ لوڈ کریں۔",
    calculator_title: "ہسپانوی حلفیہ ترجمہ ورڈ کاؤنٹر اور قیمت کا کیلکولیٹر",
    calculator_desc: "اپنی اصل زبان اور الفاظ کی تعداد درج کر کے فوری طور پر اپنے ترجمے کے اخراجات معلوم کریں۔ تصدیق شدہ ہسپانوی حلفیہ ترجمہ کے لیے دستاویزات براہ راست اپ لوڈ کریں۔",
    select_source_lang: "اصل زبان منتخب کریں",
    word_count: "الفاظ کی تعداد",
    upload_targets: "تصدیق کے لیے دستاویزات اپ لوڈ کریں",
    calculate_price: "قیمت کا حساب لگائیں",
    total_words: "کل الفاظ",
    final_price: "حتمی قیمت",
    proceed_payment: "ادائیگی کے ساتھ آگے بڑھیں"
  }
};

export const ClientPortalDocs = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [tabValue, setTabValue] = useState(0);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
  const [portalLang, setPortalLang] = useState(() => {
    return localStorage.getItem('client-portal-lang') || 'English';
  });

  const changeLanguage = (newLang) => {
    setPortalLang(newLang);
    localStorage.setItem('client-portal-lang', newLang);
  };

  const t = (key) => {
    const custom = {
      English: {
        select_target_lang: "Select Target Language",
        target_lang_label: "Target Language"
      },
      Arabic: {
        select_target_lang: "اختر اللغة المستهدفة",
        target_lang_label: "اللغة المستهدفة"
      },
      Spanish: {
        select_target_lang: "Seleccionar Idioma de Destino",
        target_lang_label: "Idioma de Destino"
      },
      French: {
        select_target_lang: "Sélectionner la Langue Cible",
        target_lang_label: "Langue Cible"
      },
      German: {
        select_target_lang: "Zielsprache auswählen",
        target_lang_label: "Zielsprache"
      },
      Urdu: {
        select_target_lang: "ہدف زبان منتخب کریں",
        target_lang_label: "ہدف زبان"
      }
    };

    if (custom[portalLang] && custom[portalLang][key]) {
      return custom[portalLang][key];
    }
    if (TRANSLATIONS[portalLang] && TRANSLATIONS[portalLang][key]) {
      return TRANSLATIONS[portalLang][key];
    }
    return TRANSLATIONS['English'][key] || key;
  };

  // Slot booking state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [preferredLang, setPreferredLang] = useState('English');
  const [nationality, setNationality] = useState('');
  const [countryOfResidence, setCountryOfResidence] = useState('');

  // Sworn Translation State
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [wordCount, setWordCount] = useState(250);
  const [wordRate, setWordRate] = useState(0.12);
  const [calcPrice, setCalcPrice] = useState(30);
  const [translationPaid, setTranslationPaid] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('word_calculated');
  const [translationFiles, setTranslationFiles] = useState([]);

  // Refund Claim Form State
  const [claimCategory, setClaimCategory] = useState('Visa Rejection');
  const [claimReason, setClaimReason] = useState('');
  const [claimProofUrl, setClaimProofUrl] = useState('');
  const [claimBankName, setClaimBankName] = useState('');
  const [claimBankIban, setClaimBankIban] = useState('');

  // Sworn Translation Add-on State
  const [addonFile, setAddonFile] = useState(null);
  const [addonCategory, setAddonCategory] = useState('Passport');
  const [addonCustomCategory, setAddonCustomCategory] = useState('');
  const [addonWordCount, setAddonWordCount] = useState(250);
  const [addonSourceLang, setAddonSourceLang] = useState('English');
  const [addonTargetLang, setAddonTargetLang] = useState('Spanish');
  const [addonCalcPrice, setAddonCalcPrice] = useState(30);
  const [addonLoading, setAddonLoading] = useState(false);

  // Visa Package selection & Billing states
  const [selectedPackage, setSelectedPackage] = useState('full_process');
  const [billingTermsChecked, setBillingTermsChecked] = useState(false);
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('card');

  // Helper to extract numeric count of applicants
  const getApplicantsCount = (countStr) => {
    if (!countStr || countStr === 'Main Only') return 1;

    // Check if it's a raw number string like "2", "3", etc.
    const numericVal = parseInt(countStr, 10);
    if (!isNaN(numericVal) && String(numericVal) === countStr.trim()) {
      return numericVal;
    }

    const match = countStr.match(/Main\s*\+\s*(\d+)/i);
    if (match) {
      return 1 + parseInt(match[1], 10);
    }
    return 1;
  };

  const [wizardDeps, setWizardDeps] = useState([]);

  // Fetch client details
  const isClientRole = localStorage.getItem('clientToken') !== null;

  const { data: clientProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['clientProfile', clientId],
    queryFn: dbService.getClientProfile,
    enabled: isClientRole
  });

  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients,
    enabled: !isClientRole
  });

  const dbClient = clients.find((c) => c.id === clientId);
  const localClientData = JSON.parse(localStorage.getItem('clientData') || 'null');
  const localMockClient = JSON.parse(localStorage.getItem('mockClientData') || 'null');
  const client = clientProfile || dbClient || (localClientData && localClientData.id === clientId ? localClientData : undefined) || (localMockClient && localMockClient.id === clientId ? localMockClient : undefined);

  const isTranslationClient = client && (client.serviceId === 'sworn_translation' || client.serviceId === 'translation' || client.serviceId === 'sworn' || client.serviceType === 'Spanish Sworn Translation');

  useEffect(() => {
    if (isTranslationClient) {
      setTabValue(1);
    }
  }, [isTranslationClient]);

  useEffect(() => {
    if (client) {
      setPreferredLang(client.preferredLanguage || 'English');
      setNationality(client.nationality || '');
      setCountryOfResidence(client.countryOfResidence || '');
      if (client.preferredLanguage) {
        setPortalLang(client.preferredLanguage);
        localStorage.setItem('client-portal-lang', client.preferredLanguage);
      }

      if (client.applicantsCount) {
        const count = getApplicantsCount(client.applicantsCount);
        const totalDeps = count - 1;
        const initialDeps = [];
        const saved = client.dependentsDetails || [];
        for (let i = 0; i < totalDeps; i++) {
          initialDeps.push({
            firstName: saved[i]?.firstName || '',
            lastName: saved[i]?.lastName || '',
            relation: saved[i]?.relation || 'Spouse',
            passportNumber: saved[i]?.passportNumber || '',
            nationality: saved[i]?.nationality || ''
          });
        }
        setWizardDeps(initialDeps);
      }
    }
  }, [client]);

  const { data: documents = [], isLoading: isDocsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: dbService.getDocuments,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const { data: consultations = [], isLoading: isConsultationsLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations
  });

  const { data: allPayments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments
  });

  const { data: allRefunds = [], refetch: refetchRefunds } = useQuery({
    queryKey: ['refundRequests'],
    queryFn: dbService.getRefundRequests
  });

  const createRefundMutation = useMutation({
    mutationFn: dbService.createRefundRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refundRequests'] });
      refetchRefunds();
      setClaimReason('');
      setClaimProofUrl('');
      setClaimBankName('');
      setClaimBankIban('');
      showAlert('Your Refund & Guarantee claim has been registered successfully! Our audit team will review your rejection letter within 48 hours.', 'success');
    },
    onError: (err) => {
      showAlert('Failed to submit refund request: ' + (err.message || 'Server error'), 'error');
    }
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents
  });

  const { data: generalSettings } = useQuery({
    queryKey: ['settings-general'],
    queryFn: dbService.getSettings
  });

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const getRateForLang = (lang) => {
    if (generalSettings && Array.isArray(generalSettings.swornTranslationRates)) {
      const match = generalSettings.swornTranslationRates.find(r => r.name === lang);
      if (match) return match.rate;
    }
    if (lang === 'Urdu') return 0.40;
    if (lang === 'Arabic') return 0.25;
    return 0.15;
  };

  useEffect(() => {
    if (generalSettings && Array.isArray(generalSettings.swornTranslationRates) && generalSettings.swornTranslationRates.length > 0) {
      const exists = generalSettings.swornTranslationRates.some(r => r.name === sourceLang);
      if (!exists) {
        setSourceLang(generalSettings.swornTranslationRates[0].name);
      }
    }
  }, [generalSettings, sourceLang]);

  useEffect(() => {
    if (translationPaid) return;
    let rate = getRateForLang(sourceLang);
    if (sourceLang.toLowerCase() === targetLang.toLowerCase()) {
      rate = 0;
    } else if (targetLang !== 'Spanish') {
      const targetRate = getRateForLang(targetLang);
      rate = parseFloat(((rate + targetRate) / 2).toFixed(2));
    }
    setWordRate(rate);
    setCalcPrice(parseFloat((wordCount * rate).toFixed(2)));
  }, [generalSettings, sourceLang, targetLang, wordCount, translationPaid]);

  useEffect(() => {
    let rate = getRateForLang(addonSourceLang);
    if (addonSourceLang.toLowerCase() === addonTargetLang.toLowerCase()) {
      rate = 0;
    } else if (addonTargetLang !== 'Spanish') {
      const targetRate = getRateForLang(addonTargetLang);
      rate = parseFloat(((rate + targetRate) / 2).toFixed(2));
    }
    setAddonCalcPrice(parseFloat((addonWordCount * rate).toFixed(2)));
  }, [addonSourceLang, addonTargetLang, addonWordCount]);

  const handlePayAddon = async () => {
    if (!addonFile) return;
    try {
      setAddonLoading(true);
      // 1. Generate Invoice / Payment Link
      const paymentLinkData = await dbService.generatePaymentLink({
        clientId: client.id,
        amount: addonCalcPrice,
        discount: 0
      });

      // 2. Mock complete payment status
      await dbService.updatePaymentStatus(paymentLinkData.id, 'Paid', 'Credit Card', 'TXN_ADDON_' + Math.floor(Math.random() * 10000000));

      // 3. Upload document using the upload endpoint
      let category = addonCategory;
      if (addonCategory === 'Other') {
        category = `Other: ${addonCustomCategory || 'General Document'}`;
      }
      await dbService.uploadDocument({
        file: addonFile,
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        category: category
      });

      // 4. Reset uploader and reload queries
      setAddonFile(null);
      setAddonWordCount(250);
      setAddonCategory('Passport');
      setAddonCustomCategory('');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      refetchDocs();

      showAlert('Add-on payment successful & document uploaded for translation! 🎉', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Add-on checkout failed. Please try again.', 'error');
    } finally {
      setAddonLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    try {
      const doc = new jsPDF();

      // Title / Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(5, 26, 59); // Brand dark color
      doc.text("AAA BUSINESS CONSULTANCY", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Spain Relocation & Certified Sworn Translation Services", 14, 26);
      doc.text("Email: info@aaabusinessconsultancy.com | Website: www.aaabusinessconsultancy.com", 14, 31);

      doc.setDrawColor(197, 155, 39); // Gold separator line
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);

      // Invoice Details
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 26, 59);
      doc.text("OFFICIAL PAYMENT RECEIPT", 14, 45);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);

      // Metadata
      doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 130, 45);
      doc.text(`Receipt No: REC-ST-${client.id.substring(0, 8).toUpperCase()}`, 130, 50);

      // Client Details
      doc.setFont("helvetica", "bold");
      doc.text("Client Information:", 14, 60);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${client.firstName} ${client.lastName}`, 14, 65);
      doc.text(`Email: ${client.email}`, 14, 70);
      doc.text(`Phone: ${client.phone || 'N/A'}`, 14, 75);

      // Translation Settings
      doc.setFont("helvetica", "bold");
      doc.text("Translation Details:", 110, 60);
      doc.setFont("helvetica", "normal");
      doc.text(`Source Language: ${sourceLang}`, 110, 65);
      doc.text(`Target Language: ${targetLang}`, 110, 70);
      doc.text(`Translation Rate: EUR ${wordRate.toFixed(2)} / word`, 110, 75);

      doc.line(14, 82, 196, 82);

      // Table Header (Documents & Wordcounts)
      doc.setFillColor(248, 245, 237);
      doc.rect(14, 88, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 26, 59);
      doc.text("DOCUMENT FILENAME", 16, 93);
      doc.text("CATEGORY", 95, 93);
      doc.text("STATUS", 140, 93);
      doc.text("WORDS", 175, 93);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      let currentY = 102;

      const translationDocs = clientDocuments;
      translationDocs.forEach((d) => {
        // Document rows
        const displayName = d.name.length > 35 ? d.name.substring(0, 32) + '...' : d.name;
        doc.text(displayName, 16, currentY);
        doc.text(d.category, 95, currentY);
        doc.text(d.status, 140, currentY);
        doc.text(String(client.wordCount || 250), 175, currentY); // fallback
        currentY += 8;
      });

      doc.line(14, currentY, 196, currentY);
      currentY += 8;

      // Payments Breakdown
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 26, 59);
      doc.text("PAYMENT LOG", 14, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);

      const paidPays = allPayments.filter(p => p.clientId === client.id && p.status === 'Paid');
      let totalAmountPaid = 0;

      paidPays.forEach((p, idx) => {
        const desc = idx === 0 ? "Initial Sworn Translation Checkout" : "Additional Add-on Translation Order";
        doc.text(desc, 16, currentY);
        doc.text(`EUR ${Number(p.amount).toFixed(2)}`, 160, currentY);
        totalAmountPaid += Number(p.amount);
        currentY += 7;
      });

      doc.line(14, currentY, 196, currentY);
      currentY += 8;

      // Totals Box
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 26, 59);
      doc.setFontSize(11);
      doc.text("TOTAL AMOUNT PAID (PAID IN FULL):", 85, currentY);
      doc.setTextColor(197, 155, 39); // brand gold
      doc.setFontSize(13);
      doc.text(`EUR ${totalAmountPaid.toFixed(2)}`, 160, currentY);

      currentY += 15;

      // Footer Note
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Thank you for choosing AAA Business Consultancy. This document is a digitally generated copy,", 14, currentY);
      doc.text("validating full clearance of Sworn Translation fees. For support, email client@aaabusinessconsultancy.com.", 14, currentY + 4);

      // Save PDF
      doc.save(`Receipt_Sworn_Translation_${client.firstName}_${client.lastName}.pdf`);
      showAlert("Receipt PDF generated and downloaded successfully!", "success");
    } catch (error) {
      console.error("PDF generation failed:", error);
      showAlert("Failed to generate PDF receipt.", "error");
    }
  };

  useEffect(() => {
    // 1. First check if there is real DB client matching
    if (client && (client.serviceId === 'sworn_translation' || client.serviceId === 'translation' || client.serviceId === 'sworn' || client.serviceType === 'Spanish Sworn Translation')) {
      setIsCalculated(true);

      const clientPayments = allPayments.filter(p => p.clientId === clientId);
      const activePayment = clientPayments[0];

      if (activePayment) {
        setCalcPrice(activePayment.amount);
        setTranslationPaid(activePayment.status === 'Paid');
      }

      if (client.sourceLanguage) {
        setSourceLang(client.sourceLanguage);
      }
      if (client.targetLanguage) {
        setTargetLang(client.targetLanguage);
      }
      if (client.wordCount) {
        setWordCount(client.wordCount);
      }

      // Map client case status to stepper state
      if (client.status === 'Documents Under Review' || client.status === 'Processing') {
        setTranslationStatus('processing');
      } else if (client.status === 'Completed' || client.status === 'Delivered') {
        setTranslationStatus('delivered');
      } else if (activePayment && activePayment.status === 'Paid') {
        setTranslationStatus('processing');
      } else {
        setTranslationStatus('word_calculated');
      }
    } else {
      // 2. Fallback to mock case in localStorage
      const mockCase = JSON.parse(localStorage.getItem('mockTranslationCase') || 'null');
      if (mockCase && mockCase.clientId === clientId) {
        setSourceLang(mockCase.sourceLanguage || 'English');
        setTargetLang(mockCase.targetLanguage || 'Spanish');
        setWordCount(mockCase.wordCount || 250);
        setCalcPrice(mockCase.estimatedPrice || 30);
        setTranslationPaid(mockCase.paid || false);
        setIsCalculated(true);
        setTranslationStatus(mockCase.status || 'processing');
      }
    }
  }, [clientId, client, allPayments]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    const success = queryParams.get('success');
    const sessionId = queryParams.get('session_id');

    if (success === 'true') {
      const verifySession = async () => {
        try {
          if (sessionId && sessionId !== 'mock_session_id') {
            const res = await dbService.verifyCheckoutSession(sessionId);
            if (!res.success) {
              showAlert('Failed to verify payment session with Stripe.', 'error');
              return;
            }
          }

          showAlert('Payment completed! Document Center is now unlocked. 🎉', 'success');

          // Invalidate queries to reload client profile and unlock the UI
          queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['documents'] });

          // Clean URL query parameters
          const cleanUrl = window.location.hash.split('?')[0];
          navigate(cleanUrl, { replace: true });
        } catch (err) {
          console.error('Session verification failed:', err);
          showAlert('Failed to verify payment session.', 'error');
        }
      };
      verifySession();
    }
  }, [clientId, navigate, queryClient]);

  // Mutations
  const uploadDocMutation = useMutation({
    mutationFn: dbService.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      refetchDocs();
      showAlert('Document uploaded successfully! It is now pending review by your Case Manager.', 'success');
    },
    onError: (err) => {
      showAlert(err?.response?.data?.message || 'Upload failed. Please try again.', 'error');
    }
  });

  const saveDependentsMutation = useMutation({
    mutationFn: (deps) => dbService.updateClientDependents(client.id, deps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Family member profiles saved successfully!', 'success');
    },
    onError: (err) => {
      showAlert(err?.message || 'Failed to save family profiles', 'error');
    }
  });

  const handleSaveWizardDeps = () => {
    for (let i = 0; i < wizardDeps.length; i++) {
      const dep = wizardDeps[i];
      if (!dep.firstName.trim() || !dep.lastName.trim() || !dep.passportNumber.trim() || !dep.nationality.trim()) {
        showAlert(`Please fill in all details for Co-Applicant ${i + 1}`, 'warning');
        return;
      }
    }
    saveDependentsMutation.mutate(wizardDeps);
  };

  const bookMeetingMutation = useMutation({
    mutationFn: dbService.bookClientConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Your consultation has been booked successfully!', 'success');
      setSelectedDate('');
      setSelectedTime('');
      setMeetingNotes('');
    }
  });

  const selectAndPayPackageMutation = useMutation({
    mutationFn: async ({ packageId, amount, discount }) => {
      const res = await dbService.createCheckoutSession({
        packageId,
        amount,
        discount,
        paymentMethod: billingPaymentMethod
      });
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error(res.message || 'Failed to initialize payment checkout session');
      }
    },
    onError: (err) => {
      showAlert(err?.message || 'Payment failed. Please try again.', 'error');
    }
  });

  const handleDocUploaded = (docData, belongsTo) => {
    uploadDocMutation.mutate({
      ...docData,
      belongsTo
    });
  };

  const handleLogout = () => {
    showAlert('Successfully logged out.', 'info');
    navigate('/portal/login');
  };

  const handleBookConsultation = () => {
    if (!selectedDate || !selectedTime) {
      showAlert('Please select a date and a time slot.', 'warning');
      return;
    }
    if (!nationality.trim() || !countryOfResidence.trim()) {
      showAlert('Nationality and Country of Residence are required to complete your booking.', 'warning');
      return;
    }
    bookMeetingMutation.mutate({
      clientId: client.id,
      meetingDate: selectedDate,
      meetingTime: selectedTime,
      notes: meetingNotes,
      preferredLanguage: preferredLang,
      nationality: nationality.trim(),
      countryOfResidence: countryOfResidence.trim()
    });
  };

  if ((isClientRole ? isProfileLoading : isClientsLoading) || isDocsLoading || isConsultationsLoading || isPaymentsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Client profile not found.</Typography>
        <Button onClick={() => navigate('/portal/login')}>Go Back to Login</Button>
      </Box>
    );
  }

  // Next 5 working dates helper
  const getNextWorkingDates = () => {
    const dates = [];
    let current = new Date();
    while (dates.length < 5) {
      current.setDate(current.getDate() + 1);
      // Exclude weekends (0: Sunday, 6: Saturday)
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        dates.push({
          val: current.toISOString().split('T')[0],
          label: current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        });
      }
    }
    return dates;
  };

  const bookingDates = getNextWorkingDates();

  // Hourly slots config
  const TIME_SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

  // Check which slots are already booked on selected date
  const getBookedSlotsForDate = (dateVal) => {
    if (!dateVal) return [];
    const agentId = client.assignedConsultantId || 'unassigned';
    return consultations
      .filter(c => c.meetingDate === dateVal && c.assignedConsultantId === agentId && c.status !== 'Cancelled')
      .map(c => c.meetingTime);
  };

  const bookedSlots = getBookedSlotsForDate(selectedDate);

  // Client specific details
  const clientDocuments = documents.filter((d) => d.clientId === client.id);
  const translatedDocs = clientDocuments.filter(d => d.translatedUrl);
  const clientConsultations = consultations.filter((c) => c.leadId === client.id || c.lead?.clientId === client.id);
  const activeConsultation = clientConsultations.find(c => c.status === 'Scheduled' || c.status === 'Pending Assignment');
  const assignedAgent = agents.find(a => a.id === client.assignedConsultantId);

  // Document categories checklist default fallback
  const DEFAULT_CHECKLISTS = {
    dnv: {
      main: ['Passport (Copy)', 'Employment Verification Letter', 'Remote Income Bank Statements', 'Social Security Certificate'],
      spouse: ['Passport (Copy)', 'Marriage Certificate'],
      minorChild: ['Passport (Copy)', 'Birth Certificate', 'School Enrollment Confirmation'],
      adultChild: ['Passport (Copy)', 'Proof of Financial Dependency', 'Clean Criminal Record Certificate'],
      parent: ['Passport (Copy)', 'Proof of Financial Dependency', 'Medical Insurance Certificate'],
      other: ['Passport (Copy)', 'Relationship Verification Certificate']
    },
    nlv: {
      main: ['Passport (Copy)', 'Spanish Health Insurance Policy', 'Clean Criminal Record Certificate', 'Savings Bank Statements'],
      spouse: ['Passport (Copy)', 'Marriage Certificate'],
      minorChild: ['Passport (Copy)', 'Birth Certificate'],
      adultChild: ['Passport (Copy)', 'Proof of Financial Dependency', 'Clean Criminal Record Certificate'],
      parent: ['Passport (Copy)', 'Proof of Financial Dependency', 'Spanish Health Insurance Policy'],
      other: ['Passport (Copy)', 'Relationship Verification Certificate']
    },
    study: {
      main: ['Passport (Copy)', 'Complutense Admission Letter', 'Medical Certificate', 'Sufficient Funds Guarantee'],
      spouse: ['Passport (Copy)', 'Marriage Certificate'],
      minorChild: ['Passport (Copy)', 'Birth Certificate'],
      adultChild: ['Passport (Copy)', 'Proof of Financial Dependency'],
      parent: ['Passport (Copy)', 'Proof of Financial Dependency'],
      other: ['Passport (Copy)']
    },
    property: {
      main: ['Passport (Copy)', 'Property Purchase Escrow Registry', 'Spanish Bank Account Certificate'],
      spouse: ['Passport (Copy)', 'Marriage Certificate'],
      minorChild: ['Passport (Copy)', 'Birth Certificate'],
      adultChild: ['Passport (Copy)', 'Proof of Financial Dependency'],
      parent: ['Passport (Copy)', 'Proof of Financial Dependency'],
      other: ['Passport (Copy)']
    },
    family: {
      main: ['Passport (Copy)', 'Relationship Verification Certificate', 'Sufficient Income Proof'],
      spouse: ['Passport (Copy)', 'Marriage Certificate'],
      minorChild: ['Passport (Copy)', 'Birth Certificate'],
      adultChild: ['Passport (Copy)', 'Proof of Financial Dependency', 'Clean Criminal Record Certificate'],
      parent: ['Passport (Copy)', 'Proof of Financial Dependency', 'Medical Insurance Certificate'],
      other: ['Passport (Copy)', 'Relationship Verification Certificate']
    }
  };

  const getRequiredDocsForPerson = (person) => {
    const checklists = customizationSettings?.documentChecklists || DEFAULT_CHECKLISTS;
    const serviceKey = (client.serviceId || '').toLowerCase();
    const serviceChecklist = checklists[serviceKey] || checklists.dnv || {};

    if (person === 'Main Applicant') {
      return serviceChecklist.main || ['Passport (Copy)'];
    }

    // Parse dependent name
    const match = (client.dependentsDetails || []).find(dep => {
      const depNameString = `${dep.firstName} ${dep.lastName} (${dep.relation})`;
      return depNameString === person;
    });

    if (!match) {
      return serviceChecklist.other || ['Passport (Copy)'];
    }

    const relation = (match.relation || '').toLowerCase();
    const age = parseInt(match.age, 10);

    if (relation === 'spouse') {
      return serviceChecklist.spouse || ['Passport (Copy)', 'Marriage Certificate'];
    }
    if (relation === 'child') {
      const ageThreshold = customizationSettings?.flowAutomationSettings?.adultAgeThreshold || 18;
      if (!isNaN(age) && age >= Number(ageThreshold)) {
        return serviceChecklist.adultChild || ['Passport (Copy)', 'Proof of Financial Dependency', 'Clean Criminal Record Certificate'];
      } else {
        return serviceChecklist.minorChild || ['Passport (Copy)', 'Birth Certificate'];
      }
    }
    if (relation === 'parent') {
      return serviceChecklist.parent || ['Passport (Copy)', 'Proof of Financial Dependency'];
    }
    return serviceChecklist.other || ['Passport (Copy)'];
  };

  // Generate dependent sections
  const applicantsList = [];
  applicantsList.push('Main Applicant');
  const totalCount = getApplicantsCount(client.applicantsCount);
  const totalDependents = totalCount - 1;
  const savedDeps = client.dependentsDetails || [];

  for (let i = 1; i < totalCount; i++) {
    const depData = savedDeps[i - 1];
    if (depData && depData.firstName) {
      applicantsList.push(`${depData.firstName} ${depData.lastName} (${depData.relation})`);
    } else {
      applicantsList.push(`Dependent ${i}`);
    }
  }

  const isRTL = portalLang === 'Arabic' || portalLang === 'Urdu';

  return (
    <Box
      dir={isRTL ? 'rtl' : 'ltr'}
      sx={{
        background: 'radial-gradient(circle at 50% 0%, #FAF6ED 0%, #F8FAFC 100%)',
        minHeight: '100vh',
        py: 4,
        px: { xs: 2, md: 6 },
        textAlign: isRTL ? 'right' : 'left',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          maxWidth: 950,
          mx: 'auto',
          flexDirection: isRTL ? 'row-reverse' : 'row',
          px: 3,
          py: 2,
          borderRadius: 3.5,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 30px rgba(5, 26, 59, 0.03)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #051A3B 0%, #C59B27 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(197, 155, 39, 0.2)'
            }}
          >
            A³
          </Box>
          <Box sx={{ textAlign: isRTL ? 'right' : 'left' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>{t('welcome')}, {client.firstName} {client.lastName}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Secure Relocation & Booking Portal ({client.id})</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={portalLang}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{ borderRadius: 2.5, height: 36, bgcolor: 'background.paper', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <MenuItem value="English">English 🇺🇸</MenuItem>
              <MenuItem value="Arabic">العربية 🇦🇪</MenuItem>
              <MenuItem value="Spanish">Español 🇪🇸</MenuItem>
              <MenuItem value="French">Français 🇫🇷</MenuItem>
              <MenuItem value="German">Deutsch 🇩🇪</MenuItem>
              <MenuItem value="Urdu">Urdu 🇵🇰</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="inherit"
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              color: '#051A3B',
              borderRadius: 2.5,
              '&:hover': { color: '#C59B27', bgcolor: 'transparent' }
            }}
          >
            {t('logout')}
          </Button>
        </Box>
      </Box>

      {/* Spain Hero Banner */}
      <Box
        sx={{
          maxWidth: 950,
          mx: 'auto',
          mb: 4,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          height: { xs: 150, sm: 190 },
          boxShadow: '0 12px 36px rgba(5, 26, 59, 0.06)',
          border: '1px solid rgba(197, 155, 39, 0.15)'
        }}
      >
        <Box
          component="img"
          src={spainSevillePlaza}
          alt="Spain Seville Plaza"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(5, 26, 59, 0.92) 0%, rgba(5, 26, 59, 0.5) 60%, rgba(5, 26, 59, 0.1) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 3, sm: 5 },
            color: 'white',
            textAlign: isRTL ? 'right' : 'left'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: '#E5C058'
            }}
          >
            Your Spain Immigration Journey
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 500, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.825rem' }, lineHeight: 1.5 }}>
            Track your visa application, complete certified sworn translations, upload required compliance documents, and launch your new relocation lifestyle.
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      {!isTranslationClient && (
        <Box sx={{ maxWidth: 950, mx: 'auto', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                backgroundColor: '#C59B27',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab
              label={t('docs_tab')}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.9rem',
                color: tabValue === 0 ? '#C59B27' : 'text.secondary',
                '&.Mui-selected': { color: '#C59B27' }
              }}
            />
            <Tab
              label="2. Visa Packages & Billing"
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.9rem',
                color: tabValue === 1 ? '#C59B27' : 'text.secondary',
                '&.Mui-selected': { color: '#C59B27' }
              }}
            />
            <Tab
              label={client.documentUploadAllowed ? "3. Refund & Guarantee Claims 🛡️" : "3. Refund & Guarantee Claims 🔒"}
              disabled={!client.documentUploadAllowed}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.9rem',
                color: tabValue === 2 ? '#C59B27' : !client.documentUploadAllowed ? 'text.disabled' : 'text.secondary',
                '&.Mui-selected': { color: '#C59B27' }
              }}
            />
          </Tabs>
        </Box>
      )}

      <Box sx={{ maxWidth: 950, mx: 'auto' }}>


        {/* Tab 0: Document Center */}
        {tabValue === 0 && !isTranslationClient && (
          <Box className="grid grid-cols-12 gap-4">
            {/* If package is not paid, show shield lock */}
            {!client.documentUploadAllowed ? (
              <Box className="col-span-12">
                <Paper
                  sx={{
                    p: 6,
                    borderRadius: 4.5,
                    border: '1px solid rgba(197, 155, 39, 0.25)',
                    textAlign: 'center',
                    bgcolor: 'rgba(250, 246, 237, 0.75)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 12px 40px rgba(5, 26, 59, 0.04)'
                  }}
                >
                  <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(197, 155, 39, 0.1)', borderRadius: '50%', mb: 2 }}>
                    <LockIcon sx={{ fontSize: 50, color: '#C59B27' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#051A3B', mb: 1.5, fontFamily: 'Outfit, sans-serif' }}>Document Center is Locked</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4, lineHeight: 1.7, fontWeight: 500 }}>
                    Please complete your visa package payment or wait for administrative approval to unlock your compliance document uploader panel.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setTabValue(1)}
                    sx={{
                      px: 5,
                      py: 1.5,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: '#051A3B',
                      color: 'white',
                      fontFamily: 'Outfit, sans-serif',
                      boxShadow: '0 4px 14px rgba(5, 26, 59, 0.2)',
                      '&:hover': { bgcolor: '#C59B27', boxShadow: '0 4px 14px rgba(197, 155, 39, 0.3)' }
                    }}
                  >
                    Go to Billing & Payments
                  </Button>
                </Paper>
              </Box>
            ) : (
              <Box className="grid grid-cols-12 gap-4 col-span-12">
                {/* Dependents Setup Wizard */}
                {totalDependents > 0 && savedDeps.length < totalDependents && (
                  <Box className="col-span-12" sx={{ mb: 2 }}>
                    <Paper
                      sx={{
                        p: 4,
                        borderRadius: 4.5,
                        border: '1px solid rgba(197, 155, 39, 0.25)',
                        bgcolor: 'rgba(250, 246, 237, 0.65)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 8px 30px rgba(5, 26, 59, 0.03)'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#051A3B', mb: 1, fontFamily: 'Outfit, sans-serif' }}>
                        👨‍👩‍👧‍👦 Complete Your Family Profiles
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                        You have registered <strong>{totalDependents} co-applicant(s)</strong>. Please fill out their profiles to generate their checklists and unlock their document upload folders.
                      </Typography>

                      <Grid container spacing={3}>
                        {wizardDeps.map((dep, idx) => (
                          <Grid item xs={12} key={idx}>
                            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', bgcolor: 'background.paper' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B', mb: 2, fontFamily: 'Outfit, sans-serif' }}>
                                Co-Applicant {idx + 1} Details
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                  <TextField
                                    label="First Name"
                                    size="small"
                                    fullWidth
                                    value={dep.firstName}
                                    onChange={(e) => {
                                      const newDeps = [...wizardDeps];
                                      newDeps[idx].firstName = e.target.value;
                                      setWizardDeps(newDeps);
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <TextField
                                    label="Last Name"
                                    size="small"
                                    fullWidth
                                    value={dep.lastName}
                                    onChange={(e) => {
                                      const newDeps = [...wizardDeps];
                                      newDeps[idx].lastName = e.target.value;
                                      setWizardDeps(newDeps);
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                  <FormControl size="small" fullWidth>
                                    <InputLabel>Relationship</InputLabel>
                                    <Select
                                      value={dep.relation}
                                      label="Relationship"
                                      onChange={(e) => {
                                        const newDeps = [...wizardDeps];
                                        newDeps[idx].relation = e.target.value;
                                        setWizardDeps(newDeps);
                                      }}
                                    >
                                      <MenuItem value="Spouse">Spouse</MenuItem>
                                      <MenuItem value="Child">Child</MenuItem>
                                      <MenuItem value="Parent">Parent</MenuItem>
                                      <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                  <TextField
                                    label="Passport Number"
                                    size="small"
                                    fullWidth
                                    value={dep.passportNumber}
                                    onChange={(e) => {
                                      const newDeps = [...wizardDeps];
                                      newDeps[idx].passportNumber = e.target.value;
                                      setWizardDeps(newDeps);
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                  <TextField
                                    label="Nationality"
                                    size="small"
                                    fullWidth
                                    value={dep.nationality}
                                    onChange={(e) => {
                                      const newDeps = [...wizardDeps];
                                      newDeps[idx].nationality = e.target.value;
                                      setWizardDeps(newDeps);
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>
                        ))}

                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            onClick={handleSaveWizardDeps}
                            disabled={saveDependentsMutation.isPending}
                            sx={{
                              px: 4,
                              py: 1.2,
                              borderRadius: 2,
                              fontWeight: 800,
                              bgcolor: '#051A3B',
                              color: 'white',
                              fontFamily: 'Outfit, sans-serif',
                              textTransform: 'none',
                              '&:hover': { bgcolor: '#C59B27' }
                            }}
                          >
                            {saveDependentsMutation.isPending ? 'Saving Profiles...' : 'Save Family Profiles'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                )}
                {/* Checklist guide */}
                <Box className="col-span-12 lg:col-span-4">
                  <Paper
                    sx={{
                      p: 3.5,
                      borderRadius: 4,
                      border: '1px solid rgba(197, 155, 39, 0.2)',
                      boxShadow: '0 6px 20px rgba(5, 26, 59, 0.02)',
                      height: '100%',
                      bgcolor: '#FAF6ED'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>{t('checklist_title')}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 500 }}>
                      {t('checklist_desc')}
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: 'rgba(197, 155, 39, 0.15)' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, fontWeight: 500 }}>
                      {t('upload_required')}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      {applicantsList.map((person) => {
                        const personDocs = clientDocuments.filter(d => d.belongsTo === person || (!d.belongsTo && person === 'Main Applicant'));
                        const docsNeeded = getRequiredDocsForPerson(person);

                        return (
                          <Box key={person} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                              📁 {person === 'Main Applicant' ? `${person} (${client.firstName})` : person}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pl: isRTL ? 0 : 2, pr: isRTL ? 2 : 0 }}>
                              {docsNeeded.map((cat, idx) => {
                                const isUploaded = personDocs.some(d => d.category === cat);
                                return (
                                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <CheckCircleIcon sx={{ fontSize: 18, color: isUploaded ? '#10B981' : '#CBD5E1' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: isUploaded ? '#051A3B' : 'text.secondary', fontSize: '0.78rem' }}>
                                      {cat}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                </Box>

                {/* Uploaders */}
                <Box className="col-span-12 lg:col-span-8">
                  <Paper
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      border: '1px solid rgba(5, 26, 59, 0.08)',
                      boxShadow: '0 6px 20px rgba(5, 26, 59, 0.02)',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>Category Document Uploaders</Typography>

                    {/* Dependent wise accordions */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {applicantsList.map((person, index) => {
                        const personDocs = clientDocuments.filter(d => d.belongsTo === person || (!d.belongsTo && person === 'Main Applicant'));
                        const docsNeeded = getRequiredDocsForPerson(person);
                        return (
                          <Accordion
                            key={person}
                            defaultExpanded={index === 0}
                            sx={{
                              border: '1px solid rgba(5, 26, 59, 0.08)',
                              borderRadius: '16px !important',
                              boxShadow: 'none',
                              overflow: 'hidden',
                              '&:before': { display: 'none' },
                              '&.Mui-expanded': { border: '1px solid rgba(197, 155, 39, 0.25)' }
                            }}
                          >
                            <AccordionSummary expandMoreIcon={<ExpandMoreIcon sx={{ color: '#051A3B' }} />}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5, color: '#051A3B', fontFamily: 'Outfit, sans-serif', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                📁 {person === 'Main Applicant' ? `${person} (${client.firstName} ${client.lastName})` : person}
                                <Chip label={`${personDocs.length} files`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(197, 155, 39, 0.1)', color: '#A37E1C', border: '1px solid rgba(197, 155, 39, 0.2)' }} />
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3, textAlign: isRTL ? 'right' : 'left', bgcolor: 'rgba(250, 246, 237, 0.2)' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 500 }}>
                                Upload files specifically belonging to **{person}**. Required files include: {docsNeeded.join(', ')}.
                              </Typography>

                              <FileUploader
                                onUpload={(docData) => handleDocUploaded(docData, person)}
                                clientId={client.id}
                                clientName={`${client.firstName} ${client.lastName}`}
                                categories={docsNeeded}
                              />

                              <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

                              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>Files uploaded for {person}:</Typography>
                              {personDocs.length === 0 ? (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 2, fontStyle: 'italic' }}>No files uploaded yet for this applicant.</Typography>
                              ) : (
                                <List disablePadding>
                                  {personDocs.map((doc) => {
                                    const isApproved = doc.status === 'Approved';
                                    return (
                                      <Paper
                                        key={doc.id}
                                        sx={{
                                          p: 2,
                                          mb: 1.5,
                                          border: '1px solid',
                                          borderColor: isApproved ? '#A7F3D0' : 'rgba(0,0,0,0.06)',
                                          borderRadius: 3,
                                          boxShadow: 'none',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          bgcolor: isApproved ? '#ECFDF5' : 'background.paper',
                                          flexDirection: isRTL ? 'row-reverse' : 'row'
                                        }}
                                      >
                                        <Box sx={{ textAlign: isRTL ? 'right' : 'left' }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B' }}>{doc.name || doc.fileName}</Typography>
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                                            Category: {doc.category} | Uploaded on: {doc.uploadedDate ? new Date(doc.uploadedDate).toLocaleDateString() : 'Recently'}
                                          </Typography>
                                          {doc.comment && (
                                            <Typography variant="body2" sx={{ mt: 0.5, color: isApproved ? '#047857' : '#B91C1C', fontStyle: 'italic', fontSize: '0.75rem', fontWeight: 500 }}>
                                              Note: {doc.comment}
                                            </Typography>
                                          )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                          <StatusBadge status={doc.status} />
                                        </Box>
                                      </Paper>
                                    );
                                  })}
                                </List>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: Sworn Translation Calculator */}
        {tabValue === 1 && (client.serviceId === 'sworn_translation' || client.serviceId === 'translation' || client.serviceId === 'sworn' || client.serviceType === 'Spanish Sworn Translation') && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                border: '1px solid rgba(5, 26, 59, 0.08)',
                boxShadow: '0 6px 20px rgba(5, 26, 59, 0.02)',
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>{t('calculator_title')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                {t('calculator_desc')}
              </Typography>

              <Grid container spacing={3} sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                {/* Inputs Panel */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel id="source-lang-select-label">{t('select_source_lang')}</InputLabel>
                      <Select
                        labelId="source-lang-select-label"
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        label={t('select_source_lang')}
                        disabled={translationPaid}
                        sx={{ borderRadius: 2.5 }}
                      >
                        {['English', 'Arabic', 'Urdu'].map((name) => (
                          <MenuItem key={name} value={name}>
                            {name} (€{getRateForLang(name).toFixed(2)} / word)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel id="target-lang-select-label">{t('select_target_lang')}</InputLabel>
                      <Select
                        labelId="target-lang-select-label"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        label={t('select_target_lang')}
                        disabled={translationPaid}
                        sx={{ borderRadius: 2.5 }}
                      >
                        <MenuItem value="Spanish">Spanish (Español) 🇪🇸</MenuItem>
                        <MenuItem value="English">English 🇺🇸</MenuItem>
                        <MenuItem value="Arabic">Arabic (العربية) 🇦🇪</MenuItem>
                        <MenuItem value="French">French (Français) 🇫🇷</MenuItem>
                        <MenuItem value="German">German (Deutsch) 🇩🇪</MenuItem>
                        <MenuItem value="Urdu">Urdu (اردو) 🇵🇰</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label={t('word_count')}
                      type="number"
                      value={wordCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val)) {
                          setWordCount('');
                        } else {
                          setWordCount(val);
                        }
                      }}
                      placeholder="e.g. 500"
                      fullWidth
                      disabled={translationPaid}
                      error={wordCount !== '' && wordCount <= 0}
                      helperText={wordCount !== '' && wordCount <= 0 ? "Word count must be greater than 0" : (translationPaid ? "Paid Order Configuration (Locked)" : "Please count the words in your target documents manually or upload a PDF for automatic word analysis.")}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                    />

                    {!translationPaid && (
                      <Box
                        sx={{
                          p: 2.5,
                          bgcolor: '#FAF6ED',
                          borderRadius: 3.5,
                          border: '1px dashed rgba(197, 155, 39, 0.3)',
                          textAlign: isRTL ? 'right' : 'left'
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>{t('upload_targets')}</Typography>
                        <FileUploader
                          onUpload={(file) => {
                            setTranslationFiles(prev => [...prev, file]);
                            showAlert('File uploaded successfully for sworn translation analysis!', 'success');
                          }}
                          clientId={client.id}
                          clientName={`${client.firstName} ${client.lastName}`}
                        />
                        {translationFiles.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>UPLOADED FILES:</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                              {translationFiles.map((file, idx) => (
                                <Paper key={idx} sx={{ p: 1, px: 2, bgcolor: 'background.paper', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row', borderRadius: 2 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#051A3B' }}>{file.name || `document_${idx + 1}.pdf`}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{file.size ? `${(file.size / 1024).toFixed(1)} KB` : '182 KB'}</Typography>
                                </Paper>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}

                    {!translationPaid && (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                          const total = wordCount * wordRate;
                          setCalcPrice(parseFloat(total.toFixed(2)));
                          setIsCalculated(true);
                          setTranslationStatus('word_calculated');
                          showAlert('Price calculated successfully!', 'success');
                        }}
                        disabled={!wordCount || wordCount <= 0}
                        sx={{
                          py: 1.5,
                          borderRadius: 2.5,
                          fontWeight: 800,
                          textTransform: 'none',
                          bgcolor: '#051A3B',
                          color: 'white',
                          fontFamily: 'Outfit, sans-serif',
                          boxShadow: '0 4px 14px rgba(5, 26, 59, 0.2)',
                          '&:hover': { bgcolor: '#C59B27', boxShadow: '0 4px 14px rgba(197, 155, 39, 0.3)' }
                        }}
                      >
                        {t('calculate_price')}
                      </Button>
                    )}
                  </Box>

                  {/* Documents list & Addon panel */}
                  {(() => {
                    const translationInputDocs = clientDocuments;
                    return (
                      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* 1. Paid Documents List */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B', mb: 1.5, fontFamily: 'Outfit, sans-serif' }}>
                            📄 Documents Uploaded for Translation:
                          </Typography>
                          {translationInputDocs.length === 0 ? (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', py: 1 }}>
                              No documents uploaded yet.
                            </Typography>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {translationInputDocs.map((doc) => (
                                <Paper
                                  key={doc.id}
                                  sx={{
                                    p: 1.8,
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    borderRadius: 2.5,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    bgcolor: 'background.paper',
                                    boxShadow: 'none'
                                  }}
                                  className="flex-col sm:flex-row gap-3"
                                >
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#051A3B', fontSize: '0.85rem' }}>
                                      {doc.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mt: 0.2 }}>
                                      Category: {doc.category} | Size: {doc.size || 'N/A'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Chip
                                      label={doc.status}
                                      size="small"
                                      sx={{
                                        fontWeight: 800,
                                        height: 20,
                                        fontSize: '0.65rem',
                                        bgcolor: doc.status === 'Translated' || doc.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        color: doc.status === 'Translated' || doc.status === 'Approved' ? '#10B981' : '#F59E0B',
                                        border: `1px solid ${doc.status === 'Translated' || doc.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                      }}
                                    />
                                  </Box>
                                </Paper>
                              ))}
                            </Box>
                          )}
                        </Box>

                        {/* 2. Add-on Upload Panel */}
                        {translationPaid && (
                          <Paper sx={{ p: 3, border: '1px dashed rgba(197, 155, 39, 0.3)', bgcolor: 'rgba(250, 246, 237, 0.25)', borderRadius: 3.5, boxShadow: 'none' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#051A3B', mb: 0.5, fontFamily: 'Outfit, sans-serif' }}>
                              ➕ Order Additional Translations
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 500, lineHeight: 1.4 }}>
                              Need to translate more documents? Select your language pair, upload your file, select a document category, and type the word count to check out instantly.
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <FormControl size="small" fullWidth>
                                <InputLabel>Source Language</InputLabel>
                                <Select
                                  value={addonSourceLang}
                                  onChange={(e) => setAddonSourceLang(e.target.value)}
                                  label="Source Language"
                                  sx={{ borderRadius: 2 }}
                                >
                                  {['English', 'Arabic', 'Urdu'].map((name) => (
                                    <MenuItem key={name} value={name}>
                                      {name} (€{getRateForLang(name).toFixed(2)} / word)
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              <FormControl size="small" fullWidth>
                                <InputLabel>Target Language</InputLabel>
                                <Select
                                  value={addonTargetLang}
                                  onChange={(e) => setAddonTargetLang(e.target.value)}
                                  label="Target Language"
                                  sx={{ borderRadius: 2 }}
                                >
                                  <MenuItem value="Spanish">Spanish (Español) 🇪🇸</MenuItem>
                                  <MenuItem value="English">English 🇺🇸</MenuItem>
                                  <MenuItem value="Arabic">Arabic (العربية) 🇦🇪</MenuItem>
                                  <MenuItem value="French">French (Français) 🇫🇷</MenuItem>
                                  <MenuItem value="German">German (Deutsch) 🇩🇪</MenuItem>
                                  <MenuItem value="Urdu">Urdu (اردو) 🇵🇰</MenuItem>
                                </Select>
                              </FormControl>

                              {/* File drag-and-drop zone */}
                              <Box
                                onClick={() => document.getElementById('portal-addon-file').click()}
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    setAddonFile(e.dataTransfer.files[0]);
                                  }
                                }}
                                sx={{
                                  border: '2px dashed rgba(197, 155, 39, 0.25)',
                                  borderRadius: 2,
                                  p: 3,
                                  textAlign: 'center',
                                  bgcolor: 'background.paper',
                                  cursor: 'pointer',
                                  transition: 'border-color 0.2s',
                                  '&:hover': { borderColor: '#C59B27' }
                                }}
                              >
                                <input
                                  id="portal-addon-file"
                                  type="file"
                                  accept="application/pdf"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setAddonFile(e.target.files[0]);
                                    }
                                  }}
                                  style={{ display: 'none' }}
                                />
                                <Typography variant="body2" sx={{ fontSize: '24px', mb: 0.5 }}>📁</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#C59B27', fontSize: '0.8rem' }}>
                                  {addonFile ? `📄 ${addonFile.name} (${(addonFile.size / 1024).toFixed(1)} KB)` : 'Drag & drop your file here, or click to browse'}
                                </Typography>
                              </Box>

                              {/* Selected file configuration area */}
                              {addonFile && (
                                <Paper
                                  sx={{
                                    p: 2.2,
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    borderRadius: 2.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    boxShadow: 'none'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#051A3B', fontSize: '0.85rem' }}>
                                        {addonFile.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {(addonFile.size / 1024).toFixed(1)} KB
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      size="small"
                                      onClick={() => setAddonFile(null)}
                                      sx={{ color: 'text.secondary' }}
                                    >
                                      ✕
                                    </IconButton>
                                  </Box>

                                  <FormControl size="small" fullWidth>
                                    <InputLabel>Document Category</InputLabel>
                                    <Select
                                      value={addonCategory}
                                      onChange={(e) => setAddonCategory(e.target.value)}
                                      label="Document Category"
                                    >
                                      <MenuItem value="Passport">Passport</MenuItem>
                                      <MenuItem value="Birth Certificate">Birth Certificate</MenuItem>
                                      <MenuItem value="Marriage Certificate">Marriage Certificate</MenuItem>
                                      <MenuItem value="Criminal Record Certificate">Criminal Record Certificate</MenuItem>
                                      <MenuItem value="Academic Transcript / Diploma">Academic Transcript / Diploma</MenuItem>
                                      <MenuItem value="Bank Statement">Bank Statement</MenuItem>
                                      <MenuItem value="Other">Other (specify below)</MenuItem>
                                    </Select>
                                  </FormControl>

                                  {addonCategory === 'Other' && (
                                    <TextField
                                      label="Specify Category"
                                      size="small"
                                      value={addonCustomCategory}
                                      onChange={(e) => setAddonCustomCategory(e.target.value)}
                                      fullWidth
                                    />
                                  )}

                                  <TextField
                                    label="Word Count"
                                    type="number"
                                    size="small"
                                    value={addonWordCount}
                                    onChange={(e) => setAddonWordCount(parseInt(e.target.value, 10) || 0)}
                                    fullWidth
                                  />
                                </Paper>
                              )}

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontSize: '0.85rem' }}>
                                  Add-on Fee:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#C59B27', fontFamily: 'Outfit, sans-serif' }}>
                                  €{addonCalcPrice.toFixed(2)}
                                </Typography>
                              </Box>

                              <Button
                                variant="contained"
                                onClick={handlePayAddon}
                                disabled={!addonFile || addonCalcPrice <= 0 || addonLoading}
                                fullWidth
                                sx={{
                                  py: 1.25,
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  bgcolor: '#051A3B',
                                  color: 'white',
                                  borderRadius: 2,
                                  fontFamily: 'Outfit, sans-serif',
                                  '&:hover': { bgcolor: '#C59B27' }
                                }}
                              >
                                {addonLoading ? 'Processing Checkout...' : '💳 Pay & Upload Additional'}
                              </Button>
                            </Box>
                          </Paper>
                        )}
                      </Box>
                    );
                  })()}
                </Grid>

                {/* Pricing Box & Progress */}
                <Grid item xs={12} md={5}>
                  <Paper
                    sx={{
                      p: 3.5,
                      border: '1px solid rgba(197, 155, 39, 0.2)',
                      boxShadow: '0 6px 20px rgba(5, 26, 59, 0.02)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      bgcolor: '#FAF6ED',
                      borderRadius: 4,
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Translation Summary</Typography>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(197, 155, 39, 0.15)' }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Translation Route:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B' }}>{sourceLang} to {targetLang}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Word Rate:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B' }}>€{wordRate.toFixed(2)} / word</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Total Words:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B' }}>{wordCount} Words</Typography>
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: 'rgba(197, 155, 39, 0.15)' }} />

                      {translationPaid ? (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                            Payments History
                          </Typography>
                          {allPayments.filter(p => p.clientId === client.id && p.status === 'Paid').map((p, idx) => (
                            <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                              <Typography variant="body2" color="text.secondary">
                                {idx === 0 ? 'Initial Checkout:' : `Add-on Payment:`}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#051A3B' }}>
                                €{Number(p.amount).toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                          <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#051A3B' }}>Grand Total Paid:</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#C59B27', fontFamily: 'Outfit, sans-serif' }}>
                              €{allPayments.filter(p => p.clientId === client.id && p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>Total Final Price:</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: '#C59B27', fontFamily: 'Outfit, sans-serif' }}>€{calcPrice.toFixed(2)}</Typography>
                        </Box>
                      )}

                      {/* Timeline status track */}
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mt: 2, display: 'block' }}>Translation Lifecycle Status</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                          <CheckCircleIcon color={isCalculated ? 'success' : 'disabled'} sx={{ fontSize: '1.25rem' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: isCalculated ? 'text.primary' : 'text.disabled' }}>1. Price Quoted & Verified</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                          <CheckCircleIcon color={translationPaid ? 'success' : 'disabled'} sx={{ fontSize: '1.25rem' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: translationPaid ? 'text.primary' : 'text.disabled' }}>2. Payment Processed</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                          <CheckCircleIcon color={translationStatus === 'processing' || translationStatus === 'completed' || translationStatus === 'delivered' ? 'success' : 'disabled'} sx={{ fontSize: '1.25rem' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: (translationStatus === 'processing' || translationStatus === 'completed' || translationStatus === 'delivered') ? 'text.primary' : 'text.disabled' }}>3. In Process (Sworn Translators Assigned)</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                          <CheckCircleIcon color={translationStatus === 'delivered' ? 'success' : 'disabled'} sx={{ fontSize: '1.25rem' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: translationStatus === 'delivered' ? 'text.primary' : 'text.disabled' }}>4. Certified PDF Sworn File Delivered</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      {translationPaid ? (
                        <Box>
                          <Chip label="Payment Verified" color="success" sx={{ py: 1.25, fontSize: '0.975rem', fontWeight: 800, mb: 1.5, width: '100%', borderRadius: 2.5 }} />
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleDownloadReceipt}
                            sx={{
                              py: 1.2,
                              borderRadius: 2.5,
                              fontWeight: 800,
                              textTransform: 'none',
                              borderColor: '#C59B27',
                              color: '#C59B27',
                              mb: 1.5,
                              fontFamily: 'Outfit, sans-serif',
                              '&:hover': { borderColor: '#051A3B', color: '#051A3B' }
                            }}
                          >
                            📥 Download Detailed Receipt (PDF)
                          </Button>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={(e) => {
                              if (translatedDocs.length === 0) {
                                showAlert('Your documents are not verified yet / translation is in progress.', 'warning');
                              } else {
                                setDownloadMenuAnchor(e.currentTarget);
                              }
                            }}
                            sx={{
                              py: 1.5,
                              borderRadius: 2.5,
                              fontWeight: 800,
                              textTransform: 'none',
                              bgcolor: translatedDocs.length > 0 ? '#10B981' : 'rgba(16, 185, 129, 0.4)',
                              color: 'white',
                              fontFamily: 'Outfit, sans-serif',
                              '&:hover': {
                                bgcolor: translatedDocs.length > 0 ? '#059669' : 'rgba(16, 185, 129, 0.4)'
                              }
                            }}
                          >
                            Download Sworn Translation PDF
                          </Button>

                          <Menu
                            anchorEl={downloadMenuAnchor}
                            open={Boolean(downloadMenuAnchor)}
                            onClose={() => setDownloadMenuAnchor(null)}
                            sx={{
                              '& .MuiPaper-root': {
                                borderRadius: 2.5,
                                mt: 1,
                                width: downloadMenuAnchor ? downloadMenuAnchor.clientWidth : 220,
                                maxWidth: '100%',
                                boxShadow: '0 8px 24px rgba(5, 26, 59, 0.1)',
                                border: '1px solid rgba(0,0,0,0.06)'
                              }
                            }}
                          >
                            {translatedDocs.map((doc) => {
                              const fileUrl = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${doc.translatedUrl}`;
                              return (
                                <MenuItem
                                  key={doc.id}
                                  onClick={async () => {
                                    setDownloadMenuAnchor(null);
                                    try {
                                      showAlert(`Downloading ${doc.name}...`, 'info');
                                      const response = await fetch(fileUrl);
                                      if (!response.ok) throw new Error('Network response was not ok');
                                      const blob = await response.blob();
                                      const blobUrl = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = blobUrl;
                                      // Append .pdf extension if not present in the name
                                      const cleanName = doc.name.toLowerCase().endsWith('.pdf') ? doc.name : `${doc.name}.pdf`;
                                      link.download = `Translated_${cleanName}`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(blobUrl);
                                      showAlert('Download complete!', 'success');
                                    } catch (error) {
                                      console.error('Direct download failed:', error);
                                      showAlert('Direct download failed. Opening file in new tab instead.', 'error');
                                      window.open(fileUrl, '_blank');
                                    }
                                  }}
                                  sx={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    color: '#051A3B',
                                    py: 1.2,
                                    whiteSpace: 'normal',
                                    '&:hover': { bgcolor: 'rgba(197, 155, 39, 0.08)', color: '#C59B27' }
                                  }}
                                >
                                  📥 {doc.name.length > 25 ? doc.name.substring(0, 22) + '...' : doc.name} (Translated)
                                </MenuItem>
                              );
                            })}
                          </Menu>
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          disabled={!isCalculated}
                          onClick={() => setPaymentModalOpen(true)}
                          sx={{
                            py: 1.5,
                            borderRadius: 2.5,
                            fontWeight: 800,
                            textTransform: 'none',
                            bgcolor: '#051A3B',
                            color: 'white',
                            fontFamily: 'Outfit, sans-serif',
                            boxShadow: '0 4px 14px rgba(5, 26, 59, 0.2)',
                            '&:hover': { bgcolor: '#C59B27', boxShadow: '0 4px 14px rgba(197, 155, 39, 0.3)' }
                          }}
                        >
                          {t('proceed_payment')}
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {tabValue === 1 && client && client.serviceId !== 'sworn_translation' && client.serviceId !== 'translation' && client.serviceId !== 'sworn' && client.serviceType !== 'Spanish Sworn Translation' && (() => {
          const getApplicantsCount = (countStr) => {
            if (!countStr || countStr === 'Main Only') return 1;
            const numericVal = parseInt(countStr, 10);
            if (!isNaN(numericVal) && String(numericVal) === countStr.trim()) {
              return numericVal;
            }
            const match = countStr.match(/Main\s*\+\s*(\d+)/i);
            if (match) {
              return 1 + parseInt(match[1], 10);
            }
            return 1;
          };

          const totalApplicants = getApplicantsCount(client.applicantsCount);
          const addApplicants = totalApplicants - 1;

          // Check for €250 assessment credit in the last 14 days
          const paidAssessment = allPayments.find(p =>
            p.clientId === client.id &&
            p.status === 'Paid' &&
            p.amount === 262.50 &&
            (new Date() - new Date(p.createdAt)) < 14 * 24 * 60 * 60 * 1000
          );
          const assessmentCredit = paidAssessment ? 250 : 0;

          // Option A: Full Processing (base €3500, additional €500)
          const optionAPrice = 3500 + (addApplicants * 500);

          // Option B: Premium (base €4750, additional €750)
          const optionBPrice = 4750 + (addApplicants * 750);
          const optionBDiscount = 0;

          // Option C: Administrative Relocation (base €1750, additional €500)
          const optionCPrice = 1750 + (addApplicants * 500);

          // Tourist Schengen Visa (base €500, additional €250)
          const schengenPrice = 500 + (addApplicants * 250);

          const baseServicePrice = optionAPrice;

          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {client.documentUploadAllowed ? (
                <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'success.main', bgcolor: '#F0FDF4', boxShadow: 'none', textAlign: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>Visa Relocation Package Active & Paid</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                    Your visa relocation package payment has been verified. You can now access your document checklist and upload your files under the <strong>Document Center</strong> tab.
                  </Typography>
                  <Button variant="contained" onClick={() => setTabValue(0)} sx={{ px: 4, py: 1.25, borderRadius: 2.5, fontWeight: 700, textTransform: 'none', bgcolor: '#051A3B', color: 'white', '&:hover': { bgcolor: '#C59B27' } }}>
                    Go to Document Center
                  </Button>
                </Paper>
              ) : (
                <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Visa Packages & Billing Hub</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Please select your preferred relocation package below to initiate checkout and unlock your document checklists.
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Select Relocation Package</Typography>

                      {client.serviceId === 'tourism' || client.serviceId === 'tourist' ? (
                        <Card sx={{ border: '2px solid', borderColor: 'secondary.main', bgcolor: 'rgba(20, 184, 166, 0.02)', borderRadius: 3, cursor: 'pointer' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Schengen Tourist Visa Package</Typography>
                              <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 800 }}>€400</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Complete Schengen guidance, invitation preparation, checklist review, and embassy appointment scheduling.
                            </Typography>
                            <Chip label="Selected Package" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                          </CardContent>
                        </Card>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          <Card
                            onClick={() => setSelectedPackage('full_process')}
                            sx={{
                              border: selectedPackage === 'full_process' ? '2px solid' : '1px solid',
                              borderColor: selectedPackage === 'full_process' ? 'secondary.main' : 'divider',
                              bgcolor: selectedPackage === 'full_process' ? 'rgba(20, 184, 166, 0.02)' : 'background.paper',
                              borderRadius: 3,
                              cursor: 'pointer',
                              boxShadow: 'none'
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>OPTION A: FULL PROCESSING PACKAGE</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {assessmentCredit > 0 && (
                                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 500 }}>€{optionAPrice}</Typography>
                                  )}
                                  <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 800 }}>€{optionAPrice - assessmentCredit}</Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Complete professional end-to-end support for Spain Residency applications from eligibility to submission.
                              </Typography>
                              {selectedPackage === 'full_process' && (
                                <Chip label="Selected" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                              )}
                            </CardContent>
                          </Card>

                          <Card
                            onClick={() => setSelectedPackage('premium')}
                            sx={{
                              border: selectedPackage === 'premium' ? '2px solid' : '1px solid',
                              borderColor: selectedPackage === 'premium' ? 'secondary.main' : 'divider',
                              bgcolor: selectedPackage === 'premium' ? 'rgba(20, 184, 166, 0.02)' : 'background.paper',
                              borderRadius: 3,
                              cursor: 'pointer',
                              boxShadow: 'none'
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>OPTION B: PREMIUM PACKAGE</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {assessmentCredit > 0 && (
                                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 500 }}>€{optionBPrice}</Typography>
                                  )}
                                  <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 800 }}>€{optionBPrice - assessmentCredit}</Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Everything in Full Process + complete relocation administrative assistance (NIE/TIE fingerprint appointments, empadronamiento local registration, Social Security, Spanish Bank setup).
                              </Typography>
                              {selectedPackage === 'premium' && (
                                <Chip label="Selected" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                              )}
                            </CardContent>
                          </Card>

                          <Card
                            onClick={() => setSelectedPackage('relocation')}
                            sx={{
                              border: selectedPackage === 'relocation' ? '2px solid' : '1px solid',
                              borderColor: selectedPackage === 'relocation' ? 'secondary.main' : 'divider',
                              bgcolor: selectedPackage === 'relocation' ? 'rgba(20, 184, 166, 0.02)' : 'background.paper',
                              borderRadius: 3,
                              cursor: 'pointer',
                              boxShadow: 'none'
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>OPTION C: ADMINISTRATIVE RELOCATION PACKAGE</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {assessmentCredit > 0 && (
                                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 500 }}>€{optionCPrice}</Typography>
                                  )}
                                  <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 800 }}>€{optionCPrice - assessmentCredit}</Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Post-approval administrative relocation support for clients who already have their visa approved and need settlement help in Spain.
                              </Typography>
                              {selectedPackage === 'relocation' && (
                                <Chip label="Selected" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: '#F9FAFB' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Summary</Typography>
                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {/* Correct, clean calculations */}
                          {(() => {
                            const baseFee = 
                              client.serviceId === 'tourism' || client.serviceId === 'tourist' 
                                ? schengenPrice 
                                : (selectedPackage === 'relocation' ? optionCPrice : optionAPrice);

                            const premiumAddon = 
                              selectedPackage === 'premium' && client.serviceId !== 'tourism' && client.serviceId !== 'tourist'
                                ? optionBPrice - optionAPrice 
                                : 0;

                            const isDeductible = ['full_process', 'premium', 'relocation'].includes(selectedPackage);
                            const activeCredit = isDeductible ? assessmentCredit : 0;
                            
                            const subtotalBeforeVat = Math.max(0, baseFee + premiumAddon - activeCredit);
                            const calculatedVat = subtotalBeforeVat * 0.05;
                            const calculatedTotal = subtotalBeforeVat * 1.05;

                            return (
                              <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Base Relocation Fee:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>€{baseFee}</Typography>
                                </Box>

                                {premiumAddon > 0 && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Relocation Add-on:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>+€{premiumAddon}</Typography>
                                  </Box>
                                )}

                                {activeCredit > 0 && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                                    <Typography variant="body2" color="inherit">Assessment Fee Credit:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontWeight: 700 }}>-€{activeCredit}.00</Typography>
                                  </Box>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">VAT (5%):</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    €{calculatedVat.toFixed(2)}
                                  </Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Payable Total:</Typography>
                                  <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 900 }}>
                                    €{calculatedTotal.toFixed(2)}
                                  </Typography>
                                </Box>
                              </>
                            );
                          })()}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>Payment Provider</Typography>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={billingPaymentMethod}
                          onChange={(e) => setBillingPaymentMethod(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="card">Credit Card (Visa/Mastercard) 💳</MenuItem>
                          <MenuItem value="apple">Apple Pay / Google Pay 📱</MenuItem>
                          <MenuItem value="wallet">Link Wallet Selector 💼</MenuItem>
                          <MenuItem value="tabby">Tabby installment (UAE Only)</MenuItem>
                          <MenuItem value="tamara">Tamara installment (UAE Only)</MenuItem>
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}>
                          <input
                            type="checkbox"
                            id="billing-tc-checkbox"
                            checked={billingTermsChecked}
                            onChange={(e) => setBillingTermsChecked(e.target.checked)}
                            style={{ marginTop: 3, transform: 'scale(1.1)', cursor: 'pointer' }}
                          />
                          <label htmlFor="billing-tc-checkbox" style={{ fontSize: '0.75rem', color: '#6B7280', cursor: 'pointer', lineHeight: 1.3, fontWeight: 500 }}>
                            I agree to Spain Visa Terms of Service, <strong>50% Refund Guarantee</strong> policies if refused, and relocation conditions.
                          </label>
                        </Box>

                        <Button
                          variant="contained"
                          fullWidth
                          disabled={selectAndPayPackageMutation.isPending}
                          onClick={() => {
                            if (!billingTermsChecked) {
                              showAlert('You must accept the terms and refund policy to check out.', 'warning');
                              return;
                            }
                            
                            const baseFee = 
                              client.serviceId === 'tourism' || client.serviceId === 'tourist' 
                                ? schengenPrice 
                                : (selectedPackage === 'relocation' ? optionCPrice : optionAPrice);

                            const premiumAddon = 
                              selectedPackage === 'premium' && client.serviceId !== 'tourism' && client.serviceId !== 'tourist'
                                ? optionBPrice - optionAPrice 
                                : 0;

                            const isDeductible = ['full_process', 'premium', 'relocation'].includes(selectedPackage);
                            const activeCredit = isDeductible ? assessmentCredit : 0;
                            const finalAmount = Math.max(0, baseFee + premiumAddon - activeCredit);
                            const finalDiscount = 0;

                            selectAndPayPackageMutation.mutate({
                              packageId: selectedPackage,
                              amount: finalAmount,
                              discount: finalDiscount
                            });
                          }}
                          sx={{
                            py: 1.5,
                            borderRadius: 2.5,
                            fontWeight: 800,
                            textTransform: 'none',
                            bgcolor: '#051A3B',
                            color: 'white',
                            fontFamily: 'Outfit, sans-serif',
                            boxShadow: '0 4px 14px rgba(5, 26, 59, 0.2)',
                            '&:hover': { bgcolor: '#C59B27', boxShadow: '0 4px 14px rgba(197, 155, 39, 0.3)' }
                          }}
                        >
                          Authorize Secure Checkout
                        </Button>

                        <Box sx={{ mt: 2, p: 1.5, border: '1px solid rgba(197,155,39,0.3)', bgcolor: '#FAF6ED', borderRadius: 2.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#A37E1C', display: 'block', mb: 0.5 }}>⚠️ REFUND GUARANTEE TERMS</Typography>
                          <Typography variant="caption" sx={{ color: '#A37E1C', display: 'block', fontSize: '0.68rem', lineHeight: 1.3, fontWeight: 500 }}>
                            If your visa application gets refused by the consulate, you are entitled to a 50% refund under company refund rules.
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Box>
          );
        })()}

        {/* Tab 2: Refund & Guarantee Claims */}
        {tabValue === 2 && !isTranslationClient && (
          <Box className="grid grid-cols-12 gap-4 items-stretch">
            {/* Header Banner */}
            <Box className="col-span-12">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(197, 155, 39, 0.3)', bgcolor: '#FAF6ED' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'Outfit, sans-serif', mb: 0.5 }}>
                  🛡️ Spain Visa 50% Money-Back Guarantee & Refund Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If your visa application gets refused by the Spanish Embassy/Consulate, you can submit your official rejection resolution letter here to claim your 50% Money-Back Guarantee refund.
                </Typography>
              </Paper>
            </Box>

            {/* Refund Claim Form Card */}
            <Box className="col-span-12 md:col-span-7 flex flex-col h-full">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#051A3B', mb: 2 }}>
                  Submit New Refund Claim
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                      Claim Category
                    </Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={claimCategory}
                      onChange={(e) => setClaimCategory(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="Visa Rejection">Visa Rejection (50% Money-Back Guarantee)</MenuItem>
                      <MenuItem value="Medical / Personal Emergency">Medical / Personal Emergency Cancellation</MenuItem>
                      <MenuItem value="Relocation Plan Change">Relocation Plan Changed / Postponed</MenuItem>
                      <MenuItem value="Service Issue">Service Issue / Dissatisfaction</MenuItem>
                      <MenuItem value="Other">Other Reason</MenuItem>
                    </Select>
                  </Box>

                  {/* Calculated Amount Box */}
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FAF6ED', border: '1px solid rgba(197, 155, 39, 0.3)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                      Estimated Refund Calculation:
                    </Typography>
                    {(() => {
                      const totalPaidAmt = allPayments.filter(p => p.clientId === clientId && p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
                      const guaranteePct = customizationSettings?.refundGuaranteePercentage ?? 50;
                      const estimatedRefund = totalPaidAmt * (guaranteePct / 100);
                      return (
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#C59B27', fontFamily: 'Outfit, sans-serif' }}>
                          €{estimatedRefund.toLocaleString()}
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                            ({guaranteePct}% of Total Paid Fees €{totalPaidAmt.toLocaleString()})
                          </Typography>
                        </Typography>
                      );
                    })()}
                  </Box>

                  {/* Proof Document File Uploader Styled Box */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                      Upload Embassy Rejection Letter (PDF / JPG / PNG) *
                    </Typography>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        textAlign: 'center',
                        border: '2px dashed rgba(197, 155, 39, 0.4)',
                        borderRadius: 3,
                        bgcolor: 'background.neutral',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#FAF6ED', borderColor: '#C59B27' }
                      }}
                      onClick={() => document.getElementById('claim-proof-file-input')?.click()}
                    >
                      <input
                        id="claim-proof-file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const res = await dbService.uploadDocument({
                                clientId: client.id,
                                file,
                                category: 'Rejection Letter',
                                belongsTo: 'Main Applicant'
                              });
                              setClaimProofUrl(res.url || res.document?.url || '');
                              showAlert('Official Rejection Letter attached successfully!', 'success');
                            } catch (err) {
                              showAlert('Failed to upload proof document.', 'error');
                            }
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#051A3B' }}>
                        📁 Click to Browse & Upload Official Embassy Resolution PDF
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Supported Formats: PDF, JPG, PNG (Max 15MB)
                      </Typography>

                      {claimProofUrl && (
                        <Chip
                          label="File Attached Successfully ✅"
                          color="success"
                          size="small"
                          sx={{ mt: 1.5, fontWeight: 800 }}
                        />
                      )}
                    </Paper>
                  </Box>

                  {/* Bank Details Inputs */}
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mt: 1, mb: -1, display: 'block' }}>
                    Client Payout Bank Details (For Wire Transfer if applicable):
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Account Holder Name"
                        value={claimBankName}
                        onChange={(e) => setClaimBankName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="IBAN / Account Number"
                        value={claimBankIban}
                        onChange={(e) => setClaimBankIban(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  {/* Reason / Remarks */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                      Notes / Statement
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Please add any details regarding your visa resolution sheet..."
                      value={claimReason}
                      onChange={(e) => setClaimReason(e.target.value)}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={createRefundMutation.isPending}
                    onClick={() => {
                      if (!claimProofUrl) {
                        showAlert('Please upload your official Embassy Rejection Letter before submitting your claim.', 'warning');
                        return;
                      }
                      createRefundMutation.mutate({
                        clientId: client.id,
                        category: claimCategory,
                        reason: claimReason,
                        proofUrl: claimProofUrl,
                        bankAccountName: claimBankName,
                        bankIban: claimBankIban,
                        amount: (allPayments.filter(p => p.clientId === clientId && p.status === 'Paid').reduce((s, p) => s + p.amount, 0)) * 0.5
                      });
                    }}
                    sx={{ mt: 1, py: 1.2, fontWeight: 800 }}
                  >
                    Submit Refund Claim
                  </Button>
                </Box>
              </Paper>
            </Box>

            {/* Right Side: Existing Claims History */}
            <Box className="col-span-12 md:col-span-5 flex flex-col h-full">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#051A3B', mb: 2 }}>
                  Your Refund Claim History
                </Typography>

                {allRefunds.filter(r => r.clientId === client.id).length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No active or past refund claims found for your profile.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {allRefunds.filter(r => r.clientId === client.id).map(r => (
                      <Paper key={r.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#FAF6ED' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>Ticket #{r.id.substring(0, 8)}</Typography>
                          <Chip
                            label={r.status}
                            color={r.status === 'Processed' ? 'success' : r.status === 'Approved' ? 'info' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>
                        <Typography variant="h6" color="error.main" sx={{ fontWeight: 800 }}>
                          €{r.amount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Category: {r.category} | Date: {r.date}
                        </Typography>
                        {r.transactionRef && (
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, mt: 0.5, display: 'block' }}>
                            Ref / UTR: {r.transactionRef}
                          </Typography>
                        )}
                        {r.proofUrl && (
                          <Button size="small" href={r.proofUrl} target="_blank" rel="noopener noreferrer" sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}>
                            View Attached Proof PDF
                          </Button>
                        )}
                        {r.status === 'Processed' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => {
                              window.print();
                            }}
                            sx={{ mt: 1, ml: 1, textTransform: 'none', fontWeight: 800 }}
                          >
                            📄 Download Refund Receipt PDF
                          </Button>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        )}
      </Box>

      {/* Modal: Translation Payment Simulation */}
      <AppModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Secure Sworn Translation Checkout"
        actions={
          <>
            <Button onClick={() => setPaymentModalOpen(false)} variant="outlined">
              Cancel
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Secure checkout for Spanish Sworn Translation certification order. Total payable sum: <strong>€{calcPrice.toFixed(2)}</strong>.
          </Typography>

          <Divider />

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Choose Payment Provider</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" sx={{ flexGrow: 1, py: 1 }}>Visa / Mastercard</Button>
            <Button variant="outlined" sx={{ flexGrow: 1, py: 1 }}>Apple Pay / Google Pay</Button>
            <Button variant="outlined" sx={{ flexGrow: 1, py: 1 }}>Tamara (Split 4x)</Button>
            <Button variant="outlined" sx={{ flexGrow: 1, py: 1 }}>Tabby</Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mt: 1 }}>
            <input
              type="checkbox"
              id="tc-checkbox"
              style={{ marginTop: 4, transform: 'scale(1.2)' }}
            />
            <label htmlFor="tc-checkbox" style={{ fontSize: '0.825rem', color: '#6B7280', cursor: 'pointer', lineHeight: 1.4 }}>
              I agree to the Spain Visa Legal Relocation Terms of Service, sworn affidavit declaration policies, and 50% refund schedule conditions.
            </label>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            onClick={() => {
              const tcChecked = document.getElementById('tc-checkbox')?.checked;
              if (!tcChecked) {
                showAlert('You must agree to the Terms & Conditions before checking out.', 'warning');
                return;
              }
              setTranslationPaid(true);
              setTranslationStatus('processing');
              setPaymentModalOpen(false);
              showAlert('Payment successful! Your documents have been dispatched to our sworn translators.', 'success');
            }}
            sx={{ mt: 1.5, py: 1.5, fontWeight: 700 }}
          >
            Authorize Payment Simulation
          </Button>
        </Box>
      </AppModal>
    </Box>
  );
};

export default ClientPortalDocs;
