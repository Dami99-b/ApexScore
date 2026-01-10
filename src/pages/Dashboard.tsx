import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  History,
  Download,
  User,
  LogOut,
  Search,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, Applicant } from "@/lib/api";
import { exportApplicantToPDF } from "@/lib/pdfExport";
import ApplicantDetail from "@/components/dashboard/ApplicantDetail";
import { useAuth } from "@/hooks/useAuth";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { Shield } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const { searchHistory, addToHistory, refreshHistory } = useSearchHistory();
  
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const getInitialMessage = () => {
    const greeting = profile?.first_name 
      ? `Welcome back, ${profile.first_name}! 👋` 
      : "Hello!";
    return `${greeting} I'm your ApexScore AI assistant. Enter an email address to analyze a loan applicant's risk profile.`;
  };

  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; applicant?: Applicant; timestamp: Date }[]>([]);

  useEffect(() => {
    if (!authLoading) {
      setChatMessages([
        { 
          role: "assistant", 
          content: getInitialMessage(),
          timestamp: new Date()
        },
      ]);
    }
  }, [authLoading, profile?.first_name]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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
        
        // Add to search history in database
        addToHistory(applicant);

        const response = `📊 Risk Assessment Complete for ${applicant.name.full}

• Overall Risk Score: ${applicant.apex_score}/100 (${applicant.risk_level} Risk)
• Location: ${applicant.location.city}, ${applicant.location.country}
• IP Match: ${applicant.network.ip_matches_declared_address ? "✅ Matches declared location" : "⚠️ Location mismatch detected"}
• VPN Status: ${applicant.device_fingerprint.vpn_detected ? "⚠️ VPN Detected" : "✅ No VPN"}
• SIM Registration: ${applicant.sim_registration === "VERIFIED" ? "✅ Verified" : "⚠️ Unverified"}
• Previous Loans: ${applicant.tfd.loan_history.length} loans on record
• Outstanding Debt: ${applicant.tfd.currency_symbol}${applicant.tfd.outstanding_debt.toLocaleString()}

Decision: ${applicant.action_recommendation.decision}

Click "View Details" to see the full profile.`;

        setChatMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: response,
            applicant,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Search error:", error);
        setChatMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "❌ Failed to fetch applicant data. Please try again.",
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content:
              "I can help you analyze loan applicants. Enter an email address to get a risk assessment including: \n\n• Identity verification (name, phone, location)\n• IP & location analysis (declared vs actual)\n• Device fingerprint (device type, OS, VPN detection)\n• Loan history (previous loans and repayment status)\n\nEnter an email address to get started!",
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }
    
    setIsLoading(false);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportPDF = (singleId?: string) => {
    const itemsToExport = singleId 
      ? searchHistory.filter(a => a.id === singleId)
      : searchHistory.filter(a => selectedItems.includes(a.id));
    
    if (itemsToExport.length === 0) {
      toast.error("Please select items to export");
      return;
    }

    try {
      const count = exportApplicantToPDF(itemsToExport);
      toast.success(`Exported ${count} record(s) to PDF`);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.info("Logged out successfully");
    navigate("/auth");
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-success";
      case "Medium": return "text-warning";
      case "High": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - ApexScore</title>
        <meta name="description" content="ApexScore Dashboard - AI-powered loan risk assessment" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        <aside className="w-64 border-r border-border bg-card/50 hidden md:flex flex-col">
          <div className="p-4 border-b border-border">
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Apex<span className="gradient-text">Score</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "chat" 
                  ? "bg-primary/10 text-primary border border-primary/30" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Bot className="w-5 h-5" />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "history" 
                  ? "bg-primary/10 text-primary border border-primary/30" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <History className="w-5 h-5" />
              Search History
              {searchHistory.length > 0 && (
                <span className="ml-auto text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                  {searchHistory.length}
                </span>
              )}
            </button>
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            {profile && (
              <div className="px-4 py-2 mb-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
            <Link 
              to="/admin"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <Settings className="w-5 h-5" />
              Admin Settings
            </Link>
            <Link 
              to="/profile"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          <header className="md:hidden p-4 border-b border-border flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">ApexScore</span>
            </Link>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "chat" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("chat")}
              >
                <Bot className="w-4 h-4" />
              </Button>
              <Button 
                variant={activeTab === "history" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("history")}
              >
                <History className="w-4 h-4" />
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </header>

          {/* Content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === "chat" ? (
              /* AI Chat Interface */
              <div className="flex-1 flex flex-col">
                {/* Chat messages */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {chatMessages.map((msg, idx) => {
                    const displayText =
                      msg.role === "assistant"
                        ? msg.content
                            .replace(/\*\*/g, "")
                            .replace(/^\s*\*\s+/gm, "")
                        : msg.content;

                    return (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "glass-card"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{displayText}</p>
                          <p
                            className={`text-xs mt-2 ${
                              msg.role === "user"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {msg.applicant && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => setSelectedApplicant(msg.applicant!)}
                            >
                              View Full Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="glass-card rounded-2xl px-4 py-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat input */}
                <div className="p-4 border-t border-border">
                  <div className="max-w-4xl mx-auto flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Enter applicant email address..."
                        className="pl-12 pr-4 h-12 bg-secondary border-border"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      variant="hero" 
                      size="icon" 
                      className="h-12 w-12"
                      onClick={handleSendMessage}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Search History */
              <div className="flex-1 overflow-auto p-4">
                <div className="max-w-3xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-foreground">Search History</h1>
                      <p className="text-muted-foreground">View and export your previous verifications</p>
                    </div>
                    <Button 
                      variant="outline-glow"
                      onClick={() => handleExportPDF()}
                      disabled={selectedItems.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF ({selectedItems.length})
                    </Button>
                  </div>

                  {searchHistory.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                      <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No search history yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Search for applicants using the AI Chat to build your history.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setActiveTab("chat")}
                      >
                        Go to AI Chat
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {searchHistory.map((item) => {
                        const applicant = item.applicant_data;
                        const ipMatch = applicant.network?.ip_matches_declared_address ?? true;
                        return (
                          <div 
                            key={item.id}
                            className={`glass-card p-3 sm:p-4 transition-all cursor-pointer ${
                              selectedItems.includes(item.id) ? "border-primary/50" : ""
                            }`}
                            onClick={() => handleSelectItem(item.id)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  item.risk_level === "Low" 
                                    ? "bg-success/20" 
                                    : item.risk_level === "High" 
                                      ? "bg-destructive/20" 
                                      : "bg-warning/20"
                                }`}>
                                  {item.risk_level === "Low" ? (
                                    <CheckCircle className="w-5 h-5 text-success" />
                                  ) : (
                                    <AlertTriangle className={`w-5 h-5 ${item.risk_level === "High" ? "text-destructive" : "text-warning"}`} />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-foreground truncate">{item.applicant_name}</p>
                                  <p className="text-sm text-muted-foreground truncate">{item.applicant_email}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(item.searched_at).toLocaleDateString()} at {new Date(item.searched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span>{applicant.location.city}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                                <div className="sm:text-right">
                                  <p className="text-xs text-muted-foreground">Risk</p>
                                  <p className={`font-display font-bold text-base sm:text-lg ${getRiskColor(item.risk_level)}`}>
                                    {item.apex_score}
                                  </p>
                                </div>

                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  ipMatch 
                                    ? "bg-success/10 text-success" 
                                    : "bg-destructive/10 text-destructive"
                                }`}>
                                  <span className="hidden sm:inline">IP</span> {ipMatch ? "✓" : "✗"}
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExportPDF(item.id);
                                    }}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>

                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedApplicant(applicant);
                                    }}
                                  >
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Applicant Detail Modal - Full screen on mobile */}
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
    </>
  );
};

export default Dashboard;
