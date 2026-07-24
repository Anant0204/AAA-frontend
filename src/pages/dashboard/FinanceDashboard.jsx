import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';

import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import AppCard from '../../components/AppCard';
import AppTable from '../../components/AppTable';

// Recharts components
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer } from 'recharts';

// Custom icons
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';

export const FinanceDashboard = () => {
  const navigate = useNavigate();

  const { data: allPayments = [] } = useQuery({ queryKey: ['payments'], queryFn: dbService.getPayments });
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications'], queryFn: dbService.getNotifications });
  const { data: agents = [] } = useQuery({ queryKey: ['agents'], queryFn: dbService.getAgents });

  // Compute key stats
  const completedPayments = allPayments.filter((p) => p.status === 'Paid');
  const pendingPayments = allPayments.filter((p) => p.status === 'Pending');

  const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.totalPaid || 0), 0);
  const totalInvoiced = allPayments.reduce((sum, p) => sum + ((p.amount || 0) - (p.discount || 0)), 0);
  const totalPendingVal = pendingPayments.reduce((sum, p) => sum + ((p.amount || 0) - (p.discount || 0)), 0);

  // Calculate Consultant Commission Data
  const consultantCommissions = agents
    .filter(a => a.role === 'consultant')
    .map(agent => {
      // Find all payments of clients assigned to this agent
      const paidClientPayments = allPayments.filter(p => {
        return p.status === 'Paid' && p.client?.assignedToId === agent.id;
      });
      
      const totalClosedRevenue = paidClientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const rate = agent.commissionRate || 10; // default 10%
      const calculatedCommission = (totalClosedRevenue * rate) / 100;
      const commissionPaid = agent.commissionPaid || 0;
      const balance = calculatedCommission - commissionPaid;

      return {
        id: agent.id,
        fullName: agent.fullName,
        rate: `${rate}%`,
        totalRevenue: `€${totalClosedRevenue.toLocaleString()}`,
        earned: `€${calculatedCommission.toLocaleString()}`,
        paid: `€${commissionPaid.toLocaleString()}`,
        balance: `€${balance.toLocaleString()}`
      };
    });

  const commissionColumns = [
    { id: 'fullName', label: 'Consultant' },
    { id: 'rate', label: 'Rate' },
    { id: 'totalRevenue', label: 'Revenue Generated' },
    { id: 'earned', label: 'Commission Earned' },
    { id: 'paid', label: 'Paid Out' },
    { id: 'balance', label: 'Payout Balance' }
  ];

  // Render stats list
  const statsList = [
    { title: 'Total Revenue (Paid)', value: `€${totalRevenue.toLocaleString()}`, icon: <PaymentsIcon />, color: '#22C55E', onClick: () => navigate('/payments/invoices', { state: { filterStatus: 'Paid', cardInfo: { title: 'Total Revenue (Paid)', value: `€${totalRevenue.toLocaleString()}`, color: '#22C55E', iconType: 'Payments' } } }) },
    { title: 'Total Invoiced Value', value: `€${totalInvoiced.toLocaleString()}`, icon: <ReceiptIcon />, color: '#3F51B5', onClick: () => navigate('/payments/invoices', { state: { filterStatus: '', cardInfo: { title: 'Total Invoiced Value', value: `€${totalInvoiced.toLocaleString()}`, color: '#3F51B5', iconType: 'Receipt' } } }) },
    { title: 'Pending Receivables', value: `€${totalPendingVal.toLocaleString()}`, icon: <CreditCardIcon />, color: '#F59E0B', onClick: () => navigate('/payments/invoices', { state: { filterStatus: 'Pending', cardInfo: { title: 'Pending Receivables', value: `€${totalPendingVal.toLocaleString()}`, color: '#F59E0B', iconType: 'CreditCard' } } }) },
    { title: 'Completed Invoices', value: completedPayments.length, icon: <ReceiptIcon />, color: '#10B981', onClick: () => navigate('/payments/invoices', { state: { filterStatus: 'Paid', cardInfo: { title: 'Completed Invoices', value: completedPayments.length, color: '#10B981', iconType: 'Receipt' } } }) }
  ];

  // CHART 1: Monthly Revenue vs Invoiced Chart
  const revenueData = [
    { name: 'Jan', revenue: 12000, invoiced: 13000 },
    { name: 'Feb', revenue: 15500, invoiced: 16000 },
    { name: 'Mar', revenue: 19800, invoiced: 21000 },
    { name: 'Apr', revenue: 22000, invoiced: 24000 },
    { name: 'May', revenue: 31000, invoiced: 33000 },
    { name: 'Jun', revenue: totalRevenue, invoiced: totalInvoiced },
  ];

  // CHART 2: Payment Gateway Distribution
  const gatewayData = allPayments.reduce((acc, curr) => {
    const method = curr.paymentMethod || 'Stripe';
    if (method === '-') return acc; // Skip unassigned
    const existing = acc.find((item) => item.name === method);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: method, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#2563EB', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Table config: Pending Invoices requiring followups
  const pendingInvoices = pendingPayments.slice(0, 5);
  const invoiceColumns = [
    { id: 'id', label: 'Invoice ID', minWidth: 90 },
    { id: 'clientName', label: 'Client' },
    {
      id: 'amount',
      label: 'Net Amount',
      render: (row) => `€${((row.amount || 0) - (row.discount || 0)).toLocaleString()}` },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'status', label: 'Status' }
  ];

  const recentTransactions = notifications
    .filter((n) => n.type === 'payment')
    .slice(0, 5);

  return (
    <Box>
      <PageHeader
        title="Finance Dashboard"
        subtitle="Manage payments history, review gateway transactions, and reconcile closed client invoices."
        action={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/settings')}
          >
            Gateway Settings
          </Button>
        }
      />

      {/* Stats list Grid */}
      <Box
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-3"
      >
        {statsList.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            onClick={stat.onClick}
          />
        ))}
      </Box>

      {/* Charts Grid */}
      <Box className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3">
        {/* Revenue Growth Area Chart */}
        <Box className="col-span-12 md:col-span-8">
          <ChartCard title="Revenue Growth Trends" subheader="Total Invoiced vs Actual payments collected">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueFin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <ChartTooltip formatter={(value) => [`€${value}`]} />
                <Area type="monotone" dataKey="revenue" name="Payments Collected (€)" stroke="#22C55E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenueFin)" />
                <Area type="monotone" dataKey="invoiced" name="Invoiced Amount (€)" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        {/* Payment Gateway Pie Chart */}
        <Box className="col-span-12 md:col-span-4">
          <ChartCard title="Gateway Distribution" subheader="Active payment methods share">
            {gatewayData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                No gateway data logged.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gatewayData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fontSize={10}
                    fontWeight={500}
                  >
                    {gatewayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Box>
      </Box>

      {/* Tables and Widgets */}
      <Box className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Pending Invoices */}
        <Box className="col-span-12 lg:col-span-8">
          <AppCard
            title="Pending Invoices Log"
            subheader="Overview of pending bank wires or unpaid gateway sessions"
            action={
              <Button size="small" variant="text" color="secondary" onClick={() => navigate('/payments')}>
                Open Payments Center
              </Button>
            }
            noPadding
          >
            <AppTable
              columns={invoiceColumns}
              data={pendingInvoices}
              onRowClick={(row) => navigate(`/payments/invoice-details/${row.id}`)}
            />
          </AppCard>
        </Box>

        {/* Recent Payment Activities */}
        <Box className="col-span-12 lg:col-span-4">
          <AppCard title="Recent Invoice Actions" subheader="Financial timeline tracking logs">
            {recentTransactions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No recent payment actions found.
              </Typography>
            ) : (
              <List disablePadding>
                {recentTransactions.map((notif, idx) => (
                  <React.Fragment key={notif.id}>
                    <ListItem sx={{ py: 1.5, px: 0 }}>
                      <ListItemText
                        slotProps={{
                          primary: { component: 'div' },
                          secondary: { component: 'div' }
                        }}
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {notif.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {notif.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notif.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {idx < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </AppCard>
        </Box>
      </Box>

      {/* Consultant Commissions & Payouts Log */}
      <Box sx={{ mt: 3 }}>
        <AppCard
          title="Consultant Commissions & Payout Log"
          subheader="Monitor closed deal values, calculated rates, and pending payout balances"
          noPadding
        >
          {consultantCommissions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No consultant data logged.
            </Typography>
          ) : (
            <AppTable
              columns={commissionColumns}
              data={consultantCommissions}
              onRowClick={(row) => navigate(`/finance/agents`)}
            />
          )}
        </AppCard>
      </Box>

      {/* Refund Claims & Guarantees Section */}
      <Box sx={{ mt: 3 }}>
        <RefundClaimsTable />
      </Box>
    </Box>
  );
};

const RefundClaimsTable = () => {
  const queryClient = useQueryClient();
  const { data: refundClaims = [], isLoading } = useQuery({
    queryKey: ['refundClaims'],
    queryFn: dbService.getRefundRequests
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ paymentId, refundStatus, rejectionReason }) =>
      dbService.updateRefundStatus(paymentId, refundStatus, null, null, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refundClaims'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const refundColumns = [
    { header: 'Client Name', accessor: 'clientName', cell: (row) => <strong>{row.clientName}</strong> },
    { header: 'Total Paid (€)', accessor: 'totalPaid', cell: (row) => `€${(row.totalPaid || row.amount || 0).toLocaleString()}` },
    { 
      header: '50% Refund Amount (€)', 
      accessor: 'calculatedRefundAmount', 
      cell: (row) => <strong style={{ color: '#DC2626' }}>€{(row.calculatedRefundAmount || 0).toLocaleString()}</strong> 
    },
    { 
      header: 'Refund Status', 
      accessor: 'refundStatus', 
      cell: (row) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          backgroundColor: row.refundStatus === 'Refund Completed' ? '#DCFCE7' : row.refundStatus === 'Refund Rejected' ? '#FEE2E2' : '#FEF3C7',
          color: row.refundStatus === 'Refund Completed' ? '#15803D' : row.refundStatus === 'Refund Rejected' ? '#B91C1C' : '#B45309'
        }}>
          {row.refundStatus || row.status || 'Refund Eligible'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.refundStatus !== 'Refund Approved' && row.refundStatus !== 'Refund Completed' && (
            <Button 
              size="small" 
              variant="outlined" 
              color="primary"
              onClick={() => updateStatusMutation.mutate({ paymentId: row.id, refundStatus: 'Refund Approved' })}
            >
              Approve
            </Button>
          )}
          {row.refundStatus !== 'Refund Completed' && (
            <Button 
              size="small" 
              variant="contained" 
              color="success"
              onClick={() => updateStatusMutation.mutate({ paymentId: row.id, refundStatus: 'Refund Completed' })}
            >
              Complete Payout
            </Button>
          )}
          {row.refundStatus !== 'Refund Rejected' && (
            <Button 
              size="small" 
              variant="outlined" 
              color="error"
              onClick={() => {
                const reason = prompt('Enter reason for rejecting refund claim:');
                if (reason) updateStatusMutation.mutate({ paymentId: row.id, refundStatus: 'Refund Rejected', rejectionReason: reason });
              }}
            >
              Reject
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <AppCard
      title="Refund Claims & 50% Guarantee Engine"
      subheader="Review eligible claims, auto-calculated 50% money-back amounts, and process payouts"
      noPadding
    >
      {refundClaims.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No active refund claims or eligible guarantee requests found.
        </Typography>
      ) : (
        <AppTable columns={refundColumns} data={refundClaims} />
      )}
    </AppCard>
  );
};

export default FinanceDashboard;
