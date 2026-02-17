const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    termWeeks: { type: Number, required: true },
    purpose: { type: String },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "disbursed",
        "paid",
        "cancelled",
      ],
      default: "pending",
    },
    disbursedAt: Date,
    repaidAt: Date,
    verifiedPayment: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Loan", LoanSchema);
