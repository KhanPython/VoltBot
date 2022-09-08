const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serverBanSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    jobId: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: false,
      default: "36500d",
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const name = "ServerBan";

module.exports = mongoose.models[name] || mongoose.model(name, serverBanSchema);
