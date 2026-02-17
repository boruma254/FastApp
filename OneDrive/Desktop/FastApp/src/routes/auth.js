const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

function genReferralCode() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      nationalId,
      kraPin,
      dob,
      referralCode,
    } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).send({ error: "Missing fields" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send({ error: "Email exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashed,
      phone,
      nationalId,
      kraPin,
      dob,
    });
    user.referralCode = genReferralCode();
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        referrer.referralRewards = (referrer.referralRewards || 0) + 200; // default KES 200
        await referrer.save();
      }
    }
    await user.save();
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );
    res.send({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        loanLimit: user.loanLimit,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).send({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );
    res.send({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        loanLimit: user.loanLimit,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Get current user info
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.send({ user });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
