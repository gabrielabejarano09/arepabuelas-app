import Stripe from 'stripe';
import 'dotenv/config';
import { createOrder } from '../models/order.model.js';
import { getProductById } from '../models/product.model.js';
import { getCouponByCode } from '../models/coupon.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const checkout = async (req, res) => {
  try {
    const { product_id, quantity, coupon_code, token } = req.body;
    const product = await getProductById(product_id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    let total = product.price * quantity;
    if (coupon_code) {
      const coupon = await getCouponByCode(coupon_code);
      if (coupon) total = total - (total * coupon.discount) / 100;
    }

    if (process.env.PAYMENT_MODE === 'test') {
      console.log('Simulación de pago:', total);
    } else {
      await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'usd',
        payment_method: token,
        confirm: true
      });
    }

    const order = await createOrder({
      user_id: req.user.id,
      product_id,
      quantity,
      total,
      coupon_code: coupon_code || null
    });

    res.json({ message: 'Pago realizado con éxito', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
