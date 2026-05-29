"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BakongClient = void 0;
class BakongClient {
    mockMode = true;
    async transfer(request) {
        if (this.mockMode) {
            return this.mockTransfer(request);
        }
        throw new Error('Real Bakong integration not configured');
    }
    async generateKhqr(amount, currency, description) {
        const transactionId = `KHQR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const qrString = [
            '00020101021229',
            `52040000`,
            `5303${currency === 'USD' ? '840' : '116'}`,
            `54${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}`,
            `5802KH`,
            `5914LMS CAMBODIA`,
            `6010PHNOM PENH`,
            `6304`,
        ].join('');
        return {
            qrString,
            amount,
            currency,
            merchantName: 'LMS Cambodia',
            transactionId,
        };
    }
    async checkTransaction(transactionHash) {
        if (this.mockMode) {
            return { status: 'COMPLETED', confirmed: true };
        }
        throw new Error('Real Bakong integration not configured');
    }
    async mockTransfer(request) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        return {
            success: true,
            transactionHash: hash,
            transactionId: `BAK-${Date.now()}`,
            status: 'COMPLETED',
            timestamp: new Date().toISOString(),
        };
    }
}
exports.BakongClient = BakongClient;
//# sourceMappingURL=bakong.client.js.map