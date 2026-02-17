const mongoose = require("mongoose");

const WithdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["queued", "processing", "paid", "failed"],
      default: "queued",
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    attemptCount: { type: Number, default: 0 },
    mpesaRef: String,
    note: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Withdrawal", WithdrawalSchema);
