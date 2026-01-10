// ApexScore API Service
const API_BASE = "https://apexscore.onrender.com";

export interface ApplicantName {
  first: string;
  middle: string;
  last: string;
  full: string;
}

export interface Location {
  city: string;
  country: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Network {
  isp: string;
  ip_address: string;
  ip_location: string;
  ip_matches_declared_address: boolean;
}

export interface ActivityLog {
  last_email_login: string;
  last_sim_activity: string;
  email_sim_sync: boolean;
}

export interface DeviceFingerprint {
  device_id: string;
  device_type: string;
  model: string;
  os_version: string;
  is_rooted: boolean;
  vpn_detected: boolean;
}

export interface BankAccount {
  bank_name: string;
  account_number: string;
  account_type: string;
  status: string;
}

export interface LoanHistory {
  loan_id: string;
  institution: string;
  amount: number;
  currency: string;
  currency_symbol: string;
  purpose: string;
  disbursement_date: string;
  due_date: string;
  status: string;
  days_overdue: number | null;
  repayment_amount: number | null;
}

export interface TFD {
  currency: string;
  currency_symbol: string;
  outstanding_debt: number;
  loan_history: LoanHistory[];
}

export interface BSI {
  location_consistency: number;
  device_stability: number;
  sim_changes: number;
  ip_region_match: number;
  travel_frequency: number;
}

// AI Recommendation from API
export interface ActionRecommendation {
  decision: string;
  recommended_loan_amount: number;
  max_loan_amount: number;
  interest_rate_range: string;
  repayment_period: string;
  reasoning: string[];
  conditions: string[];
}

export interface Applicant {
  id: string;
  email: string;
  name: ApplicantName;
  phone: string;
  occupation: string;
  location: Location;
  network: Network;
  sim_registration: string;
  activity_log: ActivityLog;
  device_fingerprint: DeviceFingerprint;
  bank_accounts: BankAccount[];
  tfd: TFD;
  bsi: BSI;
  apex_score: number;
  risk_level: "Low" | "Medium" | "High";
  action_recommendation: ActionRecommendation;
  created_at: string;
}

export const api = {
  async searchByEmail(email: string): Promise<Applicant> {
    const response = await fetch(`${API_BASE}/api/search?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error("Failed to search applicant");
    }
    return response.json();
  },

  async getApplicant(id: string): Promise<Applicant | null> {
    const response = await fetch(`${API_BASE}/api/applicant/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  },

  async listApplicants(limit: number = 50): Promise<{ applicants: Applicant[] }> {
    const response = await fetch(`${API_BASE}/api/applicants?limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to list applicants");
    }
    return response.json();
  },

  async getStats(): Promise<{
    total_applicants: number;
    active_defaults: number;
    high_risk_percentage: string;
  }> {
    const response = await fetch(`${API_BASE}/api/stats`);
    if (!response.ok) {
      throw new Error("Failed to get stats");
    }
    return response.json();
  },
};

// User session management (using localStorage for persistence)
export interface User {
  email: string;
  name: string;
  picture?: string;
  firstName?: string;
  lastName?: string;
  workEmail?: string;
  department?: string;
  institution?: string;
  position?: string;
}

const STORAGE_KEYS = {
  USER: "apexscore_user",
  HISTORY: "apexscore_history",
} as const;

// Renamed to avoid conflict with browser's sessionStorage
export const authStore = {
  getUser(): User | null {
    try {
      const user = window.localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    try {
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save user:", e);
    }
  },

  clearUser(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error("Failed to clear user:", e);
    }
  },

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  },
};

export const historyStore = {
  getSearchHistory(): Applicant[] {
    try {
      const history = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  },

  addToSearchHistory(applicant: Applicant): void {
    try {
      const history = this.getSearchHistory();
      // Remove duplicate if exists
      const filtered = history.filter(a => a.email !== applicant.email);
      // Add to beginning
      filtered.unshift(applicant);
      // Keep only last 100
      window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered.slice(0, 100)));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  },

  clearSearchHistory(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  },
};

// Keep for backwards compatibility but prefer authStore/historyStore
export const sessionStorage = {
  getUser: () => authStore.getUser(),
  setUser: (user: User) => authStore.setUser(user),
  clearUser: () => authStore.clearUser(),
  getSearchHistory: () => historyStore.getSearchHistory(),
  addToSearchHistory: (applicant: Applicant) => historyStore.addToSearchHistory(applicant),
  clearSearchHistory: () => historyStore.clearSearchHistory(),
};
