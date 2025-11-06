import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    image: { type: String }, // url local o cloud
    category: { type: String, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Previene ataques NoSQL ($, { } ) en busquedas
productSchema.pre("save", function (next) {
  this.name = this.name.replace(/[$.{}]/g, "");
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;