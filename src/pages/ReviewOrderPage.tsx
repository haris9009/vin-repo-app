import React, { useState } from 'react';
import {
  Check,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CreditCard,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  Edit2,
  Gauge,
  User,
  Mail,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { ReportPlanId, FullVehicleReport } from '../types';
import { adminStore } from '../services/adminStore';

interface ReviewOrderPageProps {
  selectedPlanId: ReportPlanId;
  report?: FullVehicleReport | null;
  onPaymentSuccess: (planId: ReportPlanId) => void;
  onNavigate: (page: string) => void;
  onBack: () => void;
}

interface PlanDetails {
  id: ReportPlanId;
  name: string;
  price: number;
  deliveryTime: string;
  features: string[];
}

const PLAN_DETAILS: Record<ReportPlanId, PlanDetails> = {
  silver: {
    id: 'silver',
    name: 'SILVER PACKAGE',
    price: 69.99,
    deliveryTime: '6 HOURS DELIVERY',
    features: [
      '6 HOURS DELIVERY',
      'EVERYTHING IN STANDARD',
      'THEFT RECORDS',
      'LIEN / IMPOUND',
      'SALVAGE AUCTION RECORDS',
    ],
  },
  standard: {
    id: 'standard',
    name: 'STANDARD PACKAGE',
    price: 39.99,
    deliveryTime: '12 HOURS DELIVERY',
    features: [
      '12 HOURS DELIVERY',
      'VEHICLE SPECIFICATIONS',
      'TITLE & BRAND RECORDS',
      'ACCIDENT RECORDS',
      '1 PDF DOWNLOAD',
    ],
  },
  gold: {
    id: 'gold',
    name: 'GOLD PACKAGE',
    price: 99.99,
    deliveryTime: 'INSTANT DELIVERY',
    features: [
      'INSTANT 1-HOUR DELIVERY',
      'EVERYTHING IN SILVER',
      'ODOMETER TAMPER AUDIT',
      'MARKET VALUE & AUCTIONS',
      'PRIORITY FORENSIC SUPPORT',
    ],
  },
  dealer: {
    id: 'dealer',
    name: 'DEALER PACKAGE',
    price: 149.99,
    deliveryTime: 'INSTANT PRIORITY',
    features: [
      'INSTANT PRIORITY ACCESS',
      '5 VEHICLE HISTORY CREDITS',
      'WHOLESALE AUCTION PRICING',
      'FULL NMVTIS SPECIFICATIONS',
      'DEDICATED ACCOUNT REP',
    ],
  },
};

export const ReviewOrderPage: React.FC<ReviewOrderPageProps> = ({
  selectedPlanId,
  report,
  onPaymentSuccess,
  onNavigate,
  onBack,
}) => {
  const [storePackages, setStorePackages] = useState(() => adminStore.getPackages());

  React.useEffect(() => {
    const sync = () => setStorePackages(adminStore.getPackages());
    window.addEventListener('wc_packages_updated', sync);
    return () => window.removeEventListener('wc_packages_updated', sync);
  }, []);

  const foundInStore = storePackages.find((p) => p.id === selectedPlanId);
  const plan: PlanDetails = foundInStore
    ? {
        id: foundInStore.id,
        name: foundInStore.name,
        price: foundInStore.price,
        deliveryTime: foundInStore.deliveryTime,
        features: foundInStore.features,
      }
    : PLAN_DETAILS[selectedPlanId] ||
      (storePackages[0]
        ? {
            id: storePackages[0].id,
            name: storePackages[0].name,
            price: storePackages[0].price,
            deliveryTime: storePackages[0].deliveryTime,
            features: storePackages[0].features,
          }
        : PLAN_DETAILS.silver);

  // Step 1: 4 Required Guest Checkout Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mileage, setMileage] = useState(
    report?.odometerHistory?.[0]?.mileage
      ? String(report.odometerHistory[0].mileage)
      : ''
  );

  // Workflow State: 'details' -> 'payment'
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');

  // Step 2: Payment Gateway Selection
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paypal'>('stripe');
  const gateways = adminStore.getGateways();

  // Transaction processing feedback
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid =
    fullName.trim().length >= 2 &&
    isEmailValid &&
    phone.trim().length >= 7 &&
    mileage.trim().length >= 1;

  // VIN to display
  const displayVin = report?.specs?.vin || '3VW2B7AJ1HM339746';

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setCurrentStep('payment');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Live Gateway Payment Error
  const [paymentError, setPaymentError] = useState<{
    gateway: 'stripe' | 'paypal';
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  // 1. Live Stripe Checkout Execution
  const handlePayWithStripe = async (methodName: string) => {
    setPaymentError(null);
    setIsProcessing(true);
    setProcessingMethod(methodName);

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: displayVin,
          vehicleName: `${report?.specs?.year || 2021} ${report?.specs?.make || 'Vehicle'} ${report?.specs?.model || ''}`.trim(),
          packageId: plan.id,
          packageName: plan.name,
          amount: plan.price,
          customerEmail: email.trim(),
          customerName: fullName.trim(),
          phone: phone.trim(),
          mileage: mileage.trim(),
          returnUrl: window.location.origin,
          secretKey: gateways.stripe.secretKey,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Redirect directly to real hosted Stripe Checkout
        window.location.href = data.url;
        return;
      }

      setIsProcessing(false);
      setPaymentError({
        gateway: 'stripe',
        title: 'Stripe API Session Initialization Failed',
        message: data.error || 'Failed to initialize Stripe checkout session.',
        details: data.details ? JSON.stringify(data.details) : 'Please check your Stripe API keys in the Admin Panel > Payment Gateways.',
      });
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError({
        gateway: 'stripe',
        title: 'Stripe Gateway Network Exception',
        message: err.message || 'Unable to connect to Stripe checkout server.',
        details: 'Verify internet connection and that the backend server is operational.',
      });
    }
  };

  // 2. Live PayPal Smart Checkout Execution
  const handlePayWithPaypal = async (methodName: string) => {
    setPaymentError(null);
    setIsProcessing(true);
    setProcessingMethod(methodName);

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: displayVin,
          packageId: plan.id,
          packageName: plan.name,
          amount: plan.price,
          returnUrl: window.location.origin,
          clientId: gateways.paypal.publishableKey,
          secretKey: gateways.paypal.secretKey,
          sandboxMode: gateways.paypal.sandboxMode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.approveUrl) {
        // Redirect directly to real PayPal authorization approval
        window.location.href = data.approveUrl;
        return;
      }

      setIsProcessing(false);
      setPaymentError({
        gateway: 'paypal',
        title: 'PayPal API Order Creation Failed',
        message: data.error || 'Failed to create PayPal order.',
        details: 'Please check your PayPal Client ID and Secret in the Admin Panel > Payment Gateways.',
      });
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError({
        gateway: 'paypal',
        title: 'PayPal Gateway Network Exception',
        message: err.message || 'Unable to connect to PayPal server.',
        details: 'Check internet connectivity and PayPal API availability.',
      });
    }
  };

  // 3. Developer Sandbox Simulator
  const handleSimulatePayment = (methodName: string) => {
    setPaymentError(null);
    setIsProcessing(true);
    setProcessingMethod(`${methodName} (Test Sandbox)`);

    try {
      adminStore.saveOrder({
        vin: displayVin,
        vehicleName: `${report?.specs?.year || 2021} ${report?.specs?.make || 'Vehicle'} ${report?.specs?.model || ''}`.trim(),
        customerName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        mileage: mileage.trim(),
        packageId: plan.id,
        packageName: plan.name,
        amount: plan.price,
        paymentMethod: `${methodName} [Dev Simulator]`,
        paymentStatus: 'Paid',
        deliveryStatus: 'Emailed & Completed',
        reportSummary: {
          specsFound: report?.recordsFoundCount || 48,
          titleStatus: 'Clean Title (NMVTIS Verified)',
          accidentCount: report?.accidents?.length || 0,
          score: report?.overallScore || 89,
        },
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(plan.id);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fb] text-slate-900 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        {/* Top Breadcrumb & Page Headline */}
        <div className="mb-8 sm:mb-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Plans</span>
          </button>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            REVIEW ORDER
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium mt-2 leading-relaxed">
            Review your selected report tier for VIN:{' '}
            <span className="font-mono font-bold text-slate-900 tracking-wider">
              {displayVin}
            </span>
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* =========================================================================
              LEFT COLUMN: SELECTED PACKAGE CARD & SECURITY CARD
              ========================================================================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* Order Summary Card */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.05)] border border-slate-100">
              {/* Top Shaded Box with Package Name & Price */}
              <div className="bg-[#f3f5f8] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                    SELECTED PACKAGE
                  </div>
                  <div className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-900 uppercase mt-0.5">
                    {plan.name}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    ${plan.price.toFixed(2)}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-0.5">
                    INC. 1 REPORT
                  </div>
                </div>
              </div>

              {/* Checklist with Yellow Checkmarks */}
              <ul className="mt-7 space-y-3.5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-yellow-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-yellow-500 stroke-[3.5]" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-black tracking-wide text-slate-700 uppercase">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Vehicle & Dispatch Snapshot */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Target Vehicle:</span>
                  <span className="font-bold text-slate-900">
                    {report?.specs?.year || 2021} {report?.specs?.make || 'Vehicle'} {report?.specs?.model || ''}
                  </span>
                </div>
                {email && (
                  <div className="flex justify-between text-slate-500 font-medium truncate">
                    <span>Dispatch To:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{email}</span>
                  </div>
                )}
                {mileage && (
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Audit Mileage:</span>
                    <span className="font-bold text-slate-900">{mileage} mi</span>
                  </div>
                )}
              </div>

              {/* Total Due Row */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-wider uppercase">
                  TOTAL DUE
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                  ${plan.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 256-Bit AES Encryption Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-500 shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                  256-BIT AES ENCRYPTION
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Official report is emailed directly to your inbox. 100% secure payment.
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: GUEST CHECKOUT & PAYMENT METHODS
              ========================================================================= */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-slate-100 relative">
              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-[32px] z-50 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-yellow-400 animate-spin mb-4" />
                  <h3 className="text-lg font-black uppercase tracking-wide text-slate-900">
                    Connecting to {processingMethod}...
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Authorizing encrypted payment token and dispatching official vehicle report to{' '}
                    <span className="font-bold text-slate-800">{email}</span>.
                  </p>
                </div>
              )}

              {/* Payment Success State */}
              {paymentSuccess && (
                <div className="py-10 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">
                    PAYMENT APPROVED!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Your full official vehicle history report has been dispatched to{' '}
                    <span className="font-bold text-slate-900">{email}</span> and is unsealing now.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Opening Report Dashboard...
                  </div>
                </div>
              )}

              {!paymentSuccess && (
                <div>
                  {/* Yellow Lock Icon Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-500 mb-5 shadow-xs">
                    <Lock className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  {/* Headline */}
                  <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight uppercase text-slate-900 leading-none">
                    GUEST CHECKOUT
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                    Enter the 4 required details below to receive your verified vehicle report.
                  </p>

                  {/* -------------------------------------------------------------
                      STEP 1: 4 REQUIRED USER INPUTS (NAME, EMAIL, PHONE, MILEAGE)
                      ------------------------------------------------------------- */}
                  <form onSubmit={handleProceedToPayment} className="mt-7 space-y-4.5">
                    {/* Input 1: Full Name */}
                    <div>
                      <label className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>FULL NAME</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={currentStep === 'payment'}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="First and last name"
                        className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 border transition-all ${
                          currentStep === 'payment'
                            ? 'bg-[#f4f6f9] border-slate-200 text-slate-600 cursor-not-allowed'
                            : 'bg-[#f1f3f6] border-transparent focus:border-yellow-400 focus:bg-white focus:outline-none'
                        }`}
                      />
                    </div>

                    {/* Input 2: Email Address */}
                    <div>
                      <label className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>EMAIL ADDRESS (REPORT DELIVERED HERE)</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        disabled={currentStep === 'payment'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john.smith@gmail.com"
                        className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 border transition-all ${
                          currentStep === 'payment'
                            ? 'bg-[#f4f6f9] border-slate-200 text-slate-600 cursor-not-allowed'
                            : 'bg-[#f1f3f6] border-transparent focus:border-yellow-400 focus:bg-white focus:outline-none'
                        }`}
                      />
                    </div>

                    {/* Input 3 & 4: Phone Number & Mileage of Vehicle (2-Columns on desktop) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Input 3: Phone */}
                      <div>
                        <label className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>PHONE NUMBER</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          disabled={currentStep === 'payment'}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 234-5678"
                          className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 border transition-all ${
                            currentStep === 'payment'
                              ? 'bg-[#f4f6f9] border-slate-200 text-slate-600 cursor-not-allowed'
                              : 'bg-[#f1f3f6] border-transparent focus:border-yellow-400 focus:bg-white focus:outline-none'
                          }`}
                        />
                      </div>

                      {/* Input 4: Mileage of Vehicle */}
                      <div>
                        <label className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>VEHICLE MILEAGE</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={currentStep === 'payment'}
                          value={mileage}
                          onChange={(e) => setMileage(e.target.value.replace(/[^0-9,]/g, ''))}
                          placeholder="e.g. 64,500"
                          className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 border transition-all ${
                            currentStep === 'payment'
                              ? 'bg-[#f4f6f9] border-slate-200 text-slate-600 cursor-not-allowed'
                              : 'bg-[#f1f3f6] border-transparent focus:border-yellow-400 focus:bg-white focus:outline-none'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Step 1 Proceed Button (if in details step) */}
                    {currentStep === 'details' && (
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={!isFormValid}
                          className="w-full py-4.5 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-200 text-black disabled:text-slate-400 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-lg shadow-yellow-400/20 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
                        >
                          <span>PROCEED TO PAYMENT METHODS</span>
                          <ChevronRight className="w-4 h-4 stroke-[3]" />
                        </button>
                        {!isFormValid && (
                          <p className="text-[11px] text-slate-400 text-center mt-2.5">
                            Please fill in Full Name, Email, Phone, and Vehicle Mileage to proceed.
                          </p>
                        )}
                      </div>
                    )}
                  </form>

                  {/* -------------------------------------------------------------
                      STEP 2: PAYMENT METHODS (MATCHING 3 SCREENSHOTS)
                      ------------------------------------------------------------- */}
                  {currentStep === 'payment' && (
                    <div className="mt-8 pt-6 border-t border-slate-200 space-y-6 animate-fadeIn">
                      {/* Customer Details Summary Pill with Edit Button */}
                      <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 font-medium truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            <span className="font-bold text-slate-900">{fullName}</span> • {email} • {mileage} mi
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('details')}
                          className="text-[11px] font-bold text-slate-600 hover:text-black flex items-center gap-1 underline ml-2 shrink-0 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>

                      {/* ============================================================
                          ON-SITE CHECKOUT PROVIDED BY STRIPE & PAYPAL
                          (No fake ready-made card input fields)
                          ============================================================ */}
                      <div className="space-y-5">
                        {/* Gateway Switcher Tabs */}
                        <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedGateway('stripe')}
                            className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              selectedGateway === 'stripe'
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                : 'text-slate-600 hover:text-slate-900 bg-transparent'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-[#635bff]"></span>
                            <span>Stripe Checkout</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedGateway('paypal')}
                            className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              selectedGateway === 'paypal'
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                : 'text-slate-600 hover:text-slate-900 bg-transparent'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-[#0079c1]"></span>
                            <span>PayPal Checkout</span>
                          </button>
                        </div>

                        {/* ==================== 1. STRIPE ON-SITE CHECKOUT ==================== */}
                        {selectedGateway === 'stripe' && (
                          <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-5 animate-fadeIn">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#635bff] text-white flex items-center justify-center font-black text-base shadow-xs">
                                  S
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900 uppercase tracking-tight">
                                    Stripe Secure On-Site Checkout
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {gateways.stripe.testMode ? 'Stripe Sandbox (Test Mode)' : 'Stripe Live Production Secured'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                <Lock className="w-3 h-3" />
                                <span>256-Bit SSL</span>
                              </div>
                            </div>

                            {/* Diagnostic Error Banner if Live API Returns an Issue */}
                            {paymentError && (
                              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 animate-fadeIn">
                                <div className="flex items-center gap-2">
                                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                                    {paymentError.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-rose-800 font-medium leading-relaxed">
                                  {paymentError.message}
                                </p>
                                {paymentError.details && (
                                  <div className="text-[10px] font-mono text-rose-700 bg-white/70 p-2 rounded-lg border border-rose-200 break-words">
                                    {paymentError.details}
                                  </div>
                                )}
                                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-rose-200">
                                  <span className="text-[10px] text-rose-600 font-medium">
                                    Configure API keys in Admin Panel &gt; Payment Gateways
                                  </span>
                                  {/* Developer Sandbox Bypass Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleSimulatePayment('Sandbox Simulation')}
                                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                  >
                                    Developer: Simulate Success
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 1. Stripe Link 1-Click Button */}
                            {gateways.stripeLink.enabled && (
                              <div className="space-y-1.5">
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => handlePayWithStripe('Stripe Link (1-Click)')}
                                  className="w-full bg-[#00d66f] hover:bg-[#00c564] active:bg-[#00b058] text-black py-3.5 px-6 rounded-xl font-bold transition-all duration-150 flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.99] disabled:opacity-60"
                                >
                                  <div className="w-5 h-5 rounded-full bg-black text-[#00d66f] flex items-center justify-center text-xs font-black">
                                    ›
                                  </div>
                                  <span className="font-black text-base tracking-tight text-black">link</span>
                                  <span className="text-black/30 font-light mx-0.5">|</span>
                                  <span className="text-xs sm:text-sm font-semibold text-black">
                                    Pay with Stripe Link • ${plan.price.toFixed(2)}
                                  </span>
                                </button>
                                <p className="text-[10px] text-slate-400 text-center">
                                  Fast &amp; secure 1-click checkout with your saved phone &amp; email
                                </p>
                              </div>
                            )}

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                              <div className="h-px bg-slate-200 flex-1" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                OR PAY WITH STRIPE
                              </span>
                              <div className="h-px bg-slate-200 flex-1" />
                            </div>

                            {/* 2. Direct Stripe Payment Element / Checkout Button */}
                            <div className="space-y-3">
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handlePayWithStripe('Stripe Checkout (Cards & Wallets)')}
                                className="w-full py-4 px-6 rounded-xl bg-[#635bff] hover:bg-[#5346e0] active:bg-[#4338ca] text-white font-black text-sm uppercase tracking-wider transition-all duration-150 shadow-md flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] disabled:opacity-60"
                              >
                                <CreditCard className="w-4 h-4 text-white" />
                                <span>Pay ${plan.price.toFixed(2)} with Stripe</span>
                              </button>

                              {/* Card Brand & Digital Wallet Badges */}
                              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-slate-500">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">VISA</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">MASTERCARD</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">AMEX</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">DISCOVER</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">APPLE PAY</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">GOOGLE PAY</span>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-[11px] leading-tight">
                                Powered by Stripe. End-to-end tokenized encryption ensures your card details never touch our servers.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ==================== 2. PAYPAL ON-SITE CHECKOUT ==================== */}
                        {selectedGateway === 'paypal' && (
                          <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-5 animate-fadeIn">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#0079c1] text-white flex items-center justify-center font-black text-base shadow-xs">
                                  P
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900 uppercase tracking-tight">
                                    PayPal Smart Checkout
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {gateways.paypal.sandboxMode ? 'PayPal Sandbox Environment' : 'PayPal Live Production'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Buyer Protection</span>
                              </div>
                            </div>

                            {/* Diagnostic Error Banner if Live API Returns an Issue */}
                            {paymentError && (
                              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 animate-fadeIn">
                                <div className="flex items-center gap-2">
                                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                                    {paymentError.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-rose-800 font-medium leading-relaxed">
                                  {paymentError.message}
                                </p>
                                {paymentError.details && (
                                  <div className="text-[10px] font-mono text-rose-700 bg-white/70 p-2 rounded-lg border border-rose-200 break-words">
                                    {paymentError.details}
                                  </div>
                                )}
                                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-rose-200">
                                  <span className="text-[10px] text-rose-600 font-medium">
                                    Configure API keys in Admin Panel &gt; Payment Gateways
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleSimulatePayment('PayPal Sandbox Simulation')}
                                    className="px-3 py-1.5 rounded-lg bg-[#0079c1] hover:bg-[#00629b] text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                  >
                                    Developer: Simulate Success
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Official PayPal Buttons Suite */}
                            <div className="space-y-3">
                              {/* 1. Yellow PayPal Button */}
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handlePayWithPaypal('PayPal Instant')}
                                className="w-full py-3.5 px-6 rounded-xl bg-[#ffc439] hover:bg-[#f4ba31] active:bg-[#e0a823] transition-all duration-150 flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
                              >
                                <span className="text-[#003087] font-black italic text-xl tracking-tighter">
                                  Pay<span className="text-[#0079c1]">Pal</span>
                                </span>
                              </button>

                              {/* 2. Pay Later Button */}
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handlePayWithPaypal('PayPal Pay Later')}
                                className="w-full py-3.5 px-6 rounded-xl bg-[#ffc439] hover:bg-[#f4ba31] active:bg-[#e0a823] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
                              >
                                <span className="text-[#003087] font-black italic text-lg">P</span>
                                <span className="text-slate-900 font-bold text-sm sm:text-base">
                                  Pay Later (4 × ${(plan.price / 4).toFixed(2)})
                                </span>
                              </button>

                              {/* 3. Debit or Credit Card Dark Button (Powered by PayPal) */}
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handlePayWithPaypal('Debit or Credit Card (PayPal)')}
                                className="w-full py-3.5 px-6 rounded-xl bg-[#2c2e2f] hover:bg-[#1f2021] active:bg-[#141516] text-white font-bold text-sm sm:text-base transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
                              >
                                <CreditCard className="w-4 h-4 text-white" />
                                <span>Debit or Credit Card</span>
                              </button>
                            </div>

                            <div className="pt-1 text-center">
                              <span className="text-[11px] text-slate-400 font-medium italic">
                                Powered by <span className="font-bold text-[#003087]">Pay</span><span className="font-bold text-[#0079c1]">Pal</span> • Instant Automated Verification
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Direct Email Confirmation Notice */}
                      <div className="pt-2 text-center text-xs font-semibold text-slate-500">
                        ⚡ Official PDF report will be delivered directly to{' '}
                        <span className="font-bold text-slate-800">{email}</span>. No password required.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
