import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Settings, 
  FileText, 
  Send, 
  FormInput,
  Shield,
  ArrowLeft,
  Lock,
  Building2,
  Key,
  AlertTriangle,
  Eye,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  // Risk Rules State (read-only demo values)
  const [minScore] = useState(35);
  const [maxDebt] = useState(500000);
  const [maxLoan] = useState(5000000);
  const [baseInterest] = useState(12);
  
  // Risk Penalties State
  const [vpnPenalty] = useState(-21);
  const [rootedPenalty] = useState(-15);
  const [unverifiedSimPenalty] = useState(-8);
  const [locationPenalty] = useState(-12);
  
  // Score Category Weights
  const [locationWeight] = useState(20);
  const [deviceWeight] = useState(15);
  const [financialWeight] = useState(45);
  const [behavioralWeight] = useState(20);

  // Policies Data
  const policies = [
    {
      name: "Standard Lending Policy",
      status: "active",
      type: "lending",
      description: "Default lending criteria for personal loans",
      updatedAt: "2024-06-20",
      details: "Applicants must have a minimum ApexScore of 60, no active defaults, and verified identity documentation. Maximum loan amount is determined by risk assessment."
    },
    {
      name: "KYC Verification Standard",
      status: "active",
      type: "kyc",
      description: "Know Your Customer verification requirements",
      updatedAt: "2024-05-15",
      details: "All applicants must provide valid government-issued ID, proof of address within last 3 months, and verified phone number through SIM registration."
    },
    {
      name: "Data Sharing Agreement",
      status: "draft",
      type: "data_sharing",
      description: "Inter-institutional data sharing protocol",
      updatedAt: "2024-04-01",
      details: "Data sharing with partner institutions requires explicit consent from the applicant. Shared data includes credit history, loan performance, and verification status."
    }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const totalWeight = locationWeight + deviceWeight + financialWeight + behavioralWeight;

  return (
    <>
      <Helmet>
        <title>Admin Settings - ApexScore</title>
        <meta name="description" content="Institution settings and Open Banking administration" />
      </Helmet>

      {/* Light theme for admin area matching screenshots */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg text-gray-900">Admin Console</h1>
                  <p className="text-xs text-gray-500">Secure Institution Configuration</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-50">
                <Eye className="w-3 h-3 mr-1" />
                Demo Mode
              </Badge>
              <Badge variant="outline" className="border-gray-300 text-gray-500">
                <Lock className="w-3 h-3 mr-1" />
                Read Only
              </Badge>
            </div>
          </div>
        </header>

        {/* Security Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-700">
                  <span className="font-semibold">Demo Mode Active</span> — This is a preview of the Admin Console. 
                  Financial institutions will require a unique product key to access and configure these features.
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="risk-rules" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white border border-gray-200">
              <TabsTrigger value="risk-rules" className="flex items-center gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Risk Rules</span>
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Policies</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
              </TabsTrigger>
              <TabsTrigger value="forms" className="flex items-center gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500">
                <FormInput className="w-4 h-4" />
                <span className="hidden sm:inline">Forms</span>
              </TabsTrigger>
            </TabsList>

            {/* Risk Rules Tab */}
            <TabsContent value="risk-rules" className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-teal-500" />
                  Custom Risk Rules
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Thresholds */}
                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900">Thresholds</h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Minimum Acceptable Score</label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[minScore]} 
                          max={100} 
                          step={1} 
                          className="flex-1"
                          disabled
                        />
                        <span className="text-sm font-medium text-gray-900 w-8">{minScore}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Max Outstanding Debt (500,000)</label>
                      <Input 
                        type="text" 
                        value={maxDebt.toLocaleString()} 
                        disabled 
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Max Loan Amount (5,000,000)</label>
                      <Input 
                        type="text" 
                        value={maxLoan.toLocaleString()} 
                        disabled 
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Base Interest Rate (%)</label>
                      <Input 
                        type="text" 
                        value={baseInterest} 
                        disabled 
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>

                  {/* Risk Penalties */}
                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900">Risk Penalties</h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">VPN Detected Penalty</label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[Math.abs(vpnPenalty)]} 
                          max={30} 
                          step={1} 
                          className="flex-1"
                          disabled
                        />
                        <span className="text-sm font-medium text-gray-900 w-8">{vpnPenalty}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Rooted Device Penalty</label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[Math.abs(rootedPenalty)]} 
                          max={30} 
                          step={1} 
                          className="flex-1"
                          disabled
                        />
                        <span className="text-sm font-medium text-gray-900 w-8">{rootedPenalty}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Unverified SIM Penalty</label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[Math.abs(unverifiedSimPenalty)]} 
                          max={30} 
                          step={1} 
                          className="flex-1"
                          disabled
                        />
                        <span className="text-sm font-medium text-gray-900 w-8">{unverifiedSimPenalty}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Location Mismatch Penalty</label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[Math.abs(locationPenalty)]} 
                          max={30} 
                          step={1} 
                          className="flex-1"
                          disabled
                        />
                        <span className="text-sm font-medium text-gray-900 w-8">{locationPenalty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Category Weights */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Score Category Weights (must sum to 100)</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Location ({locationWeight}%)</label>
                      <Slider 
                        value={[locationWeight]} 
                        max={100} 
                        step={5} 
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Device ({deviceWeight}%)</label>
                      <Slider 
                        value={[deviceWeight]} 
                        max={100} 
                        step={5} 
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Financial ({financialWeight}%)</label>
                      <Slider 
                        value={[financialWeight]} 
                        max={100} 
                        step={5} 
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Behavioral ({behavioralWeight}%)</label>
                      <Slider 
                        value={[behavioralWeight]} 
                        max={100} 
                        step={5} 
                        disabled
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">Total: {totalWeight}%</p>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white" disabled>
                    Save Risk Settings
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-gray-900">Institution Policies</h2>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white" disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Policy
                  </Button>
                </div>

                <div className="space-y-4">
                  {policies.map((policy, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                              <Badge 
                                variant="outline" 
                                className={policy.status === "active" 
                                  ? "border-green-300 text-green-700 bg-green-50" 
                                  : "border-gray-300 text-gray-600 bg-gray-50"
                                }
                              >
                                {policy.status}
                              </Badge>
                              <Badge variant="outline" className="border-gray-300 text-gray-600">
                                {policy.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{policy.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Updated: {policy.updatedAt}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600" disabled>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" disabled>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">{policy.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-teal-500" />
                  Open Banking Requests
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                  Request banking details, statements, and documents from partner institutions securely.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "GTBank", type: "Bank Statement", status: "Pending" },
                    { name: "Access Bank", type: "Transaction History", status: "Completed" },
                    { name: "First Bank", type: "Account Verification", status: "In Progress" },
                  ].map((req, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{req.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">{req.type}</p>
                      <Badge 
                        variant="outline" 
                        className={
                          req.status === "Completed" 
                            ? "mt-2 border-green-300 text-green-700 bg-green-50" 
                            : req.status === "In Progress"
                            ? "mt-2 border-blue-300 text-blue-700 bg-blue-50"
                            : "mt-2 border-amber-300 text-amber-700 bg-amber-50"
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Forms Tab */}
            <TabsContent value="forms" className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FormInput className="w-5 h-5 text-teal-500" />
                  Custom Banking Forms
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                  Create and manage custom forms for collecting applicant information and documents.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Loan Application Form", "KYC Verification", "Income Declaration", "Collateral Details", "Guarantor Information"].map((form, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <FormInput className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{form}</p>
                      <p className="text-xs text-gray-500 mt-1">Template</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Product Key CTA */}
          <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Key className="w-7 h-7 text-teal-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display font-bold text-gray-900 mb-1">Unlock Full Admin Access</h3>
                <p className="text-sm text-gray-600">
                  Financial institutions can request a product key to configure risk rules, policies, and enable open banking features.
                </p>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Request Product Key
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminSettings;