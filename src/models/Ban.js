const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const banSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
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

const name = "Ban";

module.exports = mongoose.models[name] || mongoose.model(name, banSchema);
