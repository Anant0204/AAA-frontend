import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';
import useAuth from '../hooks/useAuth';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Dashboard & CRM Modules
import Dashboard from '../pages/dashboard/Dashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import OperationsDashboard from '../pages/dashboard/OperationsDashboard';
import AgentDashboard from '../pages/dashboard/AgentDashboard';
import FinanceDashboard from '../pages/dashboard/FinanceDashboard';
import SuperAdminDashboard from '../pages/dashboard/SuperAdminDashboard';
import MarketingDashboard from '../pages/dashboard/MarketingDashboard';

import AdminLeadList from '../pages/leads/AdminLeadList';
import OperationsLeadList from '../pages/leads/OperationsLeadList';
import AgentLeadList from '../pages/leads/AgentLeadList';
import AdminLeadDetails from '../pages/leads/AdminLeadDetails';
import OperationsLeadDetails from '../pages/leads/OperationsLeadDetails';
import AgentLeadDetails from '../pages/leads/AgentLeadDetails';
import AdminConsultationList from '../pages/consultations/AdminConsultationList';
import OperationsConsultationList from '../pages/consultations/OperationsConsultationList';
import AgentConsultationList from '../pages/consultations/AgentConsultationList';
import AdminConsultationDetails from '../pages/consultations/AdminConsultationDetails';
import OperationsConsultationDetails from '../pages/consultations/OperationsConsultationDetails';
import AgentConsultationDetails from '../pages/consultations/AgentConsultationDetails';
import AdminCalendarView from '../pages/consultations/AdminCalendarView';
import OperationsCalendarView from '../pages/consultations/OperationsCalendarView';
import AgentCalendarView from '../pages/consultations/AgentCalendarView';

import AdminClientList from '../pages/clients/AdminClientList';
import OperationsClientList from '../pages/clients/OperationsClientList';
import AgentClientList from '../pages/clients/AgentClientList';
import AdminClientDetails from '../pages/clients/AdminClientDetails';
import OperationsClientDetails from '../pages/clients/OperationsClientDetails';
import AgentClientDetails from '../pages/clients/AgentClientDetails';
import AdminAgents from '../pages/team/AdminAgents';
import OperationsAgents from '../pages/team/OperationsAgents';
import AdminActiveCases from '../pages/team/AdminActiveCases';
import OperationsActiveCases from '../pages/team/OperationsActiveCases';
import AdminClosedCases from '../pages/clients/AdminClosedCases';
import OperationsClosedCases from '../pages/clients/OperationsClosedCases';
import AdminMarketing from '../pages/marketing/AdminMarketing';
import OperationsMarketing from '../pages/marketing/OperationsMarketing';
import AdminAgentsPerformance from '../pages/team/AdminAgentsPerformance';
import OperationsAgentsPerformance from '../pages/team/OperationsAgentsPerformance';
import StaffProfile from '../pages/team/StaffProfile';
import AdminPaymentDashboard from '../pages/payments/AdminPaymentDashboard';
import FinancePaymentDashboard from '../pages/payments/FinancePaymentDashboard';
import InvoiceList from '../pages/payments/InvoiceList';
import InvoiceDetails from '../pages/payments/InvoiceDetails';
import Settings from '../pages/settings/Settings';
import AdminSocialInbox from '../pages/social/AdminSocialInbox';
import OperationsSocialInbox from '../pages/social/OperationsSocialInbox';
import AgentSocialInbox from '../pages/social/AgentSocialInbox';
import ClientIntakeForm from '../pages/public/ClientIntakeForm';
import SwornTranslationForm from '../pages/public/SwornTranslationForm';
import LandingPage from '../pages/public/LandingPage';
import ClientPortalLogin from '../pages/public/ClientPortalLogin';
import ClientPortalChangePassword from '../pages/public/ClientPortalChangePassword';
import ClientPortalDocs from '../pages/public/ClientPortalDocs';
import LeadSelfFillForm from '../pages/public/LeadSelfFillForm';
import PaymentSuccess from '../pages/public/PaymentSuccess';
import AdminDocumentVerificationDashboard from '../pages/documents/AdminDocumentVerificationDashboard';
import OperationsDocumentVerificationDashboard from '../pages/documents/OperationsDocumentVerificationDashboard';

import Agents from '../pages/team/Agents';
import ActiveCases from '../pages/team/ActiveCases';
import ClosedCases from '../pages/clients/ClosedCases';
import AllAgentsPerformance from '../pages/team/AllAgentsPerformance';

// Super Admin Dedicated Pages
import SuperAdminLeadList from '../pages/leads/SuperAdminLeadList';
import SuperAdminLeadDetails from '../pages/leads/SuperAdminLeadDetails';
import SuperAdminConsultationList from '../pages/consultations/SuperAdminConsultationList';
import SuperAdminConsultationDetails from '../pages/consultations/SuperAdminConsultationDetails';
import SuperAdminCalendarView from '../pages/consultations/SuperAdminCalendarView';
import SuperAdminClientList from '../pages/clients/SuperAdminClientList';
import SuperAdminClientDetails from '../pages/clients/SuperAdminClientDetails';
import SuperAdminClosedCases from '../pages/clients/SuperAdminClosedCases';
import SuperAdminAgents from '../pages/team/SuperAdminAgents';
import SuperAdminActiveCases from '../pages/team/SuperAdminActiveCases';
import SuperAdminAgentsPerformance from '../pages/team/SuperAdminAgentsPerformance';
import SuperAdminMarketing from '../pages/marketing/SuperAdminMarketing';
import SuperAdminSocialInbox from '../pages/social/SuperAdminSocialInbox';
import SuperAdminDocumentVerificationDashboard from '../pages/documents/SuperAdminDocumentVerificationDashboard';
import SuperAdminPaymentDashboard from '../pages/payments/SuperAdminPaymentDashboard';
import SuperAdminRefundCommissionHub from '../pages/payments/SuperAdminRefundCommissionHub';
import SuperAdminStorageBackup from '../pages/documents/SuperAdminStorageBackup';
import SuperAdminCustomization from '../pages/settings/SuperAdminCustomization';
import Integrations from '../pages/integrations/Integrations';

const getMenuLabelForPath = (path) => {
  const p = path.toLowerCase();

  if (p.includes('/dashboard')) return 'Dashboard';
  if (p.includes('/agents/performance')) return 'All Agents Performance';
  if (p.includes('/agents') || p.includes('/team/agents')) return 'Agents';
  if (p.includes('/active-cases')) return 'Active Cases';
  if (p.includes('/documents/verify')) return 'Doc Verification';
  if (p.includes('/documents/storage')) return 'AWS Cloud Backups';
  if (p.includes('/payments/refund-commission')) return 'Refunds & Commissions';
  if (p.includes('/closed-cases')) return 'Closed Cases';
  if (p.includes('/marketing-manager/leads')) return 'Leads';
  if (p.includes('/marketing-manager/dashboard')) return 'Dashboard';
  if (p.includes('/clients')) return 'Clients';
  if (p.includes('/leads')) return 'Leads';
  if (p.includes('/social-inbox')) return 'Social Inbox';
  if (p.includes('/marketing')) return 'Marketing';
  if (p.includes('/consultations/calendar')) return 'Calendar';
  if (p.includes('/integrations')) return 'Integrations';
  if (p.includes('/payments') || p.includes('/finance') || p.includes('/invoice')) return 'Finance';

  return null;
};

const getDynamicRedirectPath = (label, role) => {
  let prefix = '';
  if (role === 'admin') prefix = 'admin';
  else if (role === 'operations') prefix = 'operations';
  else if (role === 'consultant') prefix = 'agent';
  else if (role === 'marketing') prefix = 'marketing-manager';
  else if (role === 'finance') prefix = 'finance';
  else prefix = role;

  let path = '/dashboard';
  if (label === 'Dashboard') path = '/dashboard';
  else if (label === 'Agents') path = '/agents';
  else if (label === 'Active Cases') path = '/active-cases';
  else if (label === 'Doc Verification') path = '/documents/verify';
  else if (label === 'Closed Cases') path = '/closed-cases';
  else if (label === 'Clients') path = '/clients';
  else if (label === 'Leads') path = '/leads';
  else if (label === 'Social Inbox') path = '/social-inbox';
  else if (label === 'Marketing') path = '/marketing';
  else if (label === 'Calendar') path = '/consultations/calendar';
  else if (label === 'Integrations') path = '/integrations';
  else if (label === 'Finance') path = '/payments';

  if (label === 'Integrations') return '/integrations';
  if (!prefix) return path;
  return `/${prefix}${path}`;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser, hasRole } = useAuth();
  const location = useLocation();

  // ✅ useQuery MUST be called before any conditional returns (Rules of Hooks)
  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings,
    enabled: !!currentUser, // only fetch when user is present
  });

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const builtInRoles = ['admin', 'operations', 'finance', 'consultant', 'super_admin', 'marketing'];
  const isCustomRole = currentUser && !builtInRoles.includes(currentUser.role);

  if (allowedRoles && !hasRole(allowedRoles) && !isCustomRole) {
    const rolePrefix = currentUser.role === 'consultant' ? 'agent'
      : currentUser.role === 'super_admin' ? 'super_admin'
      : currentUser.role === 'marketing' ? 'marketing-manager'
      : currentUser.role;
    return <Navigate to={`/${rolePrefix}/dashboard`} replace />;
  }

  if (currentUser && currentUser.role !== 'super_admin') {
    try {
      const currentMenuLabel = getMenuLabelForPath(location.pathname);

      // 1. Check individual custom permissions first (highest priority)
      if (currentUser.customPermissions?.enabled) {
        const allowedMenus = currentUser.customPermissions.menus || [];
        if (currentMenuLabel && !allowedMenus.includes(currentMenuLabel)) {
          if (allowedMenus.length > 0) {
            const firstAllowedLabel = allowedMenus[0];
            const redirectPath = getDynamicRedirectPath(firstAllowedLabel, currentUser.role);
            if (location.pathname !== redirectPath) {
              return <Navigate to={redirectPath} replace />;
            }
          }
        }
      } else if (customizationSettings) {
        // 2. Fall back to role-level customization settings with Individual User Overrides merged
        const roleDefaults = customizationSettings[currentUser.role] || {};
        const userOverrides = customizationSettings[currentUser.id] || {};
        const allowedMenus = userOverrides.menus || roleDefaults.menus || [];
        
        if (currentMenuLabel && !allowedMenus.includes(currentMenuLabel)) {
          if (allowedMenus.length > 0) {
            const firstAllowedLabel = allowedMenus[0];
            const redirectPath = getDynamicRedirectPath(firstAllowedLabel, currentUser.role);
            if (location.pathname !== redirectPath) {
              return <Navigate to={redirectPath} replace />;
            }
          } else {
            // Default fallback if all menus are disabled
            const rolePrefix = getPrefixForRole(currentUser.role);
            return <Navigate to={`/${rolePrefix}/dashboard`} replace />;
          }
        }
      }
    } catch (e) {
      console.warn('Error checking dynamic route customization:', e);
    }
  }

  return children;
};

const getPrefixForRole = (role) => {
  if (!role) return 'super_admin';
  if (role === 'consultant') return 'agent';
  if (role === 'marketing') return 'marketing-manager';
  return role;
};

// Redirectors for un-prefixed detail/list paths
const LeadDetailsRedirect = () => {
  const { currentUser } = useAuth();
  const { id } = useParams();
  return <Navigate to={`/${getPrefixForRole(currentUser?.role)}/leads/details/${id}`} replace />;
};

const ClientDetailsRedirect = () => {
  const { currentUser } = useAuth();
  const { id } = useParams();
  return <Navigate to={`/${getPrefixForRole(currentUser?.role)}/clients/details/${id}`} replace />;
};

const ConsultationDetailsRedirect = () => {
  const { currentUser } = useAuth();
  const { id } = useParams();
  return <Navigate to={`/${getPrefixForRole(currentUser?.role)}/consultations/details/${id}`} replace />;
};

const ConsultationsRedirect = () => {
  const { currentUser } = useAuth();
  return <Navigate to={`/${getPrefixForRole(currentUser?.role)}/consultations`} replace />;
};

const ConsultationsCalendarRedirect = () => {
  const { currentUser } = useAuth();
  return <Navigate to={`/${getPrefixForRole(currentUser?.role)}/consultations/calendar`} replace />;
};

const PaymentsRedirect = () => {
  const { currentUser } = useAuth();
  return <Navigate to={`/${getPrefixForRole(currentUser?.role)}/payments`} replace />;
};

const ClientPortalGuard = ({ children }) => {
  const clientData = JSON.parse(localStorage.getItem('clientData') || 'null');
  const location = useLocation();

  if (!clientData) {
    return <Navigate to="/portal/login" replace />;
  }

  if (clientData.isTemporaryPassword && location.pathname !== '/portal/change-password') {
    return <Navigate to="/portal/change-password" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Shell Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Official Single Public Lead Booking Form */}
      <Route path="/public/lead-form" element={<LeadSelfFillForm />} />
      <Route path="/public/intake" element={<Navigate to="/public/lead-form" replace />} />
      <Route path="/public/booking" element={<Navigate to="/public/lead-form" replace />} />
      <Route path="/public/eligibility-booking" element={<Navigate to="/public/lead-form" replace />} />
      <Route path="/public/intake/client/:clientId" element={<ClientIntakeForm />} />
      <Route path="/public/translation" element={<SwornTranslationForm />} />
      <Route path="/public/payment-success" element={<PaymentSuccess />} />


      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Client Portal (Protected via simple login or token in real app, keeping route structure) */}
      <Route path="/portal/login" element={<ClientPortalLogin />} />
      <Route path="/portal/change-password" element={
        <ClientPortalGuard>
          <ClientPortalChangePassword />
        </ClientPortalGuard>
      } />
      <Route path="/portal/documents/:clientId" element={
        <ClientPortalGuard>
          <ClientPortalDocs />
        </ClientPortalGuard>
      } />

      {/* Main CRM Dashboard Shell Layout (Protected) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Core Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Un-prefixed fallback redirects for details / lists */}
        <Route path="/leads/details/:id" element={<ProtectedRoute><LeadDetailsRedirect /></ProtectedRoute>} />
        <Route path="/clients/details/:id" element={<ProtectedRoute><ClientDetailsRedirect /></ProtectedRoute>} />
        <Route path="/consultations" element={<ProtectedRoute><ConsultationsRedirect /></ProtectedRoute>} />
        <Route path="/consultations/calendar" element={<ProtectedRoute><ConsultationsCalendarRedirect /></ProtectedRoute>} />
        <Route path="/consultations/details/:id" element={<ProtectedRoute><ConsultationDetailsRedirect /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsRedirect /></ProtectedRoute>} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/dashboard"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/dashboard"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/leads"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminLeadList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/leads/details/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminLeadDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/consultations"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminConsultationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/consultations/details/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminConsultationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/consultations/calendar"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminCalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/clients"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminClientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/clients/details/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminClientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/agents"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/agents/performance"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminAgentsPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/active-cases"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminActiveCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/closed-cases"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminClosedCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/documents/verify"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDocumentVerificationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/marketing"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminMarketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/payments"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminPaymentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/payments/refund-commission"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminRefundCommissionHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments/refund-commission"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <SuperAdminRefundCommissionHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/payments/refund-commission"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <SuperAdminRefundCommissionHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/payments/refund-commission"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <SuperAdminRefundCommissionHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/documents/storage"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminStorageBackup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/customization"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminCustomization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super_admin/social-inbox"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminSocialInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={['marketing']}>
              <MarketingDashboard />
            </ProtectedRoute>
          }
        />

        {/* Leads Module (Admins, Consultants, Operations) */}
        <Route
          path="/leads"
          element={<Dashboard />}
        />
        <Route
          path="/admin/leads"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'marketing']}>
              <SuperAdminLeadList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/leads"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <SuperAdminLeadList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/leads"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <SuperAdminLeadList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leads/details/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <SuperAdminLeadDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/leads/details/:id"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <SuperAdminLeadDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/leads/details/:id"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <SuperAdminLeadDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/leads"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminLeadList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/leads"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminLeadList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/leads/details/:id"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminLeadDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/leads/details/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminLeadDetails />
            </ProtectedRoute>
          }
        />

        {/* Consultations Module (Admins, Consultants, Operations) */}
        <Route
          path="/admin/consultations"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminConsultationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/consultations"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsConsultationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/consultations"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AgentConsultationList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/consultations/details/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminConsultationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/consultations/details/:id"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsConsultationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/consultations/details/:id"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AgentConsultationDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/consultations/calendar"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminCalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/consultations/calendar"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsCalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/consultations/calendar"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AgentCalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/consultations"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminConsultationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/consultations"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminConsultationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/consultations/details/:id"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminConsultationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/consultations/details/:id"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminConsultationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/consultations/calendar"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminCalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/consultations/calendar"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminCalendarView />
            </ProtectedRoute>
          }
        />

        {/* Clients Module (Admins, Consultants, Operations) */}
        <Route
          path="/clients"
          element={<Dashboard />}
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminClientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/clients"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsClientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/clients"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AgentClientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/details/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminClientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/clients/details/:id"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsClientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/clients/details/:id"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AgentClientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/clients"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminClientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/clients"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminClientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/clients/details/:id"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminClientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/clients/details/:id"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminClientDetails />
            </ProtectedRoute>
          }
        />

        {/* Agents Module (Admins, Operations) */}
        <Route
          path="/admin/agents"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/agents"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/agents/performance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminAgentsPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/agents/performance"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsAgentsPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/agents"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <Agents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/agents"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/agents"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/agents/performance"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AllAgentsPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/agents/performance"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AllAgentsPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/agents/performance"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AllAgentsPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team/profile/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operations', 'super_admin', 'consultant', 'finance', 'marketing']}>
              <StaffProfile />
            </ProtectedRoute>
          }
        />

        {/* Active Cases Processing Module (Admins, Operations) */}
        <Route
          path="/admin/active-cases"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminActiveCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/active-cases"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsActiveCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/closed-cases"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminClosedCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/closed-cases"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsClosedCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents/verify"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDocumentVerificationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/documents/verify"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsDocumentVerificationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/active-cases"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <ActiveCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/active-cases"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminActiveCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/active-cases"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminActiveCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/closed-cases"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <ClosedCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/closed-cases"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminClosedCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/closed-cases"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminClosedCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/documents/verify"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AdminDocumentVerificationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/documents/verify"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminDocumentVerificationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/documents/verify"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminDocumentVerificationDashboard />
            </ProtectedRoute>
          }
        />

        {/* Marketing Campaigns Module (Admins, Operations, Marketing) */}
        <Route
          path="/admin/marketing"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'marketing']}>
              <AdminMarketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/marketing"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsMarketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/marketing"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <AdminMarketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/marketing"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminMarketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminMarketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/marketing"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminMarketing />
            </ProtectedRoute>
          }
        />

        {/* Payments Module (Admins, Finance, and optionally Consultants to view status) */}
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminPaymentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/payments"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <FinancePaymentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/payments"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <FinancePaymentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/payments"
          element={
            <ProtectedRoute allowedRoles={['consultant', 'super_admin']}>
              <FinancePaymentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/payments"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <FinancePaymentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/invoices"
          element={
            <ProtectedRoute allowedRoles={['admin', 'finance', 'super_admin', 'operations', 'consultant', 'marketing']}>
              <InvoiceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/invoice-details/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'finance', 'super_admin', 'operations', 'consultant', 'marketing']}>
              <InvoiceDetails />
            </ProtectedRoute>
          }
        />

        {/* Social Inbox (Admins, Consultants, Operations) */}
        <Route
          path="/admin/social-inbox"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'marketing']}>
              <AdminSocialInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/social-inbox"
          element={
            <ProtectedRoute allowedRoles={['operations', 'super_admin']}>
              <OperationsSocialInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/social-inbox"
          element={
            <ProtectedRoute allowedRoles={['consultant']}>
              <AgentSocialInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/social-inbox"
          element={
            <ProtectedRoute allowedRoles={['finance', 'super_admin']}>
              <AdminSocialInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing-manager/social-inbox"
          element={
            <ProtectedRoute allowedRoles={['marketing', 'super_admin']}>
              <AdminSocialInbox />
            </ProtectedRoute>
          }
        />

        {/* Integrations (Admin, Super Admin) */}
        <Route
          path="/integrations"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'operations', 'consultant', 'finance', 'marketing']}>
              <Integrations />
            </ProtectedRoute>
          }
        />

        {/* Settings (Admins, Finance, Operations) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin', 'finance', 'operations', 'super_admin', 'marketing', 'consultant']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Dynamic / Custom Role Fallback Routes */}
        <Route path="/:rolePrefix/dashboard" element={<ProtectedRoute><OperationsDashboard /></ProtectedRoute>} />
        <Route path="/:rolePrefix/agents" element={<ProtectedRoute><OperationsAgents /></ProtectedRoute>} />
        <Route path="/:rolePrefix/agents/performance" element={<ProtectedRoute><OperationsAgentsPerformance /></ProtectedRoute>} />
        <Route path="/:rolePrefix/active-cases" element={<ProtectedRoute><OperationsActiveCases /></ProtectedRoute>} />
        <Route path="/:rolePrefix/documents/verify" element={<ProtectedRoute><OperationsDocumentVerificationDashboard /></ProtectedRoute>} />
        <Route path="/:rolePrefix/clients" element={<ProtectedRoute><OperationsClientList /></ProtectedRoute>} />
        <Route path="/:rolePrefix/clients/details/:id" element={<ProtectedRoute><OperationsClientDetails /></ProtectedRoute>} />
        <Route path="/:rolePrefix/leads" element={<ProtectedRoute><SuperAdminLeadList /></ProtectedRoute>} />
        <Route path="/:rolePrefix/leads/details/:id" element={<ProtectedRoute><SuperAdminLeadDetails /></ProtectedRoute>} />
        <Route path="/:rolePrefix/closed-cases" element={<ProtectedRoute><OperationsClosedCases /></ProtectedRoute>} />
        <Route path="/:rolePrefix/consultations" element={<ProtectedRoute><OperationsConsultationList /></ProtectedRoute>} />
        <Route path="/:rolePrefix/consultations/details/:id" element={<ProtectedRoute><OperationsConsultationDetails /></ProtectedRoute>} />
        <Route path="/:rolePrefix/consultations/calendar" element={<ProtectedRoute><SuperAdminCalendarView /></ProtectedRoute>} />
        <Route path="/:rolePrefix/payments" element={<ProtectedRoute><AdminPaymentDashboard /></ProtectedRoute>} />
        <Route path="/:rolePrefix/marketing" element={<ProtectedRoute><OperationsMarketing /></ProtectedRoute>} />
        <Route path="/:rolePrefix/social-inbox" element={<ProtectedRoute><OperationsSocialInbox /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
