import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  CreditCard,
  LifeBuoy,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  Key,
  DollarSign,
  Eye,
  EyeOff,
  Check,
  Send,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
  Car,
  FileText,
  BadgeAlert,
  Copy,
  Sliders,
  CheckCircle,
  X,
  Gauge,
  User,
  LogOut,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import {
  adminStore,
  ReportOrder,
  SupportTicket,
  EditablePackage,
  GatewaySettings,
  AdminEmailSettings,
  EmailLog,
  validateStripeCredentials,
  validatePaypalCredentials,
} from '../services/adminStore';
import { emailService } from '../services/emailService';
import { verifyStripeCredentials, verifyPaypalCredentials } from '../services/paymentCheckService';
import { ReportPlanId } from '../types';

interface AdminPageProps {
  onNavigate: (page: string) => void;
  onViewReportByVin?: (vin: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onNavigate,
  onViewReportByVin,
}) => {
  // Authentication check: password-protected admin area (Email: affandark@gmail.com)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('wc_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tickets' | 'packages' | 'gateways' | 'emails'>('overview');

  // State loaded from adminStore
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [packages, setPackages] = useState<EditablePackage[]>([]);
  const [gateways, setGateways] = useState<GatewaySettings>(adminStore.getGateways());
  const [emailSettings, setEmailSettings] = useState<AdminEmailSettings>(() => adminStore.getEmailSettings());
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => adminStore.getEmailLogs());

  // Email Config Form State
  const [adminEmailInput, setAdminEmailInput] = useState(() => adminStore.getEmailSettings().adminEmail);
  const [senderNameInput, setSenderNameInput] = useState(() => adminStore.getEmailSettings().senderName);
  const [supportNotifsInput, setSupportNotifsInput] = useState(() => adminStore.getEmailSettings().supportNotificationsEnabled);
  const [orderNotifsInput, setOrderNotifsInput] = useState(() => adminStore.getEmailSettings().orderNotificationsEnabled);
  const [autoReplyCustomerInput, setAutoReplyCustomerInput] = useState(() => adminStore.getEmailSettings().autoReplyToCustomer);
  const [orderDispatchInput, setOrderDispatchInput] = useState(() => adminStore.getEmailSettings().orderReportAutoDispatch ?? true);
  const [deliveryModeInput, setDeliveryModeInput] = useState<'auto' | 'server' | 'client_web3forms'>(
    () => adminStore.getEmailSettings().deliveryMode || 'auto'
  );
  const [web3FormsKeyInput, setWeb3FormsKeyInput] = useState(
    () => adminStore.getEmailSettings().web3FormsAccessKey || ''
  );
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [selectedLogToView, setSelectedLogToView] = useState<EmailLog | null>(null);
  const [emailLogFilter, setEmailLogFilter] = useState<'all' | 'support_query_received' | 'customer_ticket_confirmation' | 'admin_support_reply' | 'order_report_dispatch' | 'test_ping'>('all');

  // Key Visibility Toggles
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);

  // Gateway Connection Check States
  const [isCheckingStripe, setIsCheckingStripe] = useState(false);
  const [isCheckingPaypal, setIsCheckingPaypal] = useState(false);

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPackageFilter, setOrderPackageFilter] = useState('all');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [selectedOrder, setSelectedOrder] = useState<ReportOrder | null>(null);

  // Support Reply State
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Package Edit State
  const [editingPkgId, setEditingPkgId] = useState<ReportPlanId>('silver');
  const [newFeatureText, setNewFeatureText] = useState('');

  // Add New Package Modal & Form State
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgTagline, setNewPkgTagline] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('79.99');
  const [newPkgCredits, setNewPkgCredits] = useState('1');
  const [newPkgDeliveryTime, setNewPkgDeliveryTime] = useState('INSTANT 1-HOUR DELIVERY');
  const [newPkgIsPopular, setNewPkgIsPopular] = useState(false);
  const [newPkgIsActive, setNewPkgIsActive] = useState(true);
  const [newPkgFeatures, setNewPkgFeatures] = useState<string[]>([
    'INSTANT VEHICLE SPEC CHECK',
    'TITLE & BRAND RECORDS',
    'ACCIDENT DAMAGE AUDIT',
    'ODOMETER INTEGRITY VERIFICATION',
    'DIRECT EMAIL & PDF DOWNLOAD',
  ]);
  const [newPkgFeatureInput, setNewPkgFeatureInput] = useState('');

  // Success Toasts & Feedback
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(label);
    showNotification(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const reloadData = () => {
    setOrders(adminStore.getOrders());
    setTickets(adminStore.getTickets());
    setPackages(adminStore.getPackages());
    setGateways(adminStore.getGateways());
    const freshEmails = adminStore.getEmailSettings();
    setEmailSettings(freshEmails);
    setAdminEmailInput(freshEmails.adminEmail);
    setSenderNameInput(freshEmails.senderName);
    setSupportNotifsInput(freshEmails.supportNotificationsEnabled);
    setOrderNotifsInput(freshEmails.orderNotificationsEnabled);
    setAutoReplyCustomerInput(freshEmails.autoReplyToCustomer);
    setOrderDispatchInput(freshEmails.orderReportAutoDispatch ?? true);
    setEmailLogs(adminStore.getEmailLogs());
  };

  useEffect(() => {
    reloadData();
    const handleEmailUpdate = () => {
      setEmailSettings(adminStore.getEmailSettings());
      setEmailLogs(adminStore.getEmailLogs());
    };
    window.addEventListener('wc_emails_updated', handleEmailUpdate);
    return () => window.removeEventListener('wc_emails_updated', handleEmailUpdate);
  }, []);

  // Compute Overview Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.amount : 0), 0);
  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressTicketsCount = tickets.filter((t) => t.status === 'in-progress').length;
  const resolvedTicketsCount = tickets.filter((t) => t.status === 'resolved').length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const term = orderSearch.toLowerCase();
    const matchesSearch =
      o.vin.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.email.toLowerCase().includes(term) ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.vehicleName.toLowerCase().includes(term) ||
      (o.phone && o.phone.toLowerCase().includes(term));

    const matchesPackage = orderPackageFilter === 'all' || o.packageId === orderPackageFilter;
    return matchesSearch && matchesPackage;
  });

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'all') return true;
    return t.status === ticketFilter;
  });

  // Filtered Email Logs
  const filteredEmailLogs = emailLogs.filter((log) => {
    if (emailLogFilter === 'all') return true;
    return log.type === emailLogFilter;
  });

  // Order Actions
  const handleResendReportEmail = (order: ReportOrder) => {
    adminStore.sendEmail({
      from: `${emailSettings.senderName} <${emailSettings.adminEmail}>`,
      to: order.email,
      subject: `[Re-Sent Report] Vehicle History Report [Order #${order.orderNumber}] - VIN ${order.vin}`,
      body: `Dear ${order.customerName},\n\nAs requested, here is your verified vehicle history report for VIN: ${order.vin} (${order.packageName}).\n\nAll title records, accident verifications, and odometer readings are attached.\n\nBest regards,\n${emailSettings.senderName}\nOfficial Support: ${emailSettings.adminEmail}`,
      type: 'order_report_dispatch',
      orderId: order.id,
    });
    setEmailLogs(adminStore.getEmailLogs());
    showNotification(`Report re-dispatched to ${order.email} from ${emailSettings.adminEmail}!`);
  };

  // Ticket Actions
  const handleUpdateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    adminStore.updateTicketStatus(ticketId, status);
    setTickets(adminStore.getTickets());
    showNotification(`Ticket updated to ${status.toUpperCase()}`);
  };

  const handleSendTicketReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    const targetTicket = tickets.find((t) => t.id === ticketId);
    adminStore.updateTicketStatus(ticketId, 'resolved', replyText.trim());
    setTickets(adminStore.getTickets());
    setEmailLogs(adminStore.getEmailLogs());
    setReplyText('');
    setActiveTicketId(null);
    showNotification(`✓ Response sent from ${emailSettings.adminEmail} to ${targetTicket?.email || 'customer'}!`);
  };

  // Email Configuration Actions
  const handleSaveEmailSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: AdminEmailSettings = {
      adminEmail: adminEmailInput.trim() || 'affandark@gmail.com',
      senderName: senderNameInput.trim() || 'WheelClarify Support & Vehicle Audits',
      supportNotificationsEnabled: supportNotifsInput,
      orderNotificationsEnabled: orderNotifsInput,
      autoReplyToCustomer: autoReplyCustomerInput,
      orderReportAutoDispatch: orderDispatchInput,
      smtpStatus: 'operational',
      deliveryMode: deliveryModeInput,
      web3FormsAccessKey: web3FormsKeyInput.trim(),
    };
    adminStore.saveEmailSettings(updated);
    setEmailSettings(updated);
    showNotification(`✓ Email settings saved! Delivery Mode: ${deliveryModeInput.toUpperCase()}`);
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    const targetEmail = adminEmailInput.trim() || emailSettings.adminEmail;
    const sender = senderNameInput.trim() || emailSettings.senderName;
    try {
      const result = await emailService.sendTestPing(targetEmail, sender);
      setEmailLogs(adminStore.getEmailLogs());
      if (result.success) {
        showNotification(`✓ Hostinger PHP mailer test ping delivered to ${targetEmail}!`);
      } else {
        showNotification(`✕ Test delivery notice: ${result.error || 'Check server configuration'}`);
      }
    } catch (err: any) {
      const log = adminStore.sendTestEmail(targetEmail);
      setEmailLogs(adminStore.getEmailLogs());
      showNotification(`✓ Test ping logged to ${log.to}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Package Actions
  const currentEditingPkg = packages.find((p) => p.id === editingPkgId) || packages[0];

  const handleUpdatePackageField = (field: keyof EditablePackage, value: any) => {
    if (!currentEditingPkg) return;
    const updated = { ...currentEditingPkg, [field]: value };
    adminStore.savePackage(updated);
    setPackages(adminStore.getPackages());
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !currentEditingPkg) return;
    const updated = {
      ...currentEditingPkg,
      features: [...currentEditingPkg.features, newFeatureText.trim().toUpperCase()],
    };
    adminStore.savePackage(updated);
    setPackages(adminStore.getPackages());
    setNewFeatureText('');
    showNotification('New package feature added!');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!currentEditingPkg) return;
    const updatedFeatures = currentEditingPkg.features.filter((_, i) => i !== idx);
    const updated = { ...currentEditingPkg, features: updatedFeatures };
    adminStore.savePackage(updated);
    setPackages(adminStore.getPackages());
    showNotification('Feature removed from package');
  };

  // Create New Package Handlers
  const handleAddNewPkgFeature = () => {
    if (!newPkgFeatureInput.trim()) return;
    setNewPkgFeatures((prev) => [...prev, newPkgFeatureInput.trim().toUpperCase()]);
    setNewPkgFeatureInput('');
  };

  const handleRemoveNewPkgFeature = (idx: number) => {
    setNewPkgFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) {
      showNotification('Please enter a package name');
      return;
    }
    const slug =
      newPkgName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || `pkg_${Date.now()}`;

    const created = adminStore.addPackage({
      id: slug,
      name: newPkgName.trim().toUpperCase(),
      tagline: newPkgTagline.trim() || 'Comprehensive vehicle history verification.',
      price: parseFloat(newPkgPrice) || 49.99,
      credits: parseInt(newPkgCredits, 10) || 1,
      deliveryTime: newPkgDeliveryTime.trim().toUpperCase() || 'INSTANT DELIVERY',
      isPopular: newPkgIsPopular,
      isActive: newPkgIsActive,
      features:
        newPkgFeatures.length > 0
          ? newPkgFeatures
          : ['FULL VEHICLE HISTORY REPORT', 'PDF DOWNLOAD'],
    });

    const refreshed = adminStore.getPackages();
    setPackages(refreshed);
    setEditingPkgId(created.id);
    setIsAddPackageModalOpen(false);

    // Reset Form
    setNewPkgName('');
    setNewPkgTagline('');
    setNewPkgPrice('79.99');
    setNewPkgCredits('1');
    setNewPkgDeliveryTime('INSTANT 1-HOUR DELIVERY');
    setNewPkgIsPopular(false);
    setNewPkgIsActive(true);
    setNewPkgFeatures([
      'INSTANT VEHICLE SPEC CHECK',
      'TITLE & BRAND RECORDS',
      'ACCIDENT DAMAGE AUDIT',
      'ODOMETER INTEGRITY VERIFICATION',
      'DIRECT EMAIL & PDF DOWNLOAD',
    ]);
    showNotification(`✓ New package "${created.name}" created and published!`);
  };

  const handleDeletePackage = (pkgId: string, pkgName: string) => {
    if (packages.length <= 1) {
      showNotification('Cannot delete the last remaining package.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete package "${pkgName}"? It will be removed from all search report and checkout views.`)) {
      adminStore.deletePackage(pkgId);
      const refreshed = adminStore.getPackages();
      setPackages(refreshed);
      if (editingPkgId === pkgId) {
        setEditingPkgId(refreshed[0]?.id || 'silver');
      }
      showNotification(`Package "${pkgName}" deleted.`);
    }
  };

  const handleResetPackagesToDefault = () => {
    if (window.confirm('Reset all packages to default initial tiers? Any custom packages will be cleared.')) {
      const reset = adminStore.resetPackagesToDefaults();
      setPackages(reset);
      setEditingPkgId('silver');
      showNotification('Packages reset to default configurations.');
    }
  };

  // Gateway Actions
  const handleSaveGateways = (e: React.FormEvent) => {
    e.preventDefault();
    adminStore.saveGateways(gateways);
    showNotification('Payment gateway API keys & configuration saved successfully!');
  };

  // Client-Side & Hostinger PHP Fallback Credential Verification for Stripe API
  const handleCheckStripeCredentials = async () => {
    setIsCheckingStripe(true);
    try {
      const result = await verifyStripeCredentials({
        secretKey: gateways.stripe.secretKey,
        publishableKey: gateways.stripe.publishableKey,
        testMode: gateways.stripe.testMode,
      });

      const updated: GatewaySettings = {
        ...gateways,
        stripe: {
          ...gateways.stripe,
          connectionStatus: result.connected ? 'connected' : 'disconnected',
          connectionMessage: result.message + (result.details ? ` ${result.details}` : ''),
          lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      };
      setGateways(updated);
      adminStore.saveGateways(updated);

      if (result.connected) {
        showNotification('✓ Stripe API: Authenticated & Connected! (200 OK)');
      } else {
        showNotification(`✕ Stripe Check: ${result.message || 'Disconnected'}`);
      }
    } catch (err: any) {
      const errorMsg = err?.message?.includes('Unexpected token') || err?.message?.includes('<')
        ? 'Received HTML instead of JSON. Ensure check-payment.php is uploaded to public_html/.'
        : `Connection error: ${err.message}`;

      const updated: GatewaySettings = {
        ...gateways,
        stripe: {
          ...gateways.stripe,
          connectionStatus: 'disconnected',
          connectionMessage: errorMsg,
          lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      };
      setGateways(updated);
      adminStore.saveGateways(updated);
      showNotification('✕ Unable to verify Stripe credentials');
    } finally {
      setIsCheckingStripe(false);
    }
  };

  // Client-Side & Hostinger PHP Fallback Credential Verification for PayPal OAuth API
  const handleCheckPaypalCredentials = async () => {
    setIsCheckingPaypal(true);
    try {
      const result = await verifyPaypalCredentials({
        clientId: gateways.paypal.publishableKey,
        secretKey: gateways.paypal.secretKey,
        sandboxMode: gateways.paypal.sandboxMode,
      });

      const updated: GatewaySettings = {
        ...gateways,
        paypal: {
          ...gateways.paypal,
          connectionStatus: result.connected ? 'connected' : 'disconnected',
          connectionMessage: result.message + (result.details ? ` ${result.details}` : ''),
          lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      };
      setGateways(updated);
      adminStore.saveGateways(updated);

      if (result.connected) {
        showNotification('✓ PayPal OAuth API: Authenticated & Connected! (200 OK)');
      } else {
        showNotification(`✕ PayPal Check: ${result.message || 'Disconnected'}`);
      }
    } catch (err: any) {
      const errorMsg = err?.message?.includes('Unexpected token') || err?.message?.includes('<')
        ? 'Received HTML instead of JSON. Ensure check-payment.php is uploaded to public_html/.'
        : `Connection error: ${err.message}`;

      const updated: GatewaySettings = {
        ...gateways,
        paypal: {
          ...gateways.paypal,
          connectionStatus: 'disconnected',
          connectionMessage: errorMsg,
          lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      };
      setGateways(updated);
      adminStore.saveGateways(updated);
      showNotification('✕ Unable to verify PayPal credentials');
    } finally {
      setIsCheckingPaypal(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPass = adminPasscode.trim();

    if (cleanEmail === 'affandark@gmail.com' && cleanPass === 'Affanxharis@123') {
      try {
        sessionStorage.setItem('wc_admin_authenticated', 'true');
        sessionStorage.setItem('wc_admin_email', 'affandark@gmail.com');
      } catch {}
      setIsAuthenticated(true);
      setAuthError(null);
      showNotification('Authenticated as Administrator (affandark@gmail.com)');
    } else {
      setAuthError('Invalid administrator email or password. Access is restricted.');
    }
  };

  const handleAdminSignOut = () => {
    try {
      sessionStorage.removeItem('wc_admin_authenticated');
      sessionStorage.removeItem('wc_admin_email');
    } catch {}
    setIsAuthenticated(false);
    setAdminPasscode('');
    setAdminEmail('');
    showNotification('Admin console locked.');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans selection:bg-amber-400 selection:text-black">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-slate-900" />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 shadow-sm">
              <Lock className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
                WheelClarify
              </span>
              <span className="text-[10px] bg-slate-900 text-amber-400 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Admin
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              Executive Console Access
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              This area is strictly restricted. Please provide your authorized administrator credentials to proceed.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter administrator email..."
                  required
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPasscode}
                  onChange={(e) => {
                    setAdminPasscode(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter administrator password..."
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>256-bit Encrypted Admin Session</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 border border-slate-800 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navigation Bar - White Enterprise Aesthetic */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-sm">
                W
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-900">
                    WheelClarify
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Report Queries • Support Tickets • Pricing • Gateways
                </div>
              </div>
            </div>

            {/* Status, Admin Identity & Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Gateways Online</span>
              </div>

              {/* Admin User Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-mono">affandark@gmail.com</span>
              </div>

              {/* Lock / Sign Out Button */}
              <button
                type="button"
                onClick={handleAdminSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Lock admin session and sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              {/* Return to Site Button */}
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Return to Site</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-1 text-xs font-bold tracking-wider uppercase scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'orders'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Report Queries &amp; Orders</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'tickets'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Support Tickets</span>
              {openTicketsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                  {openTicketsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'packages'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Package Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('gateways')}
              className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'gateways'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Gateways</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                Stripe &amp; PayPal
              </span>
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'emails'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email &amp; Communications</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono font-bold">
                {emailSettings.adminEmail ? 'Connected' : 'Setup'}
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* =========================================================================
            TAB 1: OVERVIEW
            ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Total Revenue */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <span>+18.4%</span>
                  <span className="text-slate-400 font-normal">from last week</span>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Reports Dispatched
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                  {orders.length}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-2">
                  100% delivered to customer inbox
                </div>
              </div>

              {/* Card 3: Support Inquiries */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Support Tickets
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                  {openTicketsCount} <span className="text-sm font-normal text-slate-400">open</span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-2">
                  {resolvedTicketsCount} resolved • {inProgressTicketsCount} in progress
                </div>
              </div>

              {/* Card 4: Active Gateways */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Payment Status
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-base font-bold text-slate-900 mt-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Stripe &amp; PayPal Active
                </div>
                <div className="text-xs text-slate-500 font-medium mt-2">
                  Link 1-Click • Cards • PayPal Suite
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders Preview */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Recent Report Orders
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All ({orders.length}) &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {order.orderNumber}
                          </span>
                          <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                            {order.vin}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {order.vehicleName} • {order.customerName} ({order.email})
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-sm font-bold text-slate-900">
                          ${order.amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operations Control Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Quick Operational Tools
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Common administrator workflows
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveTab('gateways')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <span>Configure Stripe &amp; PayPal Keys</span>
                    </div>
                    <span className="text-slate-400 font-normal">&rarr;</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('packages')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>Edit Package Prices &amp; Features</span>
                    </div>
                    <span className="text-slate-400 font-normal">&rarr;</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tickets')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <LifeBuoy className="w-4 h-4 text-rose-600" />
                      <span>Reply to Support Tickets ({openTicketsCount} Open)</span>
                    </div>
                    <span className="text-slate-400 font-normal">&rarr;</span>
                  </button>

                  <button
                    onClick={() => {
                      adminStore.resetToDefaults();
                      reloadData();
                      showNotification('System demo data reset to default seed!');
                    }}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>Reset Demo Data to Defaults</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: REPORT QUERIES & ORDERS
            ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Search Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Report Queries &amp; Customer Orders
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time log of customer VIN checks, guest contact details, and instant email dispatches.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search VIN, Name, Order #..."
                    className="bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full sm:w-64"
                  />
                </div>

                <select
                  value={orderPackageFilter}
                  onChange={(e) => setOrderPackageFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Packages</option>
                  <option value="standard">Standard ($39.99)</option>
                  <option value="silver">Silver ($69.99)</option>
                  <option value="gold">Gold ($99.99)</option>
                  <option value="dealer">Dealer ($149.99)</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-4 sm:px-6">Order #</th>
                      <th className="py-3.5 px-4">Vehicle &amp; VIN</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Mileage</th>
                      <th className="py-3.5 px-4">Package</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Delivery Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No report orders found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Order Number */}
                          <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <div>{order.orderNumber}</div>
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              {order.createdAt}
                            </div>
                          </td>

                          {/* Vehicle & VIN */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900">{order.vehicleName}</div>
                            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600 mt-0.5">
                              <span>{order.vin}</span>
                              <button
                                onClick={() => handleCopy(order.vin, 'VIN')}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                                title="Copy VIN"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Customer Details */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-900">{order.customerName}</div>
                            <div className="text-[11px] text-slate-500">{order.email}</div>
                            {order.phone && (
                              <div className="text-[10px] text-slate-400">{order.phone}</div>
                            )}
                          </td>

                          {/* Mileage */}
                          <td className="py-4 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                            {order.mileage || '—'} mi
                          </td>

                          {/* Package */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-900 block">{order.packageName}</span>
                            <span className="text-[11px] font-mono text-slate-500">
                              ${order.amount.toFixed(2)}
                            </span>
                          </td>

                          {/* Payment */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3" />
                              {order.paymentMethod}
                            </span>
                          </td>

                          {/* Delivery Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Mail className="w-3 h-3" />
                              {order.deliveryStatus}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                                title="Inspect Order Details"
                              >
                                Inspect
                              </button>

                              <button
                                onClick={() => handleResendReportEmail(order)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] transition-colors cursor-pointer"
                                title="Resend PDF to customer email"
                              >
                                Resend
                              </button>

                              {onViewReportByVin && (
                                <button
                                  onClick={() => onViewReportByVin(order.vin)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
                                  title="Open live report view"
                                >
                                  View
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inspect Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-scaleUp">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                        Order Details &amp; Query Audit
                      </span>
                      <h3 className="text-lg font-black text-slate-900 font-mono">
                        {selectedOrder.orderNumber}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-slate-500 font-medium block">VIN Number</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {selectedOrder.vin}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Vehicle Spec</span>
                        <span className="font-bold text-slate-900">{selectedOrder.vehicleName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Guest Customer</span>
                        <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Destination Email</span>
                        <span className="font-mono text-slate-900">{selectedOrder.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Phone Number</span>
                        <span className="font-mono text-slate-900">{selectedOrder.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Reported Mileage</span>
                        <span className="font-mono text-slate-900">{selectedOrder.mileage || 'N/A'} mi</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Package Selected:</span>
                        <span className="font-bold text-slate-900">{selectedOrder.packageName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Charge Total:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          ${selectedOrder.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Payment Channel:</span>
                        <span className="font-semibold text-emerald-700">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Email Delivery:</span>
                        <span className="font-semibold text-blue-700">{selectedOrder.deliveryStatus}</span>
                      </div>
                    </div>

                    {selectedOrder.reportSummary && (
                      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                        <span className="text-[11px] font-bold text-amber-900 uppercase">
                          Report Summary Stats
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                          <div className="p-2 rounded-xl bg-white border border-amber-200">
                            <span className="text-[10px] text-slate-500 block">Specs</span>
                            <span className="font-bold text-slate-900">
                              {selectedOrder.reportSummary.specsFound}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-amber-200">
                            <span className="text-[10px] text-slate-500 block">Title</span>
                            <span className="font-bold text-slate-900">
                              {selectedOrder.reportSummary.titleStatus}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-amber-200">
                            <span className="text-[10px] text-slate-500 block">Score</span>
                            <span className="font-bold text-amber-600">
                              {selectedOrder.reportSummary.score}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleResendReportEmail(selectedOrder)}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Resend PDF Report to Customer
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: SUPPORT TICKETS
            ========================================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Admin Inbound & Outbound Email Quick Bar */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>Admin Receiving &amp; Outbound Dispatch Email</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Customer tickets and queries are delivered to this address. Replies sent to customers will show this email.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-white border border-amber-300 rounded-xl px-3 py-1.5 shadow-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <input
                    type="email"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="admin@example.com"
                    className="text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none w-48 sm:w-56"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveEmailSettings()}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Save Email
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('emails')}
                  className="px-3 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-slate-900 font-bold text-xs transition-colors cursor-pointer shrink-0"
                  title="Open full Email & Communications Center"
                >
                  Email Center →
                </button>
              </div>
            </div>

            {/* Top Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Customer Problem &amp; Support Tickets
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inquiries submitted via support form regarding report deliveries, VIN inquiries, and invoice requests.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2">
                {(['all', 'open', 'in-progress', 'resolved'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTicketFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                      ticketFilter === filter
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs shadow-sm">
                  No support tickets found in this view.
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {ticket.ticketNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {ticket.subject}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            ticket.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : ticket.priority === 'high'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ticket.priority} priority
                        </span>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            ticket.status === 'open'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : ticket.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{ticket.customerName}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-600">{ticket.email}</span>
                      {ticket.phone && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-600">{ticket.phone}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-slate-400">{ticket.createdAt}</span>
                      <span>•</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {ticket.category}
                      </span>
                    </div>

                    {/* Customer Message */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                      {ticket.message}
                    </div>

                    {/* Admin Reply If Any */}
                    {ticket.adminReply && (
                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Admin Response (Emailed to customer on {ticket.repliedAt}):</span>
                        </div>
                        <p className="leading-relaxed font-sans">{ticket.adminReply}</p>
                      </div>
                    )}

                    {/* Quick Response Actions */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'open')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            ticket.status === 'open'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Mark Open
                        </button>
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'in-progress')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            ticket.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Mark In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            ticket.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Mark Resolved
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTicketId(ticket.id);
                          setReplyText(ticket.adminReply || '');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Compose Official Reply</span>
                      </button>
                    </div>

                    {/* Inline Reply Composer */}
                    {activeTicketId === ticket.id && (
                      <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-900">
                            Reply to {ticket.customerName} ({ticket.email})
                          </label>
                          <button
                            onClick={() => setActiveTicketId(null)}
                            className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type customer reply here... (Will automatically email to customer and mark ticket resolved)"
                          className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <p className="text-[11px] text-slate-500 font-medium">
                            ✉️ Response will be sent from <span className="font-bold text-slate-800">{emailSettings.adminEmail}</span> directly to <span className="font-bold text-slate-800">{ticket.email}</span>.
                          </p>
                          <button
                            onClick={() => handleSendTicketReply(ticket.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send &amp; Resolve Ticket</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: PACKAGE EDITOR
            ========================================================================= */}
        {activeTab === 'packages' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header info with Add Package Button */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">
                    Vehicle History Package Editor &amp; Manager
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage active packages, create brand-new custom tiers, adjust pricing, and control delivery guarantees. All packages are shown on the VIN report and checkout pages.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleResetPackagesToDefault}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                  title="Reset to standard 4 packages"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddPackageModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
                  <span>+ Add New Package</span>
                </button>
              </div>
            </div>

            {/* Package Selector Cards */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select a Package to Edit ({packages.length} Packages Configured)
                </span>
                <span className="text-xs text-slate-400">
                  Active in Checkout: {packages.filter((p) => p.isActive).length}/{packages.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setEditingPkgId(pkg.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer bg-white relative overflow-hidden ${
                      editingPkgId === pkg.id
                        ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    } ${!pkg.isActive ? 'opacity-60 bg-slate-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-900 truncate max-w-[140px]">
                        {pkg.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {pkg.isPopular && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                            POPULAR
                          </span>
                        )}
                        {!pkg.isActive && (
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">
                            HIDDEN
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-2xl font-extrabold text-slate-900 mb-1">
                      ${pkg.price.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {pkg.deliveryTime}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {pkg.features.length} features included
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Package Form */}
            {currentEditingPkg && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                      Editing Configuration
                    </span>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <span>{currentEditingPkg.name}</span>
                      <span className="text-xs font-mono font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        ID: {currentEditingPkg.id}
                      </span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentEditingPkg.isPopular}
                        onChange={(e) =>
                          handleUpdatePackageField('isPopular', e.target.checked)
                        }
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Mark as "Most Popular"
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentEditingPkg.isActive}
                        onChange={(e) =>
                          handleUpdatePackageField('isActive', e.target.checked)
                        }
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Active in Checkout
                      </span>
                    </label>

                    {packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(currentEditingPkg.id, currentEditingPkg.name)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-2"
                        title="Delete this package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Package</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Package Name */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      Package Display Name
                    </label>
                    <input
                      type="text"
                      value={currentEditingPkg.name}
                      onChange={(e) => handleUpdatePackageField('name', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      Price ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEditingPkg.price}
                        onChange={(e) =>
                          handleUpdatePackageField('price', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Credits */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      History Credits
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={currentEditingPkg.credits || 1}
                      onChange={(e) =>
                        handleUpdatePackageField('credits', parseInt(e.target.value, 10) || 1)
                      }
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Delivery Time Label */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      Delivery Time Guarantee
                    </label>
                    <input
                      type="text"
                      value={currentEditingPkg.deliveryTime}
                      onChange={(e) =>
                        handleUpdatePackageField('deliveryTime', e.target.value)
                      }
                      placeholder="e.g. INSTANT 1-HOUR DELIVERY"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      Tagline / Short Summary
                    </label>
                    <input
                      type="text"
                      value={currentEditingPkg.tagline}
                      onChange={(e) => handleUpdatePackageField('tagline', e.target.value)}
                      placeholder="e.g. Essential history and basic verification."
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Package Features List */}
                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Included Features ({currentEditingPkg.features.length})
                  </label>

                  <div className="space-y-2">
                    {currentEditingPkg.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800">{feature}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Feature */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Add feature item (e.g., TITLE REBUILT CHECK)..."
                      className="flex-1 bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ADD NEW PACKAGE MODAL ==================== */}
            {isAddPackageModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                        Create New Tier
                      </span>
                      <h3 className="text-xl font-black text-slate-900">
                        Add New Vehicle History Package
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddPackageModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreatePackage} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Package Name */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                          Package Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPkgName}
                          onChange={(e) => setNewPkgName(e.target.value)}
                          placeholder="e.g. PLATINUM PACKAGE"
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                          Price ($ USD) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={newPkgPrice}
                            onChange={(e) => setNewPkgPrice(e.target.value)}
                            placeholder="79.99"
                            className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Delivery Guarantee */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                          Delivery Time Guarantee
                        </label>
                        <input
                          type="text"
                          value={newPkgDeliveryTime}
                          onChange={(e) => setNewPkgDeliveryTime(e.target.value)}
                          placeholder="e.g. INSTANT 1-HOUR DELIVERY"
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* History Credits */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                          Credits Included
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={newPkgCredits}
                          onChange={(e) => setNewPkgCredits(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                        Tagline / Summary
                      </label>
                      <input
                        type="text"
                        value={newPkgTagline}
                        onChange={(e) => setNewPkgTagline(e.target.value)}
                        placeholder="e.g. Total transparency with premium benefits."
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex items-center gap-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPkgIsPopular}
                          onChange={(e) => setNewPkgIsPopular(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          Mark as "Most Popular" (Golden highlight badge)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPkgIsActive}
                          onChange={(e) => setNewPkgIsActive(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          Active in Checkout
                        </span>
                      </label>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                        Included Features ({newPkgFeatures.length})
                      </label>

                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {newPkgFeatures.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <span className="font-semibold text-slate-800">{feat}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNewPkgFeature(idx)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newPkgFeatureInput}
                          onChange={(e) => setNewPkgFeatureInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewPkgFeature();
                            }
                          }}
                          placeholder="Type feature item and press enter..."
                          className="flex-1 bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewPkgFeature}
                          className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddPackageModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Publish New Package</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: PAYMENT GATEWAYS & API CONFIGURATION
            (2 Fields for Stripe & PayPal: Publishable Key and Secret Key, No Email)
            ========================================================================= */}
        {activeTab === 'gateways' && (
          <form onSubmit={handleSaveGateways} className="space-y-8 animate-fadeIn">
            {/* White Info Banner with Save Button */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">
                    Payment Gateway Settings
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Configure real credentials for <strong>Stripe</strong> and <strong>PayPal</strong>. Each gateway requires exactly two credentials: <strong>Publishable Key</strong> and <strong>Secret Key</strong>. No email configuration is needed.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save Gateway Settings</span>
                </button>
              </div>
            </div>

            {/* Gateways Grid - Responsive 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ==================== 1. STRIPE GATEWAY CARD ==================== */}
              <div className={`bg-white border rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 transition-all ${
                gateways.stripe.connectionStatus === 'connected'
                  ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                  : gateways.stripe.connectionStatus === 'disconnected'
                  ? 'border-rose-300 ring-1 ring-rose-400/20'
                  : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#635bff]/10 text-[#635bff] border border-[#635bff]/20 flex items-center justify-center font-black text-xl shadow-xs">
                      S
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        Stripe Payments
                        <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.2 rounded font-semibold">
                          Card &amp; Link
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Supports Visa, Mastercard, Amex, Apple Pay, Stripe Link
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    {gateways.stripe.connectionStatus === 'connected' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Connected</span>
                      </div>
                    ) : gateways.stripe.connectionStatus === 'disconnected' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black uppercase shadow-xs">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Disconnected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold uppercase">
                        <span>Not Checked</span>
                      </div>
                    )}

                    {/* Enable Switch */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gateways.stripe.enabled}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            stripe: { ...gateways.stripe, enabled: e.target.checked },
                          })
                        }
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-900 uppercase">
                        {gateways.stripe.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Mode Selector: Test vs Live */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Stripe Mode</span>
                    <span className="text-[11px] text-slate-500">
                      {gateways.stripe.testMode
                        ? 'Using Sandbox / Test Mode (Prefix: pk_test_ / sk_test_)'
                        : 'Live Production Charges Active (Prefix: pk_live_ / sk_live_)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setGateways({
                        ...gateways,
                        stripe: { ...gateways.stripe, testMode: !gateways.stripe.testMode },
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      gateways.stripe.testMode
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {gateways.stripe.testMode ? 'Test Mode' : 'Live Mode'}
                  </button>
                </div>

                {/* FIELD 1: STRIPE PUBLISHABLE KEY */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      1. Stripe Publishable Key
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Public Client Key</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={gateways.stripe.publishableKey}
                      onChange={(e) =>
                        setGateways({
                          ...gateways,
                          stripe: { ...gateways.stripe, publishableKey: e.target.value },
                        })
                      }
                      placeholder={gateways.stripe.testMode ? 'pk_test_...' : 'pk_live_...'}
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-4 pr-10 py-3 text-xs font-mono text-slate-900 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(gateways.stripe.publishableKey, 'Stripe Publishable Key')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title="Copy Key"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Expected: <code className="font-mono text-slate-700 font-semibold">{gateways.stripe.testMode ? 'pk_test_...' : 'pk_live_...'}</code> (at least 24 characters).
                  </p>
                </div>

                {/* FIELD 2: STRIPE SECRET KEY */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      2. Stripe Secret Key
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Server API Secret</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showStripeSecret ? 'text' : 'password'}
                      value={gateways.stripe.secretKey}
                      onChange={(e) =>
                        setGateways({
                          ...gateways,
                          stripe: { ...gateways.stripe, secretKey: e.target.value },
                        })
                      }
                      placeholder={gateways.stripe.testMode ? 'sk_test_...' : 'sk_live_...'}
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-4 pr-10 py-3 text-xs font-mono text-slate-900 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title={showStripeSecret ? 'Hide Secret Key' : 'Reveal Secret Key'}
                    >
                      {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Expected: <code className="font-mono text-slate-700 font-semibold">{gateways.stripe.testMode ? 'sk_test_...' : 'sk_live_...'}</code> (Used for charge authorization).
                  </p>
                </div>

                {/* Live Diagnostic Message Box */}
                {gateways.stripe.connectionStatus === 'connected' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Status: Connected (200 OK)
                      </span>
                      {gateways.stripe.lastChecked && (
                        <span className="text-[10px] text-emerald-700 font-mono">
                          Verified at {gateways.stripe.lastChecked}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      {gateways.stripe.connectionMessage || 'Credentials verified & operational. Stripe gateway is ready to process cards, Apple Pay & Link.'}
                    </p>
                  </div>
                )}

                {gateways.stripe.connectionStatus === 'disconnected' && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 space-y-1 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        Status: Disconnected
                      </span>
                      {gateways.stripe.lastChecked && (
                        <span className="text-[10px] text-rose-700 font-mono">
                          Checked at {gateways.stripe.lastChecked}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      {gateways.stripe.connectionMessage || 'Invalid credentials or keys format error. Please check your publishable and secret keys.'}
                    </p>
                  </div>
                )}

                {/* Credential Check Button Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isCheckingStripe}
                    onClick={handleCheckStripeCredentials}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-60 active:scale-98"
                  >
                    {isCheckingStripe ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Checking Stripe Credentials...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-amber-400" />
                        <span>Check Stripe Credentials</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-500 font-medium text-center sm:text-right">
                    {gateways.stripe.connectionStatus === 'connected' ? (
                      <span className="text-emerald-700 font-bold flex items-center justify-center sm:justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Working &amp; Connected
                      </span>
                    ) : gateways.stripe.connectionStatus === 'disconnected' ? (
                      <span className="text-rose-700 font-bold flex items-center justify-center sm:justify-end gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Check Failed - Disconnected
                      </span>
                    ) : (
                      'Click button to verify API keys'
                    )}
                  </span>
                </div>
              </div>

              {/* ==================== 2. PAYPAL GATEWAY CARD ==================== */}
              <div className={`bg-white border rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 transition-all ${
                gateways.paypal.connectionStatus === 'connected'
                  ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                  : gateways.paypal.connectionStatus === 'disconnected'
                  ? 'border-rose-300 ring-1 ring-rose-400/20'
                  : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#0079c1]/10 text-[#0079c1] border border-[#0079c1]/20 flex items-center justify-center font-black text-xl shadow-xs">
                      P
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        PayPal Gateway
                        <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.2 rounded font-semibold">
                          Express &amp; Pay Later
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Supports PayPal Balance, Pay Later &amp; Debit/Credit via PayPal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    {gateways.paypal.connectionStatus === 'connected' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Connected</span>
                      </div>
                    ) : gateways.paypal.connectionStatus === 'disconnected' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black uppercase shadow-xs">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Disconnected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold uppercase">
                        <span>Not Checked</span>
                      </div>
                    )}

                    {/* Enable Switch */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gateways.paypal.enabled}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            paypal: { ...gateways.paypal, enabled: e.target.checked },
                          })
                        }
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-900 uppercase">
                        {gateways.paypal.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Mode Selector: Sandbox vs Production */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">PayPal Environment</span>
                    <span className="text-[11px] text-slate-500">
                      {gateways.paypal.sandboxMode
                        ? 'Sandbox Mode Active'
                        : 'Live Production Merchant Active'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setGateways({
                        ...gateways,
                        paypal: { ...gateways.paypal, sandboxMode: !gateways.paypal.sandboxMode },
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      gateways.paypal.sandboxMode
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {gateways.paypal.sandboxMode ? 'Sandbox' : 'Production'}
                  </button>
                </div>

                {/* FIELD 1: PAYPAL PUBLISHABLE KEY / CLIENT ID */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      1. PayPal Publishable Key (Client ID)
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Public Client ID</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={gateways.paypal.publishableKey}
                      onChange={(e) =>
                        setGateways({
                          ...gateways,
                          paypal: { ...gateways.paypal, publishableKey: e.target.value },
                        })
                      }
                      placeholder="PayPal REST Client ID (e.g. BAA9248...)"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-4 pr-10 py-3 text-xs font-mono text-slate-900 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(gateways.paypal.publishableKey, 'PayPal Client ID')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title="Copy Client ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Found in PayPal Developer Dashboard under My Apps &amp; Credentials.
                  </p>
                </div>

                {/* FIELD 2: PAYPAL SECRET KEY (NO EMAIL REQUIRED) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      2. PayPal Secret Key
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Server Secret Key</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPaypalSecret ? 'text' : 'password'}
                      value={gateways.paypal.secretKey}
                      onChange={(e) =>
                        setGateways({
                          ...gateways,
                          paypal: { ...gateways.paypal, secretKey: e.target.value },
                        })
                      }
                      placeholder="PayPal Secret Key (e.g. EDK9248...)"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-4 pr-10 py-3 text-xs font-mono text-slate-900 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title={showPaypalSecret ? 'Hide Secret Key' : 'Reveal Secret Key'}
                    >
                      {showPaypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Direct secret key for capturing orders (no email address required).
                  </p>
                </div>

                {/* Live Diagnostic Message Box */}
                {gateways.paypal.connectionStatus === 'connected' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Status: Connected (200 OK)
                      </span>
                      {gateways.paypal.lastChecked && (
                        <span className="text-[10px] text-emerald-700 font-mono">
                          Verified at {gateways.paypal.lastChecked}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      {gateways.paypal.connectionMessage || 'Credentials verified & operational. REST OAuth Client ready for Express Checkout.'}
                    </p>
                  </div>
                )}

                {gateways.paypal.connectionStatus === 'disconnected' && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 space-y-1 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        Status: Disconnected
                      </span>
                      {gateways.paypal.lastChecked && (
                        <span className="text-[10px] text-rose-700 font-mono">
                          Checked at {gateways.paypal.lastChecked}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      {gateways.paypal.connectionMessage || 'Invalid credentials or keys format error. Please check your PayPal Client ID and Secret Key.'}
                    </p>
                  </div>
                )}

                {/* Credential Check Button Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isCheckingPaypal}
                    onClick={handleCheckPaypalCredentials}
                    className="px-5 py-2.5 rounded-xl bg-[#0079c1] hover:bg-[#00629b] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-60 active:scale-98"
                  >
                    {isCheckingPaypal ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Checking PayPal Credentials...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-white" />
                        <span>Check PayPal Credentials</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-500 font-medium text-center sm:text-right">
                    {gateways.paypal.connectionStatus === 'connected' ? (
                      <span className="text-emerald-700 font-bold flex items-center justify-center sm:justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Working &amp; Connected
                      </span>
                    ) : gateways.paypal.connectionStatus === 'disconnected' ? (
                      <span className="text-rose-700 font-bold flex items-center justify-center sm:justify-end gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Check Failed - Disconnected
                      </span>
                    ) : (
                      'Click button to verify API keys'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* General Settings Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                General Payment Preferences
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                    Default Settlement Currency
                  </label>
                  <select
                    value={gateways.general.currency}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        general: {
                          ...gateways.general,
                          currency: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
                  >
                    <option value="USD">USD ($) - United States Dollar</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl self-end">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Auto-Email Official PDF Report
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Dispatches full report immediately upon payment
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={gateways.general.autoEmailReport}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        general: {
                          ...gateways.general,
                          autoEmailReport: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save All Gateway Settings</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* =========================================================================
            TAB 6: EMAIL & COMMUNICATIONS
            ========================================================================= */}
        {activeTab === 'emails' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
                  <Mail className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Email &amp; Communications Hub
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase">
                      Operational
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                    Configure official administrator inbound &amp; outbound emails. Customer tickets and queries will arrive at your configured admin email, and customer order reports and support replies will dispatch from it.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTestEmail}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  {isSendingTestEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Test Ping...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Send Test Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Email Settings Configuration Card */}
            <form onSubmit={handleSaveEmailSettings} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Administrator Email &amp; Sender Preferences
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This email is used as the single source of truth for both customer inquiries and outgoing communication.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  SMTP Service: Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field 1: Admin Outbound & Inbound Email */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 block">
                    Admin Notification &amp; Inbound/Outbound Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      placeholder="e.g. affandark@gmail.com"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-10 pr-4 py-3 text-xs font-mono font-bold text-slate-900 focus:outline-none transition-colors"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    Customer tickets and queries are received at this address. Outgoing report deliveries and customer replies are sent with this address as sender.
                  </p>
                </div>

                {/* Field 2: Sender Display Name */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 block">
                    Sender Display Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={senderNameInput}
                      onChange={(e) => setSenderNameInput(e.target.value)}
                      placeholder="e.g. WheelClarify Support & Vehicle Audits"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-900 focus:outline-none transition-colors"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    Brand or team name shown in the customer's email inbox header.
                  </p>
                </div>
              </div>

              {/* Automatic Dispatch Toggles */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
                  Automatic Notification &amp; Dispatch Rules
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Toggle 1: Ticket Inbound Notification */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        New Ticket Alerts to Admin
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Sends instant email to {adminEmailInput || 'admin'} when a query is submitted
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={supportNotifsInput}
                      onChange={(e) => setSupportNotifsInput(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>

                  {/* Toggle 2: Auto-reply to customer */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Auto-Confirm to Customer
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Sends immediate receipt confirmation email to customer upon submitting query
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoReplyCustomerInput}
                      onChange={(e) => setAutoReplyCustomerInput(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>

                  {/* Toggle 3: New Paid Order Alert */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        New Paid Order Alerts to Admin
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Alerts administrator whenever a report package is purchased
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={orderNotifsInput}
                      onChange={(e) => setOrderNotifsInput(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>

                  {/* Toggle 4: Report Dispatch to Customer */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Auto-Dispatch Report &amp; Receipt
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Delivers report access link and PDF download rights to customer email on payment
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={orderDispatchInput}
                      onChange={(e) => setOrderDispatchInput(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Hostinger Static vs Node.js Server Deployment Architecture */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Mail Delivery Strategy &amp; Hosting Architecture
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Choose how emails are transmitted depending on your server setup.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Hostinger &amp; Node Compatible
                  </span>
                </div>

                {/* Delivery Mode Radios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryModeInput === 'auto'
                        ? 'border-slate-900 bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="deliveryMode"
                        value="auto"
                        checked={deliveryModeInput === 'auto'}
                        onChange={() => setDeliveryModeInput('auto')}
                        className="text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900">Auto-Detect (Recommended)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-5 leading-normal">
                      Tries Node server <code className="font-mono text-slate-700">/api/send</code>. If deployed statically on Hostinger (returning HTML), automatically uses Web3Forms.
                    </p>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryModeInput === 'client_web3forms'
                        ? 'border-slate-900 bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="deliveryMode"
                        value="client_web3forms"
                        checked={deliveryModeInput === 'client_web3forms'}
                        onChange={() => setDeliveryModeInput('client_web3forms')}
                        className="text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900">Hostinger Static (Web3Forms)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-5 leading-normal">
                      100% Client-side delivery for Hostinger static <code className="font-mono text-slate-700">dist/</code> upload. No Node.js server needed.
                    </p>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryModeInput === 'server'
                        ? 'border-slate-900 bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="deliveryMode"
                        value="server"
                        checked={deliveryModeInput === 'server'}
                        onChange={() => setDeliveryModeInput('server')}
                        className="text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900">Custom Node Server (SMTP)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-5 leading-normal">
                      Relays via Express backend <code className="font-mono text-slate-700">server.ts</code> using environment variables (<code className="font-mono text-slate-700">SMTP_HOST</code>).
                    </p>
                  </label>
                </div>

                {/* Sub-Card: Web3Forms Free Client-Side Setup */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      Web3Forms Access Key (For Hostinger Static Hosting)
                    </span>
                    <a
                      href="https://web3forms.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Get Free Access Key (30s) <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={web3FormsKeyInput}
                    onChange={(e) => setWeb3FormsKeyInput(e.target.value)}
                    placeholder="e.g. a4a8385a-0f9c-4b51-9ef2-5b9671d1df36 (leave blank for built-in default)"
                    className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    When you upload your static build (<code className="font-mono text-slate-700">dist</code>) to Hostinger, the browser posts directly to Web3Forms without requiring a Node.js server.
                  </p>
                </div>

                {/* Sub-Card: Node.js Server SMTP Configuration Reference */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-900 block">
                    Node.js Express Server Setup (.env variables for server.ts)
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    If running the full-stack server (<code className="font-mono text-slate-700">node server.ts</code>), configure your SMTP credentials in <code className="font-mono text-slate-700">.env</code>:
                  </p>
                  <div className="font-mono text-[10px] bg-slate-900 text-slate-200 p-2.5 rounded-lg overflow-x-auto space-y-0.5">
                    <div>SMTP_HOST="smtp.gmail.com" # or smtp.hostinger.com</div>
                    <div>SMTP_PORT="587" # or 465 for SSL</div>
                    <div>SMTP_USER="affandark@gmail.com"</div>
                    <div>SMTP_PASS="your-app-password"</div>
                    <div>SMTP_FROM="WheelClarify &lt;affandark@gmail.com&gt;"</div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-medium">
                  Current Active Admin Email: <span className="font-mono font-bold text-slate-900">{emailSettings.adminEmail}</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Save Email Settings</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Email Activity Outbox & Log Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Live Outbox &amp; Transmitted Email Logs ({emailLogs.length})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time audit log of customer inquiries received, automated confirmations, admin replies, and report dispatches.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailLogs(adminStore.getEmailLogs());
                      showNotification('Refreshed email logs');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear email log history?')) {
                        adminStore.clearEmailLogs();
                        setEmailLogs([]);
                        showNotification('Email logs cleared');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'all', label: 'All Emails' },
                  { id: 'support_query_received', label: 'Inbound Queries' },
                  { id: 'customer_ticket_confirmation', label: 'Customer Confirmations' },
                  { id: 'admin_support_reply', label: 'Admin Replies' },
                  { id: 'order_report_dispatch', label: 'Report Dispatches' },
                  { id: 'test_ping', label: 'Test Pings' },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setEmailLogFilter(flt.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                      emailLogFilter === flt.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-2">Status</th>
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Recipient (To)</th>
                      <th className="pb-3">Subject</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredEmailLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No email logs found for this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredEmailLogs.map((log) => {
                        const typeBadge =
                          log.type === 'support_query_received' ? (
                            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                              Query Received
                            </span>
                          ) : log.type === 'customer_ticket_confirmation' ? (
                            <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                              Customer Receipt
                            </span>
                          ) : log.type === 'admin_support_reply' ? (
                            <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                              Admin Reply
                            </span>
                          ) : log.type === 'order_report_dispatch' ? (
                            <span className="bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded text-[10px]">
                              Report Dispatched
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              Test Ping
                            </span>
                          );

                        return (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 pl-2">
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                              {log.timestamp}
                            </td>
                            <td className="py-3.5">{typeBadge}</td>
                            <td className="py-3.5 font-mono text-slate-800">
                              {log.to}
                            </td>
                            <td className="py-3.5 text-slate-900 font-semibold max-w-xs truncate">
                              {log.subject}
                            </td>
                            <td className="py-3.5 text-right pr-2">
                              <button
                                type="button"
                                onClick={() => setSelectedLogToView(log)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                View Email
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Email Body Preview Modal */}
            {selectedLogToView && (
              <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Email Transmission Record
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: {selectedLogToView.id}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLogToView(null)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-500 w-16">Subject:</span>
                      <span className="font-bold text-slate-900">{selectedLogToView.subject}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-500 w-16">From:</span>
                      <span className="font-mono text-slate-800">{selectedLogToView.from}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-500 w-16">To:</span>
                      <span className="font-mono text-slate-800 font-bold">{selectedLogToView.to}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-500 w-16">Time:</span>
                      <span className="text-slate-600">{selectedLogToView.timestamp}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-500 w-16">Status:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {selectedLogToView.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                      Delivered Message Body:
                    </label>
                    <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-slate-800">
                      {selectedLogToView.body}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLogToView(null)}
                      className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
