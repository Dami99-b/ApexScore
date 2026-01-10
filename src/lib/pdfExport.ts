import jsPDF from "jspdf";
import type { Applicant } from "./api";

interface SearchHistoryItem {
  id: string;
  applicant_email: string;
  applicant_name: string;
  apex_score: number;
  risk_level: string;
  applicant_data: Applicant;
  searched_at: string;
}

export const exportApplicantToPDF = (items: SearchHistoryItem[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  const addNewPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin) {
      addNewPage();
    }
  };

  const drawLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
  };

  const addTitle = (text: string) => {
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 150, 136); // Teal color
    doc.text(text, margin, yPos);
    yPos += 8;
  };

  const addSubtitle = (text: string) => {
    checkPageBreak(10);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(text, margin, yPos);
    yPos += 6;
  };

  const addField = (label: string, value: string, indent = 0) => {
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(`${label}:`, margin + indent, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.text(value, margin + indent + labelWidth, yPos);
    yPos += 6;
  };

  const addBadge = (label: string, value: string, color: [number, number, number]) => {
    checkPageBreak(12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(`${label}:`, margin, yPos);
    
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setFillColor(...color);
    doc.roundedRect(margin + labelWidth, yPos - 5, doc.getTextWidth(value) + 8, 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(value, margin + labelWidth + 4, yPos);
    yPos += 10;
  };

  items.forEach((item, index) => {
    if (index > 0) addNewPage();
    
    const a = item.applicant_data;
    
    // Header
    doc.setFillColor(0, 150, 136);
    doc.rect(0, 0, pageWidth, 35, "F");
    
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ApexScore Risk Assessment Report", margin, 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, 25);
    
    yPos = 50;

    // Risk Score Overview
    const riskColor: [number, number, number] = a.risk_level === "Low" 
      ? [34, 197, 94] 
      : a.risk_level === "High" 
        ? [239, 68, 68] 
        : [234, 179, 8];
    
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 30, 3, 3, "F");
    
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...riskColor);
    doc.text(`${a.apex_score}`, margin + 10, yPos + 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`/ 100`, margin + 35, yPos + 20);
    
    doc.setFontSize(14);
    doc.setTextColor(...riskColor);
    doc.text(`${a.risk_level} Risk`, margin + 60, yPos + 20);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const recText = a.action_recommendation.decision.substring(0, 80);
    doc.text(recText, margin + 110, yPos + 20);
    
    yPos += 45;

    // Personal Information
    addTitle("Personal Information");
    addField("Full Name", a.name.full);
    addField("Email", a.email);
    addField("Phone", a.phone);
    addField("Occupation", a.occupation);
    yPos += 5;

    // Location Details
    addTitle("Location Details");
    addField("City", a.location.city);
    addField("Country", a.location.country);
    addField("Address", a.location.address);
    addField("Coordinates", `${a.location.coordinates.lat}, ${a.location.coordinates.lng}`);
    yPos += 5;

    // Network & SIM Information
    addTitle("Network & SIM Information");
    addField("ISP", a.network.isp);
    addField("IP Address", a.network.ip_address);
    addBadge("SIM Registration", a.sim_registration, 
      a.sim_registration === "VERIFIED" ? [34, 197, 94] : [234, 179, 8]);
    yPos += 5;

    // Device Fingerprint
    addTitle("Device Fingerprint");
    addField("Device ID", a.device_fingerprint.device_id);
    addField("Device Type", a.device_fingerprint.device_type);
    addField("Model", a.device_fingerprint.model);
    addField("OS Version", a.device_fingerprint.os_version);
    addBadge("Rooted/Jailbroken", a.device_fingerprint.is_rooted ? "YES" : "NO",
      a.device_fingerprint.is_rooted ? [239, 68, 68] : [34, 197, 94]);
    addBadge("VPN Detected", a.device_fingerprint.vpn_detected ? "YES" : "NO",
      a.device_fingerprint.vpn_detected ? [234, 179, 8] : [34, 197, 94]);
    yPos += 5;

    // Bank Accounts
    checkPageBreak(50);
    addTitle("Bank Accounts");
    a.bank_accounts.forEach((bank, idx) => {
      checkPageBreak(30);
      addSubtitle(`Account ${idx + 1}`);
      addField("Bank Name", bank.bank_name, 5);
      addField("Account Number", bank.account_number, 5);
      addField("Account Type", bank.account_type, 5);
      addBadge("Status", bank.status, 
        bank.status === "Active" ? [34, 197, 94] : [100, 100, 100]);
    });
    yPos += 5;

    // Behavioral Stability Index
    checkPageBreak(40);
    addTitle("Behavioral Stability Index (BSI)");
    addField("Location Consistency", `${a.bsi.location_consistency}%`);
    addField("Device Stability", `${a.bsi.device_stability}%`);
    addField("SIM Stability", `${a.bsi.sim_changes}%`);
    yPos += 5;

    // Financial Summary
    checkPageBreak(30);
    addTitle("Financial Summary");
    addField("Currency", a.tfd.currency);
    addField("Outstanding Debt", `${a.tfd.currency_symbol}${a.tfd.outstanding_debt.toLocaleString()}`);
    addField("Total Loans", `${a.tfd.loan_history.length}`);
    yPos += 5;

    // Loan History
    if (a.tfd.loan_history.length > 0) {
      checkPageBreak(30);
      addTitle("Loan History");
      
      a.tfd.loan_history.forEach((loan, idx) => {
        checkPageBreak(50);
        addSubtitle(`Loan ${idx + 1}: ${loan.institution}`);
        addField("Loan ID", loan.loan_id, 5);
        addField("Purpose", loan.purpose, 5);
        addField("Amount", `${loan.currency_symbol}${loan.amount.toLocaleString()}`, 5);
        addField("Disbursement Date", new Date(loan.disbursement_date).toLocaleDateString(), 5);
        addField("Due Date", new Date(loan.due_date).toLocaleDateString(), 5);
        
        const statusColor: [number, number, number] = loan.status === "Paid" 
          ? [34, 197, 94] 
          : loan.status === "Active" 
            ? [59, 130, 246] 
            : [239, 68, 68];
        addBadge("Status", loan.status, statusColor);
        
        if (loan.days_overdue !== null && loan.days_overdue > 0) {
          addField("Days Overdue", `${loan.days_overdue} days`, 5);
        }
        if (loan.repayment_amount !== null) {
          addField("Repayment Amount", `${loan.currency_symbol}${loan.repayment_amount.toLocaleString()}`, 5);
        }
        yPos += 3;
      });
    }

    // AI Recommendation
    checkPageBreak(40);
    yPos += 5;
    drawLine();
    addTitle("AI Recommendation");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    const recLines = doc.splitTextToSize(`Decision: ${a.action_recommendation.decision}\nRecommended: ${a.action_recommendation.recommended_loan_amount?.toLocaleString() || 'N/A'}\nMax: ${a.action_recommendation.max_loan_amount?.toLocaleString() || 'N/A'}\nRate: ${a.action_recommendation.interest_rate_range || 'N/A'}\nPeriod: ${a.action_recommendation.repayment_period || 'N/A'}`, pageWidth - margin * 2 - 10);
    recLines.forEach((line: string) => {
      checkPageBreak(8);
      doc.text(line, margin + 5, yPos);
      yPos += 6;
    });

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This report is confidential and intended for authorized use only.", margin, footerY);
    doc.text(`Searched: ${new Date(item.searched_at).toLocaleString()}`, pageWidth - margin - 60, footerY);
  });

  // Save the PDF
  const fileName = items.length === 1 
    ? `ApexScore_${items[0].applicant_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    : `ApexScore_Export_${new Date().toISOString().split("T")[0]}.pdf`;
  
  doc.save(fileName);
  
  return items.length;
};
