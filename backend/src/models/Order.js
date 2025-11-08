// backend/models/orderModel.js
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    // ... otros campos del pedido (user, orderItems, etc.)
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentResult: { // Para guardar la info del pago simulado
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    // ... otros campos
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;