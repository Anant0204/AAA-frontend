import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { CaseActivityTimeline } from '../../components/CaseActivityTimeline';
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
import Autocomplete from '@mui/material/Autocomplete';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';

import { dbService } from '../../services/dbService';
import { ALL_COUNTRIES } from '../../constants/countryServices';
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
  const [selectedPackage, setSelectedPackage] = useState('OPTION_A');
  const [addApplicants, setAddApplicants] = useState(0);
  const [assessmentCredit, setAssessmentCredit] = useState(0);
  const [billingTermsChecked, setBillingTermsChecked] = useState(false);
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('card');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [viewingReceiptForOptA, setViewingReceiptForOptA] = useState(false);

  const isOptionAPackage = (pkg) => {
    if (!pkg) return false;
    if (typeof pkg === 'string') {
      const s = pkg.toLowerCase();
      return s === 'option_a' || s === 'opt_a' || s === 'std' || s.includes('assessment');
    }
    const code = String(pkg.code || pkg.id || '').toLowerCase();
    const name = String(pkg.name || '').toLowerCase();
    const price = Number(pkg.price);
    return code === 'option_a' || code === 'opt_a' || code === 'std' || name.includes('option a') || name.includes('assessment') || price === 250;
  };

  const selectAndPayPackageMutation = useMutation({
    mutationFn: async ({ packageId, additionalApplicants, clientId }) => {
      return await dbService.createPackageCheckout({ packageId, additionalApplicants, clientId });
    },
    onSuccess: (res) => {
      const redirectUrl = res?.stripeUrl || res?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        showAlert('Package selection initialized. Proceeding to checkout.', 'success');
        queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
      }
    },
    onError: (err) => {
      console.error('Package checkout error:', err);
      showAlert(err.response?.data?.message || 'Failed to initiate package checkout.', 'error');
    }
  });

  const DEFAULT_PACKAGES = [
    {
      id: 'OPTION_A',
      code: 'OPTION_A',
      name: 'OPTION A: PROFESSIONAL CASE ASSESSMENT',
      price: 250,
      additionalApplicantPrice: 0,
      isRecommended: false,
      refundableText: 'Non-refundable (€250 fee deductible within 14 days if upgraded to Full or Premium Package)',
      description: 'Dedicated One-to-One Case Review, Professional Case Evaluation, Comprehensive Eligibility Assessment, Most Suitable Visa & Residency Recommendation, Initial Document Review, Personalized Document Checklist, Missing & Required Documents Report, Application Readiness Assessment, Personalized Action Plan, Professional Package Recommendation, Assist with Appointments.',
      includes: [
        'Dedicated One-to-One Case Review & Evaluation',
        'Comprehensive Eligibility Assessment & Action Plan',
        'Initial Document Review & Personalized Checklist',
        'Application Readiness Assessment & Appointment Support',
        '€250 Fee 100% Deducted from Full or Premium Package within 14 days'
      ]
    },
    {
      id: 'OPTION_B',
      code: 'OPTION_B',
      name: 'OPTION B: FULL PROCESSING PACKAGE – END-TO-END SERVICE',
      price: 3500,
      additionalApplicantPrice: 500,
      isRecommended: false,
      refundableText: '50% refundable if visa is rejected (Subject to T&C)',
      description: 'Complete professional end-to-end support for Spain Residency applications from eligibility to submission.',
      includes: [
        'Complete End-to-End Application Processing & Strategy',
        'Eligibility & Document Auditing',
        'Official Sworn Translation Management',
        'Digital Nomad / NLV File Assembly',
        'Consulate Appointment Assistance & Status Tracking',
        '50% Refundable if visa application is rejected (Subject to T&C)'
      ]
    },
    {
      id: 'OPTION_C',
      code: 'OPTION_C',
      name: 'OPTION C: ADMINISTRATIVE RELOCATION PACKAGE – POST-APPROVAL ASSISTANCE IN SPAIN',
      price: 1750,
      additionalApplicantPrice: 500,
      isRecommended: false,
      refundableText: 'Non-refundable',
      description: 'Post-approval administrative relocation support for clients who already have their visa approved and need settlement help in Spain.',
      includes: [
        'Post-Approval Residency Card (TIE) Fingerprint Processing',
        'Town Hall Registration (Empadronamiento)',
        'Spanish Health Card / Private Insurance Setup',
        'Spanish Bank Account & Social Security Setup Support',
        'Driver License Exchange Guidance'
      ]
    },
    {
      id: 'OPTION_D',
      code: 'OPTION_D',
      name: 'OPTION D: PREMIUM PACKAGE – END-TO-END SERVICE + ADMINISTRATIVE RELOCATION PACKAGE',
      price: 4750,
      additionalApplicantPrice: 750,
      isRecommended: true,
      refundableText: '50% refundable if visa is rejected (Subject to T&C)',
      description: 'Everything in Full Process + complete relocation administrative assistance in Spain.',
      includes: [
        'Everything in Full Processing Package (End-to-End Service)',
        'Everything in Administrative Relocation Package (In-Spain Setup)',
        'Spanish Bank Account Opening Assistance',
        'NIE / TIE Fingerprint Appointment Booking',
        'Empadronamiento (Town Hall Registration)',
        'Spanish Social Security Registration',
        '50% Refundable if visa application is rejected (Subject to T&C)'
      ]
    }
  ];

  // Helper to extract numeric count of applicants
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

  const [wizardDeps, setWizardDeps] = useState([]);

  // Fetch client details
  // If clientId is provided in the URL, it's an Admin testing the portal, so they shouldn't fetch the /me profile
  const isClientRole = !clientId && localStorage.getItem('clientToken') !== null;

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

  const { data: dbPackages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: dbService.getPackages
  });

  const dbClient = clients.find((c) => c.id === clientId);
  const localClientData = JSON.parse(localStorage.getItem('clientData') || 'null');
  const localMockClient = JSON.parse(localStorage.getItem('mockClientData') || 'null');
  const client = clientProfile || dbClient || (localClientData && localClientData.id === clientId ? localClientData : undefined) || (localMockClient && localMockClient.id === clientId ? localMockClient : undefined);

  const isTranslationClient = client && (client.serviceId === 'sworn_translation' || client.serviceId === 'translation' || client.serviceId === 'sworn' || client.serviceType === 'Spanish Sworn Translation');

  const { data: clientPackagesData } = useQuery({
    queryKey: ['clientPackages'],
    queryFn: dbService.getClientPackages,
    enabled: isClientRole
  });

  useEffect(() => {
    if (clientPackagesData?.credit?.hasCredit) {
      setAssessmentCredit(clientPackagesData.credit.creditAmount || 250);
    }
  }, [clientPackagesData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search || (window.location.hash.includes('?') ? window.location.hash.substring(window.location.hash.indexOf('?')) : ''));
    if (params.get('tab') === 'packages' || params.get('redirect') === 'packages') {
      setTabValue(1);
    }
  }, []);

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
        setAddApplicants(Math.max(0, count - 1));
        const totalDeps = count - 1;
        const initialDeps = [];
        const saved = client.dependentsDetails || [];
        for (let i = 0; i < totalDeps; i++) {
          const rawRel = saved[i]?.relation || 'Spouse';
          const relation = rawRel.startsWith('Other:') ? rawRel.replace(/^Other:\s*/, '') : rawRel;
          initialDeps.push({
            firstName: saved[i]?.firstName || '',
            lastName: saved[i]?.lastName || '',
            relation: relation,
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

  // Phase 2 Resubmission Cycle & Checklist Integration
  const { data: clientCycles = [], refetch: refetchCycles } = useQuery({
    queryKey: ['clientCycles', client?.id],
    queryFn: () => dbService.getCyclesByClient(client.id),
    enabled: Boolean(client?.id)
  });

  const activeResubmissionCycle = clientCycles.find(
    c => c.type === 'resubmission' && c.status !== 'Closed' && c.status !== 'Archived'
  ) || (client?.applicationCycles || []).find(
    c => c.type === 'resubmission' && c.status !== 'Closed' && c.status !== 'Archived'
  );

  const { data: resubmissionChecklist = [], refetch: refetchResubmissionChecklist } = useQuery({
    queryKey: ['resubmissionChecklist', activeResubmissionCycle?.id],
    queryFn: () => dbService.getCycleChecklist(activeResubmissionCycle.id),
    enabled: Boolean(activeResubmissionCycle?.id)
  });

  const [uploadingItemId, setUploadingItemId] = useState(null);

  const handleUploadChecklistDoc = async (item, file) => {
    if (!file || !item) return;
    try {
      setUploadingItemId(item.id);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', item.category);

      await dbService.uploadChecklistDoc(item.id, formData);

      queryClient.invalidateQueries({ queryKey: ['resubmissionChecklist', activeResubmissionCycle?.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['clientCycles', client?.id] });
      refetchDocs();
      refetchResubmissionChecklist();

      showAlert(`Document version uploaded successfully for "${item.title}". It is now Under Review.`, 'success');
    } catch (err) {
      console.error('Error uploading checklist file:', err);
      showAlert(err.response?.data?.message || 'Failed to upload document version.', 'error');
    } finally {
      setUploadingItemId(null);
    }
  };

  const { data: consultations = [], isLoading: isConsultationsLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations
  });

  const { data: rawPayments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments
  });

  const allPayments = Array.isArray(rawPayments) ? rawPayments : (rawPayments?.payments || []);

  const hasAnyPaidPayment = Boolean(
    Array.isArray(allPayments) && allPayments.some(p =>
      (p.clientId === client?.id || p.clientId === clientId) && p.status === 'Paid'
    )
  );

  const hasMainPackagePaidPayment = Boolean(
    Array.isArray(allPayments) && allPayments.some(p =>
      (p.clientId === client?.id || p.clientId === clientId) &&
      p.status === 'Paid' &&
      p.packageType !== 'OPTION_A' &&
      p.amount !== 262.50 &&
      p.amount !== 250
    )
  );

  const refundablePackageCodes = (dbPackages && Array.isArray(dbPackages))
    ? dbPackages.filter(p => p.isRefundable === true).map(p => p.code || p.id).filter(Boolean)
    : [];

  const defaultRefundableCodes = ['full_process', 'premium', 'OPTION_B', 'OPTION_C', 'opt_b', 'opt_c'];
  const allRefundableCodes = Array.from(new Set([...refundablePackageCodes, ...defaultRefundableCodes]));

  const hasEligibleRefundPayment = Boolean(
    Array.isArray(allPayments) && allPayments.some(p =>
      (p.clientId === client?.id || p.clientId === clientId) &&
      p.status === 'Paid' &&
      allRefundableCodes.includes(p.packageType)
    )
  );

  const isRefundEligible = Boolean(
    hasEligibleRefundPayment ||
    allRefundableCodes.includes(client?.packageId) ||
    (client?.status === 'Payment Completed' && !['OPTION_A', 'opt_a', 'std', 'relocation', 'OPTION_D'].includes(client?.packageId))
  );

  const isStatusPaid = ['Payment Received', 'Paid', 'Partially Paid', 'Payment Completed', 'Under Process', 'Processing', 'Active'].includes(client?.status);
  const isVisaStatusActive = ['Document Preparation', 'Document Review', 'Apostille & Translations', 'Submitted - Pending Decision', 'NIE / Local Registration', 'Visa Approved'].includes(client?.visaStatus);
  const isMainPackageStatusActive = (
    client?.status === 'Payment Completed' ||
    client?.status === 'Paid' ||
    ['Submitted - Pending Decision', 'NIE / Local Registration', 'Visa Approved'].includes(client?.visaStatus)
  );
  const isClientPaid = Boolean(client?.documentUploadAllowed || hasAnyPaidPayment || translationPaid || isStatusPaid || isVisaStatusActive);
  const isMainPackagePaid = Boolean((hasMainPackagePaidPayment || isMainPackageStatusActive) && client?.status !== 'Partially Paid' && client?.status !== 'Payment Received');

  const totalApplicants = client ? getApplicantsCount(client.applicantsCount) : 1;

  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  const paidAssessment = (allPayments && Array.isArray(allPayments)) ? allPayments.find(p =>
    (p.clientId === client?.id || p.clientId === clientId) &&
    p.status === 'Paid' &&
    (p.packageType === 'OPTION_A' || p.amount === 262.50 || p.amount === 250)
  ) : null;

  const isAssessmentCreditValid = Boolean(
    (paidAssessment && (new Date() - new Date(paidAssessment.createdAt || paidAssessment.paidAt || Date.now())) <= FOURTEEN_DAYS_MS) ||
    client?.status === 'Partially Paid'
  );

  useEffect(() => {
    if (isAssessmentCreditValid || client?.status === 'Partially Paid') {
      setAssessmentCredit(250);
    } else {
      setAssessmentCredit(0); // Credit expired after 14 days!
    }
  }, [isAssessmentCreditValid, client?.status]);

  const isOptAPaid = Boolean(
    isClientPaid ||
    assessmentCredit > 0 ||
    ['Partially Paid', 'Payment Completed', 'Paid', 'Payment Received'].includes(client?.status) ||
    paidAssessment
  );

  useEffect(() => {
    if (!isClientPaid && !isProfileLoading && !isClientsLoading) {
      setTabValue(1);
    }
  }, [isClientPaid, isProfileLoading, isClientsLoading]);

  useEffect(() => {
    if (isOptAPaid && isOptionAPackage(selectedPackage)) {
      const firstMainPkg = (dbPackages && dbPackages.length > 0) ? dbPackages.find(p => !isOptionAPackage(p)) : null;
      const nextPkgCode = firstMainPkg ? (firstMainPkg.code || firstMainPkg.id) : 'full_process';
      setSelectedPackage(nextPkgCode);
    }
  }, [isOptAPaid, selectedPackage, client, dbPackages]);

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

      const translationDocs = (documents || []).filter((d) => d && d.clientId === client?.id);
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
      if (!dep.firstName.trim() || !dep.lastName.trim() || !dep.relation.trim() || !dep.nationality.trim()) {
        showAlert(`Please fill in all details for Co-Applicant ${i + 1}`, 'warning');
        return;
      }
    }
    const formattedDeps = wizardDeps.map(dep => ({
      firstName: dep.firstName.trim(),
      lastName: dep.lastName.trim(),
      relation: dep.relation.trim(),
      passportNumber: (dep.passportNumber || '').trim(),
      nationality: dep.nationality.trim()
    }));
    saveDependentsMutation.mutate(formattedDeps);
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
        py: { xs: 2.5, sm: 4 },
        px: { xs: 1.5, sm: 3, md: 6 },
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
          mb: { xs: 2, sm: 4 },
          maxWidth: 950,
          mx: 'auto',
          flexDirection: { xs: 'column', sm: isRTL ? 'row-reverse' : 'row' },
          gap: { xs: 1.5, sm: 0 },
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderRadius: { xs: 2.5, sm: 3.5 },
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 30px rgba(5, 26, 59, 0.03)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Box
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              borderRadius: 2,
              background: 'linear-gradient(135deg, #051A3B 0%, #C59B27 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              boxShadow: '0 4px 12px rgba(197, 155, 39, 0.2)'
            }}
          >
            A³
          </Box>
          <Box sx={{ textAlign: isRTL ? 'right' : 'left' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#051A3B', fontFamily: 'Outfit, sans-serif', fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>{t('welcome')}, {client.firstName} {client.lastName}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Secure Relocation & Booking Portal ({client.clientCode || 'Client'})</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
            <Select
              value={portalLang}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{ borderRadius: 2.5, height: { xs: 32, sm: 36 }, bgcolor: 'background.paper', fontSize: { xs: '0.75rem', sm: '0.85rem' }, fontWeight: 600, border: '1px solid rgba(0,0,0,0.06)' }}
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
            startIcon={<LogoutIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
            onClick={handleLogout}
            color="inherit"
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              color: '#051A3B',
              borderRadius: 2.5,
              py: { xs: 0.5, sm: 1 },
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
          mb: { xs: 2, sm: 4 },
          borderRadius: { xs: 3, sm: 4 },
          overflow: 'hidden',
          position: 'relative',
          height: { xs: 120, sm: 190 },
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
            px: { xs: 2.5, sm: 5 },
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
              fontSize: { xs: '1.15rem', sm: '2rem' },
              color: '#E5C058'
            }}
          >
            Your Spain Immigration Journey
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 500, fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.825rem' }, lineHeight: 1.35 }}>
            Track your visa application, complete certified sworn translations, upload required compliance documents, and launch your new relocation lifestyle.
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      {!isTranslationClient && (
        <Box sx={{ maxWidth: 950, mx: 'auto', mb: { xs: 2, sm: 3 } }}>
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: { xs: 36, sm: 48 },
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
                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                minHeight: { xs: 36, sm: 48 },
                px: { xs: 1.25, sm: 2.5 },
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
                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                minHeight: { xs: 36, sm: 48 },
                px: { xs: 1.25, sm: 2.5 },
                color: tabValue === 1 ? '#C59B27' : 'text.secondary',
                '&.Mui-selected': { color: '#C59B27' }
              }}
            />
            <Tab
              label={isClientPaid ? "3. Refund & Guarantee Claims 🛡️" : "3. Refund & Guarantee Claims 🔒"}
              disabled={!isClientPaid}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                minHeight: { xs: 36, sm: 48 },
                px: { xs: 1.25, sm: 2.5 },
                color: tabValue === 2 ? '#C59B27' : !isClientPaid ? 'text.disabled' : 'text.secondary',
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
            {!isClientPaid ? (
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
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: { xs: 3, md: 4.5 },
                        border: '1px solid rgba(197, 155, 39, 0.25)',
                        bgcolor: 'rgba(250, 246, 237, 0.65)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 8px 30px rgba(5, 26, 59, 0.03)'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#051A3B', mb: 1, fontFamily: 'Outfit, sans-serif', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                        👨‍👩‍👧‍👦 Complete Your Family Profiles
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                        You have registered <strong>{totalDependents} co-applicant(s)</strong>. Please fill out their profiles to generate their checklists and unlock their document upload folders.
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Main Applicant Profile Card */}
                        <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, border: '1.5px solid rgba(5, 26, 59, 0.15)', bgcolor: 'background.paper' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
                              👤 Main Applicant Details
                            </Typography>
                            <Chip label="Primary Applicant" size="small" sx={{ bgcolor: 'rgba(5, 26, 59, 0.08)', color: '#051A3B', fontWeight: 800, fontSize: '0.75rem' }} />
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                label="First Name"
                                size="small"
                                fullWidth
                                value={client?.firstName || ''}
                                disabled
                                sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                label="Last Name"
                                size="small"
                                fullWidth
                                value={client?.lastName || ''}
                                disabled
                                sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                label="Relationship"
                                size="small"
                                fullWidth
                                value="Main Applicant"
                                disabled
                                sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                label="Nationality"
                                size="small"
                                fullWidth
                                value={client?.nationality || 'N/A'}
                                disabled
                                sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Co-Applicants Cards */}
                        {wizardDeps.map((dep, idx) => (
                          <Paper key={idx} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'background.paper' }}>
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
                              <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                   <InputLabel id={`rel-select-label-${idx}`}>Relationship</InputLabel>
                                   <Select
                                     labelId={`rel-select-label-${idx}`}
                                     label="Relationship"
                                     value={dep.relation || ''}
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
                              <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                  fullWidth
                                  options={ALL_COUNTRIES}
                                  value={dep.nationality || ''}
                                  onChange={(event, newValue) => {
                                    const newDeps = [...wizardDeps];
                                    newDeps[idx].nationality = newValue || '';
                                    setWizardDeps(newDeps);
                                  }}
                                  onInputChange={(event, newInputValue) => {
                                    const newDeps = [...wizardDeps];
                                    newDeps[idx].nationality = newInputValue || '';
                                    setWizardDeps(newDeps);
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Nationality"
                                      size="small"
                                      fullWidth
                                      placeholder="Select country..."
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        ))}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 1 }}>
                          <Button
                            variant="contained"
                            onClick={handleSaveWizardDeps}
                            disabled={saveDependentsMutation.isPending}
                            sx={{
                              px: 4,
                              py: 1.2,
                              height: 42,
                              borderRadius: 2.5,
                              fontWeight: 800,
                              bgcolor: '#051A3B',
                              color: 'white',
                              fontFamily: 'Outfit, sans-serif',
                              textTransform: 'none',
                              boxShadow: '0 4px 14px rgba(5, 26, 59, 0.2)',
                              '&:hover': { bgcolor: '#C59B27', boxShadow: '0 4px 14px rgba(197, 155, 39, 0.3)' }
                            }}
                          >
                            {saveDependentsMutation.isPending ? 'Saving Profiles...' : 'Save Family Profiles'}
                          </Button>
                        </Box>
                      </Box>
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
                {/* Active Resubmission Checklist Component when Active Resubmission Cycle Exists */}
                {activeResubmissionCycle && (
                  <Box className="col-span-12" sx={{ mb: 4 }}>
                    <Paper
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        border: '2px solid #051A3B',
                        boxShadow: '0 8px 30px rgba(5, 26, 59, 0.08)',
                        bgcolor: '#FFFFFF'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
                            📋 Resubmission Document Checklist
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Application Cycle #{activeResubmissionCycle.id.substring(0, 8)} | Original Refusal Ground: <strong>{activeResubmissionCycle.refusalReason || 'Visa Refused'}</strong>
                          </Typography>
                        </Box>
                        <Chip
                          label={`Cycle Status: ${activeResubmissionCycle.status}`}
                          color={activeResubmissionCycle.status === 'Ready for Resubmission' ? 'success' : 'primary'}
                          sx={{ fontWeight: 800, fontSize: '0.85rem', px: 1, py: 2 }}
                        />
                      </Box>

                      {activeResubmissionCycle.status === 'Ready for Resubmission' && (
                        <Alert severity="success" sx={{ mb: 3, fontWeight: 700 }}>
                          🎉 All mandatory checklist documents have been verified by Operations! Your resubmission package is fully ready for legal filing.
                        </Alert>
                      )}

                      <Divider sx={{ mb: 3 }} />

                      {['Main Applicant', 'Spouse', 'Dependents'].map((groupKey) => {
                        const groupItems = resubmissionChecklist.filter(item => {
                          if (groupKey === 'Main Applicant') return item.belongsTo === 'Main Applicant';
                          if (groupKey === 'Spouse') return item.belongsTo === 'Spouse';
                          return item.belongsTo !== 'Main Applicant' && item.belongsTo !== 'Spouse';
                        });

                        if (groupItems.length === 0) return null;

                        return (
                          <Box key={groupKey} sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2, color: '#051A3B', borderBottom: '2px solid #C59B27', display: 'inline-block', pb: 0.5 }}>
                              👤 {groupKey} Checklist
                            </Typography>
                            <Grid container spacing={2}>
                              {groupItems.map((item) => {
                                const activeDoc = item.activeDocument;
                                const isPending = item.status === 'PENDING_VERIFICATION';
                                const isVerified = item.status === 'VERIFIED';
                                const isRejected = item.status === 'REJECTED';
                                const isNotRequired = item.status === 'NOT_REQUIRED';
                                const isReused = item.status === 'REUSED' || Boolean(item.sourceDocumentId);

                                const getStatusChip = () => {
                                  if (isNotRequired) return <Chip label="Not Required" size="small" sx={{ bgcolor: '#E2E8F0', color: '#475569', fontWeight: 800 }} />;
                                  if (isVerified) return <Chip label="Verified" size="small" color="success" sx={{ fontWeight: 800 }} />;
                                  if (isReused) return <Chip label="Verified from Previous Application" size="small" color="info" sx={{ fontWeight: 800 }} />;
                                  if (isPending) return <Chip label="Under Review" size="small" color="warning" sx={{ fontWeight: 800 }} />;
                                  if (isRejected) return <Chip label="Re-upload Required" size="small" color="error" sx={{ fontWeight: 800 }} />;
                                  return <Chip label="Required" size="small" color="error" variant="outlined" sx={{ fontWeight: 800 }} />;
                                };

                                return (
                                  <Grid item xs={12} key={item.id}>
                                    <Paper
                                      sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: isRejected ? '#FCA5A5' : isVerified ? '#6EE7B7' : 'rgba(5, 26, 59, 0.1)',
                                        bgcolor: isRejected ? '#FEF2F2' : isVerified ? '#ECFDF5' : '#FAF6ED'
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#051A3B', fontSize: '1rem' }}>
                                              {item.title}
                                            </Typography>
                                            <Chip label={item.isMandatory ? 'Mandatory' : 'Optional'} size="small" variant="outlined" color={item.isMandatory ? 'error' : 'default'} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }} />
                                            {activeDoc && (
                                              <Chip label={`Version V${activeDoc.version}`} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(5, 26, 59, 0.1)', color: '#051A3B' }} />
                                            )}
                                          </Box>
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                                            Category: {item.category} | Due Date: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No deadline'}
                                          </Typography>
                                          {item.clientInstructions && (
                                            <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1.5, borderLeft: '3px solid #C59B27', fontSize: '0.82rem' }}>
                                              💡 <strong>Instructions:</strong> {item.clientInstructions}
                                            </Typography>
                                          )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                          {getStatusChip()}
                                          <Button
                                            variant="contained"
                                            component="label"
                                            size="small"
                                            disabled={uploadingItemId === item.id || isPending || isVerified || isNotRequired}
                                            sx={{
                                              fontWeight: 800,
                                              bgcolor: '#051A3B',
                                              color: 'white',
                                              textTransform: 'none',
                                              '&:hover': { bgcolor: '#C59B27' }
                                            }}
                                          >
                                            {uploadingItemId === item.id ? 'Uploading...' : isRejected ? '🔁 Re-upload Corrected Version' : isVerified ? '✓ Document Verified' : isPending ? '⏳ Under Review' : '📤 Upload Document Version'}
                                            <input
                                              type="file"
                                              hidden
                                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                              onChange={(e) => {
                                                if (e.target.files[0]) {
                                                  handleUploadChecklistDoc(item, e.target.files[0]);
                                                }
                                              }}
                                            />
                                          </Button>
                                        </Box>
                                      </Box>

                                      {/* Operations Rejection Reason Prominently Displayed */}
                                      {isRejected && (activeDoc?.comment || item.rejectionComment) && (
                                        <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
                                          <strong>Operations Rejection Reason:</strong> {activeDoc?.comment || item.rejectionComment}
                                        </Alert>
                                      )}

                                      {/* Active & Past Document Versions History */}
                                      {item.documents && item.documents.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                            Document Version History ({item.documents.length} version{item.documents.length > 1 ? 's' : ''}):
                                          </Typography>
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                            {item.documents.map((doc) => (
                                              <Paper key={doc.id} sx={{ p: 1, px: 1.5, bgcolor: 'background.paper', borderRadius: 1.5, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                  V{doc.version} - {doc.name || doc.fileName} (Uploaded: {doc.uploadedDate ? new Date(doc.uploadedDate).toLocaleDateString() : 'Recently'})
                                                </Typography>
                                                <StatusBadge status={doc.status} />
                                              </Paper>
                                            ))}
                                          </Box>
                                        </Box>
                                      )}
                                    </Paper>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Box>
                        );
                      })}
                    </Paper>
                  </Box>
                )}

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
                                isLoading={uploadDocMutation.isPending}
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

                {/* Case Activity Timeline Log */}
                <Box className="col-span-12" sx={{ mt: 3 }}>
                  <CaseActivityTimeline clientId={client.id || id} />
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
                    const translationInputDocs = (documents || []).filter((d) => d && d.clientId === client?.id);
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
                              const fileUrl = `${(import.meta.env.VITE_API_URL || 'https://aaa-consultancy-backend-production.up.railway.app/api/v1').replace('/api/v1', '')}${doc.translatedUrl}`;
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
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {isMainPackagePaid ? (
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
                        Visa Packages & Billing Hub
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Select your preferred package, add co-applicants, view itemized invoice with 5% VAT, and pay securely.
                      </Typography>
                    </Box>

                    {/* Co-Applicants Counter */}
                    <Box sx={{ p: 1.5, bgcolor: '#FAF6ED', borderRadius: 2.5, border: '1px solid rgba(197, 155, 39, 0.3)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#051A3B', textTransform: 'uppercase' }}>
                        Additional Applicants:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={selectedPackage === 'OPTION_A' || addApplicants <= 0}
                          onClick={() => setAddApplicants(prev => Math.max(0, prev - 1))}
                          sx={{ minWidth: 32, width: 32, height: 32, p: 0, fontWeight: 900, borderRadius: 1.5 }}
                        >
                          -
                        </Button>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, px: 1, minWidth: 24, textAlign: 'center' }}>
                          {selectedPackage === 'OPTION_A' ? 0 : addApplicants}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={selectedPackage === 'OPTION_A'}
                          onClick={() => setAddApplicants(prev => prev + 1)}
                          sx={{ minWidth: 32, width: 32, height: 32, p: 0, fontWeight: 900, borderRadius: 1.5 }}
                        >
                          +
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {assessmentCredit > 0 && (
                    <Box sx={{ p: 2, mb: 3, bgcolor: '#F0FDF4', borderRadius: 2.5, border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body2" sx={{ color: '#166534', fontWeight: 700 }}>
                        ✨ Eligible for €250 Professional Case Assessment Credit! This amount will be automatically deducted if you select Option B or Option D within 14 days.
                      </Typography>
                    </Box>
                  )}

                  <Grid container spacing={3}>
                    {/* Package Options Cards */}
                    <Grid item xs={12} lg={8}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {[...((dbPackages && dbPackages.length > 0)
                          ? dbPackages.map(pkg => ({
                              id: pkg.id,
                              code: pkg.code || pkg.id,
                              name: pkg.name,
                              price: Number(pkg.price) || 0,
                              additionalApplicantPrice: Number(pkg.additionalApplicantPrice) || 500,
                              isRecommended: !!pkg.isRecommended,
                              isFixedPrice: !!pkg.isFixedPrice,
                              refundableText: pkg.refundableText || (pkg.isRecommended ? '50% refundable if visa is rejected (Subject to T&C)' : 'Standard Package'),
                              description: pkg.description || '',
                              includes: Array.isArray(pkg.includes) ? pkg.includes : []
                            }))
                          : DEFAULT_PACKAGES
                        )].sort((a,b) => (a.name || '').localeCompare(b.name || '')).map((pkgItem) => {
                          const pkgCode = pkgItem.code || pkgItem.id;
                          const isSelected = selectedPackage === pkgCode;
                          const isOptA = isOptionAPackage(pkgItem);
                          const effectiveAddCount = isOptA ? 0 : addApplicants;
                          const basePrice = pkgItem.price || 0;
                          const addCost = pkgItem.isFixedPrice ? 0 : (effectiveAddCount * (pkgItem.additionalApplicantPrice || 500));
                          const totalBaseBeforeCredit = basePrice + addCost;
                          const isCreditApplicable = !isOptA && assessmentCredit > 0;
                          const finalCardPrice = isCreditApplicable ? Math.max(0, totalBaseBeforeCredit - assessmentCredit) : totalBaseBeforeCredit;

                          const isOptADisabled = isOptA && isOptAPaid;

                          return (
                            <Card
                              key={pkgItem.id}
                              onClick={() => { if (!isOptADisabled) setSelectedPackage(pkgCode); }}
                              sx={{
                                border: isSelected ? '2px solid #C59B27' : (pkgItem.isRecommended ? '2px solid #C59B27' : '1px solid'),
                                borderColor: isSelected ? '#C59B27' : (pkgItem.isRecommended ? '#C59B27' : 'divider'),
                                bgcolor: isOptADisabled ? 'rgba(240, 253, 244, 0.6)' : (isSelected ? 'rgba(197, 155, 39, 0.04)' : 'background.paper'),
                                borderRadius: 3.5,
                                cursor: isOptADisabled ? 'not-allowed' : 'pointer',
                                opacity: isOptADisabled ? 0.85 : 1,
                                position: 'relative',
                                boxShadow: isSelected ? '0 8px 24px rgba(197, 155, 39, 0.15)' : 'none',
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
                                      {pkgItem.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: pkgItem.refundableText.includes('50%') ? 'secondary.main' : 'text.secondary', fontWeight: 700 }}>
                                      ● {pkgItem.refundableText}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                    {isOptADisabled && (
                                      <Chip
                                        label="✓ PAID (€250 Assessment Fee Cleared)"
                                        color="success"
                                        size="small"
                                        sx={{
                                          fontWeight: 900,
                                          fontSize: '0.65rem',
                                          mb: 0.5
                                        }}
                                      />
                                    )}
                                    {pkgItem.isRecommended && !isOptADisabled && (
                                      <Chip
                                        label="✨ RECOMMENDED PACKAGE"
                                        size="small"
                                        sx={{
                                          bgcolor: '#C59B27',
                                          color: '#051A3B',
                                          fontWeight: 900,
                                          fontSize: '0.65rem'
                                        }}
                                      />
                                    )}
                                    {isCreditApplicable && (
                                      <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                                        €{totalBaseBeforeCredit}
                                      </Typography>
                                    )}
                                    <Typography variant="h6" color={isOptADisabled ? 'success.main' : 'secondary.main'} sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                                      {isOptADisabled ? 'PAID' : `€${finalCardPrice}`}
                                    </Typography>
                                    {effectiveAddCount > 0 && !isOptA && (
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                        (Main €{basePrice} + {effectiveAddCount} Add-on €{addCost})
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1, lineHeight: 1.5 }}>
                                  {pkgItem.description}
                                </Typography>

                                {/* Features List */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                                  {pkgItem.includes.map((inc, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CheckCircleIcon sx={{ color: isOptADisabled ? 'success.main' : '#C59B27', fontSize: 16 }} />
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {inc}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                  {isOptADisabled ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                      <Chip label="✓ Completed & Deducted" color="success" size="small" sx={{ fontWeight: 800 }} />
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="success"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingReceiptForOptA(true);
                                          setShowInvoiceModal(true);
                                        }}
                                        sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem' }}
                                      >
                                        Download Receipt 📄
                                      </Button>
                                    </Box>
                                  ) : isSelected ? (
                                    <Chip label="Selected Package" color="secondary" size="small" sx={{ fontWeight: 800 }} />
                                  ) : (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Click card to select</Typography>
                                  )}

                                  {!isOptADisabled && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingReceiptForOptA(false);
                                        setSelectedPackage(pkgCode);
                                        setShowInvoiceModal(true);
                                      }}
                                      sx={{
                                        bgcolor: isSelected ? '#C59B27' : '#051A3B',
                                        color: isSelected ? '#051A3B' : '#C59B27',
                                        fontWeight: 800,
                                        borderRadius: 2,
                                        px: 2.5,
                                        py: 0.75,
                                        textTransform: 'none',
                                        fontSize: '0.8rem',
                                        fontFamily: 'Outfit, sans-serif',
                                        '&:hover': { bgcolor: '#C59B27', color: '#051A3B' }
                                      }}
                                    >
                                      Select & View Invoice →
                                    </Button>
                                  )}
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Box>
                    </Grid>

                    {/* Order Summary & Live Checkout Panel */}
                    <Grid item xs={12} lg={4}>
                      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', bgcolor: '#F9FAFB', borderRadius: 3.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#051A3B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Order Summary & Tax Calculation
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />

                        {(() => {
                          const packagesList = (dbPackages && dbPackages.length > 0)
                            ? dbPackages.map(pkg => ({
                                id: pkg.id,
                                code: pkg.code || pkg.id,
                                name: pkg.name,
                                price: Number(pkg.price) || 0,
                                additionalApplicantPrice: Number(pkg.additionalApplicantPrice) || 500,
                                isRecommended: !!pkg.isRecommended,
                                isFixedPrice: !!pkg.isFixedPrice,
                                includes: Array.isArray(pkg.includes) ? pkg.includes : []
                              }))
                            : DEFAULT_PACKAGES;
                          const activePkg = packagesList.find(p => p.code === selectedPackage || p.id === selectedPackage) || packagesList[0];
                          const activePkgCode = activePkg.code || activePkg.id;
                          const isOptA = activePkgCode === 'OPTION_A' || activePkgCode === 'opt_a';
                          const effectiveAddCount = isOptA ? 0 : addApplicants;
                          const baseFee = activePkg.price || 0;
                          const addFee = activePkg.isFixedPrice ? 0 : (effectiveAddCount * (activePkg.additionalApplicantPrice || 500));
                          const totalBase = baseFee + addFee;
                          const creditEligible = (activePkgCode !== 'OPTION_A' && activePkgCode !== 'opt_a') && assessmentCredit > 0;
                          const creditDeduction = creditEligible ? 250 : 0;
                          const subtotalExclVat = Math.max(0, totalBase - creditDeduction);
                          const vat5 = subtotalExclVat * 0.05;
                          const payableGrandTotal = subtotalExclVat * 1.05;

                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Selected Package:</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#051A3B' }}>{activePkg.code}</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Main Applicant Base:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>€{baseFee.toFixed(2)}</Typography>
                              </Box>

                              {effectiveAddCount > 0 && !isOptA && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Co-Applicants ({effectiveAddCount}):</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>+€{addFee.toFixed(2)}</Typography>
                                </Box>
                              )}

                              {creditDeduction > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                                  <Typography variant="body2" color="inherit">Option A Assessment Credit:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 800 }}>-€250.00</Typography>
                                </Box>
                              )}

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Subtotal (Excl. VAT):</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>€{subtotalExclVat.toFixed(2)}</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">VAT (5%):</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>€{vat5.toFixed(2)}</Typography>
                              </Box>

                              <Divider sx={{ my: 1 }} />

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#051A3B' }}>Total Payable Amount:</Typography>
                                <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                                  €{payableGrandTotal.toFixed(2)}
                                </Typography>
                              </Box>

                              <Divider sx={{ my: 1.5 }} />

                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                Payment Method
                              </Typography>
                              <TextField
                                select
                                size="small"
                                fullWidth
                                value={billingPaymentMethod}
                                onChange={(e) => setBillingPaymentMethod(e.target.value)}
                                sx={{ mb: 2 }}
                              >
                                <MenuItem value="card">Credit / Debit Card (Visa/Mastercard) 💳</MenuItem>
                                <MenuItem value="apple">Apple Pay / Google Pay 📱</MenuItem>
                                <MenuItem value="wallet">Link Wallet 💼</MenuItem>
                                <MenuItem value="tabby">Tabby (UAE Residents Only) 🇦🇪</MenuItem>
                                <MenuItem value="tamara">Tamara (UAE Residents Only) 🇦🇪</MenuItem>
                                <MenuItem value="bank">Emirates NBD Wire Transfer 🏦</MenuItem>
                              </TextField>

                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}>
                                <input
                                  type="checkbox"
                                  id="billing-tc-checkbox"
                                  checked={billingTermsChecked}
                                  onChange={(e) => setBillingTermsChecked(e.target.checked)}
                                  style={{ marginTop: 3, transform: 'scale(1.1)', cursor: 'pointer' }}
                                />
                                <label htmlFor="billing-tc-checkbox" style={{ fontSize: '0.75rem', color: '#4B5563', cursor: 'pointer', lineHeight: 1.35, fontWeight: 500 }}>
                                  I have read and accepted the Company's <a href="https://aaabusinessconsultancy.com/terms-conditions/" target="_blank" rel="noopener noreferrer" style={{ color: '#051A3B', textDecoration: 'underline', fontWeight: 700 }}>Terms and Conditions</a> and refund rules.
                                </label>
                              </Box>

                              <Button
                                variant="contained"
                                fullWidth
                                disabled={!billingTermsChecked || selectAndPayPackageMutation.isPending}
                                onClick={() => {
                                  if (!billingTermsChecked) {
                                    showAlert('Please check the box to confirm you agree to the Terms and Conditions.', 'warning');
                                    return;
                                  }
                                  setShowInvoiceModal(true);
                                }}
                                sx={{
                                  py: 1.2,
                                  borderRadius: 2.5,
                                  fontWeight: 900,
                                  textTransform: 'none',
                                  bgcolor: billingTermsChecked ? '#051A3B' : 'rgba(5, 26, 59, 0.35)',
                                  color: 'white',
                                  fontFamily: 'Outfit, sans-serif',
                                  '&:hover': { bgcolor: '#C59B27', color: '#051A3B' }
                                }}
                              >
                                View Invoice & Pay Now →
                              </Button>

                              <Box sx={{ mt: 2, p: 1.5, border: '1px solid rgba(197,155,39,0.3)', bgcolor: '#FAF6ED', borderRadius: 2.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#A37E1C', display: 'block', mb: 0.5 }}>⚠️ REFUND GUARANTEE TERMS</Typography>
                                <Typography variant="caption" sx={{ color: '#A37E1C', display: 'block', fontSize: '0.68rem', lineHeight: 1.3, fontWeight: 500 }}>
                                  Option B & D: 50% refund if visa application is rejected (Subject to T&C). Option A & C are non-refundable.
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })()}
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

            {!isRefundEligible ? (
              <Box className="col-span-12">
                <Paper
                  sx={{
                    p: 5,
                    borderRadius: 3.5,
                    border: '1.5px dashed #D97706',
                    bgcolor: '#FFFBEB',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(217, 119, 6, 0.08)'
                  }}
                >
                  <LockIcon sx={{ fontSize: 64, color: '#D97706', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#78350F', fontFamily: 'Outfit, sans-serif', mb: 1.5 }}>
                    🔒 Refund & Guarantee Claims Policy Notice
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#92400E', maxWidth: 680, mx: 'auto', lineHeight: 1.6, mb: 3, fontWeight: 500 }}>
                    Our 50% Money-Back Guarantee Policy applies exclusively to clients who have purchased the <strong>End-to-End Full Processing Package (Option B)</strong> or <strong>Premium Package (Option C)</strong>.
                    <br /><br />
                    Professional Case Assessment (€250), Administrative Relocation Package (Option D), and Tourist Visa Packages are <strong>non-refundable</strong>. Refund request eligibility automatically unlocks upon upgrading to Option B or Option C.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setTabValue(1)}
                    sx={{
                      bgcolor: '#051A3B',
                      color: '#C59B27',
                      fontWeight: 900,
                      borderRadius: 2.5,
                      px: 4,
                      py: 1.3,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      fontFamily: 'Outfit, sans-serif',
                      '&:hover': { bgcolor: '#C59B27', color: '#051A3B' }
                    }}
                  >
                    View Relocation Packages & Upgrade →
                  </Button>
                </Paper>
              </Box>
            ) : (
              <>
                {/* Refund Claim Form Card */}
                <Box className="col-span-12 md:col-span-7 flex flex-col h-full">
                  <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#051A3B', mb: 2 }}>
                      Submit New Refund Claim
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: '#FFFBEB',
                            border: '1.5px solid #D97706',
                            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#78350F',
                              fontWeight: 800,
                              fontSize: '0.875rem',
                              lineHeight: 1.5,
                              fontFamily: 'Outfit, sans-serif'
                            }}
                          >
                            📌 <strong>Note:</strong> If the visa is rejected after the resubmission or appeal process, the client will receive a 100% refund, subject to the Company’s Terms and Conditions.
                          </Typography>
                        </Box>
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

                      {/* Claim Category / Type */}
                      <FormControl fullWidth size="small">
                        <InputLabel id="claim-category-label">Refund Category</InputLabel>
                        <Select
                          labelId="claim-category-label"
                          value={claimCategory}
                          onChange={(e) => setClaimCategory(e.target.value)}
                          label="Refund Category"
                        >
                          <MenuItem value="Visa Rejection (50% Guarantee)">Visa Rejection (50% Money-Back Guarantee)</MenuItem>
                          <MenuItem value="Full Refund (100% Appeal / Resubmission Rejection)">Full Refund (100% Appeal / Resubmission Rejection)</MenuItem>
                          <MenuItem value="Consulate Appointment Delay">Consulate Appointment Delay</MenuItem>
                          <MenuItem value="Overpayment / Duplicate Charge">Overpayment / Duplicate Charge</MenuItem>
                          <MenuItem value="Other Case Issues">Other Case Issues</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Official Proof Upload Button */}
                      <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: '#F9FAFB' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                          Upload Official Embassy Rejection Letter (PDF / JPG) *
                        </Typography>

                        {claimProofUrl ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <CheckCircleIcon color="success" size="small" />
                            <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                              Rejection Letter Uploaded Successfully!
                            </Typography>
                            <Button size="small" color="error" onClick={() => setClaimProofUrl('')}>
                              Remove
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            startIcon={<UploadFileIcon />}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                          >
                            Select Rejection Document
                            <input
                              type="file"
                              hidden
                              accept="application/pdf,image/*"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  try {
                                    showAlert('Uploading rejection letter...', 'info');
                                    const uploadRes = await dbService.uploadDocument(file);
                                    if (uploadRes?.url) {
                                      setClaimProofUrl(uploadRes.url);
                                      showAlert('Rejection letter uploaded successfully!', 'success');
                                    } else {
                                      setClaimProofUrl(URL.createObjectURL(file));
                                      showAlert('File ready for review submission.', 'success');
                                    }
                                  } catch (err) {
                                    setClaimProofUrl(URL.createObjectURL(file));
                                    showAlert('Document attached to claim.', 'success');
                                  }
                                }
                              }}
                            />
                          </Button>
                        )}
                      </Box>

                      {/* Bank Details for Refund Payout */}
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Bank Account Holder Name"
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
              </>
            )}
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

      {/* Official Itemized Tax Invoice Modal */}
      <Dialog
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1,
            boxShadow: '0 20px 60px rgba(5, 26, 59, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ReceiptLongIcon sx={{ color: '#C59B27', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
                AAA BUSINESS CONSULTANCY LLC
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
                OFFICIAL TAX INVOICE & RELOCATION STATEMENT
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setShowInvoiceModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {(() => {
            const isShowingOptAReceipt = viewingReceiptForOptA || (isOptionAPackage(selectedPackage) && isOptAPaid);
            
            const activeCode = isShowingOptAReceipt ? 'OPTION_A' : selectedPackage;
            const currentPkg = isShowingOptAReceipt
              ? (dbPackages.find(p => isOptionAPackage(p)) || { name: 'Option A: Professional Case Assessment', price: 250, isFixedPrice: true })
              : ((dbPackages && dbPackages.length > 0)
                ? (dbPackages.find(p => (p.code || p.id) === activeCode) || dbPackages[0])
                : {
                  OPTION_A: { name: 'Option A: Professional Case Assessment', price: 250, additionalApplicantPrice: 0, isFixedPrice: true },
                  full_process: { name: 'OPTION B: FULL PROCESSING PACKAGE', price: 3500, additionalApplicantPrice: 500 },
                  premium: { name: 'OPTION C: PREMIUM PACKAGE', price: 4750, additionalApplicantPrice: 750 },
                  relocation: { name: 'OPTION D: ADMINISTRATIVE RELOCATION PACKAGE', price: 1750, additionalApplicantPrice: 500 }
                }[activeCode] || { name: 'Option A: Professional Case Assessment', price: 250, additionalApplicantPrice: 0, isFixedPrice: true });
            
            const isOptA = isOptionAPackage(currentPkg || activeCode);
            const effectiveAddCount = isOptA ? 0 : addApplicants;

            const basePrice = currentPkg?.price || (isOptA ? 250 : 3500);
            const addPrice = currentPkg?.isFixedPrice ? 0 : (effectiveAddCount * (currentPkg?.additionalApplicantPrice || 500));
            const subTotal = isOptA ? basePrice : Math.max(0, basePrice + addPrice - assessmentCredit);
            const vat5 = subTotal * 0.05;
            const grandTotal = subTotal * 1.05;

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Meta Header */}
                <Grid container spacing={2} sx={{ p: 2.5, bgcolor: '#FAF6ED', borderRadius: 3, border: '1px solid rgba(197, 155, 39, 0.3)' }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Billed To:</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
                      {client ? `${client.firstName} ${client.lastName}` : 'Valued Client'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{client?.email || 'client@email.com'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Ref / Passport: {client?.passportNumber || client?.id || 'CLIENT-REF'}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                    {isOptA && isOptAPaid ? (
                      <Chip label="PAID RECEIPT" color="success" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                    ) : (
                      <Chip label="UNPAID INVOICE" color="warning" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                      INVOICE NO: INV-2026-{(client?.id || '84920').slice(-6).toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
                      Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
                      Payment Status: {isOptA && isOptAPaid ? 'Paid in Full (€250 + VAT)' : 'Immediate upon selection'}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Itemized Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#051A3B' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 800 }}>Item & Description</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 800 }}>Amount (€)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#051A3B' }}>
                          {currentPkg?.name || 'Spain Relocation Visa Package'}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                            Includes professional eligibility guidance, document sworn translations, compliance review, and file assembly.
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>€{basePrice.toFixed(2)}</TableCell>
                      </TableRow>

                      {effectiveAddCount > 0 && !isOptA && (
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Co-Applicants Relocation Support ({effectiveAddCount} person(s))
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>+€{addPrice.toFixed(2)}</TableCell>
                        </TableRow>
                      )}

                      {assessmentCredit > 0 && !isOptA && (
                        <TableRow>
                          <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>
                            Eligibility Assessment Fee Credit (100% Deduction)
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>-€{assessmentCredit.toFixed(2)}</TableCell>
                        </TableRow>
                      )}

                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Subtotal (Excl. VAT)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>€{(isOptA ? basePrice : subTotal).toFixed(2)}</TableCell>
                      </TableRow>

                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>UAE Standard VAT (5%)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>€{(isOptA ? basePrice * 0.05 : vat5).toFixed(2)}</TableCell>
                      </TableRow>

                      <TableRow sx={{ bgcolor: isOptA && isOptAPaid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(197, 155, 39, 0.1)' }}>
                        <TableCell sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
                          {isOptA && isOptAPaid ? 'TOTAL AMOUNT PAID' : 'TOTAL AMOUNT DUE'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.25rem', color: isOptA && isOptAPaid ? 'success.main' : '#C59B27', fontFamily: 'Outfit, sans-serif' }}>
                          €{(isOptA ? basePrice * 1.05 : grandTotal).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Terms Checkbox inside Modal */}
                {!(isOptA && isOptAPaid) && (
                  <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.06)' }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        id="modal-billing-tc"
                        checked={billingTermsChecked}
                        onChange={(e) => setBillingTermsChecked(e.target.checked)}
                        style={{ marginTop: 3, transform: 'scale(1.2)', cursor: 'pointer' }}
                      />
                      <label htmlFor="modal-billing-tc" style={{ fontSize: '0.8rem', color: '#374151', cursor: 'pointer', fontWeight: 500, lineHeight: 1.4 }}>
                        I agree to Spain Visa <a href="https://aaabusinessconsultancy.com/terms-conditions/" target="_blank" rel="noopener noreferrer" style={{ color: '#051A3B', textDecoration: 'underline', fontWeight: 700 }}>Terms of Service</a>, <strong>50% Money-Back Refund Guarantee</strong> policies if refused, and relocation service rules.
                      </label>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })()}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#FAF6ED', borderTop: '1px solid rgba(0,0,0,0.08)', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: 'none', color: '#051A3B', borderColor: '#051A3B', fontFamily: 'Outfit, sans-serif' }}
          >
            Print / Download PDF
          </Button>

          {!viewingReceiptForOptA && !isOptionAPackage(selectedPackage) && (
            <Button
              variant="contained"
              disabled={!billingTermsChecked || selectAndPayPackageMutation.isPending}
              onClick={() => {
                setShowInvoiceModal(false);
                const currentPkg = (dbPackages && dbPackages.length > 0)
                  ? (dbPackages.find(p => (p.code || p.id) === selectedPackage) || dbPackages[0])
                  : null;
                const isOptA = selectedPackage === 'OPTION_A' || selectedPackage === 'opt_a' || currentPkg?.code === 'OPTION_A' || currentPkg?.code === 'opt_a';
                const effectiveAddCount = isOptA ? 0 : addApplicants;
                const baseFee = currentPkg?.price || (selectedPackage === 'premium' ? 4750 : (selectedPackage === 'relocation' ? 1750 : 3500));
                const addPrice = currentPkg?.isFixedPrice ? 0 : (effectiveAddCount * (currentPkg?.additionalApplicantPrice || 500));
                const subTotal = Math.max(0, baseFee + addPrice - assessmentCredit);

                selectAndPayPackageMutation.mutate({
                  packageId: selectedPackage,
                  additionalApplicants: effectiveAddCount,
                  clientId: client?.id || clientId,
                  amount: Math.max(0, subTotal),
                  discount: 0
                });
              }}
              sx={{
                py: 1.2,
                px: 3.5,
                borderRadius: 2.5,
                fontWeight: 900,
                textTransform: 'none',
                bgcolor: billingTermsChecked ? '#051A3B' : 'rgba(5, 26, 59, 0.35)',
                color: 'white',
                fontFamily: 'Outfit, sans-serif',
                '&:hover': { bgcolor: '#C59B27', color: '#051A3B' }
              }}
            >
              {billingTermsChecked ? 'Authorize Secure Checkout 💳' : '🔒 Accept Terms to Checkout'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientPortalDocs;
