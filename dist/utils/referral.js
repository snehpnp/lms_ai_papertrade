"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralCode = generateReferralCode;
const uuid_1 = require("uuid");
/**
 * Generate a unique referral code (e.g. 8-char alphanumeric uppercase).
 */
function generateReferralCode() {
    return (0, uuid_1.v4)().replace(/-/g, '').slice(0, 8).toUpperCase();
}
//# sourceMappingURL=referral.js.map