import { 
  User, 
  MapPin, 
  Phone, 
  Smartphone, 
  CreditCard, 
  Shield,
  History,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wallet,
  Clock,
  Mail,
  Wifi,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Applicant } from "@/lib/api";
import { useState } from "react";
import ScoreExplanation from "./ScoreExplanation";

interface ApplicantDetailProps {
  applicant: Applicant;
}

const ApplicantDetail = ({ applicant }: ApplicantDetailProps) => {
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-success bg-success/10";
      case "Medium": return "text-warning bg-warning/10";
      case "High": return "text-destructive bg-destructive/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid On Time":
      case "Paid Early":
        return "text-success";
      case "Paid Late":
        return "text-warning";
      case "Defaulted":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getDecisionIcon = (decision: string) => {
    if (decision.toLowerCase().includes("approve")) {
      return <CheckCircle className="w-8 h-8 text-success" />;
    } else if (decision.toLowerCase().includes("review")) {
      return <AlertTriangle className="w-8 h-8 text-warning" />;
    } else {
      return <XCircle className="w-8 h-8 text-destructive" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    if (decision.toLowerCase().includes("approve")) {
      return "text-success border-success/50";
    } else if (decision.toLowerCase().includes("review")) {
      return "text-warning border-warning/50";
    } else {
      return "text-destructive border-destructive/50";
    }
  };

  const currencySymbol = applicant.tfd.currency_symbol || "₦";

  return (
    <div className="space-y-4 sm:space-y-6 overflow-auto max-h-[70vh] pr-2 text-sm sm:text-base">
      {/* Header with Score */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground truncate">{applicant.name.full}</h2>
            <p className="text-muted-foreground text-xs sm:text-sm truncate">{applicant.email}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{applicant.occupation}</p>
          </div>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl ${getRiskColor(applicant.risk_level)}`}>
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-bold text-xl sm:text-2xl">{applicant.apex_score}</span>
          </div>
          <p className={`text-xs sm:text-sm font-medium mt-1 ${getRiskColor(applicant.risk_level).split(' ')[0]}`}>
            {applicant.risk_level} Risk
          </p>
        </div>
      </div>

      {/* AI Recommendation from API */}
      <div className={`glass-card p-4 border-2 ${getDecisionColor(applicant.action_recommendation.decision)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getDecisionIcon(applicant.action_recommendation.decision)}
            <div>
              <p className="font-semibold text-foreground">AI Lending Recommendation</p>
              <p className={`text-lg font-bold ${getDecisionColor(applicant.action_recommendation.decision).split(' ')[0]}`}>
                {applicant.action_recommendation.decision}
              </p>
            </div>
          </div>
        </div>

        {/* Loan Amounts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <Wallet className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Recommended</p>
            <p className="text-lg font-bold text-primary">
              {currencySymbol}{applicant.action_recommendation.recommended_loan_amount?.toLocaleString() || "N/A"}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary">
            <Wallet className="w-5 h-5 text-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Max Limit</p>
            <p className="text-lg font-bold text-foreground">
              {currencySymbol}{applicant.action_recommendation.max_loan_amount?.toLocaleString() || "N/A"}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary">
            <Info className="w-5 h-5 text-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Interest Rate</p>
            <p className="text-lg font-bold text-foreground">
              {applicant.action_recommendation.interest_rate_range || "N/A"}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary">
            <Clock className="w-5 h-5 text-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Repayment</p>
            <p className="text-lg font-bold text-foreground">
              {applicant.action_recommendation.repayment_period || "N/A"}
            </p>
          </div>
        </div>

        {/* Reasoning */}
        {applicant.action_recommendation.reasoning && applicant.action_recommendation.reasoning.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-foreground">Why this recommendation:</p>
            <ul className="space-y-1">
              {applicant.action_recommendation.reasoning.map((reason, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conditions */}
        {applicant.action_recommendation.conditions && applicant.action_recommendation.conditions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Conditions:</p>
            <ul className="space-y-1">
              {applicant.action_recommendation.conditions.map((condition, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-warning mt-1">⚠</span>
                  {condition}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Score Explanation Toggle */}
      <div className="glass-card p-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between"
          onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
        >
          <span className="font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Why This Score? (Detailed Breakdown)
          </span>
          {showScoreBreakdown ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>
        {showScoreBreakdown && (
          <div className="mt-4 pt-4 border-t border-border">
            <ScoreExplanation applicant={applicant} />
          </div>
        )}
      </div>

      {/* Location & Network Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="glass-card p-3 sm:p-4">
          <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="w-4 h-4 text-primary" />
            Location
          </h3>
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <p><span className="text-muted-foreground">City:</span> <span className="text-foreground">{applicant.location.city}</span></p>
            <p><span className="text-muted-foreground">Country:</span> <span className="text-foreground">{applicant.location.country}</span></p>
            <p><span className="text-muted-foreground">Address:</span> <span className="text-foreground">{applicant.location.address}</span></p>
            <p><span className="text-muted-foreground">Coords:</span> <span className="text-foreground font-mono text-xs">{applicant.location.coordinates.lat}, {applicant.location.coordinates.lng}</span></p>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4">
          <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Wifi className="w-4 h-4 text-primary" />
            Network
          </h3>
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <p><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{applicant.phone}</span></p>
            <p><span className="text-muted-foreground">ISP:</span> <span className="text-foreground">{applicant.network.isp}</span></p>
            <p><span className="text-muted-foreground">IP Location:</span> <span className="text-foreground">{applicant.network.ip_location}</span></p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">IP Match:</span>
              <Badge variant={applicant.network.ip_matches_declared_address ? "default" : "destructive"}>
                {applicant.network.ip_matches_declared_address ? "✓ Matches" : "⚠ Mismatch"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">SIM:</span>
              <Badge variant={applicant.sim_registration === "VERIFIED" ? "default" : "destructive"}>
                {applicant.sim_registration}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      {applicant.activity_log && (
        <div className="glass-card p-3 sm:p-4">
          <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Clock className="w-4 h-4 text-primary" />
            Activity Log
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Last Email Login</p>
                <p className="text-foreground">{new Date(applicant.activity_log.last_email_login).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Last SIM Activity</p>
                <p className="text-foreground">{new Date(applicant.activity_log.last_sim_activity).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={applicant.activity_log.email_sim_sync ? "default" : "destructive"}>
                {applicant.activity_log.email_sim_sync ? "✓ Email/SIM Synced" : "⚠ Not Synced"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Device Info */}
      <div className="glass-card p-3 sm:p-4">
        <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Smartphone className="w-4 h-4 text-primary" />
          Device Fingerprint
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-muted-foreground">Device</p>
            <p className="text-foreground font-medium">{applicant.device_fingerprint.device_type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Model</p>
            <p className="text-foreground font-medium truncate">{applicant.device_fingerprint.model}</p>
          </div>
          <div>
            <p className="text-muted-foreground">OS</p>
            <p className="text-foreground font-medium">{applicant.device_fingerprint.os_version}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge variant={applicant.device_fingerprint.is_rooted ? "destructive" : "secondary"} className="text-xs">
            {applicant.device_fingerprint.is_rooted ? "⚠️ Rooted" : "✓ Not Rooted"}
          </Badge>
          <Badge variant={applicant.device_fingerprint.vpn_detected ? "destructive" : "secondary"} className="text-xs">
            {applicant.device_fingerprint.vpn_detected ? "⚠️ VPN" : "✓ No VPN"}
          </Badge>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="glass-card p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          Bank Accounts ({applicant.bank_accounts.length})
        </h3>
        <div className="space-y-2">
          {applicant.bank_accounts.map((account, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground text-sm">{account.bank_name}</p>
                <p className="text-xs text-muted-foreground">{account.account_type} • {account.account_number}</p>
              </div>
              <Badge variant={account.status === "Active" ? "default" : "secondary"}>
                {account.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Stability Index */}
      <div className="glass-card p-3 sm:p-4">
        <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Shield className="w-4 h-4 text-primary" />
          Behavioral Stability Index
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${applicant.bsi.location_consistency >= 70 ? 'text-success' : applicant.bsi.location_consistency >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {applicant.bsi.location_consistency}%
            </div>
            <p className="text-xs text-muted-foreground">Location</p>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${applicant.bsi.device_stability >= 70 ? 'text-success' : applicant.bsi.device_stability >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {applicant.bsi.device_stability}%
            </div>
            <p className="text-xs text-muted-foreground">Device</p>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${applicant.bsi.sim_changes >= 70 ? 'text-success' : applicant.bsi.sim_changes >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {applicant.bsi.sim_changes}%
            </div>
            <p className="text-xs text-muted-foreground">SIM</p>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${applicant.bsi.ip_region_match >= 70 ? 'text-success' : applicant.bsi.ip_region_match >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {applicant.bsi.ip_region_match}%
            </div>
            <p className="text-xs text-muted-foreground">IP Match</p>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${applicant.bsi.travel_frequency >= 70 ? 'text-success' : applicant.bsi.travel_frequency >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {applicant.bsi.travel_frequency}%
            </div>
            <p className="text-xs text-muted-foreground">Travel</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="glass-card p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          Financial Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center p-3 rounded-lg bg-secondary">
            <p className="text-xs text-muted-foreground">Outstanding Debt</p>
            <p className="text-xl font-bold text-foreground">
              {currencySymbol}{applicant.tfd.outstanding_debt.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary">
            <p className="text-xs text-muted-foreground">Total Loans</p>
            <p className="text-xl font-bold text-foreground">
              {applicant.tfd.loan_history.length}
            </p>
          </div>
        </div>
      </div>

      {/* Loan History */}
      <div className="glass-card p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Loan History ({applicant.tfd.loan_history.length} loans)
        </h3>
        <div className="space-y-2 max-h-48 overflow-auto">
          {applicant.tfd.loan_history.map((loan, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{loan.institution}</p>
                  <Badge variant="secondary" className="text-xs">{loan.purpose}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {loan.disbursement_date} → {loan.due_date}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">
                  {loan.currency_symbol}{loan.amount.toLocaleString()}
                </p>
                <p className={`text-xs ${getStatusColor(loan.status)}`}>
                  {loan.status}
                  {loan.days_overdue && ` (${loan.days_overdue}d overdue)`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;