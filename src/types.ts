export type EntityCode = 'ALPHA' | 'BETA' | 'GAMMA';

export interface SystemState {
  entityCode: EntityCode;
  timestamp: string;
  marketVolatility: number; // 0.05 to 0.80
  fxRates: Record<string, number>; // Base INR: USD, EUR, GBP
  kpis: {
    totalCash: number;
    availableLiquidity: number;
    totalCollateral: number;
    availableCollateral: number;
    requiredCcpMargin: number;
    lcr: number;
    crr: number;
    slr: number;
    fxExposure: number;
    atRiskSettlementsCount: number;
    predictedFailuresCount: number;
    projectedOptimizationSavings: number;
    systemicRiskScore: number;
    systemicRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  };
  accounts: AccountItem[];
  collateral: CollateralItem[];
  settlements: SettlementItem[];
  recommendations: RecommendationItem[];
  paymentRails: RailItem[];
  auditLogs: AuditLogItem[];
  tenantSettings: TenantConfig;
}

export interface AccountItem {
  id: string;
  name: string;
  accountNumber: string;
  currency: string;
  cashBalance: number;
  availableBalance: number;
  reservedBalance: number;
  minRequiredBalance: number;
  status: 'ACTIVE' | 'RESTRICTED' | 'FLAGGED';
  lastUpdated: string;
}

export interface CollateralItem {
  id: string;
  assetIdentifier: string;
  name: string;
  type: 'GOVERNMENT_SECURITIES' | 'CORPORATE_BONDS' | 'CASH' | 'EQUITIES' | 'FIXED_INCOME';
  currency: string;
  marketValue: number;
  quantity: number;
  baseHaircut: number;
  effectiveHaircut: number;
  adjustedValue: number;
  eligibleCCPs: string[];
  pledgedValue: number;
  availableValue: number;
  maturityDate: string;
  creditRating: string;
}

export interface SettlementItem {
  id: string;
  referenceNumber: string;
  sourceAccountId: string;
  sourceAccountName: string;
  destAccountId: string;
  destAccountName: string;
  amount: number;
  currency: string;
  rail: 'RTGS' | 'NEFT' | 'IMPS' | 'INTERNAL_TRANSFER';
  createdAt: string;
  expectedSettlement: string;
  cutoffTime: string;
  latencyMs: number;
  status: 'INITIATED' | 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'FAILED';
  failureProbability: number;
  timeRemainingSeconds: number;
}

export interface RecommendationItem {
  id: string;
  actionType: 'TRANSFER_CASH' | 'SUBSTITUTE_COLLATERAL' | 'REROUTE_PAYMENT' | 'EXECUTE_REPO';
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  amount: number;
  currency: string;
  assetName: string;
  expectedCost: number;
  riskReductionAmount: number;
  cutoffTime: string;
  confidence: number;
  reason: string;
  whyExplanation: string;
  consequenceIfIgnored: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
}

export interface RailItem {
  name: 'RTGS' | 'NEFT' | 'IMPS' | 'INTERNAL_TRANSFER';
  avgLatencyMs: number;
  latencyVarianceMs: number;
  capacityUtilization: number;
  operatingStatus: 'NORMAL' | 'DEGRADED' | 'OUTAGE';
  failureRate: number;
}

export interface AuditLogItem {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
  status?: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface TenantConfig {
  minCrrThreshold: number;
  minSlrThreshold: number;
  minLcrThreshold: number;
  simulationSpeedMs: number;
  autoOptimization: boolean;
  ndtlAmount: number;
  net30DayOutflow: number;
}

export interface StressScenarioResult {
  scenarioName: string;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  cashImpactAmount: number;
  collateralDevaluation: number;
  postStressLcr: number;
  postStressCrr: number;
  marginShortfall: number;
  predictedSettlementFailures: number;
  affectedCounterparties: string[];
  estimatedRecoveryMinutes: number;
  systemicPropagationChain: string[];
}

export interface FXConversionQuote {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  convertedAmount: number;
  fxRate: number;
  spreadAmount: number;
  operationalFee: number;
  netReceived: number;
}
