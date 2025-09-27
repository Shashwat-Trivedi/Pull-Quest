"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/hederaWrapper.js
const { HederaAgentKit } = require('hedera-agent-kit');
module.exports = {
    createHederaAgent: (accountId, privateKey, network) => {
        return new HederaAgentKit(accountId, privateKey, network);
    }
};
//# sourceMappingURL=hederaWrapper.js.map