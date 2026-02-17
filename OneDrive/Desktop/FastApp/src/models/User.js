const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    nationalId: { type: String },
    kraPin: { type: String },
    dob: { type: Date },
    // loan related
    loanLimit: { type: Number, default: 20000 },
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referralRewards: { type: Number, default: 0 },
    // simple credit score: increases with repayments
    onTimeRepayments: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
