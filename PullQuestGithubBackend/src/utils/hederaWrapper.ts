// src/utils/hederaWrapper.js
const { HederaAgentKit } = require('hedera-agent-kit');

module.exports = {
  createHederaAgent: (accountId:any, privateKey:any, network:any) => {
    return new HederaAgentKit(accountId, privateKey, network);
  }
};