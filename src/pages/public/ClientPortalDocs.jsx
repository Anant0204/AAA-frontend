import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import aaaLogo from '../../assets/aaa-logo.png';
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
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
import { validateIBAN, normalizeIBAN, maskIBAN } from '../../utils/ibanValidator';
import spainSevillePlaza from '../../assets/spain_seville_plaza.png';
import spainRelocationLifestyle from '../../assets/spain_relocation_lifestyle.png';
import { SERVICES } from '../../constants/mockData';

const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

const API_URL = import.meta.env.VITE_API_URL || 'https://aaa-consultancy-backend-production.up.railway.app/api/v1';

const getFullDocUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

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
  const [selectedRefundForReceipt, setSelectedRefundForReceipt] = useState(null);

  // Official Letterhead PDF Generator for Refund Receipt
  const generateRefundReceiptPDF = (refund, clientData) => {
    try {
      const doc = new jsPDF();
      const amountVal = Number(refund?.amount) || 0;
      const amountStr = `€${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const receiptNo = `RF-2026-${(refund?.id || '').replace(/-/g, '').slice(-6).toUpperCase()}`;
      const clientName = clientData ? `${clientData.firstName} ${clientData.lastName}` : (client ? `${client.firstName} ${client.lastName}` : 'Valued Client');
      const clientEmail = clientData?.email || client?.email || 'N/A';
      const customerId = clientData?.clientCode || client?.clientCode || (clientData?.id ? 'CID-' + clientData.id.slice(-5).toUpperCase() : (client?.id ? 'CID-' + client.id.slice(-5).toUpperCase() : 'CID-12039'));
      const dateStr = refund?.date || (refund?.createdAt ? dayjs(refund.createdAt).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY'));

      // 1. Header (Logo & Company Name)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(12, 35, 64);
      doc.text("AAA BUSINESS CONSULTANCY L.L.C", 14, 20);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(197, 155, 39);
      doc.text("ADVISE  *  ASSIST  *  ACHIEVE", 14, 25);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Email: client@aaabusinessconsultancy.com | Tel: +971509554142", 14, 31);
      doc.text("Business Village B, Office F-09, Port Saeed, Deira, Dubai, UAE", 14, 36);

      // Gold line
      doc.setDrawColor(197, 155, 39);
      doc.setLineWidth(0.8);
      doc.line(14, 40, 196, 40);

      // 2. Title & Status
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(12, 35, 64);
      doc.text("OFFICIAL REFUND STATEMENT & RECEIPT", 14, 50);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Receipt #: ${receiptNo}`, 130, 50);
      doc.text(`Date Issued: ${dateStr}`, 130, 56);
      doc.text(`Status: ${refund?.status || 'Processed'}`, 130, 62);

      // 3. Client & Payout Box
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 68, 182, 30, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 68, 182, 30, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("REFUND ISSUED TO", 18, 76);
      doc.setFontSize(10);
      doc.setTextColor(12, 35, 64);
      doc.text(clientName, 18, 83);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Email: ${clientEmail}`, 18, 89);
      doc.text(`Customer ID: ${customerId}`, 18, 94);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("PAYMENT & PAYOUT DETAILS", 115, 76);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(`Payout Method: ${refund?.payoutMethod || 'Credit Card / Direct Transfer'}`, 115, 83);
      doc.text(`Ref / UTR: ${refund?.transactionRef || 'STRIPE-RF-' + (refund?.id || '').slice(0, 8)}`, 115, 89);

      // 4. Table Header
      doc.setFillColor(12, 35, 64);
      doc.rect(14, 106, 182, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Item & Description", 18, 111.5);
      doc.text("Category", 120, 111.5);
      doc.text("Amount (€)", 165, 111.5);

      // 5. Table Body
      doc.setTextColor(12, 35, 64);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("Spain Visa 100% Money-Back Guarantee Refund Settlement", 18, 122);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Official refund processed under AAA Business Consultancy Terms & Conditions.", 18, 127);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`${refund?.category || 'Visa Rejection'}`, 120, 122);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(197, 155, 39);
      doc.text(amountStr, 165, 122);

      // Line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(14, 135, 196, 135);

      // 6. Grand Total Box
      doc.setFillColor(12, 35, 64);
      doc.rect(115, 142, 81, 14, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("TOTAL REFUNDED:", 119, 151);
      doc.setTextColor(250, 204, 21);
      doc.setFontSize(11);
      doc.text(amountStr, 162, 151);

      // Footer
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Thank you for choosing AAA Business Consultancy for your Spain Relocation journey.", 14, 175);

      doc.save(`Refund_Receipt_${receiptNo}.pdf`);
    } catch (err) {
      console.error("Refund receipt PDF generation failed:", err);
      window.print();
    }
  };

  // Sworn Translation Add-on State
  const [addonFile, setAddonFile] = useState(null);
  const [addonCategory, setAddonCategory] = useState('Passport');
  const [addonCustomCategory, setAddonCustomCategory] = useState('');
  const [addonWordCount, setAddonWordCount] = useState(0);
  const [addonSourceLang, setAddonSourceLang] = useState('English');
  const [addonTargetLang, setAddonTargetLang] = useState('Spanish');
  const [addonCalcPrice, setAddonCalcPrice] = useState(0);
  const [addonLoading, setAddonLoading] = useState(false);
  const [addonAnalyzing, setAddonAnalyzing] = useState(false);

  // Staged Documents Batch Upload State (Main Applicant + Additional Applicants)
  const [stagedFiles, setStagedFiles] = useState({});

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

  const isRefundGuaranteePackage = (pkg, serviceType = '') => {
    if (!pkg && !serviceType) return false;

    // 1. Direct object isRefundable property check
    if (typeof pkg === 'object' && pkg !== null && typeof pkg.isRefundable === 'boolean') {
      return pkg.isRefundable;
    }

    // 2. DB packages lookup by id, code, or name
    if (Array.isArray(dbPackages) && dbPackages.length > 0) {
      const targetId = typeof pkg === 'string' ? pkg : (pkg?.id || pkg?.code || pkg?.name || '');
      const foundInDb = dbPackages.find(p => 
        p.id === targetId || 
        p.code === targetId || 
        (p.code && targetId && p.code.toLowerCase() === targetId.toLowerCase()) ||
        (p.name && targetId && p.name.toLowerCase() === targetId.toLowerCase()) ||
        (typeof pkg === 'object' && pkg !== null && (p.id === pkg.id || p.code === pkg.code || p.name === pkg.name))
      );
      if (foundInDb && typeof foundInDb.isRefundable === 'boolean') {
        return foundInDb.isRefundable;
      }
    }

    let pkgStr = '';
    if (typeof pkg === 'string') {
      pkgStr = pkg.toLowerCase();
    } else if (typeof pkg === 'object' && pkg !== null) {
      pkgStr = `${pkg.code || ''} ${pkg.id || ''} ${pkg.name || ''}`.toLowerCase();
    }
    const fullTarget = `${pkgStr} ${(serviceType || '').toLowerCase()}`;

    // Refundable packages: Full Professional Processing Package & Premium Package
    if (
      fullTarget.includes('premium') ||
      fullTarget.includes('full professional') ||
      fullTarget.includes('full processing') ||
      fullTarget.includes('full_process') ||
      fullTarget.includes('option_b') ||
      fullTarget.includes('opt_b') ||
      fullTarget.includes('option_d') ||
      fullTarget.includes('opt_d')
    ) {
      return true;
    }

    // Explicit non-refundable services/packages: Case Assessment, Tourist Visa, Relocation Assistance
    if (
      fullTarget.includes('assessment') ||
      fullTarget.includes('option_a') ||
      fullTarget.includes('option a') ||
      fullTarget.includes('opt_a') ||
      fullTarget.includes('tourist') ||
      fullTarget.includes('schengen') ||
      fullTarget.includes('administrative') ||
      fullTarget.includes('relocation')
    ) {
      return false;
    }

    return false;
  };

  const getServicesProvidedText = (rawService) => {
    const service = String(rawService || '').trim();
    if (!service) return 'Services Provided: Spain Visa & Relocation Service';

    const s = service.toLowerCase();
    
    if (s.includes('dnv') || s.includes('digital nomad')) {
      return 'Services Provided: Digital Nomad Visa (DNV)';
    }
    if (s.includes('nlv') || s.includes('non-lucrative')) {
      return 'Services Provided: Non-Lucrative Visa (NLV)';
    }
    if (s.includes('study') || s.includes('student')) {
      return 'Services Provided: Spain Study Visa';
    }
    if (s.includes('tourist') || s.includes('schengen') || s.includes('tourism')) {
      return 'Services Provided: Spain Tourist Visa';
    }
    if (s.includes('self_employed') || s.includes('business') || s.includes('self-employed')) {
      return 'Services Provided: Spain Self-Employed / Business Visa';
    }
    if (s.includes('translation') || s.includes('sworn')) {
      return 'Services Provided: Spanish Sworn Translation';
    }
    if (s.includes('property') || s.includes('golden')) {
      return 'Services Provided: Property Investment Guidance';
    }
    if (s.includes('family') || s.includes('reunification') || s.includes('partner')) {
      return 'Services Provided: Partner & Family Reunification';
    }

    return `Services Provided: ${service}`;
  };

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const selectAndPayPackageMutation = useMutation({
    mutationFn: async ({ packageId, additionalApplicants, clientId, amount, discount, couponCode }) => {
      return await dbService.createCheckoutSession({ 
        packageId, 
        additionalApplicants, 
        clientId, 
        amount, 
        discount, 
        paymentMethod: 'stripe',
        couponCode 
      });
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
      refundableText: '100% refundable if visa is rejected (Subject to T&C)',
      description: 'Complete professional end-to-end support for Spain Residency applications from eligibility to submission.',
      includes: [
        'Complete End-to-End Application Processing & Strategy',
        'Eligibility & Document Auditing',
        'Official Sworn Translation Management',
        'Digital Nomad / NLV File Assembly',
        'Consulate Appointment Assistance & Status Tracking',
        '100% Refundable if visa application is rejected (Subject to T&C)'
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
      refundableText: '100% refundable if visa is rejected (Subject to T&C)',
      description: 'Everything in Full Process + complete relocation administrative assistance in Spain.',
      includes: [
        'Everything in Full Processing Package (End-to-End Service)',
        'Everything in Administrative Relocation Package (In-Spain Setup)',
        'Spanish Bank Account Opening Assistance',
        'NIE / TIE Fingerprint Appointment Booking',
        'Empadronamiento (Town Hall Registration)',
        'Spanish Social Security Registration',
        '100% Refundable if visa application is rejected (Subject to T&C)'
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
  const [mainApplicantPassportNumber, setMainApplicantPassportNumber] = useState('');

  const handleApplicantsCountChange = (newCount) => {
    const validCount = Math.max(0, newCount);
    setAddApplicants(validCount);
    setWizardDeps((prevDeps) => {
      const updated = [...prevDeps];
      if (validCount > updated.length) {
        for (let i = updated.length; i < validCount; i++) {
          updated.push({
            firstName: '',
            lastName: '',
            relation: 'Spouse',
            passportNumber: '',
            nationality: ''
          });
        }
        return updated;
      } else if (validCount < updated.length) {
        return updated.slice(0, validCount);
      }
      return updated;
    });
  };

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

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
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
      setMainApplicantPassportNumber(client.passportNumber || '');
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
          const isStandard = ['Spouse', 'Child', 'Parent'].includes(rawRel);
          const relationType = isStandard ? rawRel : 'Other';
          const customRelation = isStandard ? '' : (rawRel.startsWith('Other:') ? rawRel.replace(/^Other:\s*/, '') : (rawRel === 'Other' ? '' : rawRel));
          initialDeps.push({
            firstName: saved[i]?.firstName || '',
            lastName: saved[i]?.lastName || '',
            relation: relationType,
            customRelation: customRelation,
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
      (p.status === 'Paid' || p.status === 'Payment Completed') &&
      allRefundableCodes.includes(p.packageType) &&
      p.packageType !== 'OPTION_A' &&
      p.amount !== 262.50 &&
      p.amount !== 250
    )
  );

  const currentStatusUpper = String(client?.status || '').toUpperCase();
  const isFullyPaidStatus = ['PAYMENT COMPLETED', 'PAID', 'UNDER PROCESS', 'PROCESSING', 'ACTIVE'].includes(currentStatusUpper) && currentStatusUpper !== 'PARTIALLY PAID' && currentStatusUpper !== 'WAITING FOR PAYMENT';
  const isRefundEligible = Boolean(
    hasEligibleRefundPayment ||
    (isFullyPaidStatus && (allRefundableCodes.includes(client?.packageId) || Boolean(client?.documentUploadAllowed)))
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
    (paidAssessment && (new Date() - new Date(paidAssessment.paidAt || paidAssessment.updatedAt || paidAssessment.createdAt || Date.now())) <= FOURTEEN_DAYS_MS) ||
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

  const isTranslationPaid = Boolean(
    translationPaid ||
    hasAnyPaidPayment ||
    isFullyPaidStatus ||
    client?.billingStatus === 'Payment Completed' ||
    client?.status === 'Payment Completed' ||
    client?.status === 'Paid'
  );

  useEffect(() => {
    if (!isTranslationClient && !isClientPaid && !isProfileLoading && !isClientsLoading) {
      setTabValue(1);
    }
  }, [isTranslationClient, isClientPaid, isProfileLoading, isClientsLoading]);

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
    const subtotal = parseFloat(((addonWordCount || 0) * rate).toFixed(2));
    const vat = parseFloat((subtotal * 0.05).toFixed(2));
    setAddonCalcPrice(parseFloat((subtotal + vat).toFixed(2)));
  }, [addonSourceLang, addonTargetLang, addonWordCount, generalSettings]);

  const handleAddonFileSelect = async (file) => {
    if (!file) return;
    setAddonFile(file);
    setAddonAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('documents', file);
      formData.append('firstName', client?.firstName || 'Client');
      formData.append('lastName', client?.lastName || 'User');
      formData.append('email', client?.email || 'client@example.com');
      formData.append('phone', client?.phone || '+971500000000');
      formData.append('sourceLanguage', addonSourceLang);
      formData.append('targetLanguage', addonTargetLang);
      formData.append('documentsMetadata', JSON.stringify([{
        index: 0,
        name: file.name,
        category: addonCategory,
        documentLanguage: addonSourceLang,
        sourceLanguage: addonSourceLang,
        targetLanguage: addonTargetLang
      }]));

      const res = await axios.post(`${API_URL}/booking/translation/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const resData = res.data?.data || {};
      const count = Number(resData.totalWordCount || resData.wordCount || (resData.documents?.[0]?.wordCount)) || 0;
      setAddonWordCount(count);
      showAlert(`Document analyzed: ${count} word${count === 1 ? '' : 's'} detected in "${file.name}"`, 'info');
    } catch (err) {
      console.warn('Could not auto-extract word count:', err);
    } finally {
      setAddonAnalyzing(false);
    }
  };

  const handlePayAddon = async () => {
    if (!addonFile) return;
    try {
      setAddonLoading(true);

      // 1. Upload document so it is safely registered under client's dossier
      let category = addonCategory;
      if (addonCategory === 'Other') {
        category = `Other: ${addonCustomCategory || 'General Document'}`;
      }
      await dbService.uploadDocument({
        file: addonFile,
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        category: category,
        wordCount: addonWordCount
      });

      // 2. Generate Live Stripe Checkout Session
      const paymentLinkData = await dbService.generatePaymentLink({
        clientId: client.id,
        amount: addonCalcPrice,
        discount: 0,
        gateway: 'stripe',
        serviceType: 'Spanish Sworn Translation',
        packageName: 'Certified Spanish Sworn Translation (Add-on Document)',
        wordCount: addonWordCount
      });

      // 3. Reset local file input
      setAddonFile(null);
      setAddonWordCount(0);
      setAddonCategory('Passport');
      setAddonCustomCategory('');
      const inputEl = document.getElementById('portal-addon-file');
      if (inputEl) inputEl.value = '';

      // 4. Redirect to Stripe Checkout page
      if (paymentLinkData && paymentLinkData.paymentUrl && paymentLinkData.paymentUrl.startsWith('http')) {
        window.location.href = paymentLinkData.paymentUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        refetchDocs();
        showAlert('Add-on order registered successfully! 🎉', 'success');
      }
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Add-on checkout failed. Please try again.', 'error');
    } finally {
      setAddonLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    try {
      const doc = new jsPDF();
      const invoiceId = `REC-ST-${client.id.substring(0, 8).toUpperCase()}`;
      const paymentDate = new Date().toLocaleDateString('en-GB');

      const receiptCustomerId = client?.clientCode || (client?.id ? `CID-${client.id.slice(-5).toUpperCase()}` : 'N/A');
      const qualDocsList = client?.lead?.qualificationData?.documents || client?.qualificationData?.documents || [];
      const uniqueLangs = [...new Set(
        qualDocsList.map(qd => qd.sourceLanguage || qd.documentLanguage).filter(Boolean)
      )];
      const cleanSourceLangs = uniqueLangs.length > 0 
        ? uniqueLangs.join(', ') 
        : (client?.sourceLanguage || sourceLang || 'English');

      // 1. BRAND LETTERHEAD HEADER (OFFICIAL INVOICE LETTERHEAD)
      try {
        doc.addImage(aaaLogo, 'PNG', 14, 10, 15, 15);
      } catch (imgErr) {
        console.warn('Logo embed warn:', imgErr);
      }

      // Vertical Gold Line next to logo
      doc.setDrawColor(197, 155, 39); // #C59B27
      doc.setLineWidth(0.6);
      doc.line(31, 10, 31, 26);

      // Company Title & Tagline Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(12, 35, 64); // #0C2340
      doc.text('AAA BUSINESS CONSULTANCY L.L.C', 34, 15.5);

      // Tagline container with gold border lines
      doc.setDrawColor(197, 155, 39);
      doc.setLineWidth(0.3);
      doc.line(34, 18.5, 96, 18.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(197, 155, 39);
      doc.text('ADVISE  •  ASSIST  •  ACHIEVE', 43, 21.5);
      doc.line(34, 23.5, 96, 23.5);

      // Right Header: Contact Details
      doc.setDrawColor(197, 155, 39);
      doc.setLineWidth(0.4);
      doc.line(126, 10, 126, 26);

      const contactItems = [
        'client@aaabusinessconsultancy.com',
        '+971509554142',
        'www.aaabusinessconsultancy.com',
        'Business Village B , office number F-09 Port Saeed Deira Dubai, UAE'
      ];

      doc.setFontSize(6.2);
      let contactY = 12;
      contactItems.forEach((text) => {
        doc.setFillColor(12, 35, 64);
        doc.circle(129.5, contactY - 0.8, 1.2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(12, 35, 64);
        doc.text(text, 133, contactY);
        contactY += 3.8;
      });

      // 2. DUAL-TONE ACCENT DIVIDER BAR (Navy - Gold - Navy)
      doc.setFillColor(12, 35, 64);
      doc.rect(14, 29, 58, 1.4, 'F');
      doc.setFillColor(197, 155, 39);
      doc.rect(72, 29, 64, 1.4, 'F');
      doc.setFillColor(12, 35, 64);
      doc.rect(136, 29, 60, 1.4, 'F');

      // 3. INVOICE / RECEIPT TITLE & STATUS
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(12, 35, 64);
      doc.text('OFFICIAL PAYMENT RECEIPT', 14, 40);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text(`Receipt #: ${invoiceId}`, 14, 46);

      // Status Badge (Paid)
      doc.setFillColor(220, 252, 231); // Light green #DCFCE7
      doc.setDrawColor(134, 239, 172); // Border #86EFAC
      doc.setLineWidth(0.3);
      doc.roundedRect(14, 49.5, 18, 5.5, 2, 2, 'FD');
      doc.setFillColor(22, 101, 52);
      doc.circle(18, 52.2, 0.9, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52); // #166534
      doc.text('Paid', 20.5, 53.4);

      // Right meta details
      doc.setFontSize(8.2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Date Issued: ${paymentDate}`, 155, 40);
      doc.text(`Payment Gateway: Online Checkout (Stripe)`, 134, 46);

      // 4. BILL TO / SERVICE DETAILS BOX
      doc.setFillColor(248, 250, 252); // #F8FAFC
      doc.setDrawColor(226, 232, 240); // #E2E8F0
      doc.setLineWidth(0.4);
      doc.roundedRect(14, 58, 182, 30, 2.5, 2.5, 'FD');

      // Left: BILL TO
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(100, 116, 139);
      doc.text('BILL TO', 19, 64);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(12, 35, 64);
      doc.text(`${client.firstName} ${client.lastName}`, 19, 70);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Customer ID: ${receiptCustomerId}`, 19, 75.5);
      doc.text(`Email: ${client.email}`, 19, 80.5);

      // Right: SERVICE & LANGUAGE DETAILS
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(100, 116, 139);
      doc.text('SERVICE DETAILS', 115, 64);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(12, 35, 64);
      doc.text(`Spanish Sworn Translation`, 115, 70);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Source Language: ${cleanSourceLangs}`, 115, 75);
      doc.text(`Target Language: Spanish (Espanol)`, 115, 79.5);
      doc.text(`Method: Online Instant Checkout`, 115, 84);

      // 5. ITEMIZATION TABLE
      let currentY = 94;
      doc.setFillColor(12, 35, 64); // Dark Navy #0C2340
      doc.roundedRect(14, currentY, 182, 7.5, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(255, 255, 255);
      doc.text('DOCUMENT FILENAME', 19, currentY + 5);
      doc.text('CATEGORY', 95, currentY + 5);
      doc.text('STATUS', 140, currentY + 5);
      doc.text('WORDS', 176, currentY + 5);

      currentY += 12;

      let translationDocs = (documents || []).filter(
        (d) => d && (d.clientId === client?.id || d.clientId === clientId) &&
        d.category !== 'Official Sworn Output' &&
        d.belongsTo !== 'Staff Upload' &&
        d.uploadedByRole !== 'agent' &&
        d.uploadedByRole !== 'staff' &&
        d.status !== 'Rejected'
      );

      if (translationDocs.length === 0) {
        translationDocs = (documents || []).filter((d) => d && (d.clientId === client?.id || d.clientId === clientId) && d.status !== 'Rejected');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);

      let totalCalcWords = 0;
      let totalCalcSubtotal = 0;

      translationDocs.forEach((d, idx) => {
        const displayName = d.name.length > 38 ? d.name.substring(0, 35) + '...' : d.name;
        const matchQual = qualDocsList[idx] || qualDocsList.find(q => (q.name || q.filename) === d.name);
        const docWords = Number(d.wordCount) || Number(matchQual?.wordCount) || (translationDocs.length === 1 ? (client.wordCount || 0) : 0);
        totalCalcWords += docWords;

        const docLang = d.documentLanguage || d.sourceLanguage || matchQual?.documentLanguage || matchQual?.sourceLanguage || 'English';
        const rate = docLang.toLowerCase().includes('urdu') ? 0.40 : docLang.toLowerCase().includes('arabic') ? 0.25 : 0.15;
        totalCalcSubtotal += (docWords * rate);

        doc.text(displayName, 19, currentY);
        doc.text(d.category || 'Passport', 95, currentY);
        doc.text('Verified & Paid', 140, currentY);
        doc.text(String(docWords), 178, currentY);

        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.3);
        doc.line(14, currentY + 2.5, 196, currentY + 2.5);

        currentY += 7;
      });

      currentY += 3;

      // 6. TOTALS BREAKDOWN & NAVY GRAND TOTAL HIGHLIGHT BOX
      const paidPays = allPayments.filter(p => p.clientId === client.id && p.status === 'Paid');
      const totalAmountPaid = paidPays.reduce((sum, p) => sum + Number(p.amount), 0) || (totalCalcSubtotal * 1.05) || 1.15;
      const baseSubtotal = parseFloat((totalAmountPaid / 1.05).toFixed(2));
      const vatAmount = parseFloat((totalAmountPaid - baseSubtotal).toFixed(2));

      // Base Service Fee Line
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Base Service Fee', 135, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`€${baseSubtotal.toFixed(2)}`, 182, currentY, { align: 'right' });

      currentY += 5.5;

      // UAE VAT Line
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('UAE VAT (5%)', 135, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`€${vatAmount.toFixed(2)}`, 182, currentY, { align: 'right' });

      currentY += 6.5;

      // GRAND TOTAL SOLID NAVY HIGHLIGHT BOX (Exact replica of Screenshot 2)
      doc.setFillColor(12, 35, 64); // #0C2340
      doc.roundedRect(125, currentY, 71, 10, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(255, 255, 255);
      doc.text('Grand Total', 130, currentY + 6.8);

      doc.setFontSize(11);
      doc.setTextColor(245, 158, 11); // Gold #F59E0B
      doc.text(`€${totalAmountPaid.toFixed(2)}`, 191, currentY + 6.8, { align: 'right' });

      currentY += 22;

      // 7. FOOTER NOTE (Centered)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Thank you for choosing AAA Business Consultancy for your Spain Relocation journey.', 105, currentY, { align: 'center' });

      // Save PDF
      doc.save(`Receipt_Sworn_Translation_${client.firstName}_${client.lastName}.pdf`);
      showAlert('Receipt PDF generated and downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showAlert('Failed to generate PDF receipt.', 'error');
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
    mutationFn: (payload) => dbService.updateClientDependents(client.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Family member profiles saved and locked successfully!', 'success');
    },
    onError: (err) => {
      showAlert(err?.response?.data?.message || err?.message || 'Failed to save family profiles', 'error');
    }
  });

  const handleSaveWizardDeps = () => {
    for (let i = 0; i < wizardDeps.length; i++) {
      const dep = wizardDeps[i];
      if (!dep.firstName.trim() || !dep.lastName.trim() || !dep.relation.trim() || !dep.nationality.trim()) {
        showAlert(`Please fill in all details for Co-Applicant ${i + 1}`, 'warning');
        return;
      }
      if (dep.relation === 'Other' && !dep.customRelation?.trim()) {
        showAlert(`Please specify the exact relationship for Co-Applicant ${i + 1} (e.g. Brother, Sister, Cousin)`, 'warning');
        return;
      }
    }
    const formattedDeps = wizardDeps.map(dep => {
      const finalRelation = dep.relation === 'Other' ? (dep.customRelation || '').trim() || 'Other' : dep.relation.trim();
      return {
        firstName: dep.firstName.trim(),
        lastName: dep.lastName.trim(),
        relation: finalRelation,
        passportNumber: (dep.passportNumber || '').trim(),
        nationality: dep.nationality.trim()
      };
    });
    saveDependentsMutation.mutate({
      dependents: formattedDeps,
      mainPassportNumber: (mainApplicantPassportNumber || '').trim(),
      passportNumber: (mainApplicantPassportNumber || '').trim()
    });
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



  const uploadBatchDocMutation = useMutation({
    mutationFn: async (stagedList) => {
      const formData = new FormData();
      formData.append('clientId', client?.id || clientId);
      
      const metadata = stagedList.map(item => ({
        category: item.category,
        belongsTo: item.belongsTo,
        passportNumber: item.passportNumber || undefined
      }));
      formData.append('metadata', JSON.stringify(metadata));

      stagedList.forEach(item => {
        formData.append('files', item.file);
      });

      return await dbService.uploadDocumentBatch(formData);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      refetchDocs();
      setStagedFiles({});
      const count = res?.documents?.length || 1;
      showAlert(`🎉 ${count} document(s) submitted successfully as a complete package! All items are now updated in your checklist.`, 'success');
    },
    onError: (err) => {
      console.error('Batch upload error:', err);
      showAlert(err?.response?.data?.message || err?.message || 'Failed to submit document package.', 'error');
    }
  });

  const handleStageDoc = (docData, belongsTo) => {
    const stageKey = `${belongsTo}_${docData.category}_${docData.fileName}_${Date.now()}`;
    setStagedFiles(prev => ({
      ...prev,
      [stageKey]: {
        file: docData.file,
        category: docData.category,
        belongsTo: belongsTo,
        fileName: docData.fileName,
        fileSize: docData.fileSize,
        passportNumber: docData.passportNumber || undefined
      }
    }));
    showAlert(`Attached "${docData.fileName}" for ${belongsTo} (${docData.category}). Scroll down & click "Submit Complete Document Package" when all applicant passports are attached!`, 'info');
  };

  const handleUnstageDoc = (key) => {
    setStagedFiles(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleDocUploaded = (docData, belongsTo) => {
    handleStageDoc(docData, belongsTo);
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
  const translatedDocs = clientDocuments.filter(d => Boolean(d.translatedUrl) || d.status === 'Translated');
  const clientConsultations = consultations.filter((c) => c.leadId === client.id || c.lead?.clientId === client.id);
  const activeConsultation = clientConsultations.find(c => c.status === 'Scheduled' || c.status === 'Pending Assignment');
  const assignedAgent = agents.find(a => a.id === client.assignedConsultantId);

  // Document categories checklist default fallback
  const DEFAULT_CHECKLISTS = {
    dnv: { main: ['Passport'] },
    nlv: { main: ['Passport'] },
    study: { main: ['Passport'] },
    property: { main: ['Passport'] },
    family: { main: ['Passport'] }
  };

  const getRequiredDocsForPerson = (person) => {
    const serviceKey = (client.serviceId || '').toLowerCase();
    const checklists = customizationSettings?.documentChecklists?.[serviceKey] || {};

    if (person === 'Main Applicant') {
      const configured = checklists.main;
      if (Array.isArray(configured) && configured.length > 0) {
        return configured;
      }
      return ['Passport'];
    }

    // Parse dependent name
    const match = (client.dependentsDetails || []).find(dep => {
      const depNameString = `${dep.firstName} ${dep.lastName} (${dep.relation})`;
      return depNameString === person;
    });

    if (!match) {
      const configured = checklists.other;
      return (Array.isArray(configured) && configured.length > 0) ? configured : ['Passport (Copy)'];
    }

    const relation = (match.relation || '').toLowerCase();
    const age = parseInt(match.age, 10);

    let configuredList = null;
    if (relation === 'spouse') {
      configuredList = checklists.spouse;
    } else if (relation === 'child') {
      const ageThreshold = customizationSettings?.flowAutomationSettings?.adultAgeThreshold || 18;
      if (!isNaN(age) && age >= Number(ageThreshold)) {
        configuredList = checklists.adultChild;
      } else {
        configuredList = checklists.minorChild;
      }
    } else if (relation === 'parent') {
      configuredList = checklists.parent;
    } else {
      configuredList = checklists.other;
    }

    if (Array.isArray(configuredList) && configuredList.length > 0) {
      return configuredList;
    }

    return ['Passport (Copy)'];
  };

  // Generate dependent sections
  const applicantsList = [];
  applicantsList.push('Main Applicant');
  const totalCount = getApplicantsCount(client.applicantsCount);
  const totalDependents = totalCount - 1;
  const savedDeps = client.dependentsDetails || [];

  const savedDependents = Array.isArray(client?.dependentsDetails) ? client.dependentsDetails : [];
  const totalRequiredDeps = Math.max(totalDependents, addApplicants, wizardDeps.length);
  const isFamilyProfilesSaved = Boolean(
    savedDependents.length > 0 &&
    savedDependents.length >= totalRequiredDeps &&
    savedDependents.every(d => Boolean(d.firstName?.trim() && d.lastName?.trim() && d.nationality?.trim()))
  );

  for (let i = 1; i < totalCount; i++) {
    const depData = savedDeps[i - 1];
    if (depData && depData.firstName) {
      applicantsList.push(`${depData.firstName} ${depData.lastName} (${depData.relation})`);
    } else {
      applicantsList.push(`Dependent ${i}`);
    }
  }

  // Mandatory Passport Gatekeeper Validation for All Applicants
  const missingPassports = applicantsList.filter(person => {
    // 1. Check if Passport is already uploaded in DB (and NOT rejected)
    const hasUploadedPassport = documents.some(d => {
      if (d.clientId !== client?.id) return false;
      const isRejected = (d.status || d.verificationStatus || '').toLowerCase().includes('reject') || d.rejected === true;
      if (isRejected) return false;
      const docPerson = d.belongsTo || 'Main Applicant';
      const isPersonMatch = docPerson === person || (person === 'Main Applicant' && (docPerson === 'Main Applicant' || !d.belongsTo));
      const isPassport = (d.category || '').toLowerCase().includes('passport') || (d.name || '').toLowerCase().includes('passport');
      return isPersonMatch && isPassport;
    });

    // 2. Check if Passport is staged locally
    const hasStagedPassport = Object.values(stagedFiles).some(f => {
      const isPersonMatch = f.belongsTo === person;
      const isPassport = (f.category || '').toLowerCase().includes('passport') || (f.fileName || '').toLowerCase().includes('passport');
      return isPersonMatch && isPassport;
    });

    return !hasUploadedPassport && !hasStagedPassport;
  });

  const handleSubmitBatchDossier = () => {
    const stagedList = Object.values(stagedFiles);
    if (stagedList.length === 0) {
      showAlert('No new files attached to submit. Please select files for your applicants first.', 'warning');
      return;
    }

    if (missingPassports.length > 0) {
      showAlert(`Mandatory passports missing! You must attach passports for: ${missingPassports.join(', ')} before submitting.`, 'error');
      return;
    }

    uploadBatchDocMutation.mutate(stagedList);
  };

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
      {/* Printable Letterhead CSS Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, aside, .no-print, [class*="MuiDrawer"], [class*="Sidebar"], [class*="PageHeader"], [class*="MuiBackdrop-root"] {
            display: none !important;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-invoice-letterhead, .printable-invoice-letterhead * {
            visibility: visible !important;
          }
          .printable-invoice-letterhead {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 10mm !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
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
                {(totalDependents > 0 || addApplicants > 0 || wizardDeps.length > 0) && (
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
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#051A3B', fontFamily: 'Outfit, sans-serif', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                          👨‍👩‍👧‍👦 Complete Your Family Profiles
                        </Typography>
                        {isFamilyProfilesSaved && (
                          <Chip
                            icon={<LockIcon sx={{ fontSize: '1rem !important' }} />}
                            label="Profiles Saved & Locked"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                        You have registered <strong>{totalRequiredDeps} co-applicant(s)</strong>. Please fill out their profiles to generate their checklists and unlock their document upload folders.
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
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                            <TextField
                              label="First Name"
                              size="small"
                              fullWidth
                              value={client?.firstName || ''}
                              disabled
                              sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                            />
                            <TextField
                              label="Last Name"
                              size="small"
                              fullWidth
                              value={client?.lastName || ''}
                              disabled
                              sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                            />
                            <TextField
                              label="Relationship"
                              size="small"
                              fullWidth
                              value="Main Applicant"
                              disabled
                              sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                            />
                            <TextField
                              label="Nationality"
                              size="small"
                              fullWidth
                              value={client?.nationality || 'N/A'}
                              disabled
                              sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                              inputProps={{ style: { fontWeight: 600 } }}
                            />
                            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                              <TextField
                                label="Passport Number"
                                size="small"
                                fullWidth
                                disabled={isFamilyProfilesSaved}
                                value={mainApplicantPassportNumber}
                                onChange={(e) => setMainApplicantPassportNumber(e.target.value.toUpperCase())}
                                placeholder="e.g. A12345678"
                                helperText="Official passport number of the primary applicant."
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ style: { fontWeight: 700, letterSpacing: '0.8px' } }}
                                sx={{ bgcolor: isFamilyProfilesSaved ? 'rgba(0,0,0,0.02)' : '#FFFDF7' }}
                              />
                            </Box>
                          </Box>
                        </Paper>

                        {/* Co-Applicants Cards */}
                        {wizardDeps.map((dep, idx) => (
                          <Paper key={idx} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', bgcolor: isFamilyProfilesSaved ? 'rgba(248, 250, 252, 0.7)' : 'background.paper' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
                                Co-Applicant {idx + 1} Details
                              </Typography>
                              {isFamilyProfilesSaved && (
                                <Chip label="Locked" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem', color: 'text.secondary' }} />
                              )}
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                              <TextField
                                label="First Name"
                                size="small"
                                fullWidth
                                disabled={isFamilyProfilesSaved}
                                value={dep.firstName}
                                onChange={(e) => {
                                  const newDeps = [...wizardDeps];
                                  newDeps[idx].firstName = e.target.value;
                                  setWizardDeps(newDeps);
                                }}
                              />
                              <TextField
                                label="Last Name"
                                size="small"
                                fullWidth
                                disabled={isFamilyProfilesSaved}
                                value={dep.lastName}
                                onChange={(e) => {
                                  const newDeps = [...wizardDeps];
                                  newDeps[idx].lastName = e.target.value;
                                  setWizardDeps(newDeps);
                                }}
                              />
                              <FormControl fullWidth size="small" disabled={isFamilyProfilesSaved}>
                                <InputLabel id={`rel-select-label-${idx}`}>Relationship</InputLabel>
                                <Select
                                  labelId={`rel-select-label-${idx}`}
                                  label="Relationship"
                                  disabled={isFamilyProfilesSaved}
                                  value={dep.relation || 'Spouse'}
                                  onChange={(e) => {
                                    const newDeps = [...wizardDeps];
                                    newDeps[idx].relation = e.target.value;
                                    if (e.target.value !== 'Other') {
                                      newDeps[idx].customRelation = '';
                                    }
                                    setWizardDeps(newDeps);
                                  }}
                                >
                                  <MenuItem value="Spouse">Spouse</MenuItem>
                                  <MenuItem value="Child">Child</MenuItem>
                                  <MenuItem value="Parent">Parent</MenuItem>
                                  <MenuItem value="Other">Other</MenuItem>
                                </Select>
                              </FormControl>
                              <Autocomplete
                                fullWidth
                                freeSolo
                                autoHighlight
                                disabled={isFamilyProfilesSaved}
                                clearOnBlur={false}
                                options={ALL_COUNTRIES}
                                value={dep.nationality || ''}
                                isOptionEqualToValue={(option, value) => !value || option === value || option?.toLowerCase() === value?.toLowerCase()}
                                onChange={(event, newValue) => {
                                  const newDeps = [...wizardDeps];
                                  newDeps[idx].nationality = newValue || '';
                                  setWizardDeps(newDeps);
                                }}
                                sx={{
                                  '& .MuiAutocomplete-inputRoot': {
                                    pr: '40px !important'
                                  },
                                  '& .MuiAutocomplete-input': {
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                  }
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Nationality"
                                    size="small"
                                    fullWidth
                                    disabled={isFamilyProfilesSaved}
                                    placeholder="Select or enter country"
                                    InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                                    inputProps={{
                                      ...params.inputProps,
                                      style: { fontWeight: 600 }
                                    }}
                                  />
                                )}
                              />

                              <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                                <TextField
                                  label="Passport Number"
                                  size="small"
                                  fullWidth
                                  disabled={isFamilyProfilesSaved}
                                  value={dep.passportNumber || ''}
                                  onChange={(e) => {
                                    const newDeps = [...wizardDeps];
                                    newDeps[idx].passportNumber = e.target.value.toUpperCase();
                                    setWizardDeps(newDeps);
                                  }}
                                  placeholder="e.g. A12345678"
                                  helperText="Official passport number of this co-applicant."
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ style: { fontWeight: 700, letterSpacing: '0.8px' } }}
                                  sx={{ bgcolor: isFamilyProfilesSaved ? 'rgba(0,0,0,0.02)' : '#FFFDF7' }}
                                />
                              </Box>

                              {/* Custom Relationship Input when 'Other' is selected */}
                              {dep.relation === 'Other' && (
                                <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    disabled={isFamilyProfilesSaved}
                                    label="Specify Relationship *"
                                    placeholder="e.g. Brother, Sister, Cousin, Relative, Guardian..."
                                    value={dep.customRelation || ''}
                                    onChange={(e) => {
                                      const newDeps = [...wizardDeps];
                                      newDeps[idx].customRelation = e.target.value;
                                      setWizardDeps(newDeps);
                                    }}
                                    helperText="Specify the relationship to the main applicant (e.g. Brother, Sister, Cousin, Relative)"
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ style: { fontWeight: 600 } }}
                                    sx={{
                                      bgcolor: '#FFFDF7',
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                      }
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        ))}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 1 }}>
                          {isFamilyProfilesSaved ? (
                            <Alert severity="info" icon={<LockIcon />} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 600 }}>
                              Family member profiles are saved and locked for document verification. If you need to make corrections, please contact your case manager.
                            </Alert>
                          ) : (
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
                          )}
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

                        // Dynamically combine required docs with any custom/other uploaded categories
                        const uploadedCats = personDocs.map(d => d.category).filter(Boolean);
                        const allDisplayDocs = [...docsNeeded];
                        uploadedCats.forEach(cat => {
                          if (!allDisplayDocs.includes(cat)) {
                            allDisplayDocs.push(cat);
                          }
                        });

                        return (
                          <Box key={person} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                              📁 {person === 'Main Applicant' ? `${person} (${client.firstName})` : person}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pl: isRTL ? 0 : 2, pr: isRTL ? 2 : 0 }}>
                              {allDisplayDocs.map((cat, idx) => {
                                const isUploaded = personDocs.some(d => {
                                  const isRejected = (d.status || d.verificationStatus || '').toLowerCase().includes('reject') || d.rejected === true;
                                  if (isRejected) return false;
                                  const catLower = (cat || '').toLowerCase();
                                  const docCatLower = (d.category || '').toLowerCase();
                                  const docNameLower = (d.name || '').toLowerCase();
                                  if (catLower.includes('passport')) return docCatLower.includes('passport') || docNameLower.includes('passport');
                                  return docCatLower === catLower || docCatLower.includes(catLower.split(' ')[0]) || catLower.includes(docCatLower);
                                });
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
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>Category Document Uploaders</Typography>

                    {/* Mandatory Passport Requirement Alert Banner */}
                    <Alert
                      severity={missingPassports.length > 0 ? "error" : "success"}
                      sx={{
                        mb: 3,
                        borderRadius: 3,
                        p: 2,
                        border: '1.5px solid',
                        borderColor: missingPassports.length > 0 ? '#FCA5A5' : '#6EE7B7',
                        bgcolor: missingPassports.length > 0 ? '#FEF2F2' : '#ECFDF5'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5, color: missingPassports.length > 0 ? '#991B1B' : '#065F46' }}>
                        {missingPassports.length > 0 ? '⚠️ Mandatory Applicant Passports Required' : '✅ All Mandatory Passports Attached & Ready to Submit'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: missingPassports.length > 0 ? '#7F1D1D' : '#047857' }}>
                        {missingPassports.length > 0 ? (
                          <>You cannot submit your document package until mandatory passports are attached for all applicants: <strong>{missingPassports.join(', ')}</strong>.</>
                        ) : (
                          <>Passports for all applicants are attached. Attach any additional supporting documents, then click <strong>"Submit Complete Document Package"</strong> below to send all files at once.</>
                        )}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                        {applicantsList.map(person => {
                          const isMissing = missingPassports.includes(person);
                          return (
                            <Chip
                              key={person}
                              label={`${person}: ${isMissing ? 'Passport Missing ❌' : 'Passport Attached ✓'}`}
                              color={isMissing ? "error" : "success"}
                              size="small"
                              sx={{ fontWeight: 800 }}
                            />
                          );
                        })}
                      </Box>
                    </Alert>

                    {/* Dependent wise accordions */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {applicantsList.map((person, index) => {
                        const personDocs = clientDocuments.filter(d => d.belongsTo === person || (!d.belongsTo && person === 'Main Applicant'));
                        const personStagedFiles = Object.entries(stagedFiles).filter(([key, item]) => item.belongsTo === person);
                        const docsNeeded = getRequiredDocsForPerson(person);
                        // A staged passport unlocks the category dropdown immediately (before batch submit)
                        const hasStagedPassportForPerson = personStagedFiles.some(([, item]) =>
                          (item.category || '').toLowerCase().includes('passport') ||
                          (item.fileName || '').toLowerCase().includes('passport')
                        );

                        let initialPassportNumber = '';
                        if (person === 'Main Applicant') {
                          initialPassportNumber = client?.passportNumber || mainApplicantPassportNumber || '';
                        } else {
                          const matchDep = (wizardDeps || []).find(d => {
                            const fn = (d.firstName || '').trim().toLowerCase();
                            const p = person.toLowerCase();
                            return fn && (p.includes(fn) || p.startsWith(fn));
                          }) || (client?.dependentsDetails || []).find(d => {
                            const fn = (d.firstName || '').trim().toLowerCase();
                            const p = person.toLowerCase();
                            return fn && (p.includes(fn) || p.startsWith(fn));
                          });
                          if (matchDep && matchDep.passportNumber) {
                            initialPassportNumber = matchDep.passportNumber;
                          }
                        }

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
                                <Chip label={`${personDocs.length} uploaded | ${personStagedFiles.length} staged`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(197, 155, 39, 0.1)', color: '#A37E1C', border: '1px solid rgba(197, 155, 39, 0.2)' }} />
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3, textAlign: isRTL ? 'right' : 'left', bgcolor: 'rgba(250, 246, 237, 0.2)' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 500 }}>
                                Select files specifically belonging to **{person}**. Required files include: {docsNeeded.join(', ')}.
                              </Typography>

                              <FileUploader
                                onUpload={(docData) => handleDocUploaded(docData, person)}
                                clientId={client.id}
                                clientName={`${client.firstName} ${client.lastName}`}
                                categories={docsNeeded}
                                existingDocs={personDocs}
                                requirePassportFirst={true}
                                stagedPassport={hasStagedPassportForPerson}
                                initialPassportNumber={initialPassportNumber}
                                isLoading={uploadBatchDocMutation.isPending}
                              />

                              {/* Staged Files for this person */}
                              {personStagedFiles.length > 0 && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#FFFDF7', borderRadius: 2.5, border: '1px dashed #C59B27' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#051A3B', display: 'block', mb: 1 }}>
                                    📌 STAGED FILES FOR {person.toUpperCase()} (READY FOR BATCH SUBMISSION):
                                  </Typography>
                                  <List disablePadding>
                                    {personStagedFiles.map(([key, item]) => (
                                      <Paper key={key} sx={{ p: 1, px: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <Box>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B' }}>{item.fileName}</Typography>
                                          <Typography variant="caption" color="text.secondary">Category: <strong>{item.category}</strong> | Size: {item.fileSize}</Typography>
                                        </Box>
                                        <Button size="small" color="error" onClick={() => handleUnstageDoc(key)}>Remove</Button>
                                      </Paper>
                                    ))}
                                  </List>
                                </Box>
                              )}

                              <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

                              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>Verified / Previous Uploads for {person}:</Typography>
                              {personDocs.length === 0 ? (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 2, fontStyle: 'italic' }}>No verified files uploaded yet for this applicant.</Typography>
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

                    {/* Final Staged Package Submission Card */}
                    <Paper sx={{ p: 3.5, borderRadius: 4, bgcolor: '#FAF6ED', border: '2px solid rgba(197, 155, 39, 0.4)', mt: 4, boxShadow: '0 10px 30px rgba(5, 26, 59, 0.05)' }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#051A3B', mb: 1, fontFamily: 'Outfit, sans-serif' }}>
                        📦 Complete Application Package Submission
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 500 }}>
                        All attached files for Main Applicant and Co-applicants will be submitted together in one atomic package to Operations.
                      </Typography>

                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleSubmitBatchDossier}
                        disabled={missingPassports.length > 0 || Object.keys(stagedFiles).length === 0 || uploadBatchDocMutation.isPending}
                        sx={{
                          py: 2,
                          fontWeight: 900,
                          fontSize: '1.05rem',
                          borderRadius: 3,
                          bgcolor: missingPassports.length > 0 ? '#94A3B8' : '#051A3B',
                          color: '#ffffff',
                          fontFamily: 'Outfit, sans-serif',
                          textTransform: 'none',
                          boxShadow: '0 6px 20px rgba(5, 26, 59, 0.15)',
                          '&:hover': { bgcolor: '#C59B27', color: '#051A3B' }
                        }}
                      >
                        {uploadBatchDocMutation.isPending ? (
                          'Uploading Complete Package...'
                        ) : missingPassports.length > 0 ? (
                          `🔒 Mandatory Passports Missing for (${missingPassports.length}) Applicant(s)`
                        ) : Object.keys(stagedFiles).length === 0 ? (
                          '⚠️ Attach Files for Applicants First'
                        ) : (
                          `🚀 Submit Complete Package (${Object.keys(stagedFiles).length} file${Object.keys(stagedFiles).length > 1 ? 's' : ''} ready)`
                        )}
                      </Button>
                    </Paper>
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

        {/* Sworn Translation Portal View */}
        {isTranslationClient && (
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
              {!isTranslationPaid && (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>{t('calculator_title')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                    {t('calculator_desc')}
                  </Typography>
                </>
              )}

              <Grid container spacing={3} sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                {/* Inputs Panel */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {!isTranslationPaid && (
                      <>
                        <FormControl fullWidth>
                          <InputLabel id="source-lang-select-label">{t('select_source_lang')}</InputLabel>
                          <Select
                            labelId="source-lang-select-label"
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                            label={t('select_source_lang')}
                            disabled={isTranslationPaid}
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
                            disabled={isTranslationPaid}
                            sx={{ borderRadius: 2.5 }}
                          >
                            <MenuItem value="Spanish">Spanish (Español) 🇪🇸</MenuItem>
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
                          disabled={isTranslationPaid}
                          error={wordCount !== '' && wordCount <= 0}
                          helperText={wordCount !== '' && wordCount <= 0 ? "Word count must be greater than 0" : (isTranslationPaid ? "Paid Order Configuration (Locked)" : "Please count the words in your target documents manually or upload a PDF for automatic word analysis.")}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                        />
                      </>
                    )}

                      {!isTranslationPaid && (
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

                      {!isTranslationPaid && (
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
                    let translationInputDocs = (documents || []).filter((d) => d && (d.clientId === client?.id || d.clientId === clientId || d.leadId === client?.leadId));
                    const qualDocs = client?.lead?.qualificationData?.documents || client?.qualificationData?.documents || [];
                    if (Array.isArray(qualDocs) && qualDocs.length > 0) {
                      if (translationInputDocs.length === 0) {
                        translationInputDocs = qualDocs.map((qd, idx) => ({
                          id: qd.id || `qual_${idx}_${client?.id || clientId}`,
                          clientId: client?.id || clientId,
                          name: qd.name || qd.filename || `Translation Document ${idx + 1}.pdf`,
                          url: qd.url || qd.fileUrl || '',
                          fileUrl: qd.url || qd.fileUrl || '',
                          category: qd.category || 'Sworn Translation',
                          wordCount: qd.wordCount || 0,
                          documentLanguage: qd.documentLanguage || qd.sourceLanguage || '',
                          sourceLanguage: qd.documentLanguage || qd.sourceLanguage || '',
                          uploadedDate: qd.uploadedAt || client?.createdAt,
                          status: 'Pending'
                        }));
                      } else if (translationInputDocs.length < qualDocs.length) {
                        qualDocs.forEach((qd, idx) => {
                          if (idx >= translationInputDocs.length) {
                            translationInputDocs.push({
                              id: qd.id || `qual_${idx}_${client?.id || clientId}`,
                              clientId: client?.id || clientId,
                              name: qd.name || qd.filename || `Translation Document ${idx + 1}.pdf`,
                              url: qd.url || qd.fileUrl || '',
                              fileUrl: qd.url || qd.fileUrl || '',
                              category: qd.category || 'Sworn Translation',
                              wordCount: qd.wordCount || 0,
                              documentLanguage: qd.documentLanguage || qd.sourceLanguage || '',
                              sourceLanguage: qd.documentLanguage || qd.sourceLanguage || '',
                              uploadedDate: qd.uploadedAt || client?.createdAt,
                              status: 'Pending'
                            });
                          }
                        });
                      }
                    }
                    return (
                      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* 1. Paid Documents List */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B', mb: 1.5, fontFamily: 'Outfit, sans-serif' }}>
                            📄 Documents in this Translation Order:
                          </Typography>
                          {translationInputDocs.length === 0 ? (
                            <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#FFFDF7', border: '1px dashed rgba(197,155,39,0.3)', textAlign: 'center' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Document registered. Our translation team is processing your order.
                              </Typography>
                            </Paper>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {translationInputDocs.map((doc, idx) => {
                                const hasTranslation = Boolean(doc.translatedUrl);
                                const qualDocsList = client?.lead?.qualificationData?.documents || client?.qualificationData?.documents || [];
                                const matchQual = qualDocsList[idx] || (Array.isArray(qualDocsList) && qualDocsList.find(d => (d.name || d.filename) === doc.name)) || {};

                                // Smart language extraction (Comment -> Property -> Exact Category -> Exact Index -> Fallback)
                                let docLang = '';
                                if (doc.comment) {
                                  const commentMatch = doc.comment.match(/Source:\s*([^➔|\n]+)/i);
                                  if (commentMatch && commentMatch[1]) {
                                    docLang = commentMatch[1].trim();
                                  }
                                }

                                if (!docLang) {
                                  const rawLang = doc.documentLanguage || doc.sourceLanguage || '';
                                  if (rawLang && !rawLang.includes(',')) docLang = rawLang;
                                }

                                if (!docLang && Array.isArray(qualDocsList) && qualDocsList.length > 0) {
                                  const catMatch = qualDocsList.find(d => d.category && doc.category && d.category === doc.category);
                                  if (catMatch && (catMatch.documentLanguage || catMatch.sourceLanguage)) {
                                    docLang = catMatch.documentLanguage || catMatch.sourceLanguage;
                                  }
                                  if (!docLang && qualDocsList[idx]) {
                                    docLang = qualDocsList[idx].documentLanguage || qualDocsList[idx].sourceLanguage || '';
                                  }
                                }

                                if (!docLang) docLang = 'English';

                                const targetLang = 'Spanish (Español)';
                                const wordCount = Number(doc.wordCount) || Number(matchQual.wordCount) || (translationInputDocs.length === 1 ? (client?.wordCount || 0) : 0) || 0;
                                const rate = docLang.toLowerCase().includes('urdu') ? 0.40 : docLang.toLowerCase().includes('arabic') ? 0.25 : 0.15;
                                const subtotal = parseFloat((wordCount * rate).toFixed(2));
                                const vat = parseFloat((subtotal * 0.05).toFixed(2));
                                const estimatedPrice = parseFloat((subtotal + vat).toFixed(2));

                                const formattedDate = doc.uploadedDate || doc.createdAt
                                  ? new Date(doc.uploadedDate || doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : '';

                                return (
                                  <Paper
                                    key={doc.id || idx}
                                    sx={{
                                      p: 2.5,
                                      border: '1.5px solid',
                                      borderColor: hasTranslation ? 'rgba(16, 185, 129, 0.4)' : 'rgba(197, 155, 39, 0.3)',
                                      borderRadius: 3.5,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 2,
                                      bgcolor: hasTranslation ? '#F0FDF4' : '#FFFDF7',
                                      boxShadow: '0 2px 12px rgba(5, 26, 59, 0.02)'
                                    }}
                                  >
                                    {/* Top Header: Doc name, category, and status chip */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#051A3B', fontSize: '0.98rem', fontFamily: 'Outfit, sans-serif' }}>
                                          📄 #{idx + 1} {doc.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.8, alignItems: 'center' }}>
                                          <Chip
                                            label={doc.category || 'Passport'}
                                            size="small"
                                            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: 'rgba(5, 26, 59, 0.08)', color: '#051A3B' }}
                                          />
                                          <Chip
                                            label={`🌐 ${docLang} ➔ ${targetLang} 🇪🇸`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 800, borderColor: '#C59B27', color: '#051A3B' }}
                                          />

                                          {doc.size && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                                              💾 {doc.size}
                                            </Typography>
                                          )}
                                          {formattedDate && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.72rem' }}>
                                              🕒 {formattedDate}
                                            </Typography>
                                          )}
                                        </Box>

                                      </Box>
                                      <Chip
                                        label={hasTranslation ? '✅ Certified Translation Ready' : '⏳ In Translation'}
                                        size="small"
                                        color={hasTranslation ? 'success' : 'warning'}
                                        sx={{ fontWeight: 900, fontSize: '0.75rem', px: 0.5 }}
                                      />
                                    </Box>

                                    {/* Two sections: Source Document vs Certified Translation */}
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                      {/* Left: Your Original File */}
                                      <Box sx={{ flex: 1, p: 2, bgcolor: 'background.paper', borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                                            👤 Your Original Source Document
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#051A3B', mt: 0.5, fontSize: '0.85rem' }}>
                                            {doc.name}
                                          </Typography>
                                        </Box>
                                        {(doc.url || doc.fileUrl) && (
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              href={getFullDocUrl((doc.url && !doc.url.includes('translation_doc_')) ? doc.url : (matchQual.url || matchQual.fileUrl || doc.url || doc.fileUrl))}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem' }}
                                            >
                                              👁️ View Original
                                            </Button>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              href={getFullDocUrl((doc.url && !doc.url.includes('translation_doc_')) ? doc.url : (matchQual.url || matchQual.fileUrl || doc.url || doc.fileUrl))}
                                              download={doc.name || 'original_document.pdf'}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem' }}
                                            >
                                              ⬇️ Download
                                            </Button>
                                          </Box>
                                        )}
                                      </Box>

                                      {/* Right: Official Stamped Sworn Translation */}
                                      <Box sx={{ flex: 1.3, p: 2, bgcolor: hasTranslation ? '#F0FDF4' : 'rgba(250, 246, 237, 0.6)', borderRadius: 2.5, border: hasTranslation ? '1px solid #86EFAC' : '1px dashed rgba(197, 155, 39, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 800, color: hasTranslation ? '#166534' : '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                                            🇪🇸 Official Sworn Translation (Traducción Jurada)
                                          </Typography>
                                          {hasTranslation ? (
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534', mt: 0.5, fontSize: '0.85rem' }}>
                                              Official Spanish Ministry certified stamped PDF is ready for download.
                                            </Typography>
                                          ) : (
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#92400E', mt: 0.5, fontSize: '0.82rem' }}>
                                              ⏳ Translation in progress. Our certified sworn translator is translating and stamping this document.
                                            </Typography>
                                          )}
                                        </Box>

                                        {hasTranslation ? (
                                          <Button
                                            size="medium"
                                            variant="contained"
                                            color="success"
                                            href={getFullDocUrl(doc.translatedUrl)}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                              textTransform: 'none',
                                              fontWeight: 900,
                                              borderRadius: 2,
                                              fontSize: '0.85rem',
                                              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)'
                                            }}
                                          >
                                            📥 Download Certified Translation PDF 🇪🇸
                                          </Button>
                                        ) : (
                                          <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 600, fontStyle: 'italic' }}>
                                            Download button will activate automatically once translation is uploaded.
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                  </Paper>
                                );
                              })}
                            </Box>
                          )}
                        </Box>

                        {/* 2. Add-on Upload Panel */}
                        {isTranslationPaid && (
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
                                </Select>
                              </FormControl>

                              {/* File drag-and-drop zone */}
                              <Box
                                onClick={() => document.getElementById('portal-addon-file').click()}
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleAddonFileSelect(e.dataTransfer.files[0]);
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
                                      handleAddonFileSelect(e.target.files[0]);
                                    }
                                  }}
                                  style={{ display: 'none' }}
                                />
                                <Typography variant="body2" sx={{ fontSize: '24px', mb: 0.5 }}>📁</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#C59B27', fontSize: '0.8rem' }}>
                                  {addonFile ? `📄 ${addonFile.name} (${(addonFile.size / 1024).toFixed(1)} KB)` : 'Drag & drop your file here, or click to browse'}
                                </Typography>
                                {addonAnalyzing && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                                    <CircularProgress size={16} sx={{ color: '#C59B27' }} />
                                    <Typography variant="caption" sx={{ color: '#051A3B', fontWeight: 600 }}>
                                      Analyzing document word count...
                                    </Typography>
                                  </Box>
                                )}
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
                                      onClick={() => {
                                        setAddonFile(null);
                                        setAddonWordCount(0);
                                        const inputEl = document.getElementById('portal-addon-file');
                                        if (inputEl) inputEl.value = '';
                                      }}
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
                                    helperText={addonAnalyzing ? "Analyzing PDF words..." : `Extracted: ${addonWordCount} words (@ €${getRateForLang(addonSourceLang).toFixed(2)}/word)`}
                                    fullWidth
                                  />
                                </Paper>
                              )}

                              {(() => {
                                const rate = getRateForLang(addonSourceLang);
                                const subtotal = parseFloat(((addonWordCount || 0) * rate).toFixed(2));
                                const vat = parseFloat((subtotal * 0.05).toFixed(2));
                                return (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Subtotal ({addonWordCount || 0} words @ €{rate.toFixed(2)}/word):
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#051A3B' }}>
                                        €{subtotal.toFixed(2)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        5% VAT:
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#051A3B' }}>
                                        €{vat.toFixed(2)}
                                      </Typography>
                                    </Box>
                                    <Divider sx={{ my: 0.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B' }}>
                                        Total Add-on Fee (incl. 5% VAT):
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#C59B27', fontFamily: 'Outfit, sans-serif' }}>
                                        €{addonCalcPrice.toFixed(2)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              })()}

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
                    <Box sx={{ mt: 0 }}>
                      {isTranslationPaid ? (
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
                          {(() => {
                            const clientAllDocs = (documents || []).filter(d => d && (d.clientId === client?.id || d.clientId === clientId));
                            const translatedDocs = clientAllDocs.filter(d => Boolean(d.translatedUrl));

                            return (
                              <>
                                <Button
                                  variant="contained"
                                  fullWidth
                                  onClick={(e) => {
                                    if (translatedDocs.length === 0) {
                                      showAlert('Your documents are in progress. Sworn translator will upload certified PDFs soon.', 'warning');
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
                                    const targetDocUrl = getFullDocUrl(doc.translatedUrl || doc.url || doc.fileUrl);
                                    return (
                                      <MenuItem
                                        key={doc.id}
                                        onClick={async () => {
                                          setDownloadMenuAnchor(null);
                                          if (!targetDocUrl) {
                                            showAlert('Document file URL is missing.', 'warning');
                                            return;
                                          }
                                          try {
                                            showAlert(`Downloading ${doc.name}...`, 'info');
                                            const response = await fetch(targetDocUrl);
                                            if (!response.ok) throw new Error(`HTTP ${response.status}`);
                                            const blob = await response.blob();
                                            const blobUrl = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = blobUrl;
                                            const cleanName = doc.name.toLowerCase().endsWith('.pdf') ? doc.name : `${doc.name}.pdf`;
                                            link.download = `Certified_${cleanName}`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(blobUrl);
                                            showAlert('Download complete!', 'success');
                                          } catch (error) {
                                            console.warn('Direct blob fetch failed, opening target URL:', error);
                                            showAlert('Opening file in browser...', 'info');
                                            window.open(targetDocUrl, '_blank');
                                          }
                                        }}
                                        sx={{
                                          fontFamily: 'Outfit, sans-serif',
                                          fontWeight: 700,
                                          fontSize: '0.85rem',
                                          color: '#051A3B',
                                          py: 1.25,
                                          '&:hover': { bgcolor: 'rgba(197, 155, 39, 0.1)', color: '#C59B27' }
                                        }}
                                      >
                                        📄 {doc.name} (Certified PDF)
                                      </MenuItem>
                                    );
                                  })}
                                </Menu>
                              </>
                            );
                          })()}
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
              {isMainPackagePaid && (
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'success.main', bgcolor: '#F0FDF4', boxShadow: 'none', textAlign: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 44, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: '#051A3B' }}>Visa Relocation Package Active & Paid</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
                    Your active visa package payment has been verified. You can upload documents in the <strong>Document Center</strong> tab, or purchase additional packages/applicants below.
                  </Typography>
                  <Button variant="contained" size="small" onClick={() => setTabValue(0)} sx={{ px: 3, py: 0.75, borderRadius: 2, fontWeight: 700, textTransform: 'none', bgcolor: '#051A3B', color: 'white', '&:hover': { bgcolor: '#C59B27' } }}>
                    Go to Document Center
                  </Button>
                </Paper>
              )}
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
                          disabled={addApplicants <= 0}
                          onClick={() => handleApplicantsCountChange(addApplicants - 1)}
                          sx={{ minWidth: 32, width: 32, height: 32, p: 0, fontWeight: 900, borderRadius: 1.5 }}
                        >
                          -
                        </Button>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, px: 1, minWidth: 24, textAlign: 'center' }}>
                          {addApplicants}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleApplicantsCountChange(addApplicants + 1)}
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
                        ✨ Eligible for €250 Professional Case Assessment Credit! This amount will be automatically deducted if you select any package within 14 days.
                      </Typography>
                    </Box>
                  )}

                  <Grid container spacing={3}>
                    {/* Package Options Cards */}
                    <Grid item xs={12} lg={8}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {[...((dbPackages && dbPackages.length > 0)
                          ? dbPackages.map(pkg => {
                              const isRefund = pkg.isRefundable !== undefined
                                ? !!pkg.isRefundable
                                : (pkg.code === 'premium' || pkg.code === 'full_process' || pkg.code === 'OPTION_B' || pkg.code === 'OPTION_D' || pkg.id === 'OPTION_B' || pkg.id === 'OPTION_D');
                              return {
                                id: pkg.id,
                                code: pkg.code || pkg.id,
                                name: pkg.name,
                                price: Number(pkg.price) || 0,
                                additionalApplicantPrice: Number(pkg.additionalApplicantPrice) || 500,
                                isRecommended: !!pkg.isRecommended,
                                isFixedPrice: !!pkg.isFixedPrice,
                                isRefundable: isRefund,
                                refundableText: pkg.refundableText || (isRefund ? '100% refundable if visa is rejected (Subject to T&C)' : 'Non-refundable'),
                                description: pkg.description || '',
                                includes: Array.isArray(pkg.includes) ? pkg.includes : []
                              };
                            })
                          : DEFAULT_PACKAGES
                        )].sort((a,b) => (a.name || '').localeCompare(b.name || '')).map((pkgItem) => {
                          const pkgCode = pkgItem.code || pkgItem.id;
                          const isOptA = isOptionAPackage(pkgItem);
                          const isSelected = selectedPackage === pkgCode || (isOptionAPackage(selectedPackage) && isOptA);
                          const effectiveAddCount = isOptA ? 0 : addApplicants;
                          const basePrice = pkgItem.price || 0;
                          const addCost = pkgItem.isFixedPrice ? 0 : (effectiveAddCount * (pkgItem.additionalApplicantPrice || 500));
                          const totalBaseBeforeCredit = basePrice + addCost;
                          const isCreditApplicable = !isOptA && assessmentCredit > 0;
                          const finalCardPrice = isCreditApplicable ? Math.max(0, totalBaseBeforeCredit - assessmentCredit) : totalBaseBeforeCredit;

                          const isOptADisabled = isOptA && (isOptAPaid || isMainPackagePaid);

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
                            ? dbPackages.map(pkg => {
                                const isRefund = pkg.isRefundable !== undefined
                                  ? !!pkg.isRefundable
                                  : (pkg.code === 'premium' || pkg.code === 'full_process' || pkg.code === 'OPTION_B' || pkg.code === 'OPTION_D' || pkg.name?.toLowerCase().includes('premium') || pkg.name?.toLowerCase().includes('full process'));
                                return {
                                  id: pkg.id,
                                  code: pkg.code || pkg.id,
                                  name: pkg.name,
                                  price: Number(pkg.price) || 0,
                                  additionalApplicantPrice: Number(pkg.additionalApplicantPrice) || 500,
                                  isRecommended: !!pkg.isRecommended,
                                  isFixedPrice: !!pkg.isFixedPrice,
                                  isRefundable: isRefund,
                                  refundableText: pkg.refundableText || (isRefund ? '100% refundable if visa is rejected (Subject to T&C)' : 'Non-refundable'),
                                  includes: Array.isArray(pkg.includes) ? pkg.includes : []
                                };
                              })
                            : DEFAULT_PACKAGES;
                          const activePkg = packagesList.find(p => p.code === selectedPackage || p.id === selectedPackage || (isOptionAPackage(selectedPackage) && isOptionAPackage(p))) || packagesList[0];
                          const activePkgCode = activePkg.code || activePkg.id;
                          const isOptA = isOptionAPackage(activePkg) || activePkgCode === 'OPTION_A' || activePkgCode === 'opt_a';
                          const effectiveAddCount = isOptA ? 0 : addApplicants;
                          const baseFee = activePkg.price || 0;
                          const addFee = activePkg.isFixedPrice ? 0 : (effectiveAddCount * (activePkg.additionalApplicantPrice || 500));
                          const totalBase = baseFee + addFee;
                          const creditEligible = !isOptA && assessmentCredit > 0;
                          const creditDeduction = creditEligible ? 250 : 0;
                          const subtotalExclVat = Math.max(0, totalBase - creditDeduction);
                          const vat5 = subtotalExclVat * 0.05;
                          const payableGrandTotal = subtotalExclVat * 1.05;

                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Selected Package:</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#051A3B', textAlign: 'right', maxWidth: '65%' }}>{activePkg.name}</Typography>
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
                                <MenuItem value="bank">Emirates NBD Company Bank Transfer 🏦</MenuItem>
                              </TextField>

                              {billingPaymentMethod === 'bank' && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: '#FAF6ED', borderRadius: 3, border: '1px solid rgba(197, 155, 39, 0.4)', boxShadow: '0 4px 12px rgba(5,26,59,0.04)' }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#051A3B', mb: 1.5, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(197, 155, 39, 0.2)', pb: 1 }}>
                                    🏛️ Emirates NBD Company Bank Details
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', p: 1.2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bank Name</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontSize: '0.85rem' }}>Emirates NBD</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', p: 1.2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account Name</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontSize: '0.85rem' }}>AAA Business Consultancy FZC LLC</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', p: 1.2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account Number</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'monospace', fontSize: '0.88rem' }}>1015969586301</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', p: 1.2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>IBAN</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'monospace', fontSize: '0.82rem', wordBreak: 'break-all' }}>AE390260001015969586301</Typography>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                      <Box sx={{ bgcolor: '#FFFFFF', p: 1.2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SWIFT Code</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'monospace', fontSize: '0.82rem' }}>EBILAEAD</Typography>
                                      </Box>

                                      <Box sx={{ bgcolor: '#FFFFFF', p: 1.2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Routing Code</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'monospace', fontSize: '0.82rem' }}>302620122</Typography>
                                      </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', p: 1.2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bank Address</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#051A3B', fontSize: '0.78rem', lineHeight: 1.3 }}>Baniyas Road, Deira, P.O. Box 777, Dubai, UAE</Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              )}

                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}>
                                <input
                                  type="checkbox"
                                  id="billing-tc-checkbox"
                                  checked={billingTermsChecked}
                                  onChange={(e) => setBillingTermsChecked(e.target.checked)}
                                  style={{ marginTop: 3, transform: 'scale(1.1)', cursor: 'pointer' }}
                                />
                                <label htmlFor="billing-tc-checkbox" style={{ fontSize: '0.75rem', color: '#4B5563', cursor: 'pointer', lineHeight: 1.35, fontWeight: 500 }}>
                                  {isRefundGuaranteePackage(activePkg || selectedPackage, client?.serviceType || client?.serviceId) ? (
                                    <>
                                      I agree to the <span style={{ color: '#E11D48', fontWeight: 800 }}>100%</span> Refund Guarantee according to the <a href="https://aaabusinessconsultancy.com/terms-conditions/" target="_blank" rel="noopener noreferrer" style={{ color: '#051A3B', textDecoration: 'underline', fontWeight: 700 }}>Company Terms &amp; Conditions</a>.
                                    </>
                                  ) : (
                                    <>
                                      I agree to the <a href="https://aaabusinessconsultancy.com/terms-conditions/" target="_blank" rel="noopener noreferrer" style={{ color: '#051A3B', textDecoration: 'underline', fontWeight: 700 }}>Company Terms &amp; Conditions</a>.
                                    </>
                                  )}
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
                                  {isRefundGuaranteePackage(activePkg || selectedPackage, client?.serviceType || client?.serviceId)
                                    ? 'Option B & D (Full Processing & Premium): 100% Refund Guarantee according to Company Terms & Conditions.'
                                    : 'Case Assessment, Tourist Visa & Relocation Assistance are non-refundable according to Company Terms & Conditions.'}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })()}
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
            </Box>
          );
        })()}

        {/* Tab 2: Refund & Guarantee Claims */}
        {tabValue === 2 && !isTranslationClient && (() => {
          const clientActivePkg = (dbPackages && dbPackages.length > 0)
            ? dbPackages.find(p => (p.code || p.id) === (client?.packageId || selectedPackage))
            : null;
          const isRefundEligible = isRefundGuaranteePackage(clientActivePkg || client?.packageId || selectedPackage, client?.serviceType || client?.serviceId);

          return (
            <Box className="grid grid-cols-12 gap-4 items-stretch">
              {/* Header Banner */}
              <Box className="col-span-12">
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(197, 155, 39, 0.3)', bgcolor: '#FAF6ED' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'Outfit, sans-serif', mb: 0.5 }}>
                    🛡️ Spain Visa 100% Money-Back Guarantee & Refund Center
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isRefundEligible
                      ? 'Your enrolled service plan includes our 100% Refund Guarantee under our terms & conditions. If your visa application is refused, submit your rejection letter below.'
                      : 'Your currently enrolled package operates under standard non-refundable terms without a refund guarantee clause.'}
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
                      Your currently enrolled package (<strong>{clientActivePkg?.name || clientActivePkg?.title || client?.packageId || 'Selected Package'}</strong>) is <strong>non-refundable</strong> according to Company Terms & Conditions.
                      <br /><br />
                      The 100% Refund Guarantee applies exclusively to clients enrolled in eligible refundable processing packages (such as Full Professional Processing or Premium Package).
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Bank Account Holder Name"
                          placeholder="Full Legal Name on Account"
                          value={claimBankName}
                          onChange={(e) => setClaimBankName(e.target.value)}
                        />

                        {(() => {
                          const ibanCheck = validateIBAN(claimBankIban);
                          const isTouched = Boolean(claimBankIban && claimBankIban.trim().length > 0);
                          const isValid = ibanCheck.valid;

                          return (
                            <TextField
                              fullWidth
                              size="small"
                              label="IBAN (International Bank Account Number)"
                              placeholder="e.g. ES91 2100 0418 4502 0005 1332"
                              value={claimBankIban}
                              onChange={(e) => {
                                // Clean input: uppercase, allow alphanumeric and space
                                const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
                                setClaimBankIban(clean);
                              }}
                              error={isTouched && !isValid}
                              helperText={
                                isTouched ? (
                                  isValid ? (
                                    <span style={{ color: '#16A34A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      ✓ Valid IBAN ({ibanCheck.countryCode})
                                    </span>
                                  ) : (
                                    <span style={{ color: '#DC2626', fontWeight: 600 }}>
                                      ✕ Please enter a valid IBAN
                                    </span>
                                  )
                                ) : (
                                  'Enter a valid country-format IBAN'
                                )
                              }
                              InputProps={{
                                endAdornment: isTouched && (
                                  <InputAdornment position="end">
                                    {isValid ? (
                                      <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                                    ) : (
                                      <CloseIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                                    )}
                                  </InputAdornment>
                                )
                              }}
                            />
                          );
                        })()}
                      </Box>

                      {/* Reason / Remarks */}
                      <Box>
                      {(() => {
                        const ibanCheck = validateIBAN(claimBankIban);
                        const isFormReady = Boolean(claimBankIban && ibanCheck.valid && claimBankName.trim());

                        return (
                          <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={createRefundMutation.isPending || !isFormReady}
                            onClick={() => {
                              if (!claimBankName || !claimBankName.trim()) {
                                showAlert('Please enter the Bank Account Holder Name.', 'warning');
                                return;
                              }
                              if (!claimBankIban || !ibanCheck.valid) {
                                showAlert('Please enter a structurally valid IBAN for your refund.', 'error');
                                return;
                              }
                              if (!claimProofUrl) {
                                showAlert('Please upload your official Embassy Rejection Letter before submitting your claim.', 'warning');
                                return;
                              }
                                createRefundMutation.mutate({
                                  clientId: client?.id || clientId,
                                  clientEmail: client?.email || '',
                                  category: claimCategory || 'Visa Rejection (100% Guarantee)',
                                  reason: claimReason,
                                  proofUrl: claimProofUrl,
                                  bankAccountName: claimBankName.trim(),
                                  bankIban: ibanCheck.normalizedIBAN,
                                  amount: 0
                                });
                            }}
                            sx={{ mt: 1, py: 1.2, fontWeight: 800 }}
                          >
                            Submit Refund Claim
                          </Button>
                        );
                      })()}
                    </Box>
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
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        maxHeight: '400px',
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': { width: 6 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(5, 26, 59, 0.25)', borderRadius: 3 },
                        '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                      }}>
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
{r.status === 'Processed' || r.status === 'Approved' ? (
                              <Typography variant="h6" color="error.main" sx={{ fontWeight: 800 }}>
                                €{(Number(r?.amount) || 0).toLocaleString()}
                              </Typography>
                            ) : (
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#D97706', my: 0.5 }}>
                                Pending Admin Audit & Approval
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                              Category: {r.category} | Date: {r.date ? (dayjs(r.date).isValid() ? dayjs(r.date).format('DD/MM/YYYY') : r.date) : (r.createdAt ? dayjs(r.createdAt).format('DD/MM/YYYY') : 'N/A')}
                            </Typography>
                            {r.transactionRef && (
                              <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, mt: 0.5, display: 'block' }}>
                                Ref / UTR: {r.transactionRef}
                              </Typography>
                            )}
                            {r.proofUrl && (
                              <Button size="small" href={getFullDocUrl(r.proofUrl)} target="_blank" rel="noopener noreferrer" sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}>
                                View Attached Proof PDF
                              </Button>
                            )}
                            {r.status === 'Processed' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => setSelectedRefundForReceipt(r)}
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
          );
        })()}
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
            <Button variant="outlined" sx={{ flexGrow: 1, py: 1 }}>Emirates NBD Company Bank Transfer</Button>
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
                Receipt
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setShowInvoiceModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: '#F8FAFC' }}>
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
            const grossSubTotal = isOptA ? basePrice : Math.max(0, basePrice + addPrice - assessmentCredit);
            const couponDiscount = appliedCoupon ? Math.round((grossSubTotal * (appliedCoupon.discountPercent / 100)) * 100) / 100 : 0;
            const vat5 = Math.round((grossSubTotal * 0.05) * 100) / 100;
            const subTotal = grossSubTotal;
            const grandTotal = Math.max(0, Math.round((grossSubTotal + vat5 - couponDiscount) * 100) / 100);

            const invNo = `INV-2026-${(client?.id || '84920').slice(-6).toUpperCase()}`;
            const customerId = client?.clientCode || client?.clientCustomId || client?.cid || (client?.id ? `CID-${client.id.slice(-5).toUpperCase()}` : 'CLIENT-ID');

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Print Stylesheet */}
                <style>{`
                  @media print {
                    @page {
                      size: A4 portrait;
                      margin: 0;
                    }
                    html, body {
                      background: #ffffff !important;
                      color: #000000 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                    body * {
                      visibility: hidden !important;
                    }
                    .printable-client-receipt-letterhead, .printable-client-receipt-letterhead * {
                      visibility: visible !important;
                    }
                    .printable-client-receipt-letterhead {
                      position: absolute !important;
                      top: 0 !important;
                      left: 0 !important;
                      width: 100% !important;
                      max-width: 100% !important;
                      margin: 0 !important;
                      padding: 12mm 12mm !important;
                      box-shadow: none !important;
                      border: none !important;
                      border-radius: 0 !important;
                      background: #ffffff !important;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                  }
                `}</style>

                {/* OFFICIAL AAA BUSINESS CONSULTANCY FZC LLC LETTERHEAD CONTAINER */}
                <Paper
                  className="printable-client-receipt-letterhead"
                  sx={{
                    position: 'relative',
                    bgcolor: '#ffffff',
                    borderRadius: 3,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    p: { xs: 2.5, sm: 3.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '680px'
                  }}
                >
                  {/* Background Watermark */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      opacity: 0.04,
                      pointerEvents: 'none',
                      zIndex: 0,
                      width: '320px',
                      height: '320px'
                    }}
                  >
                    <img src={aaaLogo} alt="AAA Watermark" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>

                  {/* Letterhead Content */}
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Header: Logo + Contact Info */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
                        <img src={aaaLogo} alt="AAA Logo" style={{ width: 64, height: 68, objectFit: 'contain' }} />
                        <Box sx={{ borderLeft: '1.5px solid #C59B27', pl: 1.2, py: 0.2 }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0C2340', lineHeight: 1.1, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                            AAA BUSINESS CONSULTANCY L.L.C
                          </Typography>

                          <Box sx={{ borderTop: '1.5px solid #C59B27', borderBottom: '1.5px solid #C59B27', py: 0.2, px: 0.4, textAlign: 'center', mt: 0.5, display: 'inline-block', width: '100%' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.55rem', color: '#C59B27', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                              ADVISE • ASSIST • ACHIEVE
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
                        <Box sx={{ width: '1.5px', height: '60px', bgcolor: '#C59B27', flexShrink: 0 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: '#0C2340', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0 }}>
                              ✉️
                            </Box>
                            <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              client@aaabusinessconsultancy.com
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: '#0C2340', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0 }}>
                              📞
                            </Box>
                            <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              +971509554142
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: '#0C2340', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0 }}>
                              🌐
                            </Box>
                            <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              www.aaabusinessconsultancy.com
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                            <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: '#0C2340', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0, mt: 0.1 }}>
                              📍
                            </Box>
                            <Typography sx={{ fontSize: '0.63rem', color: '#0C2340', fontWeight: 700, maxWidth: '210px', lineHeight: 1.25 }}>
                              Business Village B , office number F-09 Port Saeed Deira Dubai, UAE
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Dual-tone Header Divider Bar */}
                    <Box sx={{ width: '100%', height: '5px', borderRadius: '1px', display: 'flex', mb: 3, overflow: 'hidden' }}>
                      <Box sx={{ width: '32%', bgcolor: '#0C2340' }} />
                      <Box sx={{ width: '35%', bgcolor: '#C59B27' }} />
                      <Box sx={{ width: '33%', bgcolor: '#0C2340' }} />
                    </Box>

                    {/* Invoice Meta & Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                      <Box>
                        <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#0C2340', letterSpacing: '0.8px', lineHeight: 1 }}>
                          {isOptA && isOptAPaid ? 'RECEIPT' : 'INVOICE'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155', mt: 0.4 }}>
                          Invoice #: {invNo}
                        </Typography>
                        <Box sx={{ mt: 0.8 }}>
                          {isOptA && isOptAPaid ? (
                            <Chip label="PAID RECEIPT" color="success" size="small" sx={{ fontWeight: 900 }} />
                          ) : (
                            <Chip label="UNPAID INVOICE" color="warning" size="small" sx={{ fontWeight: 900 }} />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: { sm: 'right' } }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                          <strong>Date Issued:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, mt: 0.3 }}>
                          <strong>Payment Status:</strong> <span style={{ color: isOptA && isOptAPaid ? '#2e7d32' : '#ed6c02', fontWeight: 800 }}>{isOptA && isOptAPaid ? 'Paid in Full (€250 + VAT)' : 'Immediate upon selection'}</span>
                        </Typography>
                      </Box>
                    </Box>

                    {/* Bill To & Payment Details */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3, bgcolor: '#F8FAFC', p: 2, borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.4 }}>
                          BILL TO
                        </Typography>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0C2340' }}>
                          {client ? `${client.firstName} ${client.lastName}` : 'Valued Client'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                          {client?.email || 'client@email.com'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', mt: 0.2 }}>
                          Customer ID: {customerId}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: { sm: 'right' } }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.4 }}>
                          PAYMENT DETAILS
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>
                          Method: {isOptA && isOptAPaid ? 'Online Card Payment' : 'Card / Bank Transfer'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Table */}
                    <TableContainer sx={{ mb: 3, borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                      <Table>
                        <TableHead sx={{ bgcolor: '#0C2340 !important', '& .MuiTableCell-head': { color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.85rem' } }}>
                          <TableRow sx={{ bgcolor: '#0C2340 !important' }}>
                            <TableCell sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.3px' }}>Item & Description</TableCell>
                            <TableCell align="right" sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.3px' }}>Amount (€)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' } }}>
                            <TableCell>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0C2340' }}>
                                {currentPkg?.name || 'Spain Relocation Visa Package'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.2 }}>
                                {getServicesProvidedText(client?.serviceType || clientProfile?.serviceType || (isOptA ? 'Spain Visa Case Assessment' : ''))}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>€{basePrice.toFixed(2)}</TableCell>
                          </TableRow>

                          {effectiveAddCount > 0 && !isOptA && (
                            <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' } }}>
                              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.82rem' }}>
                                Co-Applicants Relocation Support ({effectiveAddCount} person(s))
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>+€{addPrice.toFixed(2)}</TableCell>
                            </TableRow>
                          )}

                          {assessmentCredit > 0 && !isOptA && (
                            <TableRow>
                              <TableCell sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.82rem' }}>
                                Eligibility Assessment Fee Credit (100% Deduction)
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#16A34A', fontWeight: 700 }}>-€{assessmentCredit.toFixed(2)}</TableCell>
                            </TableRow>
                          )}

                          {appliedCoupon && !isOptA && (
                            <TableRow>
                              <TableCell sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.82rem' }}>
                                Coupon Discount ({appliedCoupon.code} - {appliedCoupon.discountPercent}%)
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#16A34A', fontWeight: 700 }}>-€{couponDiscount.toFixed(2)}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Totals Summary Block */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                      <Box sx={{ width: { xs: '100%', sm: '300px' }, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <Typography sx={{ color: '#64748B', fontWeight: 600 }}>Base Package Amount</Typography>
                          <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>€{grossSubTotal.toFixed(2)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <Typography sx={{ color: '#64748B', fontWeight: 600 }}>+ UAE Standard VAT (5%)</Typography>
                          <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>+€{vat5.toFixed(2)}</Typography>
                        </Box>

                        {appliedCoupon && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <Typography sx={{ color: '#16A34A', fontWeight: 600 }}>- Coupon Discount ({appliedCoupon.code} - {appliedCoupon.discountPercent}%)</Typography>
                            <Typography sx={{ fontWeight: 700, color: '#16A34A' }}>-€{couponDiscount.toFixed(2)}</Typography>
                          </Box>
                        )}

                        <Divider sx={{ my: 0.4, borderColor: '#CBD5E1' }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#0C2340', color: 'white', p: 1.2, borderRadius: '8px', borderLeft: '4px solid #C59B27' }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                            {isOptA && isOptAPaid ? 'TOTAL PAID' : 'TOTAL DUE'}
                          </Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#FACC15' }}>
                            €{grandTotal.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center' }}>
                      Thank you for choosing AAA Business Consultancy for your Spain Relocation journey.
                    </Typography>
                  </Box>

                  {/* OFFICIAL LETTERHEAD BOTTOM GRAPHIC FOOTER */}
                  <Box sx={{ position: 'relative', width: '100%', mt: 3, overflow: 'hidden' }}>
                    <svg viewBox="0 0 1000 45" preserveAspectRatio="none" style={{ width: '100%', height: '38px', display: 'block' }}>
                      {/* Gold Accent Slanted Line */}
                      <path d="M 0 10 L 230 10 C 248 10 258 18 266 28 L 278 45 L 1000 45 L 1000 38 L 274 38 L 260 22 C 252 12 240 4 225 4 L 0 4 Z" fill="#C59B27" />
                      {/* Deep Navy Blue Bottom Base Block */}
                      <path d="M 0 12 L 225 12 C 240 12 250 20 258 30 L 270 45 L 0 45 Z" fill="#0C2340" />
                      <path d="M 270 45 L 1000 45 L 1000 38 L 270 38 Z" fill="#0C2340" />
                    </svg>
                  </Box>
                </Paper>

                {/* Coupon Code Input Card (Screen only) */}
                {!(isOptA && isOptAPaid) && (
                  <Box className="coupon-section no-print" sx={{ p: 2, bgcolor: '#FAF6ED', borderRadius: 2.5, border: '1px solid rgba(197, 155, 39, 0.3)' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#051A3B', display: 'block', mb: 1, letterSpacing: '0.05em' }}>
                      HAVE A DISCOUNT / COUPON CODE?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Enter Coupon Code (e.g. SAVE10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                        sx={{ bgcolor: 'white', flexGrow: 1, '& .MuiInputBase-input': { fontWeight: 700, letterSpacing: '0.05em' } }}
                      />
                      {appliedCoupon ? (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponInput('');
                            showAlert('Coupon removed', 'info');
                          }}
                          sx={{ fontWeight: 800, textTransform: 'none' }}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={validatingCoupon || !couponInput.trim()}
                          onClick={async () => {
                            try {
                              setValidatingCoupon(true);
                              const res = await dbService.validateCoupon(couponInput.trim(), grossSubTotal);
                              if (res.valid) {
                                setAppliedCoupon(res);
                                showAlert(`Coupon ${res.code} applied! (${res.discountPercent}% OFF)`, 'success');
                              } else {
                                showAlert(res.message || 'Invalid coupon code', 'error');
                              }
                            } catch (err) {
                              showAlert(err?.response?.data?.message || 'Invalid or expired coupon code', 'error');
                            } finally {
                              setValidatingCoupon(false);
                            }
                          }}
                          sx={{ bgcolor: '#051A3B', color: 'white', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#C59B27' } }}
                        >
                          {validatingCoupon ? 'Validating...' : 'Apply'}
                        </Button>
                      )}
                    </Box>
                    {appliedCoupon && (
                      <Alert severity="success" sx={{ mt: 1.5, py: 0.5, px: 2, fontWeight: 700, fontSize: '0.8rem' }}>
                        ✓ {appliedCoupon.code} applied successfully! You save €{couponDiscount.toFixed(2)} ({appliedCoupon.discountPercent}% OFF)
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Terms Checkbox inside Modal (Screen only) */}
                {!(isOptA && isOptAPaid) && (
                  <Box className="terms-section no-print" sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.06)' }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        id="modal-billing-tc"
                        checked={billingTermsChecked}
                        onChange={(e) => setBillingTermsChecked(e.target.checked)}
                        style={{ marginTop: 3, transform: 'scale(1.2)', cursor: 'pointer' }}
                      />
                      <label htmlFor="modal-billing-tc" style={{ fontSize: '0.8rem', color: '#374151', cursor: 'pointer', fontWeight: 500, lineHeight: 1.4 }}>
                        {isRefundGuaranteePackage(currentPkg || selectedPackage, client?.serviceType || client?.serviceId) ? (
                          <>
                            I agree to the <span style={{ color: '#E11D48', fontWeight: 800 }}>100%</span> Refund Guarantee according to the <a href="https://aaabusinessconsultancy.com/terms-conditions/" target="_blank" rel="noopener noreferrer" style={{ color: '#051A3B', textDecoration: 'underline', fontWeight: 700 }}>Company Terms &amp; Conditions</a>.
                          </>
                        ) : (
                          <>
                            I agree to the <a href="https://aaabusinessconsultancy.com/terms-conditions/" target="_blank" rel="noopener noreferrer" style={{ color: '#051A3B', textDecoration: 'underline', fontWeight: 700 }}>Company Terms &amp; Conditions</a>.
                          </>
                        )}
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
                const grossSubTotal = Math.max(0, baseFee + addPrice - assessmentCredit);
                const couponDiscount = appliedCoupon ? Math.round((grossSubTotal * (appliedCoupon.discountPercent / 100)) * 100) / 100 : 0;

                selectAndPayPackageMutation.mutate({
                  packageId: selectedPackage,
                  additionalApplicants: effectiveAddCount,
                  clientId: client?.id || clientId,
                  amount: Math.max(0, grossSubTotal),
                  discount: couponDiscount,
                  couponCode: appliedCoupon ? appliedCoupon.code : undefined
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

      {/* ── OFFICIAL AAA BUSINESS CONSULTANCY LETTERHEAD REFUND STATEMENT MODAL ── */}
      <Dialog
        open={Boolean(selectedRefundForReceipt)}
        onClose={() => setSelectedRefundForReceipt(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', py: 1.5, px: 3, borderBottom: '1px solid #E2E8F0' }} className="no-print">
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0C2340', fontFamily: 'Outfit, sans-serif' }}>
            Official Refund Statement & Receipt
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => generateRefundReceiptPDF(selectedRefundForReceipt, client)}
              sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2, bgcolor: '#0C2340', color: 'white', '&:hover': { bgcolor: '#C59B27', color: '#0C2340' } }}
            >
              📥 Download PDF
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.print()}
              sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
            >
              🖨️ Print Receipt
            </Button>
            <IconButton size="small" onClick={() => setSelectedRefundForReceipt(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF' }}>
          {selectedRefundForReceipt && (() => {
            const r = selectedRefundForReceipt;
            const amountVal = Number(r?.amount) || 0;
            const amountStr = `€${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const receiptNo = `RF-2026-${(r?.id || '').replace(/-/g, '').slice(-6).toUpperCase()}`;
            const clientName = client ? `${client.firstName} ${client.lastName}` : 'Valued Client';
            const customerId = client?.clientCode || (client?.id ? 'CID-' + client.id.slice(-5).toUpperCase() : 'CID-12039');
            const dateStr = r?.date || (r?.createdAt ? dayjs(r.createdAt).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY'));

            return (
              <Paper
                className="printable-invoice-letterhead"
                elevation={0}
                sx={{
                  position: 'relative',
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  minHeight: '720px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: { xs: 2.5, sm: 4, md: 4.5 }
                }}
              >
                {/* Background Faint Watermark Logo */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.04,
                    pointerEvents: 'none',
                    zIndex: 0,
                    width: '350px',
                    height: '350px'
                  }}
                >
                  <img src={aaaLogo} alt="AAA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  {/* 1. LETTERHEAD HEADER */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                    {/* Left: Logo & Company Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
                      <img src={aaaLogo} alt="AAA Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                      <Box sx={{ borderLeft: '1.5px solid #C59B27', pl: 1.2, py: 0.2 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0C2340', lineHeight: 1.1, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                          AAA BUSINESS CONSULTANCY L.L.C
                        </Typography>
                        <Box sx={{ borderTop: '1.5px solid #C59B27', borderBottom: '1.5px solid #C59B27', py: 0.2, px: 0.4, textAlign: 'center', mt: 0.5, display: 'inline-block', width: '100%' }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.55rem', color: '#C59B27', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                            ADVISE • ASSIST • ACHIEVE
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Right: Contact Block */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
                      <Box sx={{ width: '1.5px', height: '58px', bgcolor: '#C59B27', flexShrink: 0 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700 }}>
                          ✉️ client@aaabusinessconsultancy.com
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700 }}>
                          📞 +971509554142
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700 }}>
                          🌐 www.aaabusinessconsultancy.com
                        </Typography>
                        <Typography sx={{ fontSize: '0.63rem', color: '#0C2340', fontWeight: 700, maxWidth: '210px', lineHeight: 1.2 }}>
                          📍 Business Village B, office number F-09 Port Saeed Deira Dubai, UAE
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* 2. DUAL-TONE DIVIDER BAR */}
                  <Box sx={{ width: '100%', height: '5px', borderRadius: '1px', display: 'flex', mb: 3.5, overflow: 'hidden' }}>
                    <Box sx={{ width: '32%', bgcolor: '#0C2340' }} />
                    <Box sx={{ width: '35%', bgcolor: '#C59B27' }} />
                    <Box sx={{ width: '33%', bgcolor: '#0C2340' }} />
                  </Box>

                  {/* 3. STATEMENT META & STATUS BAR */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#0C2340', letterSpacing: '0.5px', lineHeight: 1 }}>
                        REFUND STATEMENT
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', mt: 0.5 }}>
                        Receipt #: {receiptNo}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label={r.status || 'Processed'} color="success" size="small" sx={{ fontWeight: 800, textTransform: 'uppercase' }} />
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: { sm: 'right' } }}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                        <strong>Date Issued:</strong> {dateStr}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, mt: 0.4 }}>
                        <strong>Payment Status:</strong> PROCESSED / REFUNDED
                      </Typography>
                    </Box>
                  </Box>

                  {/* 4. BILL TO / PAYOUT DETAILS */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3.5, bgcolor: '#F8FAFC', p: 2.5, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                        REFUND ISSUED TO
                      </Typography>
                      <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0C2340' }}>
                        {clientName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', mt: 0.2 }}>
                        Email: {client?.email || 'N/A'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', mt: 0.2 }}>
                        Customer ID: {customerId}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: { sm: 'right' } }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                        PAYMENT & PAYOUT DETAILS
                      </Typography>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B' }}>
                        Payout Method: {r.payoutMethod || 'Credit Card / Direct Transfer'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#16A34A', mt: 0.4 }}>
                        Ref / UTR: {r.transactionRef || 'STRIPE-RF-' + (r.id || '').slice(0, 8)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 5. ITEMIZED TABLE */}
                  <TableContainer sx={{ mb: 3.5, borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#0C2340 !important' }}>
                        <TableRow sx={{ bgcolor: '#0C2340 !important' }}>
                          <TableCell sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.88rem' }}>Description & Settlement</TableCell>
                          <TableCell sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.88rem' }}>Category</TableCell>
                          <TableCell align="right" sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.88rem' }}>Amount (€)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0C2340' }}>
                              Spain Visa Guarantee Refund Settlement
                            </Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.2 }}>
                              Official refund settlement as per AAA 100% Money-Back Guarantee Terms & Conditions.
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {r.category || 'Visa Rejection'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#C59B27', fontSize: '1rem' }}>
                            {amountStr}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* 6. TOTAL REFUNDED SUMMARY */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Box sx={{ width: { xs: '100%', sm: '320px' } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#0C2340', color: 'white', p: 1.8, borderRadius: '8px', borderLeft: '4px solid #C59B27' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>TOTAL REFUNDED</Typography>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#FACC15' }}>{amountStr}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center', mb: 1 }}>
                    Thank you for choosing AAA Business Consultancy for your Spain Relocation journey.
                  </Typography>
                </Box>

                {/* 7. BOTTOM GRAPHIC FOOTER */}
                <Box sx={{ position: 'relative', width: '100%', mt: 3, overflow: 'hidden' }}>
                  <svg viewBox="0 0 1000 45" preserveAspectRatio="none" style={{ width: '100%', height: '40px', display: 'block' }}>
                    <path d="M 0 10 L 230 10 C 248 10 258 18 266 28 L 278 45 L 1000 45 L 1000 38 L 274 38 L 260 22 C 252 12 240 4 225 4 L 0 4 Z" fill="#C59B27" />
                    <path d="M 0 12 L 225 12 C 240 12 250 20 258 30 L 270 45 L 0 45 Z" fill="#0C2340" />
                    <path d="M 270 45 L 1000 45 L 1000 38 L 270 38 Z" fill="#0C2340" />
                  </svg>
                </Box>
              </Paper>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ClientPortalDocs;
