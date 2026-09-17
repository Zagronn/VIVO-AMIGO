export interface EcosystemProjection24M {
  projectedGMV: number;
  projectedNetRevenue: number;
  activeUsers: number;
  fleetSize: number;
  companyValuationMin: number;
  companyValuationMax: number;
}

const ANNUAL_GMV_USD = 200_000_000;
const AVERAGE_COMMISSION_RATE = 0.035;
const ADDITIONAL_NET_REVENUE_USD = 5_000_000;
const VALUATION_MULTIPLE_MIN = 8;
const VALUATION_MULTIPLE_MAX = 10;
const PROJECTED_FLEET_SIZE = 750;

export function calculate24MonthValuation(baseUsers = 1_000_000): EcosystemProjection24M {
  if (!Number.isInteger(baseUsers) || baseUsers < 0) throw new Error('baseUsers must be a non-negative integer');
  const projectedNetRevenue = ANNUAL_GMV_USD * AVERAGE_COMMISSION_RATE + ADDITIONAL_NET_REVENUE_USD;
  return {
    projectedGMV: ANNUAL_GMV_USD,
    projectedNetRevenue,
    activeUsers: baseUsers,
    fleetSize: PROJECTED_FLEET_SIZE,
    companyValuationMin: projectedNetRevenue * VALUATION_MULTIPLE_MIN,
    companyValuationMax: projectedNetRevenue * VALUATION_MULTIPLE_MAX
  };
}
