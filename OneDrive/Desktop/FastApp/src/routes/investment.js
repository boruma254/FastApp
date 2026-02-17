const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Investment = require("../models/Investment");

router.post("/deposit", auth, async (req, res) => {
  try {
    const { amount, termDays } = req.body;
    if (!amount) return res.status(400).send({ error: "Missing amount" });
    const inv = new Investment({
      user: req.user._id,
      amount,
      termDays,
      expectedReturn: amount * 1.05,
    });
    await inv.save();
    res.send({ investment: inv });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// List all investments for the user
router.get("/", auth, async (req, res) => {
  try {
    const items = await Investment.find({ user: req.user._id }).sort({
      startedAt: -1,
    });
    res.send({ items });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Get a single investment with calculated returns
router.get("/:id", auth, async (req, res) => {
  try {
    const inv = await Investment.findById(req.params.id);
    if (!inv) return res.status(404).send({ error: "Not found" });
    if (inv.user.toString() !== req.user._id.toString())
      return res.status(403).send({ error: "Not allowed" });

    // Calculate returns based on elapsed days
    const now = new Date();
    const elapsed = Math.floor((now - inv.startedAt) / (1000 * 60 * 60 * 24));
    const progress = Math.min(elapsed / (inv.termDays || 30), 1); // 0 to 1
    const currentValue =
      inv.amount + (inv.expectedReturn - inv.amount) * progress;

    res.send({ investment: inv, currentValue, progress, elapsedDays: elapsed });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Withdraw from an investment early
router.post("/withdraw/:id", auth, async (req, res) => {
  try {
    const inv = await Investment.findById(req.params.id);
    if (!inv) return res.status(404).send({ error: "Not found" });
    if (inv.user.toString() !== req.user._id.toString())
      return res.status(403).send({ error: "Not allowed" });
    if (inv.status !== "active")
      return res
        .status(400)
        .send({
          error: "Investment is not active (already withdrawn/completed)",
        });

    // Calculate early withdrawal penalty (10% of returns)
    const now = new Date();
    const elapsed = Math.floor((now - inv.startedAt) / (1000 * 60 * 60 * 24));
    const progress = Math.min(elapsed / (inv.termDays || 30), 1);
    const currentValue =
      inv.amount + (inv.expectedReturn - inv.amount) * progress;
    const penalty = (inv.expectedReturn - inv.amount) * 0.1; // 10% of returns
    const withdrawAmount = currentValue - penalty;

    inv.status = "withdrawn";
    await inv.save();

    res.send({
      investment: inv,
      withdrawAmount,
      penalty,
      message: "Early withdrawal successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
