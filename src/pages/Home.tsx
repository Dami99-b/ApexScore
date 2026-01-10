import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  User,
  LogOut,
  Search,
  Send,
  ChevronRight,
  Loader2,
  Menu,
  Info,
  FileText,
  History,
  MessageCircle,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, Applicant } from "@/lib/api";
import ApplicantDetail from "@/components/dashboard/ApplicantDetail";
import { useAuth } from "@/hooks/useAuth";
import { useSearchHistory } from "@/hooks/useSearchHistory";


const Home = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const { addToHistory } = useSearchHistory();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; applicant?: Applicant; timestamp: Date }[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm your ApexScore AI assistant. Enter an email address to analyze a loan applicant's risk profile.",
      timestamp: new Date()
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apexscore_theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('apexscore_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('apexscore_theme', 'light');
    }
  }, [isDark]);

  // Extract email from any input text
  const extractEmail = (text: string): string | null => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailRegex);
    return match ? match[0].toLowerCase() : null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setChatMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setInputMessage("");
    setIsLoading(true);

    const email = extractEmail(userMessage);
    
    if (email) {
      try {
        const applicant = await api.searchByEmail(email);
        
        addToHistory(applicant);

        const response = `Risk Assessment Complete for ${applicant.name.full}

Overall Risk Score: ${applicant.apex_score}/100 (${applicant.risk_level} Risk)
Location: ${applicant.location.city}, ${applicant.location.country}
IP Match: ${applicant.network.ip_matches_declared_address ? "Matches declared location" : "Location mismatch detected"}
VPN Status: ${applicant.device_fingerprint.vpn_detected ? "VPN Detected" : "No VPN"}
SIM Registration: ${applicant.sim_registration === "VERIFIED" ? "Verified" : "Unverified"}
Previous Loans: ${applicant.tfd.loan_history.length} loans on record
Outstanding Debt: ${applicant.tfd.currency_symbol}${applicant.tfd.outstanding_debt.toLocaleString()}

Decision: ${applicant.action_recommendation.decision}

Click "View Details" to see the full profile.`;

        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          content: response,
          applicant,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error("Search error:", error);
        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Failed to fetch applicant data. Please try again.",
          timestamp: new Date()
        }]);
      }
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          content: "I can help you analyze loan applicants. Simply enter an email address to get a comprehensive risk assessment.",
          timestamp: new Date()
        }]);
        setIsLoading(false);
      }, 500);
      return;
    }
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.info("Logged out successfully");
    navigate("/");
  };

  const marqueeItems = [
    "Real-time fraud detection",
    "AI-powered risk scoring",
    "Identity verification",
    "Bank account analysis",
    "Device fingerprinting",
    "Location verification",
    "Loan history tracking",
    "Behavioral analytics",
  ];

  return (
    <>
      <Helmet>
        <title>Home - ApexScore</title>
        <meta name="description" content="ApexScore Dashboard - AI-powered loan risk assessment platform" />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Banking pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Apex<span className="gradient-text">Score</span>
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                  <History className="w-4 h-4" />
                  History
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user && (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-foreground">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setIsDark(!isDark)} className="sm:hidden cursor-pointer">
                    {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <History className="w-4 h-4" />
                      Search History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Admin Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Marquee */}
        <div className="fixed top-16 left-0 right-0 z-40 bg-primary/10 border-b border-primary/20 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-2">
            {[...marqueeItems, ...marqueeItems].map((item, idx) => (
              <span key={idx} className="mx-8 text-sm text-primary font-medium flex items-center gap-2">
                <Shield className="w-3 h-3" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="pt-32 pb-32">
          <div className="container mx-auto px-4">
            {/* Welcome section */}
            <section className="text-center mb-12 sm:mb-16">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}!
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Use the AI chat to search for loan applicants by email and get instant risk assessments.
              </p>
            </section>

            {/* About ApexScore section */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
              <div className="glass-card p-5 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-foreground mb-2">
                  AI-Powered Risk Assessment
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Our advanced AI analyzes multiple data points to provide accurate risk scores for loan applicants.
                </p>
              </div>

              <div className="glass-card p-5 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Info className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-foreground mb-2">
                  Identity Verification
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Verify applicant identities through multiple sources including IP analysis and device fingerprinting.
                </p>
              </div>

              <div className="glass-card p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center mb-3 sm:mb-4">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-foreground mb-2">
                  Comprehensive Reports
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Generate detailed reports with loan history, behavioral stability index, and action recommendations.
                </p>
              </div>
            </section>

            {/* Quick stats */}
            <section className="glass-card p-6 sm:p-8 text-center">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">
                How to Use ApexScore
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="font-display font-bold text-primary text-lg sm:text-xl">1</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Open AI Chat</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Click the floating chat bubble in the bottom right corner
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="font-display font-bold text-primary text-lg sm:text-xl">2</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Enter Email</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Type the applicant's email address to search
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="font-display font-bold text-primary text-lg sm:text-xl">3</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Get Results</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive instant risk assessment and detailed profile
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Floating AI Chat Bubble */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center z-50 group"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground group-hover:scale-110 transition-transform" />
        </button>

        {/* Chat Dialog - Full screen on mobile */}
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="w-full max-w-lg h-[100dvh] sm:h-[600px] flex flex-col p-0 gap-0 sm:rounded-lg rounded-none">
            <DialogHeader className="p-4 border-b border-border flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                ApexScore AI
              </DialogTitle>
            </DialogHeader>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-2 ${msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.applicant && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => {
                          setSelectedApplicant(msg.applicant!);
                          setIsChatOpen(false);
                        }}
                      >
                        View Full Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter email address..."
                    className="pl-10"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  variant="hero" 
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Applicant Detail Modal - Full screen */}
        <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
          <DialogContent className="w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden p-0 sm:rounded-lg rounded-none">
            <DialogHeader className="p-4 border-b border-border">
              <DialogTitle>Applicant Profile</DialogTitle>
            </DialogHeader>
            <div className="p-4 overflow-auto">
              {selectedApplicant && <ApplicantDetail applicant={selectedApplicant} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Home;
