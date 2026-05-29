$body = @{
    bill_no = "TEST-BILL-12345"
    transaction_id = 987654321012
    transaction_date = "20240229"
    transaction_time = "112827"
    payer_account_no = "1234567890"
    payer_name = "John Doe"
    currency_code = "USD"
    payment_method = "PM001"
    amount = 150.00
    sender_bank_name = "Acme Bank"
    sender_account_name = "John Doe"
    settlement_date = "20240229"
    settlement_status = "0"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/v1/client/wb/v1/payloan-callback" -Method Post -Body $body -ContentType "application/json"
