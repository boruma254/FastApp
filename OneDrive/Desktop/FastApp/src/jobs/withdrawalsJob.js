const cron = require("node-cron");
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const { b2cTransfer } = require("../utils/mpesaAdapter");

async function processWithdrawalsImmediate() {
  console.log("Processing queued withdrawals...");
  const queued = await Withdrawal.find({ status: "queued" })
    .limit(50)
    .populate("user");
  for (const w of queued) {
    try {
      w.status = "processing";
      w.attemptCount = (w.attemptCount || 0) + 1;
      await w.save();
      const phone = w.user.phone;
      const res = await b2cTransfer(phone, w.amount);
      if (res && res.success) {
        w.status = "paid";
        w.processedAt = new Date();
        w.mpesaRef = res.mpesaRef || JSON.stringify(res.raw || res);
        await w.save();
      } else {
        w.status = "failed";
        w.note = res && res.error ? res.error.toString() : "Unknown error";
        await w.save();
      }
    } catch (err) {
      console.error(
        "Withdrawal processing error",
        err.message || err.toString(),
      );
      w.status = "failed";
      w.note = err.message;
      await w.save();
    }
  }
}

function scheduleWeeklyFriday() {
  // Runs at 10:00 server time every Friday
  cron.schedule("0 10 * * 5", async () => {
    console.log("Weekly withdrawal job triggered (Friday)");
    await processWithdrawalsImmediate();
  });
  console.log("Scheduled weekly withdrawal job (Friday 10:00)");
}

module.exports = { scheduleWeeklyFriday, processWithdrawalsImmediate };
