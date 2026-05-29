export interface CbcReportResponse {
    cbcScore: number | null;
    totalExposure: number;
    activeLoans: number;
    delinquencyFlag: boolean;
    reportData: Record<string, unknown>;
}
export declare class CbcClient {
    queryCredit(nationalId: string): Promise<CbcReportResponse>;
    hasDelinquency(nationalId: string): Promise<boolean>;
}
