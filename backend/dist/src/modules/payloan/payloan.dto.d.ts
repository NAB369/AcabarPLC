export declare class PayloanCallbackDto {
    bill_no: string;
    transaction_id: number;
    transaction_date: string;
    transaction_time: string;
    payer_account_no: string;
    payer_name: string;
    currency_code: string;
    payment_method: string;
    amount: number;
    sender_bank_name: string;
    sender_account_name: string;
    settlement_date: string;
    settlement_time?: string;
    settlement_status: string;
    settlement_error_message?: string;
    remark?: string;
    bank_transaction_id?: string;
}
