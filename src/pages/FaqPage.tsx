import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  CreditCard,
  FileText,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import heroSedanImg from '../assets/images/pricing_hero_car_garage_1790203751610.jpg';

interface FaqPageProps {
  onNavigate: (page: string) => void;
}

interface FaqItem {
  id: string;
  category: 'getting-started' | 'pricing-payments' | 'reports-data' | 'billing-support';
  categoryLabel: string;
  question: string;
  answer: string;
}

const FAQS_DATA: FaqItem[] = [
  // Category 1: GETTING STARTED
  {
    id: 'what-is-wheelclarify',
    category: 'getting-started',
    categoryLabel: 'GETTING STARTED',
    question: 'WHAT IS WHEELCLARIFY?',
    answer:
      'WheelClarify is an independent federal vehicle history intelligence platform providing instant access to official NMVTIS data, 50-state DMV titling records, total loss insurance claims, police collision reports, and salvage auction history to help car buyers avoid hidden damage, title washing, and odometer fraud.',
  },
  {
    id: 'how-do-i-buy-a-report',
    category: 'getting-started',
    categoryLabel: 'GETTING STARTED',
    question: 'HOW DO I BUY A REPORT?',
    answer:
      'Simply enter any 17-digit VIN or US license plate on our homepage. Choose the audit package that fits your needs (Standard, Silver, or Gold), and complete our secure checkout via Stripe or PayPal. Your verified report unlocks instantly on-screen and a PDF copy is emailed to you.',
  },
  {
    id: 'how-do-i-access-my-report',
    category: 'getting-started',
    categoryLabel: 'GETTING STARTED',
    question: 'HOW DO I ACCESS MY PURCHASED REPORT?',
    answer:
      'No account or password is required! All reports are generated instantly and delivered directly to the email address provided during checkout. You can open and download your full official report anytime directly from your email.',
  },
  {
    id: 'do-you-provide-data-for-international-vehicles',
    category: 'getting-started',
    categoryLabel: 'GETTING STARTED',
    question: 'DO YOU PROVIDE DATA FOR INTERNATIONAL VEHICLES?',
    answer:
      'Yes, WheelClarify supports vehicles manufactured and titled across North America (United States and Canada), with expanding support for European Union and Australian vehicle identification numbers through federated international nodes.',
  },

  // Category 2: PRICING & PAYMENTS
  {
    id: 'do-you-offer-a-free-trial',
    category: 'pricing-payments',
    categoryLabel: 'PRICING & PAYMENTS',
    question: 'DO YOU OFFER A FREE TRIAL?',
    answer:
      'We provide free basic VIN decoding and preliminary specification checks for any vehicle. Full federal NMVTIS audits, police accident logs, and title brand records require a one-time audit credit or package.',
  },
  {
    id: 'what-packages-do-you-offer',
    category: 'pricing-payments',
    categoryLabel: 'PRICING & PAYMENTS',
    question: 'WHAT PACKAGES DO YOU OFFER?',
    answer:
      'We offer three tiers: Standard Package ($39.99 / 1 credit), Silver Package ($59.99 with enhanced inspection history and lien checks), and Gold Package ($99.99 for enterprise audit-grade intelligence, insurance total-loss files, and priority 1-hour delivery).',
  },
  {
    id: 'can-i-pay-with-stripe-or-paypal',
    category: 'pricing-payments',
    categoryLabel: 'PRICING & PAYMENTS',
    question: 'CAN I PAY WITH STRIPE OR PAYPAL?',
    answer:
      'Yes. All transactions are protected by 256-bit SSL encryption. We accept Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay via Stripe, as well as one-click PayPal checkout.',
  },
  {
    id: 'is-there-a-recurring-monthly-subscription',
    category: 'pricing-payments',
    categoryLabel: 'PRICING & PAYMENTS',
    question: 'IS THERE A RECURRING MONTHLY SUBSCRIPTION?',
    answer:
      'No! Unlike traditional report monopolies that trap buyers in $44.99/month recurring auto-billing, WheelClarify operates strictly on upfront, single-credit purchases with zero recurring charges.',
  },

  // Category 3: REPORTS & DATA
  {
    id: 'where-does-wheelclarify-get-its-data',
    category: 'reports-data',
    categoryLabel: 'REPORTS & DATA',
    question: 'WHERE DOES WHEELCLARIFY GET ITS DATA?',
    answer:
      'Our data pipeline connects directly to official federal registries including the National Motor Vehicle Title Information System (NMVTIS), 50 state DMVs, over 800 insurance total loss carriers, law enforcement stolen vehicle databases, and major salvage auctions (Copart & IAAI).',
  },
  {
    id: 'how-accurate-are-the-odometer-readings',
    category: 'reports-data',
    categoryLabel: 'REPORTS & DATA',
    question: 'HOW ACCURATE ARE THE ODOMETER READINGS?',
    answer:
      'Odometer milestones are chronologically compiled from certified state emissions inspections, annual title renewals, dealer service visits, and auto auction check-ins to detect digital mileage rollback scams.',
  },
  {
    id: 'what-are-nmvtis-title-brands',
    category: 'reports-data',
    categoryLabel: 'REPORTS & DATA',
    question: 'WHAT ARE NMVTIS TITLE BRANDS?',
    answer:
      'Title brands are permanent legal designations applied by state DMVs to alert future owners of catastrophic damage, such as Salvage, Flood, Junk, Rebuilt, Fire, Lemon Law Buyback, or Odometer Tampering.',
  },
  {
    id: 'can-a-report-detect-previous-accidents',
    category: 'reports-data',
    categoryLabel: 'REPORTS & DATA',
    question: 'CAN A REPORT DETECT PREVIOUS ACCIDENTS OR FRAME DAMAGE?',
    answer:
      'Yes. Our reports cross-reference state police accident reports, insurance collision appraisals, structural frame inspection logs, and airbag deployment records to pinpoint prior collision impact severity.',
  },

  // Category 4: BILLING & SUPPORT
  {
    id: 'how-do-i-contact-24-7-support',
    category: 'billing-support',
    categoryLabel: 'BILLING & SUPPORT',
    question: 'HOW DO I CONTACT 24/7 SUPPORT?',
    answer:
      'Our dedicated customer support desk is available around the clock. You can open a ticket directly through our Support page, or reach out to our verification team via live chat.',
  },
  {
    id: 'what-if-a-vin-returned-no-records',
    category: 'billing-support',
    categoryLabel: 'BILLING & SUPPORT',
    question: 'WHAT IF A VIN RETURNED NO RECORDS?',
    answer:
      'If an official VIN search returns zero records due to rare clerical issues or a very recent vehicle import, our 100% Data Quality Guarantee provides an instant replacement credit or prompt refund.',
  },
  {
    id: 'can-i-download-and-print-my-report-as-a-pdf',
    category: 'billing-support',
    categoryLabel: 'BILLING & SUPPORT',
    question: 'CAN I DOWNLOAD AND PRINT MY REPORT AS A PDF?',
    answer:
      'Yes, every unlocked report includes a 1-click option to download or print an Official NMVTIS Certified PDF document suitable for auto loans, insurance underwriters, or private sales.',
  },
];

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const matchesCategory =
        activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Group filtered faqs by category
  const groupedFaqs = useMemo(() => {
    const groups: { [key: string]: FaqItem[] } = {};
    filteredFaqs.forEach((faq) => {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }
      groups[faq.category].push(faq);
    });
    return groups;
  }, [filteredFaqs]);

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans animate-fadeIn">
      {/* =========================================================================
          HERO SECTION (MATCHING SCREENSHOT 1 / Screenshot 2026-09-25 024720.png)
          Dark automotive workshop background with open-hood silver sedan,
          bold italic typography: "SUPPORT & INTELLIGENCE."
          Search bar: "Search the knowledge base..."
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#0d1017] text-white pt-24 pb-28 sm:pt-32 sm:pb-36 px-4 text-center">
        {/* Background Image with Dark Vignette Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url(${heroSedanImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-[#0d1017]" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Top Pill Capsule: HELP CENTER */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold tracking-widest uppercase backdrop-blur-sm">
            HELP CENTER
          </div>

          {/* Main Headline: SUPPORT & INTELLIGENCE. */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tight uppercase text-white leading-none drop-shadow-md">
            SUPPORT & <br />
            <span className="text-yellow-400">INTELLIGENCE.</span>
          </h1>

          {/* Centered Knowledge Base Search Bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the knowledge base..."
                className="w-full pl-13 pr-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/20 focus:border-yellow-400 text-white placeholder:text-slate-400 placeholder:italic text-sm sm:text-base outline-none transition-all backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 text-xs text-slate-400 hover:text-white uppercase font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTENT SECTION (MATCHING SCREENSHOT 2 / Screenshot 2026-09-25 024741.png)
          Left Sidebar (Categories & Still Need Help card)
          Right Column (Accordion sections with yellow outline icons and > chevrons)
          ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* =====================================================================
              LEFT SIDEBAR: CATEGORIES & STILL NEED HELP? CARD
              ===================================================================== */}
          <aside className="lg:col-span-4 space-y-8">
            <div>
              <div className="text-[11px] font-black text-slate-400 tracking-wider mb-4 uppercase">
                CATEGORIES
              </div>

              {/* Category Nav Buttons */}
              <div className="space-y-2">
                {/* 1. ALL TOPICS */}
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    activeCategory === 'all'
                      ? 'bg-yellow-400 text-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span>ALL TOPICS</span>
                </button>

                {/* 2. GETTING STARTED */}
                <button
                  onClick={() => setActiveCategory('getting-started')}
                  className={`w-full text-left font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    activeCategory === 'getting-started'
                      ? 'bg-yellow-400 text-black font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle
                    className={`w-4 h-4 ${
                      activeCategory === 'getting-started' ? 'text-black' : 'text-slate-400'
                    }`}
                  />
                  <span>GETTING STARTED</span>
                </button>

                {/* 3. PRICING & PAYMENTS */}
                <button
                  onClick={() => setActiveCategory('pricing-payments')}
                  className={`w-full text-left font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    activeCategory === 'pricing-payments'
                      ? 'bg-yellow-400 text-black font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard
                    className={`w-4 h-4 ${
                      activeCategory === 'pricing-payments' ? 'text-black' : 'text-slate-400'
                    }`}
                  />
                  <span>PRICING & PAYMENTS</span>
                </button>

                {/* 4. REPORTS & DATA */}
                <button
                  onClick={() => setActiveCategory('reports-data')}
                  className={`w-full text-left font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    activeCategory === 'reports-data'
                      ? 'bg-yellow-400 text-black font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 ${
                      activeCategory === 'reports-data' ? 'text-black' : 'text-slate-400'
                    }`}
                  />
                  <span>REPORTS & DATA</span>
                </button>

                {/* 5. BILLING & SUPPORT */}
                <button
                  onClick={() => setActiveCategory('billing-support')}
                  className={`w-full text-left font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    activeCategory === 'billing-support'
                      ? 'bg-yellow-400 text-black font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <AlertCircle
                    className={`w-4 h-4 ${
                      activeCategory === 'billing-support' ? 'text-black' : 'text-slate-400'
                    }`}
                  />
                  <span>BILLING & SUPPORT</span>
                </button>
              </div>
            </div>

            {/* STILL NEED HELP? CARD (Exact match to screenshot) */}
            <div className="bg-[#15161b] text-white rounded-[28px] p-7 space-y-4 shadow-xl">
              {/* Yellow Alert Exclamation Circle */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-yellow-400 stroke-[2.5]" />
              </div>

              <h2 className="text-xl font-black italic uppercase tracking-tight text-white leading-tight">
                STILL NEED HELP?
              </h2>

              <p className="text-slate-400 italic text-xs leading-relaxed font-medium">
                Our expert data team is available 24/7 for manual verification.
              </p>

              <button
                onClick={() => onNavigate('support')}
                className="w-full py-3 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 cursor-pointer text-center"
              >
                OPEN TICKET
              </button>
            </div>
          </aside>

          {/* =====================================================================
              RIGHT COLUMN: FAQ ACCORDION LIST
              ===================================================================== */}
          <main className="lg:col-span-8 space-y-12">
            {filteredFaqs.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-lg font-black italic uppercase text-slate-900">
                  No matching questions found
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                  Try searching for keywords like "NMVTIS", "salvage", "free trial", "Stripe", or "account".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-2 px-5 py-2 rounded-full bg-yellow-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* 1. GETTING STARTED GROUP */}
                {groupedFaqs['getting-started'] && (
                  <div className="space-y-4">
                    {/* Header with Yellow Icon */}
                    <div className="flex items-center gap-3 pb-2">
                      <HelpCircle className="w-6 h-6 text-yellow-400 shrink-0 stroke-[2.5]" />
                      <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-slate-950">
                        GETTING STARTED
                      </h2>
                    </div>

                    {/* Questions in group */}
                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                      {groupedFaqs['getting-started'].map((item) => {
                        const isOpen = openFaqId === item.id;
                        return (
                          <div key={item.id} className="py-4 sm:py-5">
                            <button
                              onClick={() => toggleFaq(item.id)}
                              className="w-full text-left flex items-center justify-between gap-4 group cursor-pointer"
                            >
                              <span className="text-base sm:text-lg font-black italic uppercase tracking-tight text-slate-950 group-hover:text-yellow-600 transition-colors">
                                {item.question}
                              </span>
                              <ChevronRight
                                className={`w-5 h-5 text-slate-300 group-hover:text-yellow-500 shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-90 text-yellow-500' : ''
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="pt-3 pr-6 text-sm text-slate-600 leading-relaxed font-medium animate-fadeIn">
                                <p>{item.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. PRICING & PAYMENTS GROUP */}
                {groupedFaqs['pricing-payments'] && (
                  <div className="space-y-4 pt-4">
                    {/* Header with Yellow Icon */}
                    <div className="flex items-center gap-3 pb-2">
                      <CreditCard className="w-6 h-6 text-yellow-400 shrink-0 stroke-[2.5]" />
                      <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-slate-950">
                        PRICING & PAYMENTS
                      </h2>
                    </div>

                    {/* Questions in group */}
                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                      {groupedFaqs['pricing-payments'].map((item) => {
                        const isOpen = openFaqId === item.id;
                        return (
                          <div key={item.id} className="py-4 sm:py-5">
                            <button
                              onClick={() => toggleFaq(item.id)}
                              className="w-full text-left flex items-center justify-between gap-4 group cursor-pointer"
                            >
                              <span className="text-base sm:text-lg font-black italic uppercase tracking-tight text-slate-950 group-hover:text-yellow-600 transition-colors">
                                {item.question}
                              </span>
                              <ChevronRight
                                className={`w-5 h-5 text-slate-300 group-hover:text-yellow-500 shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-90 text-yellow-500' : ''
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="pt-3 pr-6 text-sm text-slate-600 leading-relaxed font-medium animate-fadeIn">
                                <p>{item.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. REPORTS & DATA GROUP */}
                {groupedFaqs['reports-data'] && (
                  <div className="space-y-4 pt-4">
                    {/* Header with Yellow Icon */}
                    <div className="flex items-center gap-3 pb-2">
                      <FileText className="w-6 h-6 text-yellow-400 shrink-0 stroke-[2.5]" />
                      <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-slate-950">
                        REPORTS & DATA
                      </h2>
                    </div>

                    {/* Questions in group */}
                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                      {groupedFaqs['reports-data'].map((item) => {
                        const isOpen = openFaqId === item.id;
                        return (
                          <div key={item.id} className="py-4 sm:py-5">
                            <button
                              onClick={() => toggleFaq(item.id)}
                              className="w-full text-left flex items-center justify-between gap-4 group cursor-pointer"
                            >
                              <span className="text-base sm:text-lg font-black italic uppercase tracking-tight text-slate-950 group-hover:text-yellow-600 transition-colors">
                                {item.question}
                              </span>
                              <ChevronRight
                                className={`w-5 h-5 text-slate-300 group-hover:text-yellow-500 shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-90 text-yellow-500' : ''
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="pt-3 pr-6 text-sm text-slate-600 leading-relaxed font-medium animate-fadeIn">
                                <p>{item.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. BILLING & SUPPORT GROUP */}
                {groupedFaqs['billing-support'] && (
                  <div className="space-y-4 pt-4">
                    {/* Header with Yellow Icon */}
                    <div className="flex items-center gap-3 pb-2">
                      <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0 stroke-[2.5]" />
                      <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-slate-950">
                        BILLING & SUPPORT
                      </h2>
                    </div>

                    {/* Questions in group */}
                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                      {groupedFaqs['billing-support'].map((item) => {
                        const isOpen = openFaqId === item.id;
                        return (
                          <div key={item.id} className="py-4 sm:py-5">
                            <button
                              onClick={() => toggleFaq(item.id)}
                              className="w-full text-left flex items-center justify-between gap-4 group cursor-pointer"
                            >
                              <span className="text-base sm:text-lg font-black italic uppercase tracking-tight text-slate-950 group-hover:text-yellow-600 transition-colors">
                                {item.question}
                              </span>
                              <ChevronRight
                                className={`w-5 h-5 text-slate-300 group-hover:text-yellow-500 shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-90 text-yellow-500' : ''
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="pt-3 pr-6 text-sm text-slate-600 leading-relaxed font-medium animate-fadeIn">
                                <p>{item.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};
