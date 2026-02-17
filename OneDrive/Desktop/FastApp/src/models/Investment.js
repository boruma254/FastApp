const mongoose = require("mongoose");

const InvestmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    termDays: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["active", "withdrawn", "completed"],
      default: "active",
    },
    startedAt: { type: Date, default: Date.now },
    expectedReturn: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Investment", InvestmentSchema);
