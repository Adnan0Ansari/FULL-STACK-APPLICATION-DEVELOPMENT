const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const razorpay = require('../config/razorpay');

const ADDRESS_FIELDS = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];

const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'object') {
    return 'Shipping address is required';
  }
  for (const field of ADDRESS_FIELDS) {
    if (typeof address[field] !== 'string' || address[field].trim() === '') {
      return `${field} is required`;
    }
  }
  if (!/^\d{10}$/.test(address.phone.trim())) {
    return 'Phone must contain 10 digits';
  }
  if (!/^\d{6}$/.test(address.pincode.trim())) {
    return 'Pincode must contain 6 digits';
  }
  return null;
};

const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const productIds = customer.cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = productMap.get(cartItem.product.toString());

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'A product in your cart is no longer available',
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
      totalAmount += product.price * cartItem.quantity;
    }

    const cleanAddress = {};
    for (const field of ADDRESS_FIELDS) {
      cleanAddress[field] = shippingAddress[field].trim();
    }

    const orderId = new mongoose.Types.ObjectId();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: orderId.toString(),
    });

    const order = await Order.create({
      _id: orderId,
      user: customer._id,
      items,
      shippingAddress: cleanAddress,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const message = (error.error && error.error.description) || error.message || 'Something went wrong';
    res.status(500).json({ success: false, message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const paymentDetails = [razorpay_order_id, razorpay_payment_id, razorpay_signature];
    if (!paymentDetails.every((v) => typeof v === 'string' && v.length > 0)) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ success: true, message: 'Order already confirmed', order });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment does not match this order',
      });
    }

    const body = order.razorpayOrderId + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    res.status(200).json({ success: true, message: 'Payment verified, order placed', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};

const markPaymentFailed = async (req, res) => {
  try {
    const { shopKartOrderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'PENDING') {
      order.paymentStatus = 'FAILED';
      await order.save();
    }

    res.status(200).json({ success: true, message: 'Payment marked as failed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, paymentStatus: 'PAID' }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getOrders,
  getOrderById,
};