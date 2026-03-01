export const currentUser = {
  id: "usr_001",
  name: "Maria Chen",
  email: "maria@investor.com",
  role: "shareholder" as const,
  avatarInitials: "MC",
};

export const holdingCompany = {
  name: "Nexus AI Holdings",
  description: "A holding company owning and operating a portfolio of applied AI ventures across healthcare, fintech, and enterprise automation. Founded in 2023, Nexus AI Holdings provides strategic capital, operational support, and shared infrastructure to its portfolio companies.",
  currentValuation: 48_500_000,
  previousValuation: 42_000_000,
  secFilingUrl: "#",
  etherscanUrl: "#",
};

export const shareholderData = {
  ownershipPercent: 4.25,
  totalValue: 20_600,
  previousValue: 17_850,
  investmentDate: "2024-03-15",
  totalInvested: 15_000,
};

export const holdings = [
  {
    id: "trn_001",
    date: "2024-03-15",
    units: 425,
    percent: 2.5,
    paidPrice: 850_000,
    currentValue: 1_212_500,
    documents: [
      { id: "doc_001", name: "Subscription Agreement — Series A", type: "Subscription Agreement", date: "2024-03-15" },
      { id: "doc_002", name: "Side Letter — Maria Chen", type: "Side Letter", date: "2024-03-15" },
    ],
  },
  {
    id: "trn_002",
    date: "2024-11-01",
    units: 175,
    percent: 1.75,
    paidPrice: 650_000,
    currentValue: 848_750,
    documents: [
      { id: "doc_003", name: "Subscription Agreement — Series B", type: "Subscription Agreement", date: "2024-11-01" },
    ],
  },
];

export const capTable = [
  { name: "Investor A", percent: 28.5 },
  { name: "Investor B", percent: 18.2 },
  { name: "Investor C", percent: 12.0 },
  { name: "Investor D", percent: 9.8 },
  { name: "You (Maria Chen)", percent: 4.25, isCurrentUser: true },
  { name: "Other Shareholders", percent: 27.25 },
];

export const portfolioVentures = [
  { id: "pv_001", name: "MediScan AI", sector: "Healthcare", description: "AI-powered diagnostic imaging platform for early disease detection.", stakePercent: 65, milestone: "Series B closed — $12M raised" },
  { id: "pv_002", name: "FinGuard", sector: "Fintech", description: "Real-time fraud detection and compliance monitoring for digital banks.", stakePercent: 80, milestone: "100+ enterprise clients onboarded" },
  { id: "pv_003", name: "AutoFlow", sector: "Enterprise", description: "Intelligent process automation for supply chain and logistics.", stakePercent: 55, milestone: "Partnership with Fortune 500 manufacturer" },
  { id: "pv_004", name: "LegalLens", sector: "Legal Tech", description: "Contract analysis and due diligence automation using NLP.", stakePercent: 70, milestone: "SOC 2 Type II certification achieved" },
];

export const adminStats = {
  totalShareholders: 24,
  documentsIndexed: 187,
  latestValuation: 48_500_000,
  pendingApprovals: 3,
};

export const recentActivity = [
  { id: "act_001", action: "Valuation updated", detail: "$48.5M — Q4 2025", time: "2 hours ago", type: "valuation" as const },
  { id: "act_002", action: "Document uploaded", detail: "Board Resolution — Dec 2025", time: "5 hours ago", type: "document" as const },
  { id: "act_003", action: "New shareholder added", detail: "David Park — 1.2%", time: "1 day ago", type: "shareholder" as const },
  { id: "act_004", action: "Share purchase approved", detail: "Emily Zhao — 200 units", time: "2 days ago", type: "purchase" as const },
  { id: "act_005", action: "Document indexed", detail: "PPM — Series C", time: "3 days ago", type: "document" as const },
];
