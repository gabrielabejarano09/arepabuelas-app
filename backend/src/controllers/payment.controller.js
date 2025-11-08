// backend/controllers/paymentController.js

// Importa tu modelo de Pedido
const Order = require('../models/orderModel');

// Objeto para simular respuestas de un procesador de pagos
const mockPaymentProcessor = {
  process: (cardDetails, amount) => {
    // Lógica de simulación basada en el número de tarjeta
    if (cardDetails.cardNumber.startsWith('4242')) {
      return { success: true, transactionId: `sim_${new Date().getTime()}` };
    } else if (cardDetails.cardNumber.startsWith('5100')) {
      return { success: false, message: 'Fondos insuficientes.' };
    } else {
      return { success: false, message: 'Tarjeta rechazada.' };
    }
  }
};

const simulatePayment = async (req, res) => {
  const { orderId, paymentDetails } = req.body;

  // --- 1. Validación de Entrada ---
  if (!orderId || !paymentDetails) {
    return res.status(400).json({ message: 'Falta el ID del pedido o los detalles de pago.' });
  }

  const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = paymentDetails;

  if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvv) {
    return res.status(400).json({ message: 'Todos los campos de la tarjeta son obligatorios.' });
  }

  // Validación de formato básico (puedes expandir esto con regex más complejos)
  if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
    return res.status(400).json({ message: 'Número de tarjeta inválido.' });
  }
  if (!/^\d{2}$/.test(expiryMonth) || !/^\d{4}$/.test(expiryYear)) {
    return res.status(400).json({ message: 'Formato de fecha de expiración inválido.' });
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return res.status(400).json({ message: 'CVV inválido.' });
  }

  try {
    // --- 2. Verificar el Pedido ---
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Este pedido ya ha sido pagado.' });
    }

    // --- 3. Procesar el Pago Simulado ---
    const paymentResult = mockPaymentProcessor.process({ cardNumber, ...paymentDetails }, order.totalPrice);

    if (paymentResult.success) {
      // --- 4. Actualizar el Estado del Pedido en la Base de Datos ---
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentResult.transactionId,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: req.user.email, // Asumiendo que el email viene del usuario autenticado
      };

      const updatedOrder = await order.save();

      res.status(200).json({
        message: 'Pago simulado exitosamente.',
        order: updatedOrder
      });
    } else {
      res.status(400).json({ message: `Error en el pago: ${paymentResult.message}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = { simulatePayment };