const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);

    const alreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock',
    });

    res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const customer = await Customer.findById(req.user._id);

    const isInWishlist = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!isInWishlist) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);

    const isInWishlist = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isInWishlist) {
      customer.wishlist = customer.wishlist.filter(
        (id) => id.toString() !== productId
      );
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    }

    customer.wishlist.push(productId);
    await customer.save();
    return res.status(200).json({
      success: true,
      saved: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist};
