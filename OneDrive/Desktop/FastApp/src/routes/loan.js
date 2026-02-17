const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Loan = require("../models/Loan");
const Withdrawal = require("../models/Withdrawal");
const { verifyPayment } = require("../utils/mpesaAdapter");

// Apply for loan
router.post("/apply", auth, async (req, res) => {
  try {
    const { amount, termWeeks, purpose, paymentRef } = req.body;
    if (!amount || !termWeeks)
      return res.status(400).send({ error: "Missing fields" });

    // Check if user has any active loans (pending or disbursed)
    const activeLoans = await Loan.find({
      user: req.user._id,
      status: { $in: ["pending", "disbursed"] },
    });

    if (activeLoans.length > 0) {
      return res.status(400).send({
        error:
          "You must repay your existing loan before applying for a new one",
      });
    }

    if (amount > req.user.loanLimit)
      return res.status(400).send({
        error: `Amount exceeds loan limit. Your limit: KES ${req.user.loanLimit}`,
      });
    // Save any provided KYC updates on the user
    const { nationalId, kraPin, dob } = req.body;
    if (nationalId) req.user.nationalId = nationalId;
    if (kraPin) req.user.kraPin = kraPin;
    if (dob) req.user.dob = new Date(dob);
    await req.user.save();

    const loan = new Loan({ user: req.user._id, amount, termWeeks, purpose });
    // Optionally verify payment reference (e.g., application fee)
    if (paymentRef) {
      const verified = await verifyPayment(paymentRef);
      if (verified && verified.success) loan.verifiedPayment = true;
    }
    await loan.save();
    res.send({ loan });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Get all loans for the current user
router.get("/", auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.send({ loans });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Repay a loan (mark paid) and apply loan-limit growth on on-time repayment
router.post("/repay/:id", auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).send({ error: "Not found" });
    if (loan.user.toString() !== req.user._id.toString())
      return res.status(403).send({ error: "Not allowed" });
    loan.status = "paid";
    loan.repaidAt = new Date();
    await loan.save();

    // Determine on-time repayment: compare repaidAt to due date (disbursedAt + termWeeks)
    let onTime = false;
    if (loan.disbursedAt) {
      const due = new Date(
        loan.disbursedAt.getTime() +
          (loan.termWeeks || 0) * 7 * 24 * 3600 * 1000,
      );
      onTime = loan.repaidAt <= due;
    }

    if (onTime) {
      const user = await require("../models/User").findById(req.user._id);
      user.onTimeRepayments = (user.onTimeRepayments || 0) + 1;
      // Increase loan limit by 10%
      user.loanLimit = Math.round((user.loanLimit || 0) * 1.1);
      await user.save();
    }

    // Repayment is instant - no withdrawal queue needed
    res.send({ loan, onTime });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Simple endpoint to approve & disburse (demo only)
// Verify a payment reference before applying
router.get("/verify/:ref", auth, async (req, res) => {
  try {
    const ref = req.params.ref;
    const result = await verifyPayment(ref);
    res.send({ result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});
router.post("/disburse/:id", auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate("user");
    if (!loan) return res.status(404).send({ error: "Not found" });
    loan.status = "disbursed";
    loan.disbursedAt = new Date();
    await loan.save();

    // Automatically queue withdrawal for the disbursed loan amount
    const withdrawal = new Withdrawal({
      user: loan.user._id,
      amount: loan.amount,
      status: "queued",
      note: `Loan disbursement for loan ${loan._id}`,
    });
    await withdrawal.save();

    res.send({ loan, withdrawal });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Cancel a loan (only if pending)
router.delete("/:id", auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).send({ error: "Not found" });
    if (loan.user.toString() !== req.user._id.toString())
      return res.status(403).send({ error: "Not allowed" });
    if (loan.status !== "pending")
      return res.status(400).send({
        error: `Cannot cancel loan with status '${loan.status}'`,
      });

    loan.status = "cancelled";
    await loan.save();
    res.send({ loan, message: "Loan cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
