// MPesa adapter: tries sandbox OAuth token + transaction query, falls back to simulation
const axios = require("axios");
const qs = require("qs");

const simulatePaymentVerification = async (transactionRef) => {
  return {
    success: true,
    reference: transactionRef,
    amount: 0,
    simulated: true,
  };
};

async function getOAuthToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const base = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke";
  if (!key || !secret) return null;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  try {
    const res = await axios.get(
      `${base}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } },
    );
    return res.data.access_token;
  } catch (err) {
    console.error("MPesa token error", err.message || err.toString());
    return null;
  }
}

async function queryTransaction(transactionRef) {
  const token = await getOAuthToken();
  if (!token) return null;
  const base = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke";
  try {
    // Use Transaction Status or STK Query endpoints depending on flow
    const url = `${base}/mpesa/transactionstatus/v1/query`;
    const payload = {
      // Required fields depend on the account; using placeholders when empty
      Initiator: process.env.MPESA_INITIATOR || "testapi",
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "SEC_CRED",
      CommandID: "TransactionStatusQuery",
      TransactionID: transactionRef,
      PartyA: process.env.MPESA_SHORTCODE || "",
      IdentifierType: "4",
      ResultURL: process.env.MPESA_RESULT_URL || "https://example.com/result",
      QueueTimeOutURL:
        process.env.MPESA_TIMEOUT_URL || "https://example.com/timeout",
      Remarks: "Query",
    };
    const res = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("MPesa query error", err.message || err.toString());
    return null;
  }
}

const verifyPayment = async (transactionRef) => {
  if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
    return simulatePaymentVerification(transactionRef);
  }
  const q = await queryTransaction(transactionRef);
  if (!q) return simulatePaymentVerification(transactionRef);
  // Parse response for success (this is a simplified check)
  const success = q.ResultCode === "0" || q.ResultCode === 0;
  return { success, reference: transactionRef, raw: q };
};

async function simulateB2CTransfer(phone, amount) {
  return {
    success: true,
    simulated: true,
    phone,
    amount,
    mpesaRef: `SIM-${Date.now()}`,
  };
}

async function b2cTransfer(phone, amount) {
  const token = await getOAuthToken();
  if (!token) return simulateB2CTransfer(phone, amount);
  const base = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke";
  try {
    const url = `${base}/mpesa/b2c/v1/paymentrequest`;
    const normalizePhone = (p) => {
      if (!p) return p;
      p = p.trim();
      if (p.startsWith("+")) p = p.slice(1);
      if (p.startsWith("0")) p = "254" + p.slice(1);
      if (p.length === 9 && p.startsWith("7")) p = "254" + p; // 7xxxxxxxx
      return p;
    };
    const payload = {
      InitiatorName: process.env.MPESA_INITIATOR || "testapi",
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "SEC_CRED",
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: process.env.MPESA_SHORTCODE || process.env.MPESA_SHORTCODE || "",
      PartyB: normalizePhone(phone),
      Remarks: "Withdrawal payout",
      QueueTimeOutURL:
        process.env.MPESA_TIMEOUT_URL || "https://example.com/timeout",
      ResultURL: process.env.MPESA_RESULT_URL || "https://example.com/result",
      Occasion: "Withdrawal",
    };
    const res = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, raw: res.data };
  } catch (err) {
    console.error("MPesa B2C error", err.message || err.toString());
    return { success: false, error: err.message || err.toString() };
  }
}

module.exports = {
  verifyPayment,
  getOAuthToken,
  queryTransaction,
  b2cTransfer,
};
