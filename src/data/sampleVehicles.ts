import { FullVehicleReport, ReportPlan } from '../types';

export const SAMPLE_BMW_Z3: FullVehicleReport = {
  specs: {
    vin: 'WBACH9343YLG18917',
    year: 2000,
    make: 'BMW',
    model: 'Z3',
    manufacturer: 'BMW AG',
    plantCountry: 'UNITED STATES (USA)',
    engineDisplacement: '2.3L',
    engineCylinders: 6,
    transmission: 'Manual/Standard',
    bodyClass: 'Roadster',
    fuelType: 'Gasoline',
    driveType: 'RWD (Rear-Wheel Drive)',
    trim: '2.3 Roadster',
    doors: 2,
  },
  recordsFoundCount: 14,
  lastReportedDate: '2026-08-14',
  overallScore: 88,
  indicators: [
    {
      id: 'specifications',
      title: 'SPECIFICATIONS',
      displayTitle: 'SPECIFICATIONS',
      status: 'verified',
      statusText: 'VERIFIED',
      isLocked: false,
      icon: 'car',
      badgeType: 'green',
      details: 'All 48 manufacturer build specs, engine code, and factory options verified via OEM database.'
    },
    {
      id: 'nmvtis',
      title: 'NMVTIS HISTORY',
      displayTitle: 'NMVTIS HISTO...',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'clipboard-list',
      badgeType: 'yellow',
      details: 'Federal NMVTIS database checked across all 50 states. Full title brand status & DMV certificates.'
    },
    {
      id: 'ownership',
      title: 'OWNERSHIP CHRONOLOGY',
      displayTitle: 'OWNERSHIP CH...',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'users',
      badgeType: 'yellow',
      details: '2 Previous owners verified. Commercial vs personal usage history documented.'
    },
    {
      id: 'odometer',
      title: 'ODOMETER HISTORY',
      displayTitle: 'ODOMETER HIS...',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'gauge',
      badgeType: 'yellow',
      details: 'Chronological odometer tracking records with zero rollback flags detected across 8 inspections.'
    },
    {
      id: 'salvage',
      title: 'SALVAGE & JUNK',
      displayTitle: 'SALVAGE & JUNK',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'alert-triangle',
      badgeType: 'yellow',
      details: 'Total loss, insurance dismantler, and junk yard registry audit across 50 state motor vehicle agencies.'
    },
    {
      id: 'accidents',
      title: 'ACCIDENT CHECK',
      displayTitle: 'ACCIDENT CHECK',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'shield-alert',
      badgeType: 'yellow',
      details: 'State police collision database, insurance claims, and body repair shop estimates cross-referenced.'
    },
    {
      id: 'theft',
      title: 'THEFT RECORDS',
      displayTitle: 'THEFT RECORDS',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'ghost',
      badgeType: 'yellow',
      details: 'FBI National Crime Information Center (NCIC) and NICB stolen vehicle database checked.'
    },
    {
      id: 'financial',
      title: 'FINANCIAL LIENS',
      displayTitle: 'FINANCIAL LIE...',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'landmark',
      badgeType: 'yellow',
      details: 'Active bank loans, repo notices, and court liens registry searched.'
    },
    {
      id: 'sales',
      title: 'SALES ARCHIVE',
      displayTitle: 'SALES ARCHIVE',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'dollar-sign',
      badgeType: 'yellow',
      details: 'Wholesale dealer auction records, Copart, Manheim, and historical classified listings.'
    },
    {
      id: 'us_record',
      title: 'US RECORD FOUND',
      displayTitle: 'US RECORD FO...',
      status: 'verified',
      statusText: 'YES',
      isLocked: false,
      icon: 'shield-check',
      badgeType: 'green',
      details: 'Vehicle is registered and documented within the United States federal automotive database.'
    },
    {
      id: 'problem',
      title: 'PROBLEM CHECKS',
      displayTitle: 'PROBLEM CHEC...',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'shield-x',
      badgeType: 'yellow',
      details: 'Hail damage, flood brand, fire damage, lemon law buyback, and odometer rollback checks.'
    },
    {
      id: 'market',
      title: 'MARKET ANALYSIS',
      displayTitle: 'MARKET ANALY...',
      status: 'locked',
      statusText: 'LOCKED',
      isLocked: true,
      icon: 'bar-chart-3',
      badgeType: 'yellow',
      details: 'Real-time retail value estimation, dealer wholesale trade-in valuation, and price trends.'
    }
  ],
  titleRecords: [
    { date: '2024-05-18', state: 'California (CA)', mileage: 78500, event: 'Title issued / Clean Record', brand: 'CLEAN' },
    { date: '2016-09-12', state: 'Washington (WA)', mileage: 52100, event: 'Title transferred / Private Party', brand: 'CLEAN' },
    { date: '2000-04-03', state: 'South Carolina (SC)', mileage: 12, event: 'First Title Issued / Original Owner', brand: 'CLEAN' },
  ],
  accidents: [
    {
      date: '2019-11-04',
      location: 'Sacramento, CA',
      severity: 'Minor',
      impactArea: 'Front Right Bumper Fascia',
      airbagDeployed: false,
      structuralDamage: false,
      details: 'Low-speed parking lot contact reported. Cosmetic scuff repair completed by certified technician. Structural integrity 100% verified.'
    }
  ],
  odometerHistory: [
    { date: '2024-05-18', source: 'California Bureau of Automotive Repair', mileage: 78520, status: 'Consistent' },
    { date: '2022-04-10', source: 'Smog Check Station #4819', mileage: 71200, status: 'Consistent' },
    { date: '2019-11-04', source: 'Insurance Claim Inspection', mileage: 62450, status: 'Consistent' },
    { date: '2016-09-12', source: 'Washington Dept. of Licensing', mileage: 52110, status: 'Consistent' },
    { date: '2011-08-20', source: 'BMW Authorized Service Center', mileage: 38900, status: 'Consistent' },
    { date: '2000-04-03', source: 'Original Dealer Delivery', mileage: 12, status: 'Consistent' }
  ],
  ownershipHistory: [
    {
      ownerNumber: 1,
      purchasedYear: 2000,
      ownershipType: 'Personal',
      estimatedDuration: '16 Years, 5 Mos',
      location: 'Washington / South Carolina',
      estimatedMilesPerYear: 3200
    },
    {
      ownerNumber: 2,
      purchasedYear: 2016,
      ownershipType: 'Personal',
      estimatedDuration: 'Current Owner (8 Years+)',
      location: 'California',
      estimatedMilesPerYear: 3300
    }
  ],
  lienStatus: {
    hasActiveLien: false,
    recordsCount: 1,
    details: 'Previous financing with BMW Financial Services paid off in full (Lien release letter on file).'
  },
  theftStatus: {
    isStolen: false,
    recordsCount: 0,
    details: 'No record of theft or active impound reports in NICB or FBI NCIC registries.'
  },
  recalls: {
    count: 1,
    items: [
      {
        campaignNumber: '02V031000',
        component: 'ELECTRICAL SYSTEM: BATTERY CABLE',
        summary: 'BMW recalled certain model year 1999-2000 Z3 roadsters regarding positive battery cable routing.',
        consequence: 'Wear could cause short circuit.',
        remedy: 'Dealers inspected and rerouted cable with protective sleeve free of charge.'
      }
    ]
  },
  marketValue: {
    estimatedLow: 13900,
    estimatedBase: 16500,
    estimatedHigh: 19800,
    tradeInValue: 12200,
    confidence: 'HIGH'
  }
};

export const PLANS: ReportPlan[] = [
  {
    id: 'standard',
    name: 'STANDARD PACKAGE',
    tagline: '"Essential history and basic verification."',
    price: 39.99,
    credits: 1,
    deliveryTime: '12 HOURS',
    isPopular: false,
    features: [
      'VEHICLE SPECIFICATIONS',
      'TITLE RECORDS',
      'JUNK / SALVAGE RECORDS',
      'ACCIDENT RECORDS',
      '1 PDF DOWNLOAD'
    ]
  },
  {
    id: 'silver',
    name: 'SILVER PACKAGE',
    tagline: '"Detailed analysis with risk indicators."',
    price: 69.99,
    credits: 1,
    deliveryTime: '6 HOURS',
    isPopular: true,
    features: [
      'EVERYTHING IN STANDARD',
      'THEFT RECORDS',
      'LIEN / IMPOUND',
      'SALVAGE AUCTION RECORDS',
      '3 PDF DOWNLOADS',
      '1 AUTOMATED REPORT EMAIL'
    ]
  },
  {
    id: 'gold',
    name: 'GOLD PACKAGE',
    tagline: '"Total transparency with premium benefits."',
    price: 99.99,
    credits: 1,
    deliveryTime: '1 HOUR',
    isPopular: false,
    features: [
      'EVERYTHING IN SILVER',
      'SALE RECORDS',
      'TITLE CHECKS',
      'INSURANCE RECORDS',
      'TITLE BRAND',
      'OPEN RECALL',
      'IMPOUND RECORDS'
    ]
  }
];

export const POPULAR_SAMPLE_VINS = [
  {
    vin: 'WBACH9343YLG18917',
    label: '2000 BMW Z3 Roadster (Screenshot Spec)',
    badge: 'Popular'
  },
  {
    vin: '1FTFW1ED4MFA19823',
    label: '2021 Ford F-150 Lariat 4WD',
    badge: 'Truck'
  },
  {
    vin: '5YJ3E1EB8LF812349',
    label: '2020 Tesla Model 3 Long Range',
    badge: 'EV'
  },
  {
    vin: '4T1B11HK5JU192847',
    label: '2018 Toyota Camry SE',
    badge: 'Sedan'
  },
  {
    vin: 'WP0AA2A94KS123456',
    label: '2019 Porsche 911 Carrera S',
    badge: 'Sports'
  }
];
