export interface VehicleSpecs {
  vin: string;
  year: number | string;
  make: string;
  model: string;
  manufacturer: string;
  plantCountry: string;
  engineDisplacement: string;
  engineCylinders: string | number;
  transmission: string;
  bodyClass: string;
  fuelType: string;
  driveType: string;
  trim?: string;
  doors?: string | number;
}

export type IndicatorStatus = 'verified' | 'locked' | 'passed' | 'warning' | 'clean' | 'issue';

export interface StatusIndicator {
  id: string;
  title: string;
  displayTitle: string;
  status: IndicatorStatus;
  statusText: string;
  isLocked: boolean;
  icon: string;
  details?: string;
  badgeType?: 'green' | 'yellow' | 'red' | 'blue';
}

export interface TitleRecord {
  date: string;
  state: string;
  mileage: number;
  event: string;
  brand: 'CLEAN' | 'SALVAGE' | 'REBUILT' | 'FLOOD' | 'EXEMPT';
}

export interface AccidentRecord {
  date: string;
  location: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  impactArea: string;
  airbagDeployed: boolean;
  structuralDamage: boolean;
  details: string;
}

export interface OdometerReading {
  date: string;
  source: string;
  mileage: number;
  status: 'Consistent' | 'Flagged';
}

export interface OwnershipRecord {
  ownerNumber: number;
  purchasedYear: number;
  ownershipType: 'Personal' | 'Commercial' | 'Lease' | 'Fleet';
  estimatedDuration: string;
  location: string;
  estimatedMilesPerYear: number;
}

export interface FullVehicleReport {
  specs: VehicleSpecs;
  recordsFoundCount: number;
  lastReportedDate: string;
  overallScore: number;
  indicators: StatusIndicator[];
  titleRecords: TitleRecord[];
  accidents: AccidentRecord[];
  odometerHistory: OdometerReading[];
  ownershipHistory: OwnershipRecord[];
  lienStatus: {
    hasActiveLien: boolean;
    recordsCount: number;
    details: string;
  };
  theftStatus: {
    isStolen: boolean;
    recordsCount: number;
    details: string;
  };
  recalls: {
    count: number;
    items: Array<{
      campaignNumber: string;
      component: string;
      summary: string;
      consequence: string;
      remedy: string;
    }>;
  };
  marketValue: {
    estimatedLow: number;
    estimatedBase: number;
    estimatedHigh: number;
    tradeInValue: number;
    confidence: 'HIGH' | 'MEDIUM';
  };
  rawNhtsaData?: Record<string, any> | null;
}

export type ReportPlanId = 'standard' | 'silver' | 'dealer' | 'gold' | string;

export interface ReportPlan {
  id: ReportPlanId;
  name: string;
  tagline: string;
  price: number;
  credits: number;
  deliveryTime: string;
  isPopular?: boolean;
  features: string[];
}
