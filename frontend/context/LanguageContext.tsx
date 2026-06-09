'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'km' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar & Menus
    overview: "Overview",
    dashboard: "Dashboard",
    customer: "Customer",
    allCustomers: "All Customers",
    repayment: "Repayment",
    losPipeline: "LOS Pipeline",
    underwriting: "Underwriting",
    newApplication: "New Application",
    loanProduct: "Loan Product",
    cbcCheck: "CBC Check",
    bankStatement: "Bank Statement",
    report: "Report",
    adminTitle: "Acabar Plc Admin",
    
    // Header & User Menu
    toggleTheme: "Toggle theme",
    profile: "Profile",
    settings: "Settings",
    signOut: "Sign out",
    guest: "GUEST",
    
    // Settings Modal Tabs & Content
    settingsTitle: "Settings",
    tabProfile: "Profile",
    tabSecurity: "Security",
    tabCompany: "Company",
    tabNavigation: "Navigation",
    tabUsers: "Users",
    tabRoles: "Roles",
    tabLanguage: "Language",
    tabIntegrations: "Integrations",
    
    displayLanguage: "Display Language",
    displayLanguageDesc: "Select your preferred language for the admin dashboard interface.",
    languageSuccess: "Language preference updated successfully",
    
    // Dashboard general & Metrics
    totalVolume: "Total Volume",
    growthTracking: "Growth Tracking",
    annualVolume: "Annual Volume",
    totalCumulative: "Total Cumulative",
    monthlyVolume: "Monthly Volume",
    cumulativeGrowth: "Cumulative Growth",
    totalPortfolio: "Total Portfolio",
    overdueAccounts: "Overdue Accounts",
    realTime: "Real-time",
    loans: "Loans",
    changeFromLastMonth: "+12.5% from last month",
    noChangeFromLastWeek: "No change from last week",
    recentApplications: "Recent Applications",
    viewAll: "View All",
    searchPlaceholder: "Search applications...",
    statusAll: "All Statuses",
    settledLoans: "Settled Loans",
    accounts: "Accounts",
    settledThisWeek: "+4 settled this week",
    avgTicketSize: "Avg. Ticket Size",
    avgSteady: "Average steady over 3mo",
    liveLoanPipeline: "Live Loan Pipeline",
    newApplicationBtn: "New Application",
    searchPlaceholderAdmin: "Search by ID or Name...",
    
    // Table Headers & Toolbar
    tableHeaderID: "ID",
    tableHeaderName: "Name",
    tableHeaderProduct: "Product",
    tableHeaderAmount: "Amount",
    tableHeaderSentDate: "Sent Date",
    tableHeaderStatus: "Status",
    tableHeaderActions: "Actions",
    
    // Filter values
    filter_ALL: "All Statuses",
    filter_ACTIVE: "Active",
    filter_PENDING: "Pending",
    filter_UNDERWRITING: "Underwriting",
    filter_APPROVED: "Approved",
    filter_DISBURSED: "Disbursed",
    filter_REJECTED: "Rejected",

    // Statuses
    status_PENDING: "Pending",
    status_DISBURSED: "Disbursed",
    status_UNDERWRITING: "Underwriting",
    status_APPROVED: "Approved",
    status_REJECTED: "Rejected",
    status_ACTIVE: "Active",
    status_COMPLETED: "Completed",
    status_OVERDUE: "Overdue",
    status_TIER1_REVIEW: "Tier 1 Review",
    status_TIER2_REVIEW: "Tier 2 Review",
    status_TIER3_REVIEW: "Tier 3 Review"
  },
  km: {
    // Sidebar & Menus
    overview: "ទិដ្ឋភាពទូទៅ",
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    customer: "អតិថិជន",
    allCustomers: "អតិថិជនទាំងអស់",
    repayment: "ការសងប្រាក់",
    losPipeline: "ដំណាក់កាលឥណទាន (LOS)",
    underwriting: "ការវាយតម្លៃឥណទាន",
    newApplication: "ពាក្យស្នើសុំថ្មី",
    loanProduct: "ផលិតផលឥណទាន",
    cbcCheck: "ពិនិត្យ CBC",
    bankStatement: "របាយការណ៍ធនាគារ",
    report: "របាយការណ៍",
    adminTitle: "អ្នកគ្រប់គ្រង Acabar Plc",
    
    // Header & User Menu
    toggleTheme: "ប្តូរពណ៌ផ្ទៃក្រោយ",
    profile: "ប្រវត្តិរូបសង្ខេប",
    settings: "ការកំណត់",
    signOut: "ចាកចេញ",
    guest: "ភ្ញៀវ",
    
    // Settings Modal Tabs & Content
    settingsTitle: "ការកំណត់",
    tabProfile: "ប្រវត្តិរូប",
    tabSecurity: "សុវត្ថិភាព",
    tabCompany: "ក្រុមហ៊ុន",
    tabNavigation: "ម៉ឺនុយប្រព័ន្ធ",
    tabUsers: "អ្នកប្រើប្រាស់",
    tabRoles: "តួនាទី",
    tabLanguage: "ភាសា",
    tabIntegrations: "ការតភ្ជាប់",
    
    displayLanguage: "ភាសាក្នុងប្រព័ន្ធ",
    displayLanguageDesc: "ជ្រើសរើសភាសាដែលអ្នកចង់ប្រើសម្រាប់ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធផ្ទៃក្នុង។",
    languageSuccess: "បានផ្លាស់ប្តូរភាសាដោយជោគជ័យ",
    
    // Dashboard general & Metrics
    totalVolume: "ទំហំឥណទានសរុប",
    growthTracking: "ការតាមដានកំណើន",
    annualVolume: "ទំហំឥណទានប្រចាំឆ្នាំ",
    totalCumulative: "សរុបគរុប",
    monthlyVolume: "ទំហំឥណទានប្រចាំខែ",
    cumulativeGrowth: "កំណើនគរុបសរុប",
    totalPortfolio: "ផលប័ត្រឥណទានសរុប",
    overdueAccounts: "គណនីហួសកាលកំណត់",
    realTime: "ជាក់ស្តែង",
    loans: "កម្ចី",
    changeFromLastMonth: "+12.5% ធៀបនឹងខែមុន",
    noChangeFromLastWeek: "គ្មានការផ្លាស់ប្តូរធៀបនឹងសប្តាហ៍មុន",
    recentApplications: "ពាក្យស្នើសុំថ្មីៗ",
    viewAll: "មើលទាំងអស់",
    searchPlaceholder: "ស្វែងរកពាក្យស្នើសុំ...",
    statusAll: "ស្ថានភាពទាំងអស់",
    settledLoans: "កម្ចីទូទាត់រួច",
    accounts: "គណនី",
    settledThisWeek: "+4 បានទូទាត់សប្តាហ៍នេះ",
    avgTicketSize: "ទំហំកម្ចីមធ្យម",
    avgSteady: "កម្រិតមធ្យមថេររយៈពេល ៣ខែ",
    liveLoanPipeline: "ដំណាក់កាលឥណទានសកម្ម",
    newApplicationBtn: "ពាក្យស្នើសុំថ្មី",
    searchPlaceholderAdmin: "ស្វែងរកតាមលេខសម្គាល់ ឬឈ្មោះ...",
    
    // Table Headers & Toolbar
    tableHeaderID: "លេខសម្គាល់",
    tableHeaderName: "ឈ្មោះ",
    tableHeaderProduct: "ផលិតផល",
    tableHeaderAmount: "ចំនួនទឹកប្រាក់",
    tableHeaderSentDate: "ថ្ងៃផ្ញើ",
    tableHeaderStatus: "ស្ថានភាព",
    tableHeaderActions: "សកម្មភាព",
    
    // Filter values
    filter_ALL: "ស្ថានភាពទាំងអស់",
    filter_ACTIVE: "សកម្ម",
    filter_PENDING: "កំពុងរង់ចាំ",
    filter_UNDERWRITING: "កំពុងវាយតម្លៃ",
    filter_APPROVED: "បានអនុម័ត",
    filter_DISBURSED: "បានបើកប្រាក់",
    filter_REJECTED: "បានបដិសេធ",

    // Statuses
    status_PENDING: "កំពុងរង់ចាំ",
    status_DISBURSED: "បានបើកប្រាក់",
    status_UNDERWRITING: "កំពុងវាយតម្លៃ",
    status_APPROVED: "បានអនុម័ត",
    status_REJECTED: "បានបដិសេធ",
    status_ACTIVE: "សកម្ម",
    status_COMPLETED: "បានបញ្ចប់",
    status_OVERDUE: "ហួសកាលកំណត់",
    status_TIER1_REVIEW: "ការពិនិត្យកម្រិតទី១",
    status_TIER2_REVIEW: "ការពិនិត្យកម្រិតទី២",
    status_TIER3_REVIEW: "ការពិនិត្យកម្រិតទី៣"
  },
  ko: {
    // Sidebar & Menus
    overview: "개요",
    dashboard: "대시보드",
    customer: "고객 관리",
    allCustomers: "모든 고객",
    repayment: "대출 상환",
    losPipeline: "심사 프로세스",
    underwriting: "여신 심사",
    newApplication: "신규 신청",
    loanProduct: "대출 상품",
    cbcCheck: "CBC 신용조회",
    bankStatement: "거래 내역",
    report: "통계 및 보고서",
    adminTitle: "아카바 Plc 관리자",
    
    // Header & User Menu
    toggleTheme: "테마 변경",
    profile: "프로필 설정",
    settings: "시스템 설정",
    signOut: "로그아웃",
    guest: "게스트",
    
    // Settings Modal Tabs & Content
    settingsTitle: "설정",
    tabProfile: "프로필",
    tabSecurity: "보안",
    tabCompany: "회사 설정",
    tabNavigation: "메뉴 설정",
    tabUsers: "사용자 관리",
    tabRoles: "역할 설정",
    tabLanguage: "언어 설정",
    tabIntegrations: "연동 설정",
    
    displayLanguage: "표시 언어",
    displayLanguageDesc: "관리자 대시보드 인터페이스의 기본 표시 언어를 선택합니다.",
    languageSuccess: "언어 설정이 성공적으로 업데이트되었습니다",
    
    // Dashboard general & Metrics
    totalVolume: "총 대출액",
    growthTracking: "성장 추적",
    annualVolume: "연간 대출액",
    totalCumulative: "누적 대출액",
    monthlyVolume: "월간 대출액",
    cumulativeGrowth: "누적 성장액",
    totalPortfolio: "총 포트폴리오",
    overdueAccounts: "연체 계좌",
    realTime: "실시간",
    loans: "건",
    changeFromLastMonth: "전월 대비 +12.5%",
    noChangeFromLastWeek: "지난주 대비 변동 없음",
    recentApplications: "최근 신청 목록",
    viewAll: "전체 보기",
    searchPlaceholder: "신청서 검색...",
    statusAll: "전체 상태",
    settledLoans: "상환 완료 대출",
    accounts: "개 계좌",
    settledThisWeek: "이번 주 4건 상환 완료",
    avgTicketSize: "평균 대출 금액",
    avgSteady: "최근 3개월간 평균 유지",
    liveLoanPipeline: "실시간 대출 심사 현황",
    newApplicationBtn: "신규 신청 등록",
    searchPlaceholderAdmin: "ID 또는 이름으로 검색...",
    
    // Table Headers & Toolbar
    tableHeaderID: "ID",
    tableHeaderName: "이름",
    tableHeaderProduct: "대출 상품",
    tableHeaderAmount: "대출 금액",
    tableHeaderSentDate: "신청 일자",
    tableHeaderStatus: "상태",
    tableHeaderActions: "작업",
    
    // Filter values
    filter_ALL: "전체 상태",
    filter_ACTIVE: "활성",
    filter_PENDING: "대기중",
    filter_UNDERWRITING: "심사중",
    filter_APPROVED: "승인됨",
    filter_DISBURSED: "지급 완료",
    filter_REJECTED: "거절됨",

    // Statuses
    status_PENDING: "대기중",
    status_DISBURSED: "지급 완료",
    status_UNDERWRITING: "심사중",
    status_APPROVED: "승인됨",
    status_REJECTED: "거절됨",
    status_ACTIVE: "활성",
    status_COMPLETED: "완료됨",
    status_OVERDUE: "연체됨",
    status_TIER1_REVIEW: "1단계 검토",
    status_TIER2_REVIEW: "2단계 검토",
    status_TIER3_REVIEW: "3단계 검토"
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred_language') as Language;
      if (stored && (stored === 'en' || stored === 'km' || stored === 'ko')) {
        setLanguageState(stored);
      }
      setIsLoaded(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', lang);
      // Dispatch storage or custom event so settings modal or other elements can react if needed
      window.dispatchEvent(new Event('languageChanged'));
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div style={{ opacity: isLoaded ? 1 : 0, display: 'contents' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
