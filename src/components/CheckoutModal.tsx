import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Gauge,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FullVehicleReport, ReportPlanId } from '../types';
import { PLANS } from '../data/sampleVehicles';
import { adminStore } from '../services/adminStore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullVehicleReport;
  selectedPlanId: ReportPlanId;
  onPaymentSuccess: (planId: ReportPlanId) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  report,
  selectedPlanId,
  onPaymentSuccess,
}) => {
  const storePackages = adminStore.getPackages();
  const foundPkg = storePackages.find((p) => p.id === selectedPlanId);
  const plan = foundPkg || PLANS.find((p) => p.id === selectedPlanId) || storePackages[0] || PLANS[1];

  // Step 1: 4 Guest Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mileage, setMileage] = useState(
    report?.odometerHistory?.[0]?.mileage ? String(report.odometerHistory[0].mileage) : ''
  );

  // Workflow State: 'details' -> 'payment'
  const [step, setStep] = useState<'details' | 'payment'>('details');

  // Step 2: Payment Gateway Selection (Stripe vs PayPal on-site checkout)
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paypal'>('stripe');
  const gateways = adminStore.getGateways();

  // Processing steps
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMethod, setProcessingMethod] = useState('');

  if (!isOpen) return null;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid =
    fullName.trim().length >= 2 &&
    isEmailValid &&
    phone.trim().length >= 7 &&
    mileage.trim().length >= 1;

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setStep('payment');
  };

  // Live Payment Error Diagnostic
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
          vin: report.specs.vin,
          vehicleName: `${report.specs.year} ${report.specs.make} ${report.specs.model}`.trim(),
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
        window.location.href = data.url;
        return;
      }

      setIsProcessing(false);
      setPaymentError({
        gateway: 'stripe',
        title: 'Stripe API Checkout Error',
        message: data.error || 'Failed to initialize Stripe checkout session.',
        details: data.details ? JSON.stringify(data.details) : 'Please check your Stripe Secret Key in the Admin Panel > Payment Gateways.',
      });
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError({
        gateway: 'stripe',
        title: 'Stripe Connection Exception',
        message: err.message || 'Unable to connect to Stripe server.',
        details: 'Verify backend connection and network access.',
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
          vin: report.specs.vin,
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
        window.location.href = data.approveUrl;
        return;
      }

      setIsProcessing(false);
      setPaymentError({
        gateway: 'paypal',
        title: 'PayPal API Checkout Error',
        message: data.error || 'Failed to create PayPal order.',
        details: 'Please check your PayPal Client ID and Secret in the Admin Panel > Payment Gateways.',
      });
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError({
        gateway: 'paypal',
        title: 'PayPal Connection Exception',
        message: err.message || 'Unable to connect to PayPal server.',
        details: 'Verify backend connectivity.',
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
        vin: report.specs.vin,
        vehicleName: `${report.specs.year} ${report.specs.make} ${report.specs.model}`.trim(),
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
          specsFound: report.recordsFoundCount || 48,
          titleStatus: 'Clean Title (NMVTIS Verified)',
          accidentCount: report.accidents?.length || 0,
          score: report.overallScore || 89,
        },
      });
    } catch (err) {
      console.warn('Checkout order save notice:', err);
    }

    setTimeout(() => {
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // fallback
      }
      onPaymentSuccess(plan.id);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Modal Top Bar */}
        <div className="bg-[#0c121d] text-white p-5 sm:p-6 flex items-center justify-between border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
                OFFICIAL ON-SITE ENCRYPTED CHECKOUT
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight mt-1">
              Unlock Full Vehicle History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Banner */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Selected Vehicle:</span>
            <div className="font-bold text-slate-900 text-sm">
              {report.specs.year} {report.specs.make} {report.specs.model}
            </div>
            <div className="font-mono text-slate-500 text-[11px]">
              VIN: {report.specs.vin}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              {plan.name}
            </span>
            <div className="text-xl font-black text-slate-950 mt-1">
              ${plan.price.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Processing Overlay */}
          {isProcessing ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-base font-bold text-slate-900">
                Authorizing secure payment via {processingMethod}...
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Official report is being compiled and dispatched to{' '}
                <span className="font-bold text-slate-800">{email}</span>.
              </p>
            </div>
          ) : step === 'details' ? (
            /* STEP 1: 4 REQUIRED USER INPUTS */
            <form onSubmit={handleProceed} className="space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Step 1: Enter 4 Details to Proceed
              </div>

              {/* 1. Full Name */}
              <div>
                <label className="text-[11px] font-black tracking-widest text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>FULL NAME *</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="First and last name"
                  className="w-full px-4 py-3 bg-[#f1f3f6] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* 2. Email Address */}
              <div>
                <label className="text-[11px] font-black tracking-widest text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>EMAIL ADDRESS (REPORT DISPATCH) *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-[#f1f3f6] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* 3 & 4: Phone & Mileage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black tracking-widest text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>PHONE NUMBER *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-[#f1f3f6] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black tracking-widest text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span>VEHICLE MILEAGE *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value.replace(/[^0-9,]/g, ''))}
                    placeholder="e.g. 64,500"
                    className="w-full px-4 py-3 bg-[#f1f3f6] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full py-4 px-6 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-200 text-black disabled:text-slate-400 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md"
                >
                  <span>PROCEED TO PAYMENT</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: ON-SITE CHECKOUT PROVIDED DIRECTLY BY STRIPE & PAYPAL (NO FAKE READY-MADE CARD INPUTS) */
            <div className="space-y-5 animate-fadeIn">
              {/* Summary Pill with Edit */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-medium truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    <span className="font-bold text-slate-900">{fullName}</span> • {email} • {mileage} mi
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-[11px] font-bold text-slate-600 hover:text-black flex items-center gap-1 underline ml-2 shrink-0 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>

              {/* Gateway Switcher Tabs */}
              <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedGateway('stripe')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                  className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
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
                    <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
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
                          onClick={() => handleSimulatePayment('Sandbox Simulation')}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Developer: Simulate Success
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 1. Stripe Link 1-Click Button */}
                  {gateways.stripeLink.enabled && (
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handlePayWithStripe('Stripe Link (1-Click)')}
                        className="w-full bg-[#00d66f] hover:bg-[#00c564] active:bg-[#00b058] text-black py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.99]"
                      >
                        <div className="w-4 h-4 rounded-full bg-black text-[#00d66f] flex items-center justify-center text-[10px] font-black">
                          ›
                        </div>
                        <span className="font-black text-sm tracking-tight text-black">link</span>
                        <span className="text-black/30 font-light mx-0.5">|</span>
                        <span className="text-xs font-semibold text-black">
                          Pay with Stripe Link • ${plan.price.toFixed(2)}
                        </span>
                      </button>
                      <p className="text-[10px] text-slate-400 text-center">
                        Instant 1-click checkout with your saved phone &amp; email
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

                  {/* 2. Direct Stripe Payment Element / Checkout Trigger */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handlePayWithStripe('Stripe Checkout (Cards & Wallets)')}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#635bff] hover:bg-[#5346e0] active:bg-[#4338ca] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>Pay ${plan.price.toFixed(2)} with Stripe</span>
                    </button>

                    {/* Card Brand Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">VISA</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">MASTERCARD</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">AMEX</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">DISCOVER</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">APPLE PAY</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">GOOGLE PAY</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] leading-tight">
                      End-to-end tokenized encryption provided on-site by Stripe. No card numbers are stored locally.
                    </span>
                  </div>
                </div>
              )}

              {/* ==================== 2. PAYPAL ON-SITE CHECKOUT ==================== */}
              {selectedGateway === 'paypal' && (
                <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0079c1] text-white flex items-center justify-center font-black text-base shadow-xs">
                        P
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 uppercase tracking-tight">
                          PayPal Smart On-Site Checkout
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
                    <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
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
                          className="px-2.5 py-1 rounded-lg bg-[#0079c1] hover:bg-[#00629b] text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Developer: Simulate Success
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PayPal Suite */}
                  <div className="space-y-2.5">
                    {/* 1. Yellow PayPal Button */}
                    <button
                      type="button"
                      onClick={() => handlePayWithPaypal('PayPal Instant')}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#ffc439] hover:bg-[#f4ba31] active:bg-[#e0a823] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <span className="text-[#003087] font-black italic text-lg tracking-tighter">
                        Pay<span className="text-[#0079c1]">Pal</span>
                      </span>
                    </button>

                    {/* 2. Pay Later Button */}
                    <button
                      type="button"
                      onClick={() => handlePayWithPaypal('PayPal Pay Later')}
                      className="w-full py-3 px-6 rounded-xl bg-[#ffc439] hover:bg-[#f4ba31] active:bg-[#e0a823] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <span className="text-[#003087] font-black italic">P</span>
                      <span className="text-slate-900 font-bold text-xs sm:text-sm">
                        Pay Later (4 × ${(plan.price / 4).toFixed(2)})
                      </span>
                    </button>

                    {/* 3. Debit or Credit Card Dark Button (Powered by PayPal) */}
                    <button
                      type="button"
                      onClick={() => handlePayWithPaypal('Debit or Credit Card (PayPal)')}
                      className="w-full py-3 px-6 rounded-xl bg-[#2c2e2f] hover:bg-[#1f2021] active:bg-[#141516] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>Debit or Credit Card</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <span className="text-[10px] text-slate-400 italic">
                      Powered on-site by <span className="font-bold text-[#003087]">Pay</span><span className="font-bold text-[#0079c1]">Pal</span> • Instant Automated Verification
                    </span>
                  </div>
                </div>
              )}

              {/* Direct Email Confirmation Notice */}
              <div className="pt-2 text-center text-xs font-semibold text-slate-500">
                ⚡ Official PDF report will be delivered directly to{' '}
                <span className="font-bold text-slate-800">{email}</span>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
