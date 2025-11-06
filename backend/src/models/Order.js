import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        qty: { type: Number, required: true, min: 1 }
      }
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending"
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
