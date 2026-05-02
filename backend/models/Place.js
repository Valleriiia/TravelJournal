import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["hotel", "attraction", "restaurant", "transport", "other"],
      default: "other",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    visitedAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    notes: { type: String },
  },
  { timestamps: true },
);

placeSchema.index({ location: "2dsphere" }, { sparse: true });

export default mongoose.model("places", placeSchema);
