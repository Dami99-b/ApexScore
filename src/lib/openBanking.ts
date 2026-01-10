// Open Banking demo utilities for ApexScore

export interface InstitutionPolicy {
  id: string;
  name: string;
  description: string;
  type: "lending" | "kyc" | "data_sharing" | "compliance";
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
  terms: string;
}

export interface DocumentRequest {
  id: string;
  requestType: "bank_statement" | "income_proof" | "identity_verification" | "credit_report" | "employment_letter";
  recipientInstitution: string;
  applicantEmail: string;
  status: "pending" | "approved" | "rejected" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  dueDate: string;
  notes?: string;
}

export interface BankingDetailForm {
  id: string;
  formName: string;
  fields: {
    name: string;
    type: "text" | "number" | "date" | "select" | "file";
    required: boolean;
    options?: string[];
  }[];
  status: "active" | "draft";
  createdAt: string;
}

export const defaultPolicies: InstitutionPolicy[] = [
  {
    id: "pol-001",
    name: "Standard Lending Policy",
    description: "Default lending criteria for personal loans",
    type: "lending",
    status: "active",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
    terms: "Applicants must have a minimum ApexScore of 60, no active defaults, and verified identity documentation. Maximum loan amount is determined by risk assessment.",
  },
  {
    id: "pol-002",
    name: "KYC Verification Standard",
    description: "Know Your Customer verification requirements",
    type: "kyc",
    status: "active",
    createdAt: "2024-02-01",
    updatedAt: "2024-05-15",
    terms: "All applicants must provide valid government-issued ID, proof of address within last 3 months, and verified phone number through SIM registration.",
  },
  {
    id: "pol-003",
    name: "Data Sharing Agreement",
    description: "Inter-institutional data sharing protocol",
    type: "data_sharing",
    status: "draft",
    createdAt: "2024-03-10",
    updatedAt: "2024-04-01",
    terms: "Data sharing with partner institutions requires explicit consent from the applicant. Shared data includes credit history, loan performance, and verification status.",
  },
];

export const defaultDocumentRequests: DocumentRequest[] = [
  {
    id: "req-001",
    requestType: "bank_statement",
    recipientInstitution: "First National Bank",
    applicantEmail: "john.doe@example.com",
    status: "pending",
    priority: "high",
    createdAt: "2024-06-25",
    dueDate: "2024-07-02",
    notes: "Requesting 6-month statement for income verification",
  },
  {
    id: "req-002",
    requestType: "credit_report",
    recipientInstitution: "Credit Bureau Central",
    applicantEmail: "jane.smith@example.com",
    status: "completed",
    priority: "medium",
    createdAt: "2024-06-20",
    dueDate: "2024-06-27",
  },
  {
    id: "req-003",
    requestType: "employment_letter",
    recipientInstitution: "TechCorp Industries",
    applicantEmail: "mike.johnson@example.com",
    status: "approved",
    priority: "low",
    createdAt: "2024-06-22",
    dueDate: "2024-07-05",
  },
];

export const defaultBankingForms: BankingDetailForm[] = [
  {
    id: "form-001",
    formName: "Income Verification Form",
    fields: [
      { name: "Monthly Salary", type: "number", required: true },
      { name: "Employer Name", type: "text", required: true },
      { name: "Employment Start Date", type: "date", required: true },
      { name: "Employment Type", type: "select", required: true, options: ["Full-time", "Part-time", "Contract", "Self-employed"] },
      { name: "Salary Slip", type: "file", required: false },
    ],
    status: "active",
    createdAt: "2024-04-01",
  },
  {
    id: "form-002",
    formName: "Asset Declaration Form",
    fields: [
      { name: "Property Value", type: "number", required: false },
      { name: "Vehicle Value", type: "number", required: false },
      { name: "Investment Portfolio", type: "number", required: false },
      { name: "Other Assets", type: "text", required: false },
    ],
    status: "active",
    createdAt: "2024-04-15",
  },
];

// Storage functions for demo
export const getPolicies = (): InstitutionPolicy[] => {
  try {
    const stored = localStorage.getItem("apexscore_policies");
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load policies:", e);
  }
  return defaultPolicies;
};

export const savePolicies = (policies: InstitutionPolicy[]): void => {
  try {
    localStorage.setItem("apexscore_policies", JSON.stringify(policies));
  } catch (e) {
    console.error("Failed to save policies:", e);
  }
};

export const getDocumentRequests = (): DocumentRequest[] => {
  try {
    const stored = localStorage.getItem("apexscore_doc_requests");
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load document requests:", e);
  }
  return defaultDocumentRequests;
};

export const saveDocumentRequests = (requests: DocumentRequest[]): void => {
  try {
    localStorage.setItem("apexscore_doc_requests", JSON.stringify(requests));
  } catch (e) {
    console.error("Failed to save document requests:", e);
  }
};

export const getBankingForms = (): BankingDetailForm[] => {
  try {
    const stored = localStorage.getItem("apexscore_banking_forms");
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load banking forms:", e);
  }
  return defaultBankingForms;
};

export const saveBankingForms = (forms: BankingDetailForm[]): void => {
  try {
    localStorage.setItem("apexscore_banking_forms", JSON.stringify(forms));
  } catch (e) {
    console.error("Failed to save banking forms:", e);
  }
};

// Demo institution list
export const partnerInstitutions = [
  "First National Bank",
  "Credit Bureau Central",
  "TechCorp Industries",
  "Global Finance Ltd",
  "Metro Credit Union",
  "Unity Bank",
  "Premier Lending Co",
  "Eastern Trust Bank",
];
