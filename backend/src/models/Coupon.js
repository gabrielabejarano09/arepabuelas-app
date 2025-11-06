import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountPercent: { type: Number, min: 1, max: 90, required: true },
    active: { type: Boolean, default: true },
    newUserOnly: { type: Boolean, default: false }
  },
  { timestamps: true }
);

couponSchema.pre("save", function (next) {
  this.code = this.code.toUpperCase().trim().replace(/[$.{}]/g, "");
  next();
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;