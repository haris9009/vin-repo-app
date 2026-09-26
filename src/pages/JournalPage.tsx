import React, { useState } from 'react';
import { BookOpen, Clock, Tag, Search, ArrowRight, ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

interface JournalPageProps {
  onSearchVin: (vin: string) => void;
  onNavigate: (page: string) => void;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  date: string;
  imageTag: string;
  summary: string;
  highlight: string;
  bullets: string[];
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'The Modern Anatomy of Odometer Rollback Scams in Digital Instrument Clusters',
    slug: 'digital-odometer-rollback-scams',
    category: 'Fraud Prevention',
    readTime: '5 min read',
    date: 'Sep 18, 2026',
    imageTag: 'Mileage Fraud',
    summary: 'Think digital clusters are immune to tampering? Handheld CAN-bus programmers and mileage blockers sold online allow dishonest sellers to erase 50,000+ miles in under 90 seconds.',
    highlight: 'NMVTIS maintains cross-referenced state inspection odometer logs that flag retroactive drops instantly.',
    bullets: [
      'Digital mileage blockers intercept CAN-bus signals without triggering diagnostic trouble codes (DTCs).',
      'Checking physical wear (pedal pads, steering wheel leather, brake rotors) against recorded mileage.',
      'How to verify telemetry timestamps across oil change chains and state emissions checkpoints.'
    ]
  },
  {
    id: '2',
    title: 'Title Washing Tactics: How Salvage & Flood Cars Migrate Across State Lines',
    slug: 'title-washing-salvage-flood-tactics',
    category: 'Title Brands',
    readTime: '7 min read',
    date: 'Sep 12, 2026',
    imageTag: 'Title Brands',
    summary: 'After extreme weather events, thousands of flood-damaged and total-loss insurance write-offs undergo cosmetic detailing and are retitled in lenient jurisdictions to scrub the salvage brand.',
    highlight: 'Federal NMVTIS legislation mandates that total-loss insurer declarations permanently brand the VIN regardless of state transfers.',
    bullets: [
      'The difference between Salvage, Rebuilt, Junk, Certificate of Destruction, and Clean titles.',
      'Hidden corrosion hazards in unsealed body control modules (BCM) and airbag squib circuits.',
      'Why secondary market flood cars frequently exhibit intermittent electrical failure 6-12 months later.'
    ]
  },
  {
    id: '3',
    title: 'Hidden Liens & Repossession Risk: Why Private Party Car Buyers Get Burned',
    slug: 'hidden-liens-private-party-scams',
    category: 'Buyer Protection',
    readTime: '4 min read',
    date: 'Aug 29, 2026',
    imageTag: 'Financial Records',
    summary: 'If you buy a vehicle with an active unpaid bank or credit union lien, the lender retains legal ownership and can repossess the car directly out of your driveway.',
    highlight: 'Always demand a formal Lien Release Letter from the lending institution prior to exchanging cashier checks.',
    bullets: [
      'UCC-1 financing statements and electronic lien titling (ELT) systems.',
      'How title loan companies place stealth priority claims on vehicle registrations.',
      'Step-by-step verification protocol before handing over cash in private transactions.'
    ]
  },
  {
    id: '4',
    title: '5 Red Flags in Used Car Listings You Can Spot in Under 60 Seconds',
    slug: 'red-flags-used-car-listings',
    category: 'Inspection Guides',
    readTime: '6 min read',
    date: 'Aug 15, 2026',
    imageTag: 'Checklist',
    summary: 'From misaligned front bumper gaps indicating repaired front-end collision impacts to inconsistent tire tread manufacturing dates, learn what professional appraisers look for.',
    highlight: 'VIN decoders reveal factory trim levels—preventing sellers from upcharging on counterfeit performance packages.',
    bullets: [
      'Factory paint depth measurements vs secondary clear coat resprays.',
      'Checking VIN stamping consistency on firewall, driver door jamb sticker, and lower windshield plate.',
      'Verifying open NHTSA safety recalls that dealers legally cannot sell without addressing.'
    ]
  }
];

export const JournalPage: React.FC<JournalPageProps> = ({ onSearchVin, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Fraud Prevention', 'Title Brands', 'Buyer Protection', 'Inspection Guides'];

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-[#070b11] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black tracking-widest uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            AUTOMOTIVE INVESTIGATION JOURNAL
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Vehicle History, Fraud Scams & Buyer Defense
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            In-depth guides authored by automotive forensic inspectors, NMVTIS database researchers, and legal consumer protection specialists.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-[#0e1522] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides & topics..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-white/15 rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              className="bg-[#0e1522] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-yellow-400/50 transition-all group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="bg-yellow-400/15 text-yellow-400 font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {art.readTime}
                    </span>
                    <span>•</span>
                    <span>{art.date}</span>
                  </div>
                </div>

                <h2 className="text-xl font-black text-white group-hover:text-yellow-400 transition-colors leading-snug">
                  {art.title}
                </h2>

                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {art.summary}
                </p>

                {/* Key takeaway highlight box */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-yellow-400/20 text-xs text-yellow-200/90 font-medium">
                  <span className="font-bold text-yellow-400 uppercase tracking-wider text-[10px] block mb-1">
                    Key Investigation Takeaway:
                  </span>
                  {art.highlight}
                </div>

                {/* Bullet checklist */}
                <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
                  {art.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => onSearchVin('WBACH9343YLG18917')}
                  className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Audit a VIN Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] font-mono text-slate-500">
                  DOC ID: VW-ART-{art.id.padStart(3, '0')}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom VIN Prompt Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-[#0e1522] to-[#0e1522] border border-yellow-400/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-black text-white uppercase">
              Suspect an undisclosed accident or odometer rollback?
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Cross-reference any 17-digit VIN against 50-state title brands, police collision records, and salvage auctions instantly.
            </p>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-yellow-400/20 cursor-pointer shrink-0"
          >
            Search Vehicle History
          </button>
        </div>
      </div>
    </div>
  );
};
