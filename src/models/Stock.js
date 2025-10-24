import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    initialQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    currentQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    soldQuantity: {
      type: Number,
      default: 0,
    },
    lowStockAlert: {
      type: Number,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock"],
      default: "in_stock",
    },
  },
  {
    timestamps: true,
  }
);

// 🟢 Automatically update status before saving
stockSchema.methods.updateStatus = function () {
  if (this.currentQuantity <= 0) this.status = "out_of_stock";
  else if (this.currentQuantity <= this.lowStockAlert)
    this.status = "low_stock";
  else this.status = "in_stock";
};

stockSchema.pre("save", function (next) {
  this.updateStatus();
  next();
});

// ✅ Correct export to always use the “stocks” collection
export default mongoose.models.Stock || mongoose.model("Stock", stockSchema);
