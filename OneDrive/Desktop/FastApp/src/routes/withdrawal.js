const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Withdrawal = require("../models/Withdrawal");

// Request a withdrawal (queued)
router.post("/request", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).send({ error: "Invalid amount" });
    // NOTE: For prototype we do not validate balances; production must check user wallet
    const w = new Withdrawal({ user: req.user._id, amount });
    await w.save();
    res.send({ withdrawal: w });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// List user's withdrawals
router.get("/", auth, async (req, res) => {
  try {
    const items = await Withdrawal.find({ user: req.user._id }).sort({
      requestedAt: -1,
    });
    res.send({ items });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
