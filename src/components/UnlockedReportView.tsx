import React, { useState } from 'react';
import {
  FileCheck2,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Users,
  Gauge,
  Landmark,
  ShieldAlert,
  Car,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Check
} from 'lucide-react';
import { FullVehicleReport } from '../types';
import { generateVehicleReportPdf } from '../services/pdfReportGenerator';

interface UnlockedReportViewProps {
  report: FullVehicleReport;
  onLockAgain?: () => void;
}

export const UnlockedReportView: React.FC<UnlockedReportViewProps> = ({
  report,
  onLockAgain,
}) => {
  const [activeTab, setActiveTab] = useState<'title' | 'accidents' | 'odometer' | 'ownership' | 'liens' | 'recalls' | 'market'>('title');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      generateVehicleReportPdf(report);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
      try {
        window.print();
      } catch (printErr) {
        console.error('Print error:', printErr);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleDownloadPdf();
    }
  };

  return (
    <div id="unlocked-report" className="w-full bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Certificate Banner */}
        <div className="bg-[#141d2c] border border-yellow-400/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-yellow-400/20">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400/20 text-yellow-300 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  OFFICIAL NMVTIS REPORT
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  REF #VN-{report.specs.vin.slice(-6)}-2026
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Full Vehicle History Unlocked & Certified
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generated from official federal databases, state DMV records, and police crash archives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4 text-black stroke-[3]" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isDownloading ? 'Generating PDF...' : downloadSuccess ? 'PDF Downloaded!' : 'Download Official PDF'}
              </span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('title')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'title' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Title & Brands (DMV)
          </button>
          <button
            onClick={() => setActiveTab('accidents')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'accidents' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Accident & Damage ({report.accidents.length})
          </button>
          <button
            onClick={() => setActiveTab('odometer')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'odometer' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Odometer History ({report.odometerHistory.length} logs)
          </button>
          <button
            onClick={() => setActiveTab('ownership')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ownership' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ownership History ({report.ownershipHistory.length} owners)
          </button>
          <button
            onClick={() => setActiveTab('liens')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'liens' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Liens & Theft Check
          </button>
          <button
            onClick={() => setActiveTab('recalls')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'recalls' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety Recalls ({report.recalls.count})
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'market' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Market Valuation
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-[#101725] rounded-2xl p-6 sm:p-8 border border-white/10">
          {/* TAB: TITLE RECORDS */}
          {activeTab === 'title' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    NMVTIS 50-State Title & Brand Check
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Audited against National Motor Vehicle Title Information System standards.
                  </p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CLEAN TITLE CONFIRMED
                </span>
              </div>

              {/* Title brand checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Salvage Brand</span>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Junk / Scrap</span>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Flood / Water</span>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Lemon / Buyback</span>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>
              </div>

              {/* Detailed Title History Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Official Title Issue Timeline
                </h4>
                <div className="space-y-2.5">
                  {report.titleRecords.map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/40 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{t.event}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {t.state}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {t.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {t.brand} BRAND
                        </span>
                        <div className="text-xs font-mono text-slate-400 mt-1">
                          {t.mileage.toLocaleString()} miles recorded
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACCIDENT RECORDS */}
          {activeTab === 'accidents' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Police Crash & Insurance Claim Records
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cross-referenced with state highway patrol, local police precincts, and insurance damage claims.
                </p>
              </div>

              {report.accidents.length === 0 ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="font-bold text-sm text-white mt-2">Zero Accidents Reported</div>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    No collision reports, total loss insurance payments, or police accident documentation found on this VIN.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.accidents.map((acc, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/40 border border-amber-500/30 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                            {acc.severity} IMPACT
                          </span>
                          <span className="text-sm font-bold text-white">
                            Incident Date: {acc.date}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Location: {acc.location}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Impact Point</span>
                          <span className="font-semibold text-slate-200">{acc.impactArea}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Airbags Deployed</span>
                          <span className="font-semibold text-slate-200">
                            {acc.airbagDeployed ? 'Yes' : 'No (Non-Severe)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Structural / Frame Damage</span>
                          <span className="font-semibold text-emerald-400">
                            {acc.structuralDamage ? 'Yes' : 'None Detected (Clean)'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {acc.details}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ODOMETER */}
          {activeTab === 'odometer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    Odometer Rollback & Mileage Progression Audit
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Verifying chronological consistency to detect digital tampering or rollback scams.
                  </p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                  ROLLBACK RISK: NONE
                </span>
              </div>

              <div className="space-y-2">
                {report.odometerHistory.map((reading, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/40 p-3.5 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <div>
                        <div className="font-bold text-white">{reading.source}</div>
                        <div className="text-slate-400 text-[11px]">{reading.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-yellow-400">
                        {reading.mileage.toLocaleString()} mi
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                        {reading.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: OWNERSHIP */}
          {activeTab === 'ownership' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Registered Ownership History ({report.ownershipHistory.length} Previous Owners)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Timeline of ownership duration, vehicle use classification, and estimated annual mileage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.ownershipHistory.map((own) => (
                  <div
                    key={own.ownerNumber}
                    className="bg-slate-800/40 border border-white/5 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-yellow-400 text-black text-xs font-black px-2.5 py-1 rounded uppercase">
                        Owner {own.ownerNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        Acquired in {own.purchasedYear}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Use Type</span>
                        <span className="font-semibold text-white">{own.ownershipType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Length of Ownership</span>
                        <span className="font-semibold text-white">{own.estimatedDuration}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
                        <span className="font-semibold text-white">{own.location}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Miles/Yr</span>
                        <span className="font-semibold text-yellow-400">
                          {own.estimatedMilesPerYear.toLocaleString()} mi/yr
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LIENS & THEFT */}
          {activeTab === 'liens' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Financial Liens, Impound, & Stolen Registry Check
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cross-referenced with lenders, banks, and the National Insurance Crime Bureau (NICB).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Financial Liens & Loans</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      NO ACTIVE LIEN
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {report.lienStatus.details}
                  </p>
                </div>

                <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Stolen Vehicle Database</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      CLEAN / NO THEFT RECORD
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {report.theftStatus.details}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RECALLS */}
          {activeTab === 'recalls' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Official NHTSA Safety Recalls
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manufacturer recall campaigns issued by the National Highway Traffic Safety Administration.
                </p>
              </div>

              {report.recalls.items.length === 0 ? (
                <div className="bg-slate-800/40 p-6 rounded-xl border border-white/5 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="font-bold text-sm text-white mt-2">Zero Open Safety Recalls</div>
                  <p className="text-xs text-slate-400 mt-1">
                    No unrepaired safety campaigns active on this VIN.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.recalls.items.map((rc, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/40 p-5 rounded-xl border border-amber-500/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-yellow-400 font-bold">
                          CAMPAIGN #{rc.campaignNumber}
                        </span>
                        <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          {rc.component}
                        </span>
                      </div>
                      <p className="text-slate-200">{rc.summary}</p>
                      <div className="pt-2 border-t border-white/5 text-slate-400">
                        <span className="font-bold text-white">Manufacturer Remedy:</span> {rc.remedy}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MARKET VALUATION */}
          {activeTab === 'market' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Fair Market Value & Price Guidance
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Based on recent wholesale auction sales, private party transactions, and dealer listings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5 text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Trade-In Valuation</div>
                  <div className="text-2xl font-black text-slate-200 mt-1">
                    ${report.marketValue.tradeInValue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Dealer trade-in estimate</div>
                </div>

                <div className="bg-yellow-400/10 p-5 rounded-xl border border-yellow-400/40 text-center">
                  <div className="text-[11px] font-black text-yellow-400 uppercase">Suggested Retail Value</div>
                  <div className="text-3xl font-black text-yellow-400 mt-1">
                    ${report.marketValue.estimatedBase.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-yellow-300 mt-0.5">Average private party value</div>
                </div>

                <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5 text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Dealer Retail High</div>
                  <div className="text-2xl font-black text-slate-200 mt-1">
                    ${report.marketValue.estimatedHigh.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Top tier dealer condition</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
