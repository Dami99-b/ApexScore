// Risk calculation utilities for ApexScore

import { Applicant } from "./api";

export interface RiskSettings {
  // Thresholds
  minAcceptableScore: number;
  maxDebtToIncomeRatio: number;
  maxOutstandingDebt: number;
  
  // Score weights (must sum to 100)
  locationWeight: number;
  deviceWeight: number;
  financialWeight: number;
  behavioralWeight: number;
  
  // Risk factors
  vpnPenalty: number;
  rootedDevicePenalty: number;
  unverifiedSimPenalty: number;
  locationMismatchPenalty: number;
  
  // Lending limits
  maxLoanAmount: number;
  baseInterestRate: number;
}

export const defaultRiskSettings: RiskSettings = {
  minAcceptableScore: 50,
  maxDebtToIncomeRatio: 0.4,
  maxOutstandingDebt: 500000,
  
  locationWeight: 20,
  deviceWeight: 15,
  financialWeight: 45,
  behavioralWeight: 20,
  
  vpnPenalty: 10,
  rootedDevicePenalty: 15,
  unverifiedSimPenalty: 8,
  locationMismatchPenalty: 12,
  
  maxLoanAmount: 5000000,
  baseInterestRate: 12,
};

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  factors: {
    name: string;
    impact: "positive" | "negative" | "neutral";
    value: string;
    points: number;
  }[];
}

export interface SafeBorrowingRecommendation {
  recommendedAmount: number;
  maxAmount: number;
  interestRate: number;
  monthlyPayment: number;
  riskAdjustedLimit: number;
  confidence: "high" | "medium" | "low";
  reasoning: string[];
}

// Calculate score breakdown with explanations
export const calculateScoreBreakdown = (
  applicant: Applicant,
  settings: RiskSettings = defaultRiskSettings
): ScoreBreakdown[] => {
  const breakdowns: ScoreBreakdown[] = [];

  // 1. Location & Identity Verification
  const locationFactors: ScoreBreakdown["factors"] = [];
  let locationScore = settings.locationWeight;

  if (applicant.sim_registration === "VERIFIED") {
    locationFactors.push({
      name: "SIM Registration",
      impact: "positive",
      value: "Verified",
      points: 5,
    });
  } else {
    locationScore -= settings.unverifiedSimPenalty;
    locationFactors.push({
      name: "SIM Registration",
      impact: "negative",
      value: "Unverified",
      points: -settings.unverifiedSimPenalty,
    });
  }

  if (applicant.device_fingerprint.vpn_detected) {
    locationScore -= settings.vpnPenalty;
    locationFactors.push({
      name: "VPN Usage",
      impact: "negative",
      value: "Detected",
      points: -settings.vpnPenalty,
    });
  } else {
    locationFactors.push({
      name: "VPN Usage",
      impact: "positive",
      value: "Not Detected",
      points: 3,
    });
  }

  locationFactors.push({
    name: "Location Consistency",
    impact: applicant.bsi.location_consistency >= 70 ? "positive" : applicant.bsi.location_consistency >= 50 ? "neutral" : "negative",
    value: `${applicant.bsi.location_consistency}%`,
    points: Math.round((applicant.bsi.location_consistency / 100) * 5),
  });

  breakdowns.push({
    category: "Location & Identity",
    score: Math.max(0, locationScore),
    maxScore: settings.locationWeight,
    factors: locationFactors,
  });

  // 2. Device Security
  const deviceFactors: ScoreBreakdown["factors"] = [];
  let deviceScore = settings.deviceWeight;

  if (applicant.device_fingerprint.is_rooted) {
    deviceScore -= settings.rootedDevicePenalty;
    deviceFactors.push({
      name: "Device Security",
      impact: "negative",
      value: "Rooted/Jailbroken",
      points: -settings.rootedDevicePenalty,
    });
  } else {
    deviceFactors.push({
      name: "Device Security",
      impact: "positive",
      value: "Secure",
      points: 5,
    });
  }

  deviceFactors.push({
    name: "Device Stability",
    impact: applicant.bsi.device_stability >= 70 ? "positive" : applicant.bsi.device_stability >= 50 ? "neutral" : "negative",
    value: `${applicant.bsi.device_stability}%`,
    points: Math.round((applicant.bsi.device_stability / 100) * 5),
  });

  deviceFactors.push({
    name: "SIM Stability",
    impact: applicant.bsi.sim_changes >= 70 ? "positive" : applicant.bsi.sim_changes >= 50 ? "neutral" : "negative",
    value: `${applicant.bsi.sim_changes}%`,
    points: Math.round((applicant.bsi.sim_changes / 100) * 3),
  });

  breakdowns.push({
    category: "Device Security",
    score: Math.max(0, deviceScore),
    maxScore: settings.deviceWeight,
    factors: deviceFactors,
  });

  // 3. Financial History
  const financialFactors: ScoreBreakdown["factors"] = [];
  let financialScore = settings.financialWeight;

  // Loan history analysis
  const totalLoans = applicant.tfd.loan_history.length;
  const paidOnTime = applicant.tfd.loan_history.filter(l => l.status === "Paid On Time" || l.status === "Paid Early").length;
  const defaulted = applicant.tfd.loan_history.filter(l => l.status === "Defaulted").length;
  const repaymentRate = totalLoans > 0 ? (paidOnTime / totalLoans) * 100 : 0;

  if (totalLoans > 0) {
    financialFactors.push({
      name: "Repayment History",
      impact: repaymentRate >= 80 ? "positive" : repaymentRate >= 50 ? "neutral" : "negative",
      value: `${paidOnTime}/${totalLoans} on time (${repaymentRate.toFixed(0)}%)`,
      points: Math.round((repaymentRate / 100) * 20),
    });

    if (defaulted > 0) {
      const defaultPenalty = defaulted * 10;
      financialScore -= defaultPenalty;
      financialFactors.push({
        name: "Defaults",
        impact: "negative",
        value: `${defaulted} loan(s) defaulted`,
        points: -defaultPenalty,
      });
    }
  } else {
    financialFactors.push({
      name: "Credit History",
      impact: "neutral",
      value: "No previous loans",
      points: 0,
    });
  }

  // Outstanding debt
  const debtLevel = applicant.tfd.outstanding_debt;
  if (debtLevel > settings.maxOutstandingDebt) {
    financialScore -= 15;
    financialFactors.push({
      name: "Outstanding Debt",
      impact: "negative",
      value: `${applicant.tfd.currency_symbol}${debtLevel.toLocaleString()} (High)`,
      points: -15,
    });
  } else if (debtLevel > settings.maxOutstandingDebt * 0.5) {
    financialScore -= 5;
    financialFactors.push({
      name: "Outstanding Debt",
      impact: "neutral",
      value: `${applicant.tfd.currency_symbol}${debtLevel.toLocaleString()} (Moderate)`,
      points: -5,
    });
  } else {
    financialFactors.push({
      name: "Outstanding Debt",
      impact: "positive",
      value: `${applicant.tfd.currency_symbol}${debtLevel.toLocaleString()} (Low)`,
      points: 10,
    });
  }

  // Bank accounts
  const activeAccounts = applicant.bank_accounts.filter(a => a.status === "Active").length;
  financialFactors.push({
    name: "Bank Accounts",
    impact: activeAccounts >= 2 ? "positive" : activeAccounts === 1 ? "neutral" : "negative",
    value: `${activeAccounts} active account(s)`,
    points: activeAccounts >= 2 ? 5 : activeAccounts === 1 ? 2 : -3,
  });

  breakdowns.push({
    category: "Financial History",
    score: Math.max(0, Math.min(financialScore, settings.financialWeight)),
    maxScore: settings.financialWeight,
    factors: financialFactors,
  });

  // 4. Behavioral Patterns
  const behavioralFactors: ScoreBreakdown["factors"] = [];
  const avgBsi = (applicant.bsi.location_consistency + applicant.bsi.device_stability + applicant.bsi.sim_changes) / 3;
  let behavioralScore = Math.round((avgBsi / 100) * settings.behavioralWeight);

  behavioralFactors.push({
    name: "Overall Stability",
    impact: avgBsi >= 70 ? "positive" : avgBsi >= 50 ? "neutral" : "negative",
    value: `${avgBsi.toFixed(0)}% average BSI`,
    points: behavioralScore,
  });

  breakdowns.push({
    category: "Behavioral Stability",
    score: behavioralScore,
    maxScore: settings.behavioralWeight,
    factors: behavioralFactors,
  });

  return breakdowns;
};

// Calculate safe borrowing amount
export const calculateSafeBorrowingAmount = (
  applicant: Applicant,
  settings: RiskSettings = defaultRiskSettings
): SafeBorrowingRecommendation => {
  const score = applicant.apex_score;
  const reasoning: string[] = [];

  // Base calculation from score
  const scoreMultiplier = score / 100;
  let baseAmount = settings.maxLoanAmount * scoreMultiplier;

  // Adjust for risk level
  if (applicant.risk_level === "High") {
    baseAmount *= 0.3;
    reasoning.push("High risk profile limits maximum borrowing capacity to 30%");
  } else if (applicant.risk_level === "Medium") {
    baseAmount *= 0.6;
    reasoning.push("Medium risk profile limits borrowing capacity to 60%");
  } else {
    reasoning.push("Low risk profile qualifies for full borrowing capacity");
  }

  // Adjust for outstanding debt
  const debtAdjustment = Math.max(0, 1 - (applicant.tfd.outstanding_debt / settings.maxOutstandingDebt));
  baseAmount *= debtAdjustment;
  if (debtAdjustment < 1) {
    reasoning.push(`Existing debt of ${applicant.tfd.currency_symbol}${applicant.tfd.outstanding_debt.toLocaleString()} reduces capacity by ${((1 - debtAdjustment) * 100).toFixed(0)}%`);
  }

  // Adjust for repayment history
  const paidOnTime = applicant.tfd.loan_history.filter(l => l.status === "Paid On Time" || l.status === "Paid Early").length;
  const totalLoans = applicant.tfd.loan_history.length;
  if (totalLoans > 0) {
    const repaymentRate = paidOnTime / totalLoans;
    if (repaymentRate >= 0.8) {
      baseAmount *= 1.2;
      reasoning.push("Excellent repayment history adds 20% bonus to limit");
    } else if (repaymentRate < 0.5) {
      baseAmount *= 0.7;
      reasoning.push("Poor repayment history reduces limit by 30%");
    }
  } else {
    baseAmount *= 0.8;
    reasoning.push("No credit history - starting with 80% of calculated limit");
  }

  // Calculate interest rate based on risk
  let interestRate = settings.baseInterestRate;
  if (applicant.risk_level === "High") {
    interestRate += 8;
    reasoning.push("Higher interest rate (+8%) due to elevated risk");
  } else if (applicant.risk_level === "Medium") {
    interestRate += 4;
    reasoning.push("Moderate interest rate (+4%) due to medium risk");
  }

  // Round to nearest 1000
  const recommendedAmount = Math.round(baseAmount / 1000) * 1000;
  const maxAmount = Math.round((recommendedAmount * 1.5) / 1000) * 1000;

  // Calculate monthly payment (12-month term)
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = (recommendedAmount * monthlyRate * Math.pow(1 + monthlyRate, 12)) / (Math.pow(1 + monthlyRate, 12) - 1);

  // Determine confidence
  let confidence: SafeBorrowingRecommendation["confidence"] = "medium";
  if (score >= 70 && totalLoans >= 2 && paidOnTime >= totalLoans * 0.8) {
    confidence = "high";
  } else if (score < 50 || (totalLoans > 0 && paidOnTime < totalLoans * 0.5)) {
    confidence = "low";
  }

  return {
    recommendedAmount: Math.max(0, recommendedAmount),
    maxAmount: Math.max(0, maxAmount),
    interestRate,
    monthlyPayment: Math.round(monthlyPayment),
    riskAdjustedLimit: Math.round(baseAmount),
    confidence,
    reasoning,
  };
};

// Get risk settings from localStorage (demo purposes)
export const getRiskSettings = (): RiskSettings => {
  try {
    const stored = localStorage.getItem("apexscore_risk_settings");
    if (stored) {
      return { ...defaultRiskSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load risk settings:", e);
  }
  return defaultRiskSettings;
};

// Save risk settings to localStorage (demo purposes)
export const saveRiskSettings = (settings: RiskSettings): void => {
  try {
    localStorage.setItem("apexscore_risk_settings", JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save risk settings:", e);
  }
};
